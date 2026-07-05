export const CALENDAR_EVENTS_KEY = "project-legacy-calendar-events";

export type CalendarEventType =
  | "family"
  | "health"
  | "home"
  | "work"
  | "social"
  | "other";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location?: string;
  type: CalendarEventType;
  createdAt: string;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  const storedValue = window.localStorage.getItem(key);

  if (!storedValue) {
    return fallback;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function notifyCalendarUpdated() {
  if (!canUseStorage()) {
    return;
  }

  window.setTimeout(() => {
    window.dispatchEvent(new Event("project-legacy-calendar-updated"));
  }, 0);
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

export function readCalendarEvents(): CalendarEvent[] {
  return readJson<CalendarEvent[]>(CALENDAR_EVENTS_KEY, []);
}

export function saveCalendarEvents(events: CalendarEvent[]) {
  writeJson(CALENDAR_EVENTS_KEY, events);
  notifyCalendarUpdated();
}

export function sortCalendarEvents(events: CalendarEvent[]) {
  return [...events].sort((a, b) => {
    const aValue = `${a.date} ${a.time || "23:59"}`;
    const bValue = `${b.date} ${b.time || "23:59"}`;

    return aValue.localeCompare(bValue);
  });
}

export function addCalendarEvent(event: {
  title: string;
  date: string;
  time?: string;
  location?: string;
  type: CalendarEventType;
}) {
  const trimmedTitle = event.title.trim();

  if (!trimmedTitle || !event.date) {
    return;
  }

  const existingEvents = readCalendarEvents();

  const newEvent: CalendarEvent = {
    id: `calendar-${Date.now()}`,
    title: trimmedTitle,
    date: event.date,
    time: event.time || "Hele dagen",
    location: event.location?.trim() || undefined,
    type: event.type,
    createdAt: new Date().toISOString(),
  };

  saveCalendarEvents(sortCalendarEvents([...existingEvents, newEvent]));
}

export function deleteCalendarEvent(eventId: string) {
  const existingEvents = readCalendarEvents();
  const nextEvents = existingEvents.filter((event) => event.id !== eventId);

  saveCalendarEvents(nextEvents);
}