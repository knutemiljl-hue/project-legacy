import { LegacyUserId, readActiveUser } from "@/lib/users";

export type PushPermissionState =
  | "unsupported"
  | "default"
  | "denied"
  | "granted";

type PushSubscriptionPayload = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`
    .replaceAll("-", "+")
    .replaceAll("_", "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

export function canUsePushNotifications() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export function readPushPermission(): PushPermissionState {
  if (!canUsePushNotifications()) {
    return "unsupported";
  }

  return Notification.permission;
}

async function getPushServiceWorkerRegistration() {
  const existingRegistration = await navigator.serviceWorker.getRegistration("/");

  if (existingRegistration) {
    return existingRegistration;
  }

  return navigator.serviceWorker.register("/sw.js");
}

async function readCurrentSubscription() {
  if (!canUsePushNotifications()) {
    return null;
  }

  const registration = await getPushServiceWorkerRegistration();

  return registration.pushManager.getSubscription();
}

function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
}

export async function isCurrentDeviceSubscribedToPush() {
  const subscription = await readCurrentSubscription();

  return Boolean(subscription);
}

export async function subscribeActiveUserToPush() {
  if (!canUsePushNotifications()) {
    return {
      ok: false,
      message: "Denne nettleseren støtter ikke push-varsler.",
    };
  }

  const vapidPublicKey = getVapidPublicKey();

  if (!vapidPublicKey) {
    return {
      ok: false,
      message: "Mangler NEXT_PUBLIC_VAPID_PUBLIC_KEY.",
    };
  }

  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    return {
      ok: false,
      message: "Varsler er ikke tillatt i nettleseren.",
    };
  }

  const activeUser = readActiveUser();
  const registration = await getPushServiceWorkerRegistration();
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      userVisibleOnly: true,
    }));

  return savePushSubscription(activeUser.id, subscription.toJSON());
}

export async function unsubscribeCurrentDeviceFromPush() {
  const subscription = await readCurrentSubscription();

  if (!subscription) {
    return {
      ok: true,
      message: "Varsler er allerede av.",
    };
  }

  const response = await fetch("/api/push/unsubscribe", {
    body: JSON.stringify({
      endpoint: subscription.endpoint,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  await subscription.unsubscribe();

  if (!response.ok) {
    return {
      ok: false,
      message: "Varsler ble slått av lokalt, men ikke fjernet fra server.",
    };
  }

  return {
    ok: true,
    message: "Varsler er slått av.",
  };
}

export async function sendTestPushToActiveUser() {
  const activeUser = readActiveUser();
  const response = await fetch("/api/push/test", {
    body: JSON.stringify({
      userId: activeUser.id,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const result = await response.json().catch(() => null);

  return {
    ok: response.ok,
    sent: Number(result?.sent ?? 0),
  };
}

async function savePushSubscription(
  userId: LegacyUserId,
  subscription: PushSubscriptionPayload
) {
  const response = await fetch("/api/push/subscribe", {
    body: JSON.stringify({
      subscription,
      userAgent: navigator.userAgent,
      userId,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    return {
      ok: false,
      message: result?.message ?? "Kunne ikke lagre push-abonnement.",
    };
  }

  return {
    ok: true,
    message: "Varsler er slått på.",
  };
}
