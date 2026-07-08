import { NextResponse } from "next/server";
import { sendPushToUsers } from "@/lib/push";
import { supabaseServer } from "@/lib/supabase-server";
import { LegacyUserId } from "@/lib/users";

export const runtime = "nodejs";

type TaskReminderRow = {
  id: string;
  title: string;
  task_date: string | null;
  task_time: string | null;
  scope: "personal" | "family";
  created_by: LegacyUserId | null;
};

type CalendarReminderRow = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  calendar_owner: LegacyUserId | "family" | null;
};

type ReminderCandidate = {
  body: string;
  itemId: string;
  itemType: "task" | "calendar";
  logKey: string;
  title: string;
  url: string;
  userIds: LegacyUserId[];
};

const allUsers: LegacyUserId[] = ["knut", "ingrid"];
const timeZone = "Europe/Oslo";

function getNorwayDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    dateKey: `${values.year}-${values.month}-${values.day}`,
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}

function parseDateTime(dateKey: string, time: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  if (
    !year ||
    !month ||
    !day ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute);
}

function isTimeInNextHour(dateKey: string, time?: string | null) {
  if (!time || time === "Hele dagen" || !/^\d{2}:\d{2}$/.test(time)) {
    return false;
  }

  const targetDate = parseDateTime(dateKey, time);

  if (!targetDate) {
    return false;
  }

  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  return targetDate >= now && targetDate <= oneHourFromNow;
}

function getTaskUserIds(task: TaskReminderRow) {
  if (task.scope === "family") {
    return allUsers;
  }

  return task.created_by ? [task.created_by] : [];
}

function getCalendarUserIds(event: CalendarReminderRow) {
  if (!event.calendar_owner || event.calendar_owner === "family") {
    return allUsers;
  }

  return [event.calendar_owner];
}

async function hasReminderBeenSent(logKey: string) {
  const { data, error } = await supabaseServer
    .from("legacy_push_notification_log")
    .select("id")
    .eq("log_key", logKey)
    .maybeSingle();

  if (error) {
    console.error("Kunne ikke lese varslingslogg:", error);
    return true;
  }

  return Boolean(data);
}

async function markReminderSent(candidate: ReminderCandidate) {
  const { error } = await supabaseServer
    .from("legacy_push_notification_log")
    .insert({
      item_id: candidate.itemId,
      item_type: candidate.itemType,
      log_key: candidate.logKey,
      notification_type: "reminder",
    });

  if (error && error.code !== "23505") {
    console.error("Kunne ikke lagre varslingslogg:", error);
  }
}

async function readTaskReminderCandidates() {
  const { dateKey, hour } = getNorwayDateParts();

  const { data, error } = await supabaseServer
    .from("legacy_tasks")
    .select("id, title, task_date, task_time, scope, created_by")
    .eq("is_done", false)
    .eq("is_archived", false)
    .not("task_date", "is", null)
    .lte("task_date", dateKey);

  if (error) {
    console.error("Kunne ikke hente oppgaver for påminnelse:", error);
    return [];
  }

  return ((data ?? []) as TaskReminderRow[])
    .flatMap((task): ReminderCandidate[] => {
      if (!task.task_date) {
        return [];
      }

      const userIds = getTaskUserIds(task);

      if (userIds.length === 0) {
        return [];
      }

      const hasSpecificTime = Boolean(
        task.task_time &&
          task.task_time !== "Hele dagen" &&
          /^\d{2}:\d{2}$/.test(task.task_time)
      );

      if (hasSpecificTime && isTimeInNextHour(task.task_date, task.task_time)) {
        return [
          {
            body: `${task.title} nærmer seg kl. ${task.task_time}.`,
            itemId: task.id,
            itemType: "task",
            logKey: `task-due-soon:${task.id}:${task.task_date}:${task.task_time}`,
            title: "Oppgave nærmer seg",
            url: "/tasks",
            userIds,
          },
        ];
      }

      if (!hasSpecificTime && task.task_date <= dateKey && hour >= 7) {
        return [
          {
            body:
              task.task_date === dateKey
                ? `${task.title} ligger på dagens liste.`
                : `${task.title} er forsinket og ligger fortsatt åpen.`,
            itemId: task.id,
            itemType: "task",
            logKey: `task-day:${task.id}:${dateKey}`,
            title:
              task.task_date === dateKey
                ? "Oppgave i dag"
                : "Forsinket oppgave",
            url: "/tasks",
            userIds,
          },
        ];
      }

      return [];
    });
}

async function readCalendarReminderCandidates() {
  const { dateKey, hour } = getNorwayDateParts();

  const { data, error } = await supabaseServer
    .from("legacy_calendar_events")
    .select("id, title, event_date, event_time, calendar_owner")
    .eq("event_date", dateKey);

  if (error) {
    console.error("Kunne ikke hente kalender for påminnelse:", error);
    return [];
  }

  return ((data ?? []) as CalendarReminderRow[])
    .flatMap((event): ReminderCandidate[] => {
      const userIds = getCalendarUserIds(event);

      if (userIds.length === 0) {
        return [];
      }

      const hasSpecificTime = Boolean(
        event.event_time &&
          event.event_time !== "Hele dagen" &&
          /^\d{2}:\d{2}$/.test(event.event_time)
      );

      if (
        hasSpecificTime &&
        isTimeInNextHour(event.event_date, event.event_time)
      ) {
        return [
          {
            body: `${event.title} starter kl. ${event.event_time}.`,
            itemId: event.id,
            itemType: "calendar",
            logKey: `calendar-start-soon:${event.id}:${event.event_date}:${event.event_time}`,
            title: "Avtale nærmer seg",
            url: "/calendar",
            userIds,
          },
        ];
      }

      if (!hasSpecificTime && hour >= 7) {
        return [
          {
            body: `${event.title} ligger i kalenderen i dag.`,
            itemId: event.id,
            itemType: "calendar",
            logKey: `calendar-day:${event.id}:${event.event_date}`,
            title: "Avtale i dag",
            url: "/calendar",
            userIds,
          },
        ];
      }

      return [];
    });
}

export async function GET() {
  const taskCandidates = await readTaskReminderCandidates();
  const calendarCandidates = await readCalendarReminderCandidates();
  const candidates = [...taskCandidates, ...calendarCandidates];
  let sent = 0;
  let skipped = 0;

  for (const candidate of candidates) {
    if (await hasReminderBeenSent(candidate.logKey)) {
      skipped += 1;
      continue;
    }

    const result = await sendPushToUsers({
      body: candidate.body,
      tag: candidate.logKey,
      title: candidate.title,
      url: candidate.url,
      userIds: candidate.userIds,
    });

    await markReminderSent(candidate);
    sent += result.sent;
  }

  return NextResponse.json({
    ok: true,
    candidates: candidates.length,
    sent,
    skipped,
  });
}
