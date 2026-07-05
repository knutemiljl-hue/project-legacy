import { supabase } from "@/lib/supabase";
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
  location?: string;
  type: CalendarEventType;
  calendarOwner: CalendarOwner;
  createdAt: string;
  createdBy?: LegacyUserId;
};

export type CalendarEventInput = {
  title: string;
  date: string;
  time?: string;
  location?: string;
  type: CalendarEventType;
  calendarOwner?: CalendarOwner;
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
  location: string | null;
  type: CalendarEventType;
  calendar_owner: CalendarOwner | null;
  created_by: LegacyUserId | null;
  created_at: string;
};

function mapCalendarEvent(row: CalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.event_date,
    time: row.event_time,
    location: row.location ?? undefined,
    type: row.type,
    calendarOwner: row.calendar_owner ?? "family",
    createdAt: row.created_at,
    createdBy: row.created_by ?? undefined,
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
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }

    return a.time.localeCompare(b.time);
  });
}

export async function readCalendarEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from("legacy_calendar_events")
    .select(
      "id, title, event_date, event_time, location, type, calendar_owner, created_by, created_at"
    )
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
  const trimmedTitle = event.title.trim();

  if (!trimmedTitle || !event.date) {
    return;
  }

  const activeUser = readActiveUser();

  const { error } = await supabase.from("legacy_calendar_events").insert({
    title: trimmedTitle,
    event_date: event.date,
    event_time: event.time || "Hele dagen",
    location: event.location?.trim() || null,
    type: event.type,
    calendar_owner: event.calendarOwner ?? "family",
    created_by: activeUser.id,
  });

  if (error) {
    console.error("Kunne ikke legge til kalenderavtale:", error);
    return;
  }

  notifyCalendarUpdated();
}

export async function addRecurringCalendarEvents(
  event: RecurringCalendarEventInput
) {
  const trimmedTitle = event.title.trim();

  if (!trimmedTitle || !event.date) {
    return;
  }

  const frequency = event.recurrenceFrequency ?? "none";

  if (frequency === "none" || !event.recurrenceUntil) {
    await addCalendarEvent(event);
    return;
  }

  const activeUser = readActiveUser();

  const dates = buildRecurringCalendarDateKeys({
    startDate: event.date,
    untilDate: event.recurrenceUntil,
    frequency,
  });

  if (dates.length === 0) {
    await addCalendarEvent(event);
    return;
  }

  const { error } = await supabase.from("legacy_calendar_events").insert(
    dates.map((date) => ({
      title: trimmedTitle,
      event_date: date,
      event_time: event.time || "Hele dagen",
      location: event.location?.trim() || null,
      type: event.type,
      calendar_owner: event.calendarOwner ?? "family",
      created_by: activeUser.id,
    }))
  );

  if (error) {
    console.error("Kunne ikke legge til gjentakende kalenderavtaler:", error);
    return;
  }

  notifyCalendarUpdated();
}

export async function updateCalendarEvent(
  eventId: string,
  updatedEvent: CalendarEventInput
) {
  const trimmedTitle = updatedEvent.title.trim();

  if (!trimmedTitle || !updatedEvent.date) {
    return;
  }

  const { error } = await supabase
    .from("legacy_calendar_events")
    .update({
      title: trimmedTitle,
      event_date: updatedEvent.date,
      event_time: updatedEvent.time || "Hele dagen",
      location: updatedEvent.location?.trim() || null,
      type: updatedEvent.type,
      calendar_owner: updatedEvent.calendarOwner ?? "family",
    })
    .eq("id", eventId);

  if (error) {
    console.error("Kunne ikke oppdatere kalenderavtale:", error);
    return;
  }

  notifyCalendarUpdated();
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

export function subscribeToCalendarEvents(onChange: () => void) {
  const channel = supabase
    .channel("legacy-calendar-events")
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