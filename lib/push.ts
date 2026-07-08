import webPush from "web-push";
import { supabaseServer } from "@/lib/supabase-server";
import { LegacyUserId } from "@/lib/users";

type PushSubscriptionRow = {
  id: string;
  user_id: LegacyUserId;
  endpoint: string;
  p256dh: string;
  auth: string;
};

type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

type SendPushInput = PushPayload & {
  userIds: LegacyUserId[];
};

function getVapidConfig() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:hello@project-legacy.local";

  if (!publicKey || !privateKey) {
    return null;
  }

  return {
    publicKey,
    privateKey,
    subject,
  };
}

function configureWebPush() {
  const vapidConfig = getVapidConfig();

  if (!vapidConfig) {
    return false;
  }

  webPush.setVapidDetails(
    vapidConfig.subject,
    vapidConfig.publicKey,
    vapidConfig.privateKey
  );

  return true;
}

async function deleteExpiredSubscription(endpoint: string) {
  await supabaseServer
    .from("legacy_push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);
}

export function getPushConfigStatus() {
  return {
    hasPublicKey: Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY),
    hasPrivateKey: Boolean(process.env.VAPID_PRIVATE_KEY),
  };
}

export async function sendPushToUsers({
  userIds,
  title,
  body,
  url = "/",
  tag = "project-legacy",
}: SendPushInput) {
  const uniqueUserIds = Array.from(new Set(userIds));

  if (uniqueUserIds.length === 0 || !configureWebPush()) {
    return {
      sent: 0,
      skipped: true,
    };
  }

  const { data, error } = await supabaseServer
    .from("legacy_push_subscriptions")
    .select("id, user_id, endpoint, p256dh, auth")
    .in("user_id", uniqueUserIds);

  if (error) {
    console.error("Kunne ikke hente push-abonnementer:", error);
    return {
      sent: 0,
      skipped: true,
    };
  }

  const subscriptions = (data ?? []) as PushSubscriptionRow[];
  const payload = JSON.stringify({
    title,
    body,
    url,
    tag,
  });

  const results = await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              auth: subscription.auth,
              p256dh: subscription.p256dh,
            },
          },
          payload
        );

        return true;
      } catch (error) {
        const statusCode =
          typeof error === "object" &&
          error !== null &&
          "statusCode" in error
            ? Number((error as { statusCode?: unknown }).statusCode)
            : null;

        if (statusCode === 404 || statusCode === 410) {
          await deleteExpiredSubscription(subscription.endpoint);
          return false;
        }

        console.error("Kunne ikke sende push-varsel:", error);
        return false;
      }
    })
  );

  return {
    sent: results.filter(
      (result) => result.status === "fulfilled" && result.value
    ).length,
    skipped: false,
  };
}
