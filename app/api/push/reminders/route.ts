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
  reminder_minutes_before: number | null;
};

type CalendarReminderRow = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  calendar_owner: LegacyUserId | "family" | null;
  reminder_minutes_before: number | null;
};

type ReminderCandidate = {
  body: string;
  itemId: string;
  itemType: "task" | "calendar";
  logKey: string;
  reminderAt: Date;
  title: string;
  url: string;
  userIds: LegacyUserId[];
};

const allUsers: LegacyUserId[] = ["knut", "ingrid"];
const timeZone = "Europe/Oslo";
const reminderWindowMinutes = 30;
const validReminderOffsets = new Set([0, 5, 15, 30, 60, 1440]);

function isAuthorizedReminderRequest(request: Request) {
  const expectedSecret = process.env.REMINDERS_SECRET;

  if (!expectedSecret) {
    return true;
  }

  const url = new URL(request.url);

  return url.searchParams.get("secret") === expectedSecret;
}

function getNorwayDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function addDaysToDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

function getTimeZoneParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return {
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    month: Number(values.month),
    year: Number(values.year),
  };
}

function localNorwayDateTimeToUtc(dateKey: string, time: string) {
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

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const actualParts = getTimeZoneParts(utcGuess);
  const desiredTimestamp = Date.UTC(year, month - 1, day, hour, minute);
  const actualTimestamp = Date.UTC(
    actualParts.year,
    actualParts.month - 1,
    actualParts.day,
    actualParts.hour,
    actualParts.minute
  );

  return new Date(utcGuess.getTime() + desiredTimestamp - actualTimestamp);
}

function getReminderAt({
  dateKey,
  time,
  reminderMinutesBefore,
}: {
  dateKey: string;
  time?: string | null;
  reminderMinutesBefore?: number | null;
}) {
  if (
    !time ||
    time === "Hele dagen" ||
    !/^\d{2}:\d{2}$/.test(time) ||
    reminderMinutesBefore === null ||
    reminderMinutesBefore === undefined ||
    !validReminderOffsets.has(reminderMinutesBefore)
  ) {
    return null;
  }

  const startsAt = localNorwayDateTimeToUtc(dateKey, time);

  if (!startsAt) {
    return null;
  }

  return new Date(startsAt.getTime() - reminderMinutesBefore * 60 * 1000);
}

function isReminderDue(reminderAt: Date, now = new Date()) {
  const windowStart = new Date(
    now.getTime() - reminderWindowMinutes * 60 * 1000
  );

  return reminderAt >= windowStart && reminderAt <= now;
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

function formatReminderTime(dateKey: string, time: string) {
  return `${dateKey} ${time}`;
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
      notification_type: "scheduled-reminder",
    });

  if (error && error.code !== "23505") {
    console.error("Kunne ikke lagre varslingslogg:", error);
  }
}

async function readTaskReminderCandidates() {
  const today = getNorwayDateKey();
  const fromDate = addDaysToDateKey(today, -1);
  const toDate = addDaysToDateKey(today, 2);

  const { data, error } = await supabaseServer
    .from("legacy_tasks")
    .select(
      "id, title, task_date, task_time, scope, created_by, reminder_minutes_before"
    )
    .eq("is_done", false)
    .eq("is_archived", false)
    .not("task_date", "is", null)
    .not("reminder_minutes_before", "is", null)
    .gte("task_date", fromDate)
    .lte("task_date", toDate);

  if (error) {
    console.error("Kunne ikke hente oppgaver for påminnelse:", error);
    return [];
  }

  return ((data ?? []) as TaskReminderRow[]).flatMap(
    (task): ReminderCandidate[] => {
      if (!task.task_date || !task.task_time) {
        return [];
      }

      const reminderAt = getReminderAt({
        dateKey: task.task_date,
        reminderMinutesBefore: task.reminder_minutes_before,
        time: task.task_time,
      });
      const userIds = getTaskUserIds(task);

      if (!reminderAt || !isReminderDue(reminderAt) || userIds.length === 0) {
        return [];
      }

      return [
        {
          body: `${task.title} er satt til ${formatReminderTime(
            task.task_date,
            task.task_time
          )}.`,
          itemId: task.id,
          itemType: "task",
          logKey: `task-reminder:${task.id}:${task.task_date}:${task.task_time}:${task.reminder_minutes_before}`,
          reminderAt,
          title: "Oppgavepåminnelse",
          url: "/tasks",
          userIds,
        },
      ];
    }
  );
}

async function readCalendarReminderCandidates() {
  const today = getNorwayDateKey();
  const fromDate = addDaysToDateKey(today, -1);
  const toDate = addDaysToDateKey(today, 2);

  const { data, error } = await supabaseServer
    .from("legacy_calendar_events")
    .select(
      "id, title, event_date, event_time, calendar_owner, reminder_minutes_before"
    )
    .not("reminder_minutes_before", "is", null)
    .gte("event_date", fromDate)
    .lte("event_date", toDate);

  if (error) {
    console.error("Kunne ikke hente kalender for påminnelse:", error);
    return [];
  }

  return ((data ?? []) as CalendarReminderRow[]).flatMap(
    (event): ReminderCandidate[] => {
      if (!event.event_time) {
        return [];
      }

      const reminderAt = getReminderAt({
        dateKey: event.event_date,
        reminderMinutesBefore: event.reminder_minutes_before,
        time: event.event_time,
      });
      const userIds = getCalendarUserIds(event);

      if (!reminderAt || !isReminderDue(reminderAt) || userIds.length === 0) {
        return [];
      }

      return [
        {
          body: `${event.title} starter ${formatReminderTime(
            event.event_date,
            event.event_time
          )}.`,
          itemId: event.id,
          itemType: "calendar",
          logKey: `calendar-reminder:${event.id}:${event.event_date}:${event.event_time}:${event.reminder_minutes_before}`,
          reminderAt,
          title: "Kalenderpåminnelse",
          url: "/calendar",
          userIds,
        },
      ];
    }
  );
}

export async function GET(request: Request) {
  if (!isAuthorizedReminderRequest(request)) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized reminder request." },
      { status: 401 }
    );
  }

  const taskCandidates = await readTaskReminderCandidates();
  const calendarCandidates = await readCalendarReminderCandidates();
  const candidates = [...taskCandidates, ...calendarCandidates].sort(
    (a, b) => a.reminderAt.getTime() - b.reminderAt.getTime()
  );
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
    windowMinutes: reminderWindowMinutes,
  });
}
