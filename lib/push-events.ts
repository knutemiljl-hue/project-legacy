import type { CalendarOwner } from "@/lib/calendar";
import type { TaskScope } from "@/lib/tasks";
import type { LegacyUserId } from "@/lib/users";

const allUsers: LegacyUserId[] = ["knut", "ingrid"];

function sendPushNotification({
  body,
  tag,
  title,
  url,
  userIds,
}: {
  body: string;
  tag: string;
  title: string;
  url: string;
  userIds: LegacyUserId[];
}) {
  if (typeof window === "undefined" || userIds.length === 0) {
    return;
  }

  fetch("/api/push/notify", {
    body: JSON.stringify({
      body,
      tag,
      title,
      url,
      userIds,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  }).catch((error) => {
    console.error("Kunne ikke sende push-varsel:", error);
  });
}

export function notifyTaskCreatedByPush({
  createdBy,
  scope,
  title,
}: {
  createdBy: LegacyUserId;
  scope: TaskScope;
  title: string;
}) {
  const userIds = scope === "family" ? allUsers : [createdBy];

  sendPushNotification({
    body:
      scope === "family"
        ? `Ny familieoppgave: ${title}`
        : `Ny oppgave til deg: ${title}`,
    tag: "project-legacy-task-created",
    title: "Ny oppgave",
    url: "/tasks",
    userIds,
  });
}

export function notifyCalendarEventCreatedByPush({
  owner,
  title,
}: {
  owner: CalendarOwner;
  title: string;
}) {
  const userIds = owner === "family" ? allUsers : [owner];

  sendPushNotification({
    body:
      owner === "family"
        ? `Ny felles avtale: ${title}`
        : `Ny avtale: ${title}`,
    tag: "project-legacy-calendar-created",
    title: "Ny kalenderavtale",
    url: "/calendar",
    userIds,
  });
}
