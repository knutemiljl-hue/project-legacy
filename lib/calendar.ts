import { supabase } from "@/lib/supabase";
import {
  notifyCalendarEventCreatedByPush,
  notifyCalendarEventUpdatedByPush,
} from "@/lib/push-events";
import {
  ReminderValue,
  normalizeReminderOffset,
} from "@/lib/reminders";
import { LegacyUserId, readActiveUser } from "@/lib/users";

export const MAX_CALENDAR_RECURRENCE_ITEMS = 52;

export type CalendarEventType =
  | "family"
  | "health"
  | "home"
  | "work"
  | "social"
  | "other";

export type CalendarOwner = "knut" | "ingrid" | "family";
export type CalendarRecurrenceFrequency =
  | "none"
  | "weekly"
  | "biweekly"
  | "monthly";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime?: string;
  location?: string;
  type: CalendarEventType;
  calendarOwner: CalendarOwner;
  createdAt: string;
  createdBy?: LegacyUserId;
  recurrenceGroupId?: string;
  recurrenceFrequency?: CalendarRecurrenceFrequency;
  recurrenceUntil?: string;
  recurrenceIndex?: number;
  reminderMinutesBefore?: ReminderValue;
};

export type CalendarEventInput = {
  title: string;
  date?: string;
  time?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  type: CalendarEventType;
  calendarOwner?: CalendarOwner;
  reminderMinutesBefore?: ReminderValue;
};

export type RecurringCalendarEventInput = CalendarEventInput & {
  recurrenceFrequency?: CalendarRecurrenceFrequency;
  recurrenceUntil?: string;
};

type CalendarEventRow = {
  id: string;
  title: string;
  event_date: string;
  event_time: string;
  end_date: string | null;
  end_time: string | null;
  location: string | null;
  type: CalendarEventType;
  calendar_owner: CalendarOwner | null;
  created_by: LegacyUserId | null;
  created_at: string;
  recurrence_group_id: string | null;
  recurrence_frequency: CalendarRecurrenceFrequency | null;
  recurrence_until: string | null;
  recurrence_index: number | null;
  reminder_minutes_before: number | null;
};

const CALENDAR_EVENT_SELECT =
  "id, title, event_date, event_time, end_date, end_time, location, type, calendar_owner, created_by, created_at, recurrence_group_id, recurrence_frequency, recurrence_until, recurrence_index, reminder_minutes_before";

function mapCalendarEvent(row: CalendarEventRow): CalendarEvent {
  const startDate = row.event_date;
  const startTime = row.event_time || "Hele dagen";

  return {
    id: row.id,
    title: row.title,
    date: startDate,
    time: startTime,
    startDate,
    endDate: row.end_date ?? startDate,
    startTime,
    endTime: row.end_time ?? undefined,
    location: row.location ?? undefined,
    type: row.type,
    calendarOwner: row.calendar_owner ?? "family",
    createdAt: row.created_at,
    createdBy: row.created_by ?? undefined,
    recurrenceGroupId: row.recurrence_group_id ?? undefined,
    recurrenceFrequency: row.recurrence_frequency ?? undefined,
    recurrenceUntil: row.recurrence_until ?? undefined,
    recurrenceIndex: row.recurrence_index ?? undefined,
    reminderMinutesBefore: normalizeReminderOffset(
      row.reminder_minutes_before
    ),
  };
}

export function notifyCalendarUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("project-legacy-calendar-updated"));
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatCalendarDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(localDate);
}

export function formatCalendarMonth(date: Date) {
  return new Intl.DateTimeFormat("nb-NO", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getEventTypeLabel(type: CalendarEventType) {
  const labels: Record<CalendarEventType, string> = {
    family: "Familie",
    health: "Helse",
    home: "Hjem",
    work: "Arbeid",
    social: "Sosialt",
    other: "Annet",
  };

  return labels[type];
}

export function getCalendarOwnerLabel(owner: CalendarOwner) {
  const labels: Record<CalendarOwner, string> = {
    knut: "Knut Emil",
    ingrid: "Ingrid",
    family: "Felles",
  };

  return labels[owner];
}

export function getCalendarOwnerDotClass(owner: CalendarOwner) {
  const classes: Record<CalendarOwner, string> = {
    knut: "bg-sky-500",
    ingrid: "bg-rose-500",
    family: "bg-emerald-500",
  };

  return classes[owner];
}

export function getCalendarOwnerBadgeClass(owner: CalendarOwner) {
  const classes: Record<CalendarOwner, string> = {
    knut: "border-sky-200 bg-sky-50 text-sky-700",
    ingrid: "border-rose-200 bg-rose-50 text-rose-700",
    family: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return classes[owner];
}

export function getCalendarRecurrenceLabel(
  frequency: CalendarRecurrenceFrequency
) {
  const labels: Record<CalendarRecurrenceFrequency, string> = {
    none: "Gjentas ikke",
    weekly: "Ukentlig",
    biweekly: "Annenhver uke",
    monthly: "Månedlig",
  };

  return labels[frequency];
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function addDays(dateKey: string, days: number) {
  const date = parseDateKey(dateKey);

  date.setDate(date.getDate() + days);

  return getLocalDateKey(date);
}

function getDateDifferenceInDays(startDate: string, endDate: string) {
  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);

  return Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / 86_400_000)
  );
}

function getSignedDateDifferenceInDays(startDate: string, endDate: string) {
  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);

  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

function createRecurrenceGroupId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (
      Number(char) ^
      (Math.random() * 16) >> (Number(char) / 4)
    ).toString(16)
  );
}

function normalizeCalendarEventInput(event: CalendarEventInput) {
  const startDate = event.startDate ?? event.date ?? "";
  const endDate = event.endDate && event.endDate >= startDate
    ? event.endDate
    : startDate;
  const startTime = event.startTime ?? event.time ?? "Hele dagen";

  return {
    title: event.title.trim(),
    startDate,
    endDate,
    startTime,
    endTime: event.endTime || null,
  };
}

function getLastDayOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function addMonthsClamped(date: Date, monthsToAdd: number, preferredDay: number) {
  const year = date.getFullYear();
  const monthIndex = date.getMonth() + monthsToAdd;
  const target = new Date(year, monthIndex, 1);
  const lastDay = getLastDayOfMonth(target.getFullYear(), target.getMonth());

  target.setDate(Math.min(preferredDay, lastDay));

  return target;
}

export function buildRecurringCalendarDateKeys({
  startDate,
  untilDate,
  frequency,
}: {
  startDate?: string;
  untilDate?: string;
  frequency: CalendarRecurrenceFrequency;
}) {
  if (frequency === "none" || !startDate || !untilDate) {
    return startDate ? [startDate] : [];
  }

  const start = parseDateKey(startDate);
  const until = parseDateKey(untilDate);

  if (start > until) {
    return [startDate];
  }

  const dates: string[] = [];
  let current = new Date(start);
  const preferredMonthDay = start.getDate();

  while (current <= until && dates.length < MAX_CALENDAR_RECURRENCE_ITEMS) {
    dates.push(getLocalDateKey(current));

    if (frequency === "weekly") {
      current.setDate(current.getDate() + 7);
    }

    if (frequency === "biweekly") {
      current.setDate(current.getDate() + 14);
    }

    if (frequency === "monthly") {
      current = addMonthsClamped(current, 1, preferredMonthDay);
    }
  }

  return dates;
}

export function sortCalendarEvents(events: CalendarEvent[]) {
  return [...events].sort((a, b) => {
    if (a.startDate !== b.startDate) {
      return a.startDate.localeCompare(b.startDate);
    }

    return a.startTime.localeCompare(b.startTime);
  });
}

export function getCalendarEventDateKeys(event: CalendarEvent) {
  const startDate = event.startDate || event.date;
  const endDate = event.endDate && event.endDate >= startDate
    ? event.endDate
    : startDate;
  const dates: string[] = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}

export function isCalendarEventInDateRange(
  event: CalendarEvent,
  startDate: string,
  endDate: string
) {
  const eventStartDate = event.startDate || event.date;
  const eventEndDate = event.endDate && event.endDate >= eventStartDate
    ? event.endDate
    : eventStartDate;

  return eventStartDate <= endDate && eventEndDate >= startDate;
}

export function formatCalendarEventTime(event: CalendarEvent) {
  const startTime = event.startTime || event.time || "Hele dagen";

  if (!event.endTime || startTime === "Hele dagen") {
    return startTime;
  }

  return `${startTime} - ${event.endTime}`;
}

export function formatCalendarEventDateRange(event: CalendarEvent) {
  const startDate = event.startDate || event.date;
  const endDate = event.endDate && event.endDate >= startDate
    ? event.endDate
    : startDate;

  if (startDate === endDate) {
    return formatCalendarDate(startDate);
  }

  return `${formatCalendarDate(startDate)} - ${formatCalendarDate(endDate)}`;
}

export async function readCalendarEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from("legacy_calendar_events")
    .select(CALENDAR_EVENT_SELECT)
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true });

  if (error) {
    console.error("Kunne ikke hente kalender:", error);
    return [];
  }

  return sortCalendarEvents(
    (data ?? []).map((event) => mapCalendarEvent(event as CalendarEventRow))
  );
}

export async function addCalendarEvent(event: CalendarEventInput) {
  const normalizedEvent = normalizeCalendarEventInput(event);

  if (!normalizedEvent.title || !normalizedEvent.startDate) {
    return;
  }

  const activeUser = readActiveUser();

  const { error } = await supabase.from("legacy_calendar_events").insert({
    title: normalizedEvent.title,
    event_date: normalizedEvent.startDate,
    event_time: normalizedEvent.startTime,
    end_date: normalizedEvent.endDate,
    end_time: normalizedEvent.endTime,
    location: event.location?.trim() || null,
    type: event.type,
    calendar_owner: event.calendarOwner ?? "family",
    created_by: activeUser.id,
    reminder_minutes_before:
      normalizedEvent.startTime !== "Hele dagen"
        ? normalizeReminderOffset(event.reminderMinutesBefore)
        : null,
  });

  if (error) {
    console.error("Kunne ikke legge til kalenderavtale:", error);
    return;
  }

  notifyCalendarUpdated();
  notifyCalendarEventCreatedByPush({
    owner: event.calendarOwner ?? "family",
    title: normalizedEvent.title,
  });
}

export async function addRecurringCalendarEvents(
  event: RecurringCalendarEventInput
) {
  const normalizedEvent = normalizeCalendarEventInput(event);

  if (!normalizedEvent.title || !normalizedEvent.startDate) {
    return;
  }

  const frequency = event.recurrenceFrequency ?? "none";

  if (frequency === "none" || !event.recurrenceUntil) {
    await addCalendarEvent(event);
    return;
  }

  const activeUser = readActiveUser();

  const dates = buildRecurringCalendarDateKeys({
    startDate: normalizedEvent.startDate,
    untilDate: event.recurrenceUntil,
    frequency,
  });

  if (dates.length === 0) {
    await addCalendarEvent(event);
    return;
  }

  const eventDurationDays = getDateDifferenceInDays(
    normalizedEvent.startDate,
    normalizedEvent.endDate
  );
  const recurrenceGroupId = createRecurrenceGroupId();

  const { error } = await supabase.from("legacy_calendar_events").insert(
    dates.map((date, index) => ({
      title: normalizedEvent.title,
      event_date: date,
      event_time: normalizedEvent.startTime,
      end_date: addDays(date, eventDurationDays),
      end_time: normalizedEvent.endTime,
      location: event.location?.trim() || null,
      type: event.type,
      calendar_owner: event.calendarOwner ?? "family",
      created_by: activeUser.id,
      recurrence_group_id: recurrenceGroupId,
      recurrence_frequency: frequency,
      recurrence_until: event.recurrenceUntil,
      recurrence_index: index,
      reminder_minutes_before:
        normalizedEvent.startTime !== "Hele dagen"
          ? normalizeReminderOffset(event.reminderMinutesBefore)
          : null,
    }))
  );

  if (error) {
    console.error("Kunne ikke legge til gjentakende kalenderavtaler:", error);
    return;
  }

  notifyCalendarUpdated();
  notifyCalendarEventCreatedByPush({
    owner: event.calendarOwner ?? "family",
    title: normalizedEvent.title,
  });
}

export async function updateCalendarEvent(
  eventId: string,
  updatedEvent: CalendarEventInput
) {
  const normalizedEvent = normalizeCalendarEventInput(updatedEvent);

  if (!normalizedEvent.title || !normalizedEvent.startDate) {
    return;
  }

  const { error } = await supabase
    .from("legacy_calendar_events")
    .update({
      title: normalizedEvent.title,
      event_date: normalizedEvent.startDate,
      event_time: normalizedEvent.startTime,
      end_date: normalizedEvent.endDate,
      end_time: normalizedEvent.endTime,
      location: updatedEvent.location?.trim() || null,
      type: updatedEvent.type,
      calendar_owner: updatedEvent.calendarOwner ?? "family",
      reminder_minutes_before:
        normalizedEvent.startTime !== "Hele dagen"
          ? normalizeReminderOffset(updatedEvent.reminderMinutesBefore)
          : null,
    })
    .eq("id", eventId);

  if (error) {
    console.error("Kunne ikke oppdatere kalenderavtale:", error);
    return;
  }

  notifyCalendarUpdated();
  notifyCalendarEventUpdatedByPush({
    owner: updatedEvent.calendarOwner ?? "family",
    title: normalizedEvent.title,
  });
}

export async function updateCalendarEventAndFuture(
  originalEvent: CalendarEvent,
  updatedEvent: CalendarEventInput
) {
  const normalizedEvent = normalizeCalendarEventInput(updatedEvent);

  if (!normalizedEvent.title || !normalizedEvent.startDate) {
    return;
  }

  const { data: selectedData, error: selectedError } = await supabase
    .from("legacy_calendar_events")
    .select(CALENDAR_EVENT_SELECT)
    .eq("id", originalEvent.id)
    .maybeSingle();

  if (selectedError) {
    console.error("Kunne ikke hente valgt kalenderavtale:", selectedError);
    return;
  }

  const selectedEvent = selectedData
    ? mapCalendarEvent(selectedData as CalendarEventRow)
    : originalEvent;
  const recurrenceGroupId =
    selectedEvent.recurrenceGroupId ?? originalEvent.recurrenceGroupId;

  if (!recurrenceGroupId) {
    await updateCalendarEvent(originalEvent.id, updatedEvent);
    return;
  }

  const eventDurationDays = getDateDifferenceInDays(
    normalizedEvent.startDate,
    normalizedEvent.endDate
  );
  const dateOffsetDays = getSignedDateDifferenceInDays(
    selectedEvent.startDate || selectedEvent.date,
    normalizedEvent.startDate
  );

  const { data, error: readError } = await supabase
    .from("legacy_calendar_events")
    .select(CALENDAR_EVENT_SELECT)
    .eq("recurrence_group_id", recurrenceGroupId)
    .order("recurrence_index", { ascending: true })
    .order("event_date", { ascending: true });

  if (readError) {
    console.error("Kunne ikke hente kalender-serie:", readError);
    return;
  }

  const seriesEvents = (data ?? []).map((event) =>
    mapCalendarEvent(event as CalendarEventRow)
  );

  if (seriesEvents.length === 0) {
    await updateCalendarEvent(originalEvent.id, updatedEvent);
    return;
  }

  const updates = seriesEvents.map((event) => {
    const currentStartDate = addDays(event.startDate, dateOffsetDays);

    return supabase
      .from("legacy_calendar_events")
      .update({
        title: normalizedEvent.title,
        event_date: currentStartDate,
        event_time: normalizedEvent.startTime,
        end_date: addDays(currentStartDate, eventDurationDays),
        end_time: normalizedEvent.endTime,
        location: updatedEvent.location?.trim() || null,
        type: updatedEvent.type,
        calendar_owner: updatedEvent.calendarOwner ?? "family",
        reminder_minutes_before:
          normalizedEvent.startTime !== "Hele dagen"
            ? normalizeReminderOffset(updatedEvent.reminderMinutesBefore)
            : null,
      })
      .eq("id", event.id);
  });

  const results = await Promise.all(updates);
  const updateError = results.find((result) => result.error)?.error;

  if (updateError) {
    console.error("Kunne ikke oppdatere kalender-serie:", updateError);
    return;
  }

  notifyCalendarUpdated();
  notifyCalendarEventUpdatedByPush({
    owner: updatedEvent.calendarOwner ?? "family",
    title: normalizedEvent.title,
  });
}

export async function deleteCalendarEvent(eventId: string) {
  const { error } = await supabase
    .from("legacy_calendar_events")
    .delete()
    .eq("id", eventId);

  if (error) {
    console.error("Kunne ikke slette kalenderavtale:", error);
    return;
  }

  notifyCalendarUpdated();
}

export async function deleteCalendarEventAndSeries(event: CalendarEvent) {
  if (!event.recurrenceGroupId) {
    await deleteCalendarEvent(event.id);
    return;
  }

  const { error } = await supabase
    .from("legacy_calendar_events")
    .delete()
    .eq("recurrence_group_id", event.recurrenceGroupId);

  if (error) {
    console.error("Kunne ikke slette kalender-serie:", error);
    return;
  }

  notifyCalendarUpdated();
}

export function subscribeToCalendarEvents(onChange: () => void) {
  const channelName = `legacy-calendar-events-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "legacy_calendar_events",
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
