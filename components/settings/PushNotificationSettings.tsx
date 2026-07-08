"use client";

import { Bell, BellOff, Send } from "lucide-react";
import { useEffect, useState } from "react";
import {
  PushPermissionState,
  canUsePushNotifications,
  isCurrentDeviceSubscribedToPush,
  readPushPermission,
  sendTestPushToActiveUser,
  subscribeActiveUserToPush,
  unsubscribeCurrentDeviceFromPush,
} from "@/lib/push-notifications";
import { readActiveUser } from "@/lib/users";

function getPermissionLabel(permission: PushPermissionState) {
  const labels: Record<PushPermissionState, string> = {
    default: "Ikke valgt",
    denied: "Blokkert",
    granted: "Tillatt",
    unsupported: "Ikke støttet",
  };

  return labels[permission];
}

export default function PushNotificationSettings() {
  const [permission, setPermission] =
    useState<PushPermissionState>("unsupported");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [activeUserName, setActiveUserName] = useState("aktiv bruker");

  async function refreshState() {
    setPermission(readPushPermission());
    setActiveUserName(readActiveUser().name);

    if (!canUsePushNotifications()) {
      setIsSubscribed(false);
      return;
    }

    setIsSubscribed(await isCurrentDeviceSubscribedToPush());
  }

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      refreshState();
    }, 0);

    window.addEventListener("project-legacy-active-user-updated", refreshState);
    window.addEventListener("storage", refreshState);

    return () => {
      window.clearTimeout(initialLoadTimer);
      window.removeEventListener(
        "project-legacy-active-user-updated",
        refreshState
      );
      window.removeEventListener("storage", refreshState);
    };
  }, []);

  async function enableNotifications() {
    setIsBusy(true);
    setMessage("");

    const result = await subscribeActiveUserToPush();

    setMessage(result.message);
    await refreshState();
    setIsBusy(false);
  }

  async function disableNotifications() {
    setIsBusy(true);
    setMessage("");

    const result = await unsubscribeCurrentDeviceFromPush();

    setMessage(result.message);
    await refreshState();
    setIsBusy(false);
  }

  async function sendTestNotification() {
    setIsBusy(true);
    setMessage("");

    const result = await sendTestPushToActiveUser();

    setMessage(
      result.ok && result.sent > 0
        ? "Testvarsel sendt."
        : result.ok
          ? "Testen kjørte, men ingen aktive enheter fikk varsel. Slå på varsler på denne enheten først."
        : "Kunne ikke sende testvarsel. Sjekk VAPID og Supabase-tabell."
    );
    setIsBusy(false);
  }

  return (
    <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#EEF5E8] text-[#4F773D]">
            {isSubscribed ? (
              <Bell size={21} strokeWidth={2} />
            ) : (
              <BellOff size={21} strokeWidth={2} />
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
              Varsler
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
              Push-varsler
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-600">
              Slå på varsler for {activeUserName} på denne enheten.
            </p>

            {permission === "unsupported" && (
              <p className="mt-2 text-sm leading-6 text-stone-500">
                På iPhone må appen legges til Hjem-skjerm og åpnes derfra før
                push-varsler støttes.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-[#F7F4EA] px-4 py-3 text-right">
          <p className="text-xs text-stone-500">Status</p>
          <p className="text-sm font-semibold text-[#24312A]">
            {isSubscribed ? "På" : "Av"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
            Nettleser
          </p>
          <p className="mt-1 text-sm font-semibold text-[#24312A]">
            {getPermissionLabel(permission)}
          </p>
        </div>

        <button
          type="button"
          onClick={isSubscribed ? disableNotifications : enableNotifications}
          disabled={isBusy || permission === "unsupported"}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#3F6F35] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSubscribed ? (
            <BellOff size={17} strokeWidth={2.25} />
          ) : (
            <Bell size={17} strokeWidth={2.25} />
          )}
          {isSubscribed ? "Slå av" : "Slå på"}
        </button>

        <button
          type="button"
          onClick={sendTestNotification}
          disabled={isBusy || !isSubscribed}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#F7F4EA] px-4 py-3 text-sm font-semibold text-[#24312A] shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Send size={17} strokeWidth={2.25} />
          Send test
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-2xl bg-[#F7F4EA] px-4 py-3 text-sm leading-6 text-stone-600">
          {message}
        </p>
      )}
    </section>
  );
}
