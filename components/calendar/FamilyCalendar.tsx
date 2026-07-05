"use client";

import { useEffect, useState } from "react";
import {
  CalendarEvent,
  deleteCalendarEvent,
  formatCalendarDate,
  getEventTypeLabel,
  getLocalDateKey,
  readCalendarEvents,
  sortCalendarEvents,
} from "@/lib/calendar";

type FamilyCalendarProps = {
  compact?: boolean;
};

function groupEventsByDate(events: CalendarEvent[]) {
  return events.reduce<Record<string, CalendarEvent[]>>((groups, event) => {
    if (!groups[event.date]) {
      groups[event.date] = [];
    }

    groups[event.date].push(event);

    return groups;
  }, {});
}

export default function FamilyCalendar({
  compact = false,
}: FamilyCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    loadEvents();

    window.addEventListener("project-legacy-calendar-updated", loadEvents);
    window.addEventListener("storage", loadEvents);

    return () => {
      window.removeEventListener("project-legacy-calendar-updated", loadEvents);
      window.removeEventListener("storage", loadEvents);
    };
  }, []);

  function loadEvents() {
    setEvents(sortCalendarEvents(readCalendarEvents()));
  }

  function removeEvent(eventId: string) {
    deleteCalendarEvent(eventId);
    setEvents(sortCalendarEvents(readCalendarEvents()));
  }

  const todayKey = getLocalDateKey();

  const upcomingEvents = events.filter((event) => event.date >= todayKey);
  const visibleEvents = compact ? upcomingEvents.slice(0, 4) : upcomingEvents;
  const groupedEvents = groupEventsByDate(visibleEvents);
  const groupedDates = Object.keys(groupedEvents).sort();

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#8D846F]">Kalender</p>

          <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
            Kommende avtaler
          </h2>

          {!compact && (
            <p className="mt-2 text-sm leading-6 text-stone-600">
              En enkel felles kalender for familie, helse, hjem og avtaler.
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-[#F7F4EA] px-4 py-3 text-right">
          <p className="text-xs text-stone-500">Kommende</p>
          <p className="text-lg font-semibold text-[#24312A]">
            {upcomingEvents.length}
          </p>
        </div>
      </div>

      {visibleEvents.length === 0 ? (
        <div className="rounded-2xl bg-[#F7F4EA] p-4">
          <p className="text-sm leading-6 text-stone-600">
            Ingen kommende avtaler. Legg til en avtale via{" "}
            <strong>+ Ny</strong>.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedDates.map((date) => (
            <div key={date}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#8D846F]">
                {formatCalendarDate(date)}
              </h3>

              <div className="space-y-3">
                {groupedEvents[date].map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between gap-4 rounded-2xl bg-[#F7F4EA] p-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[#24312A]">
                          {event.title}
                        </p>

                        <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-[#8D846F]">
                          {getEventTypeLabel(event.type)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-stone-500">
                        {event.time}
                        {event.location ? ` · ${event.location}` : ""}
                      </p>
                    </div>

                    <button
                      onClick={() => removeEvent(event.id)}
                      className="rounded-full px-3 py-1 text-sm font-medium text-stone-400 transition hover:bg-white hover:text-red-600"
                      aria-label={`Slett ${event.title}`}
                      title="Slett avtale"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {compact && upcomingEvents.length > visibleEvents.length && (
            <p className="text-sm text-stone-500">
              +{upcomingEvents.length - visibleEvents.length} flere avtaler på
              familiesiden.
            </p>
          )}
        </div>
      )}
    </section>
  );
}