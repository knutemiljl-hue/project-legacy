"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, ShoppingBag } from "lucide-react";
import {
  CalendarEvent,
  getLocalDateKey as getCalendarDateKey,
  readCalendarEvents,
  subscribeToCalendarEvents,
} from "@/lib/calendar";
import {
  Task,
  isPurchaseTask,
  isRegularTask,
  isTaskDueTodayOrOverdue,
  readTasks,
  subscribeToTasks,
} from "@/lib/tasks";
import {
  LegacyUserId,
  legacyUsers,
  readActiveUser,
} from "@/lib/users";

type DashboardStats = {
  todayTasks: number;
  upcomingEvents: number;
  largeTasks: number;
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 6) {
    return "God natt";
  }

  if (hour < 12) {
    return "God morgen";
  }

  if (hour < 18) {
    return "God ettermiddag";
  }

  return "God kveld";
}

function isVisibleForActiveUser(task: Task, activeUserId: LegacyUserId) {
  if (task.scope === "family") {
    return true;
  }

  if (!task.createdBy) {
    return true;
  }

  return task.createdBy === activeUserId;
}

function getSevenDaysFromTodayKey() {
  const sevenDaysFromToday = new Date();

  sevenDaysFromToday.setDate(sevenDaysFromToday.getDate() + 7);

  return getCalendarDateKey(sevenDaysFromToday);
}

function countUpcomingEvents(events: CalendarEvent[]) {
  const todayKey = getCalendarDateKey();
  const sevenDaysFromTodayKey = getSevenDaysFromTodayKey();

  return events.filter(
    (event) => event.date >= todayKey && event.date <= sevenDaysFromTodayKey
  ).length;
}

function StatusChip({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "tasks" | "calendar" | "large";
}) {
  const toneClasses = {
    tasks: {
      shell: "border-[#CFE4C5] bg-[#F3FAF1]",
      icon: "bg-[#E2F1D8] text-[#3F6F35]",
    },
    calendar: {
      shell: "border-sky-200 bg-sky-50",
      icon: "bg-sky-100 text-sky-700",
    },
    large: {
      shell: "border-[#D9C7E8] bg-[#F7F1FB]",
      icon: "bg-[#EADCF5] text-[#6F4D8B]",
    },
  }[tone];

  return (
    <div
      className={`flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-3 shadow-sm sm:px-4 ${toneClasses.shell}`}
    >
      <div
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl shadow-sm ${toneClasses.icon}`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-[#8D846F]">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-semibold text-[#24312A] sm:text-base">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function UserGreeting() {
  const [activeUser, setActiveUser] = useState(legacyUsers[0]);
  const [greeting, setGreeting] = useState("Hei");
  const [stats, setStats] = useState<DashboardStats>({
    todayTasks: 0,
    upcomingEvents: 0,
    largeTasks: 0,
  });

  async function updateDashboard() {
    const nextActiveUser = readActiveUser();

    setActiveUser(nextActiveUser);
    setGreeting(getGreeting());

    const [tasks, events] = await Promise.all([
      readTasks(),
      readCalendarEvents(),
    ]);

    const visibleTasks = tasks.filter((task) =>
      isVisibleForActiveUser(task, nextActiveUser.id)
    );

    const todayTasks = visibleTasks
      .filter(isRegularTask)
      .filter(isTaskDueTodayOrOverdue)
      .filter((task) => !task.done).length;

    const largeTasks = visibleTasks
      .filter(isPurchaseTask)
      .filter((task) => !task.done).length;

    setStats({
      todayTasks,
      upcomingEvents: countUpcomingEvents(events),
      largeTasks,
    });
  }

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      updateDashboard();
    }, 0);

    const unsubscribeFromTasks = subscribeToTasks(updateDashboard);
    const unsubscribeFromCalendar = subscribeToCalendarEvents(updateDashboard);

    window.addEventListener(
      "project-legacy-active-user-updated",
      updateDashboard
    );
    window.addEventListener("project-legacy-tasks-updated", updateDashboard);
    window.addEventListener("project-legacy-calendar-updated", updateDashboard);
    window.addEventListener("storage", updateDashboard);
    window.addEventListener("focus", updateDashboard);

    return () => {
      window.clearTimeout(initialLoadTimer);
      unsubscribeFromTasks();
      unsubscribeFromCalendar();

      window.removeEventListener(
        "project-legacy-active-user-updated",
        updateDashboard
      );
      window.removeEventListener("project-legacy-tasks-updated", updateDashboard);
      window.removeEventListener(
        "project-legacy-calendar-updated",
        updateDashboard
      );
      window.removeEventListener("storage", updateDashboard);
      window.removeEventListener("focus", updateDashboard);
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#E2D8C7] bg-white/85 p-5 shadow-sm ring-1 ring-black/5 sm:rounded-[2.5rem] sm:p-7">
      <div className="flex flex-col gap-5">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.75rem] border border-[#E2D8C7] bg-white shadow-sm ring-1 ring-black/5 sm:h-28 sm:w-28 sm:rounded-[2.25rem]">
            <Image
              src={activeUser.avatar}
              alt={`Avatar for ${activeUser.name}`}
              fill
              priority
              sizes="(max-width: 640px) 80px, 112px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8D846F]">
              Project Legacy
            </p>

            <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#24312A] sm:text-5xl">
              {greeting}, {activeUser.name}.
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
              Her er familiens rolige kontrollsenter for dagen, uken og alt som
              må huskes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <StatusChip
            label="I dag"
            value={`${stats.todayTasks} åpne`}
            icon={<CheckCircle2 size={18} strokeWidth={2.25} />}
            tone="tasks"
          />

          <StatusChip
            label="Neste 7 dager"
            value={`${stats.upcomingEvents} avtaler`}
            icon={<CalendarDays size={18} strokeWidth={2.25} />}
            tone="calendar"
          />

          <StatusChip
            label="Store ting"
            value={`${stats.largeTasks} åpne`}
            icon={<ShoppingBag size={18} strokeWidth={2.25} />}
            tone="large"
          />
        </div>
      </div>
    </section>
  );
}
