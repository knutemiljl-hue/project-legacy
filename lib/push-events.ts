import type { CalendarOwner } from "@/lib/calendar";
import type { TaskScope } from "@/lib/tasks";
import type { LegacyUserId } from "@/lib/users";

const allUsers: LegacyUserId[] = ["knut", "ingrid"];

function getTaskRecipients(scope: TaskScope, owner: LegacyUserId) {
  return scope === "family" ? allUsers : [owner];
}

function getCalendarRecipients(owner: CalendarOwner) {
  return owner === "family" ? allUsers : [owner];
}

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
  const userIds = getTaskRecipients(scope, createdBy);

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

export function notifyTaskUpdatedByPush({
  owner,
  scope,
  title,
}: {
  owner: LegacyUserId;
  scope: TaskScope;
  title: string;
}) {
  const userIds = getTaskRecipients(scope, owner);

  sendPushNotification({
    body:
      scope === "family"
        ? `Familieoppgaven er oppdatert: ${title}`
        : `Oppgaven er oppdatert: ${title}`,
    tag: "project-legacy-task-updated",
    title: "Oppgave endret",
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
  const userIds = getCalendarRecipients(owner);

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

export function notifyCalendarEventUpdatedByPush({
  owner,
  title,
}: {
  owner: CalendarOwner;
  title: string;
}) {
  const userIds = getCalendarRecipients(owner);

  sendPushNotification({
    body:
      owner === "family"
        ? `Felles avtale er oppdatert: ${title}`
        : `Avtale er oppdatert: ${title}`,
    tag: "project-legacy-calendar-updated",
    title: "Kalenderavtale endret",
    url: "/calendar",
    userIds,
  });
}

export function notifyShoppingItemsCreatedByPush(titles: string[]) {
  if (titles.length === 0) {
    return;
  }

  sendPushNotification({
    body:
      titles.length === 1
        ? `Lagt til i handlelisten: ${titles[0]}`
        : `${titles.length} varer er lagt til i handlelisten.`,
    tag: "project-legacy-shopping-created",
    title: titles.length === 1 ? "Ny handlelistevare" : "Nye handlelistevarer",
    url: "/family",
    userIds: allUsers,
  });
}
