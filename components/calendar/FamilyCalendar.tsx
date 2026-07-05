"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  MapPin,
  Trash2,
} from "lucide-react";
import {
  CalendarEvent,
  CalendarEventType,
  deleteCalendarEvent,
  formatCalendarDate,
  formatCalendarMonth,
  getEventTypeLabel,
  getLocalDateKey,
  readCalendarEvents,
  sortCalendarEvents,
  updateCalendarEvent,
} from "@/lib/calendar";
import { getUserDisplayName } from "@/lib/users";

type FamilyCalendarProps = {
  compact?: boolean;
};

const weekDays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

const calendarTypes: {
  id: CalendarEventType;
  label: string;
}[] = [
  {
    id: "family",
    label: "Familie",
  },
  {
    id: "health",
    label: "Helse",
  },
  {
    id: "home",
    label: "Hjem",
  },
  {
    id: "work",
    label: "Arbeid",
  },
  {
    id: "social",
    label: "Sosialt",
  },
  {
    id: "other",
    label: "Annet",
  },
];

function CreatedByText({ createdBy }: { createdBy?: string }) {
  if (!createdBy) {
    return null;
  }

  return (
    <span className="text-xs text-stone-400">
      · Lagt til av {getUserDisplayName(createdBy)}
    </span>
  );
}

function groupEventsByDate(events: CalendarEvent[]) {
  return events.reduce<Record<string, CalendarEvent[]>>((groups, event) => {
    if (!groups[event.date]) {
      groups[event.date] = [];
    }

    groups[event.date].push(event);

    return groups;
  }, {});
}

function getDateKeyFromParts(year: number, monthIndex: number, day: number) {
  const date = new Date(year, monthIndex, day);

  const actualYear = date.getFullYear();
  const actualMonth = String(date.getMonth() + 1).padStart(2, "0");
  const actualDay = String(date.getDate()).padStart(2, "0");

  return `${actualYear}-${actualMonth}-${actualDay}`;
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const monthIndex = monthDate.getMonth();

  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

  const firstWeekday =
    firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay();

  const leadingEmptyDays = firstWeekday - 1;
  const daysInMonth = lastDayOfMonth.getDate();

  const days: {
    date: string;
    day: number;
    isCurrentMonth: boolean;
  }[] = [];

  const previousMonthLastDay = new Date(year, monthIndex, 0).getDate();

  for (let index = leadingEmptyDays; index > 0; index -= 1) {
    const day = previousMonthLastDay - index + 1;

    days.push({
      date: getDateKeyFromParts(year, monthIndex - 1, day),
      day,
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push({
      date: getDateKeyFromParts(year, monthIndex, day),
      day,
      isCurrentMonth: true,
    });
  }

  const trailingDays = 42 - days.length;

  for (let day = 1; day <= trailingDays; day += 1) {
    days.push({
      date: getDateKeyFromParts(year, monthIndex + 1, day),
      day,
      isCurrentMonth: false,
    });
  }

  return days;
}

function getInitialEditState(event: CalendarEvent | null) {
  return {
    title: event?.title ?? "",
    date: event?.date ?? getLocalDateKey(),
    time: event?.time === "Hele dagen" ? "" : event?.time ?? "",
    location: event?.location ?? "",
    type: event?.type ?? "family",
  };
}

export default function FamilyCalendar({
  compact = false,
}: FamilyCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(getLocalDateKey());
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState(getLocalDateKey());
  const [editTime, setEditTime] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editType, setEditType] = useState<CalendarEventType>("family");

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

  function goToPreviousMonth() {
    setVisibleMonth(
      (currentMonth) =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  }

  function goToNextMonth() {
    setVisibleMonth(
      (currentMonth) =>
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  }

  function goToToday() {
    const today = new Date();

    setVisibleMonth(today);
    setSelectedDate(getLocalDateKey(today));
  }

  function openEditModal(event: CalendarEvent) {
    const initialState = getInitialEditState(event);

    setEditingEvent(event);
    setEditTitle(initialState.title);
    setEditDate(initialState.date);
    setEditTime(initialState.time);
    setEditLocation(initialState.location);
    setEditType(initialState.type);
  }

  function closeEditModal() {
    setEditingEvent(null);
    setEditTitle("");
    setEditDate(getLocalDateKey());
    setEditTime("");
    setEditLocation("");
    setEditType("family");
  }

  function saveEditedEvent() {
    if (!editingEvent || !editTitle.trim()) {
      return;
    }

    updateCalendarEvent(editingEvent.id, {
      title: editTitle,
      date: editDate,
      time: editTime,
      location: editLocation,
      type: editType,
    });

    loadEvents();
    setSelectedDate(editDate);
    setVisibleMonth(
      new Date(
        Number(editDate.slice(0, 4)),
        Number(editDate.slice(5, 7)) - 1,
        1
      )
    );
    closeEditModal();
  }

  function removeEvent(eventId: string) {
    deleteCalendarEvent(eventId);
    loadEvents();
    closeEditModal();
  }

  const todayKey = getLocalDateKey();

  const upcomingEvents = events.filter((event) => event.date >= todayKey);
  const visibleUpcomingEvents = compact
    ? upcomingEvents.slice(0, 4)
    : upcomingEvents.slice(0, 8);

  const eventsByDate = useMemo(() => groupEventsByDate(events), [events]);
  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth]
  );

  const selectedDateEvents = sortCalendarEvents(
    eventsByDate[selectedDate] ?? []
  );

  return (
    <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F7F4EA] text-[#4F773D]">
            <CalendarDays size={21} strokeWidth={2} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
              Kalender
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
              Familiekalender
            </h2>

            {!compact && (
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Klikk på en dag for å se avtalene. Klikk på en avtale for å
                redigere.
              </p>
            )}
          </div>
        </div>

        <div className="ml-15 w-fit rounded-2xl bg-[#F7F4EA] px-4 py-3 text-left sm:ml-0 sm:text-right">
          <p className="text-xs text-stone-500">Kommende</p>
          <p className="text-lg font-semibold text-[#24312A]">
            {upcomingEvents.length}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-3xl border border-[#ECE3D4] bg-[#F7F4EA] p-3 sm:p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              onClick={goToPreviousMonth}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#24312A] shadow-sm transition hover:brightness-95"
              aria-label="Forrige måned"
              title="Forrige måned"
            >
              <ChevronLeft size={17} strokeWidth={2.25} />
            </button>

            <button onClick={goToToday} className="min-w-0 text-center">
              <p className="truncate text-sm font-semibold capitalize text-[#24312A]">
                {formatCalendarMonth(visibleMonth)}
              </p>

              <p className="mt-0.5 text-xs text-stone-500">Gå til i dag</p>
            </button>

            <button
              onClick={goToNextMonth}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#24312A] shadow-sm transition hover:brightness-95"
              aria-label="Neste måned"
              title="Neste måned"
            >
              <ChevronRight size={17} strokeWidth={2.25} />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-[#8D846F] sm:py-2 sm:text-[11px]"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const dayEvents = eventsByDate[day.date] ?? [];
              const isToday = day.date === todayKey;
              const isSelected = day.date === selectedDate;

              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`min-h-11 rounded-2xl p-1.5 text-left transition hover:bg-white sm:min-h-12 sm:p-2 ${
                    isSelected
                      ? "bg-white shadow-sm ring-2 ring-[#8EB069]"
                      : "bg-transparent"
                  } ${!day.isCurrentMonth ? "opacity-35" : ""}`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                        isToday
                          ? "bg-[#F3D66B] text-[#24312A]"
                          : "text-[#24312A]"
                      }`}
                    >
                      {day.day}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="rounded-full bg-[#4F773D] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {!compact && dayEvents.length > 0 && (
                    <div className="mt-1 hidden space-y-1 sm:block">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="truncate rounded-full bg-white px-2 py-1 text-[10px] text-stone-600"
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-[#ECE3D4] bg-[#F7F4EA] p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
                Valgt dag
              </p>

              <h3 className="mt-1 text-base font-semibold text-[#24312A]">
                {formatCalendarDate(selectedDate)}
              </h3>
            </div>

            <p className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-500">
              {selectedDateEvents.length} avtaler
            </p>
          </div>

          {selectedDateEvents.length === 0 ? (
            <div className="rounded-2xl bg-white px-4 py-3">
              <p className="text-sm text-stone-500">
                Ingen avtaler denne dagen.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-white">
              {selectedDateEvents.map((event, index) => (
                <button
                  key={event.id}
                  onClick={() => openEditModal(event)}
                  className={`w-full px-4 py-4 text-left transition hover:bg-[#F7F4EA] sm:py-3 ${
                    index !== selectedDateEvents.length - 1
                      ? "border-b border-[#ECE3D4]"
                      : ""
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[#24312A]">
                          {event.title}
                        </p>

                        <span className="rounded-full bg-[#F7F4EA] px-2 py-1 text-xs font-medium text-[#8D846F]">
                          {getEventTypeLabel(event.type)}
                        </span>
                      </div>

                      <p className="mt-1 flex flex-wrap items-center gap-1 text-sm leading-5 text-stone-500">
                        <Clock size={13} strokeWidth={2} />
                        {event.time}

                        {event.location && (
                          <>
                            <span>·</span>
                            <MapPin size={13} strokeWidth={2} />
                            {event.location}
                          </>
                        )}

                        <CreatedByText createdBy={event.createdBy} />
                      </p>
                    </div>

                    <p className="flex w-fit items-center gap-1 text-xs font-medium text-stone-400">
                      <Edit3 size={12} strokeWidth={2} />
                      Rediger
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
              Kommende avtaler
            </h3>

            <p className="text-xs text-stone-400">
              {visibleUpcomingEvents.length} vist
            </p>
          </div>

          {visibleUpcomingEvents.length === 0 ? (
            <div className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] p-4">
              <p className="text-sm leading-6 text-stone-600">
                Ingen kommende avtaler. Legg til en avtale via{" "}
                <strong>+ Ny</strong>.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA]">
              {visibleUpcomingEvents.map((event, index) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedDate(event.date);
                    setVisibleMonth(
                      new Date(
                        Number(event.date.slice(0, 4)),
                        Number(event.date.slice(5, 7)) - 1,
                        1
                      )
                    );
                  }}
                  className={`w-full px-4 py-4 text-left transition hover:bg-white sm:py-3 ${
                    index !== visibleUpcomingEvents.length - 1
                      ? "border-b border-[#ECE3D4]"
                      : ""
                  }`}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-[#24312A]">
                          {event.title}
                        </p>

                        <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-[#8D846F]">
                          {getEventTypeLabel(event.type)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-5 text-stone-500">
                        {formatCalendarDate(event.date)}
                        <CreatedByText createdBy={event.createdBy} />
                      </p>
                    </div>

                    <p className="flex w-fit items-center gap-1 text-sm text-stone-500">
                      <Clock size={13} strokeWidth={2} />
                      {event.time}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {editingEvent && (
        <div className="fixed inset-0 z-[999999] overflow-y-auto bg-black/75">
          <div className="flex min-h-screen items-start justify-center px-4 py-8 sm:px-6 sm:pt-36">
            <div className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-5 shadow-2xl sm:p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#8D846F]">
                    Kalender
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
                    Rediger avtale
                  </h2>

                  {editingEvent.createdBy && (
                    <p className="mt-1 text-sm text-stone-500">
                      Lagt til av {getUserDisplayName(editingEvent.createdBy)}
                    </p>
                  )}
                </div>

                <button
                  onClick={closeEditModal}
                  className="rounded-full bg-[#F7F4EA] px-3 py-1 text-sm font-medium text-[#24312A] transition hover:brightness-95"
                >
                  Lukk
                </button>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-[#24312A]">
                    Tittel
                  </span>

                  <input
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-sm text-[#24312A] outline-none transition placeholder:text-stone-400 focus:border-[#8D846F]"
                    placeholder="F.eks. Helsestasjon"
                  />
                </label>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-[#24312A]">
                      Dato
                    </span>

                    <input
                      type="date"
                      value={editDate}
                      onChange={(event) => setEditDate(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-sm text-[#24312A] outline-none transition focus:border-[#8D846F]"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-[#24312A]">
                      Klokkeslett
                    </span>

                    <input
                      type="time"
                      value={editTime}
                      onChange={(event) => setEditTime(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-sm text-[#24312A] outline-none transition focus:border-[#8D846F]"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-[#24312A]">
                    Sted
                  </span>

                  <input
                    value={editLocation}
                    onChange={(event) => setEditLocation(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-sm text-[#24312A] outline-none transition placeholder:text-stone-400 focus:border-[#8D846F]"
                    placeholder="F.eks. Bergen sentrum"
                  />
                </label>

                <div>
                  <span className="text-sm font-medium text-[#24312A]">
                    Type
                  </span>

                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {calendarTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setEditType(type.id)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                          editType === type.id
                            ? "border-[#8EB069] bg-[#EEF5E8] text-[#24312A]"
                            : "border-stone-200 bg-[#F7F4EA] text-stone-500 hover:brightness-95"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-3 pt-2 sm:flex-row">
                  <button
                    onClick={() => removeEvent(editingEvent.id)}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-medium text-red-700 transition hover:brightness-95"
                  >
                    <Trash2 size={15} strokeWidth={2} />
                    Slett avtale
                  </button>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={closeEditModal}
                      className="rounded-2xl bg-[#F7F4EA] px-5 py-3 text-sm font-medium text-[#24312A] transition hover:brightness-95"
                    >
                      Avbryt
                    </button>

                    <button
                      onClick={saveEditedEvent}
                      className="rounded-2xl bg-[#3F6F35] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
                    >
                      Lagre endring
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}