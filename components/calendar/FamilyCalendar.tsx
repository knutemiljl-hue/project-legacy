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
  CalendarOwner,
  deleteCalendarEvent,
  formatCalendarDate,
  formatCalendarMonth,
  getCalendarOwnerBadgeClass,
  getCalendarOwnerDotClass,
  getCalendarOwnerLabel,
  getEventTypeLabel,
  getLocalDateKey,
  readCalendarEvents,
  sortCalendarEvents,
  subscribeToCalendarEvents,
  updateCalendarEvent,
} from "@/lib/calendar";
import { getUserDisplayName } from "@/lib/users";

type FamilyCalendarProps = {
  compact?: boolean;
};

type CalendarViewMode = "month" | "week";

const weekDays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];

const calendarTypes: {
  id: CalendarEventType;
  label: string;
}[] = [
  { id: "family", label: "Familie" },
  { id: "health", label: "Helse" },
  { id: "home", label: "Hjem" },
  { id: "work", label: "Arbeid" },
  { id: "social", label: "Sosialt" },
  { id: "other", label: "Annet" },
];

const calendarOwners: CalendarOwner[] = ["knut", "ingrid", "family"];

const calendarOwnerBorderClasses: Record<CalendarOwner, string> = {
  knut: "border-l-sky-500",
  ingrid: "border-l-rose-500",
  family: "border-l-emerald-500",
};

const calendarOwnerSoftBackgroundClasses: Record<CalendarOwner, string> = {
  knut: "bg-sky-50",
  ingrid: "bg-rose-50",
  family: "bg-emerald-50",
};

const calendarOwnerTextClasses: Record<CalendarOwner, string> = {
  knut: "text-sky-700",
  ingrid: "text-rose-700",
  family: "text-emerald-700",
};

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

function CalendarOwnerBadge({ owner }: { owner: CalendarOwner }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold ${getCalendarOwnerBadgeClass(
        owner
      )}`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${getCalendarOwnerDotClass(
          owner
        )}`}
      />
      {getCalendarOwnerLabel(owner)}
    </span>
  );
}

function CalendarOwnerLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {calendarOwners.map((owner) => (
        <CalendarOwnerBadge key={owner} owner={owner} />
      ))}
    </div>
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

function getOwnersForEvents(events: CalendarEvent[]) {
  return calendarOwners.filter((owner) =>
    events.some((event) => event.calendarOwner === owner)
  );
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

function getMondayForDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = date.getDay() === 0 ? 7 : date.getDay();

  date.setDate(date.getDate() - weekday + 1);

  return date;
}

function getWeekDays(selectedDate: string) {
  const monday = getMondayForDate(selectedDate);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      date: getLocalDateKey(date),
      day: date.getDate(),
      isCurrentMonth: true,
    };
  });
}

function getWeekLabel(selectedDate: string) {
  const days = getWeekDays(selectedDate);
  const firstDay = days[0].date;
  const lastDay = days[6].date;

  const [firstYear, firstMonth, firstDate] = firstDay.split("-").map(Number);
  const [lastYear, lastMonth, lastDate] = lastDay.split("-").map(Number);

  const first = new Date(firstYear, firstMonth - 1, firstDate);
  const last = new Date(lastYear, lastMonth - 1, lastDate);

  const firstLabel = new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
  }).format(first);

  const lastLabel = new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    year: first.getFullYear() === last.getFullYear() ? undefined : "numeric",
  }).format(last);

  return `${firstLabel} – ${lastLabel}`;
}

function getInitialEditState(event: CalendarEvent | null) {
  return {
    title: event?.title ?? "",
    date: event?.date ?? getLocalDateKey(),
    time: event?.time === "Hele dagen" ? "" : event?.time ?? "",
    location: event?.location ?? "",
    type: event?.type ?? "family",
    calendarOwner: event?.calendarOwner ?? "family",
  };
}

function EventMiniCard({ event }: { event: CalendarEvent }) {
  return (
    <div
      className={`truncate rounded-xl border-l-4 bg-white px-2 py-1.5 text-[10px] font-medium text-stone-700 shadow-sm ${
        calendarOwnerBorderClasses[event.calendarOwner]
      }`}
      title={`${getCalendarOwnerLabel(event.calendarOwner)}: ${event.title}`}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${getCalendarOwnerDotClass(
            event.calendarOwner
          )}`}
        />
        <span className="truncate">{event.title}</span>
      </div>
    </div>
  );
}

function EventListButton({
  event,
  index,
  total,
  onClick,
  variant = "white",
}: {
  event: CalendarEvent;
  index: number;
  total: number;
  onClick: () => void;
  variant?: "white" | "cream";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border-l-4 px-4 py-4 text-left transition sm:py-3 ${
        variant === "white" ? "hover:bg-[#F7F4EA]" : "hover:bg-white"
      } ${calendarOwnerBorderClasses[event.calendarOwner]} ${
        calendarOwnerSoftBackgroundClasses[event.calendarOwner]
      } ${
        index !== total - 1 ? "border-b border-b-[#ECE3D4]" : ""
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[#24312A]">{event.title}</p>

            <CalendarOwnerBadge owner={event.calendarOwner} />

            <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-medium text-[#8D846F]">
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

        <p
          className={`flex w-fit items-center gap-1 text-xs font-semibold ${
            calendarOwnerTextClasses[event.calendarOwner]
          }`}
        >
          <Edit3 size={12} strokeWidth={2} />
          Rediger
        </p>
      </div>
    </button>
  );
}

export default function FamilyCalendar({
  compact = false,
}: FamilyCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(getLocalDateKey());
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState(getLocalDateKey());
  const [editTime, setEditTime] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editType, setEditType] = useState<CalendarEventType>("family");
  const [editCalendarOwner, setEditCalendarOwner] =
    useState<CalendarOwner>("family");

  useEffect(() => {
    loadEvents();

    const unsubscribeFromCalendar = subscribeToCalendarEvents(loadEvents);

    window.addEventListener("project-legacy-calendar-updated", loadEvents);
    window.addEventListener("focus", loadEvents);

    return () => {
      unsubscribeFromCalendar();
      window.removeEventListener("project-legacy-calendar-updated", loadEvents);
      window.removeEventListener("focus", loadEvents);
    };
  }, []);

  async function loadEvents() {
    setIsLoading(true);

    const nextEvents = await readCalendarEvents();

    setEvents(nextEvents);
    setIsLoading(false);
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

  function goToPreviousWeek() {
    const currentMonday = getMondayForDate(selectedDate);
    currentMonday.setDate(currentMonday.getDate() - 7);

    const nextSelectedDate = getLocalDateKey(currentMonday);

    setSelectedDate(nextSelectedDate);
    setVisibleMonth(currentMonday);
  }

  function goToNextWeek() {
    const currentMonday = getMondayForDate(selectedDate);
    currentMonday.setDate(currentMonday.getDate() + 7);

    const nextSelectedDate = getLocalDateKey(currentMonday);

    setSelectedDate(nextSelectedDate);
    setVisibleMonth(currentMonday);
  }

  function goToPreviousPeriod() {
    if (viewMode === "week" && !compact) {
      goToPreviousWeek();
      return;
    }

    goToPreviousMonth();
  }

  function goToNextPeriod() {
    if (viewMode === "week" && !compact) {
      goToNextWeek();
      return;
    }

    goToNextMonth();
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
    setEditCalendarOwner(initialState.calendarOwner);
  }

  function closeEditModal() {
    setEditingEvent(null);
    setEditTitle("");
    setEditDate(getLocalDateKey());
    setEditTime("");
    setEditLocation("");
    setEditType("family");
    setEditCalendarOwner("family");
  }

  async function saveEditedEvent() {
    if (!editingEvent || !editTitle.trim()) {
      return;
    }

    await updateCalendarEvent(editingEvent.id, {
      title: editTitle,
      date: editDate,
      time: editTime,
      location: editLocation,
      type: editType,
      calendarOwner: editCalendarOwner,
    });

    await loadEvents();

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

  async function removeEvent(eventId: string) {
    await deleteCalendarEvent(eventId);
    await loadEvents();
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
  const weekCalendarDays = useMemo(
    () => getWeekDays(selectedDate),
    [selectedDate]
  );

  const selectedDateEvents = sortCalendarEvents(
    eventsByDate[selectedDate] ?? []
  );

  const periodLabel =
    viewMode === "week" && !compact
      ? getWeekLabel(selectedDate)
      : formatCalendarMonth(visibleMonth);

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
                Klikk på en dag for å se avtalene. Farger og venstrekant viser
                om avtalen gjelder Knut Emil, Ingrid eller Felles.
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

      {!compact && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CalendarOwnerLegend />

          <div className="grid grid-cols-2 rounded-2xl bg-[#F7F4EA] p-1">
            <button
              type="button"
              onClick={() => setViewMode("month")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                viewMode === "month"
                  ? "bg-white text-[#24312A] shadow-sm"
                  : "text-stone-500 hover:text-[#24312A]"
              }`}
            >
              Måned
            </button>

            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                viewMode === "week"
                  ? "bg-white text-[#24312A] shadow-sm"
                  : "text-stone-500 hover:text-[#24312A]"
              }`}
            >
              Uke
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl bg-[#F7F4EA] p-4">
          <p className="text-sm leading-6 text-stone-600">
            Henter kalenderen …
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#ECE3D4] bg-[#F7F4EA] p-3 sm:p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goToPreviousPeriod}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#24312A] shadow-sm transition hover:brightness-95"
                aria-label={viewMode === "week" ? "Forrige uke" : "Forrige måned"}
                title={viewMode === "week" ? "Forrige uke" : "Forrige måned"}
              >
                <ChevronLeft size={17} strokeWidth={2.25} />
              </button>

              <button
                type="button"
                onClick={goToToday}
                className="min-w-0 text-center"
              >
                <p className="truncate text-sm font-semibold capitalize text-[#24312A]">
                  {periodLabel}
                </p>

                <p className="mt-0.5 text-xs text-stone-500">Gå til i dag</p>
              </button>

              <button
                type="button"
                onClick={goToNextPeriod}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#24312A] shadow-sm transition hover:brightness-95"
                aria-label={viewMode === "week" ? "Neste uke" : "Neste måned"}
                title={viewMode === "week" ? "Neste uke" : "Neste måned"}
              >
                <ChevronRight size={17} strokeWidth={2.25} />
              </button>
            </div>

            {viewMode === "month" || compact ? (
              <>
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
                    const dayOwners = getOwnersForEvents(dayEvents);
                    const isToday = day.date === todayKey;
                    const isSelected = day.date === selectedDate;

                    return (
                      <button
                        type="button"
                        key={day.date}
                        onClick={() => setSelectedDate(day.date)}
                        className={`min-h-14 rounded-2xl border p-1.5 text-left transition hover:bg-white sm:min-h-20 sm:p-2 ${
                          isSelected
                            ? "border-[#8EB069] bg-white shadow-sm ring-2 ring-[#8EB069]"
                            : dayOwners.length > 0
                              ? "border-white bg-white/70"
                              : "border-transparent bg-transparent"
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
                            <span className="rounded-full bg-[#24312A] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              {dayEvents.length}
                            </span>
                          )}
                        </div>

                        {dayOwners.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {dayOwners.map((owner) => (
                              <span
                                key={owner}
                                className={`h-2.5 w-2.5 rounded-full ring-2 ring-white ${getCalendarOwnerDotClass(
                                  owner
                                )}`}
                                title={getCalendarOwnerLabel(owner)}
                              />
                            ))}
                          </div>
                        )}

                        {!compact && dayEvents.length > 0 && (
                          <div className="mt-2 hidden space-y-1 sm:block">
                            {dayEvents.slice(0, 2).map((event) => (
                              <EventMiniCard key={event.id} event={event} />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-7">
                {weekCalendarDays.map((day, index) => {
                  const dayEvents = sortCalendarEvents(
                    eventsByDate[day.date] ?? []
                  );
                  const dayOwners = getOwnersForEvents(dayEvents);
                  const isToday = day.date === todayKey;
                  const isSelected = day.date === selectedDate;

                  return (
                    <button
                      type="button"
                      key={day.date}
                      onClick={() => {
                        setSelectedDate(day.date);
                        setVisibleMonth(
                          new Date(
                            Number(day.date.slice(0, 4)),
                            Number(day.date.slice(5, 7)) - 1,
                            1
                          )
                        );
                      }}
                      className={`min-h-32 rounded-3xl border p-3 text-left transition hover:bg-white ${
                        isSelected
                          ? "border-[#8EB069] bg-white shadow-sm ring-2 ring-[#8EB069]"
                          : dayOwners.length > 0
                            ? "border-white bg-white/70"
                            : "border-[#ECE3D4] bg-[#FBF8F0]"
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
                            {weekDays[index]}
                          </p>

                          <p
                            className={`mt-1 grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
                              isToday
                                ? "bg-[#F3D66B] text-[#24312A]"
                                : "bg-white text-[#24312A]"
                            }`}
                          >
                            {day.day}
                          </p>
                        </div>

                        {dayEvents.length > 0 && (
                          <span className="rounded-full bg-[#24312A] px-2 py-1 text-xs font-semibold text-white">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {dayOwners.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1.5">
                          {dayOwners.map((owner) => (
                            <span
                              key={owner}
                              className={`h-3 w-3 rounded-full ring-2 ring-white ${getCalendarOwnerDotClass(
                                owner
                              )}`}
                              title={getCalendarOwnerLabel(owner)}
                            />
                          ))}
                        </div>
                      )}

                      {dayEvents.length === 0 ? (
                        <p className="text-xs text-stone-400">Ingen avtaler</p>
                      ) : (
                        <div className="space-y-2">
                          {dayEvents.slice(0, 3).map((event) => (
                            <EventMiniCard key={event.id} event={event} />
                          ))}

                          {dayEvents.length > 3 && (
                            <p className="text-xs font-medium text-stone-500">
                              + {dayEvents.length - 3} flere
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
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
                  <EventListButton
                    key={event.id}
                    event={event}
                    index={index}
                    total={selectedDateEvents.length}
                    onClick={() => openEditModal(event)}
                    variant="white"
                  />
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
                  <EventListButton
                    key={event.id}
                    event={event}
                    index={index}
                    total={visibleUpcomingEvents.length}
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
                    variant="cream"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
                  type="button"
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
                    Gjelder
                  </span>

                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {calendarOwners.map((owner) => (
                      <button
                        type="button"
                        key={owner}
                        onClick={() => setEditCalendarOwner(owner)}
                        className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                          editCalendarOwner === owner
                            ? getCalendarOwnerBadgeClass(owner)
                            : "border-stone-200 bg-[#F7F4EA] text-stone-500 hover:brightness-95"
                        }`}
                      >
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${getCalendarOwnerDotClass(
                            owner
                          )}`}
                        />
                        {getCalendarOwnerLabel(owner)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-[#24312A]">
                    Type
                  </span>

                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {calendarTypes.map((type) => (
                      <button
                        type="button"
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
                    type="button"
                    onClick={() => removeEvent(editingEvent.id)}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-medium text-red-700 transition hover:brightness-95"
                  >
                    <Trash2 size={15} strokeWidth={2} />
                    Slett avtale
                  </button>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="rounded-2xl bg-[#F7F4EA] px-5 py-3 text-sm font-medium text-[#24312A] transition hover:brightness-95"
                    >
                      Avbryt
                    </button>

                    <button
                      type="button"
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