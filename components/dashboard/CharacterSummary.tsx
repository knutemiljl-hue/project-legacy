"use client";

import { useEffect, useState } from "react";
import { dailyTasks } from "@/data/dashboard";
import {
  ArchivedTask,
  CompletionRecord,
  Task,
  XP_PER_LEVEL,
  createDefaultTasks,
  getDateKey,
  getScopeLabel,
  getTodayKey,
  readCompletionRecords,
  readCustomTasks,
  readTaskHistory,
} from "@/lib/tasks";

type XpTask = {
  id: string;
  title: string;
  scope: "personal" | "family";
  xp: number;
  completedAt: string;
};

type XpSummary = {
  totalXp: number;
  todayXp: number;
  personalXp: number;
  familyXp: number;
  completedToday: number;
  completedTotal: number;
  recentTasks: XpTask[];
};

function getLevel(totalXp: number) {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

function getCurrentLevelXp(totalXp: number) {
  return totalXp % XP_PER_LEVEL;
}

function getXpToNextLevel(totalXp: number) {
  return XP_PER_LEVEL - getCurrentLevelXp(totalXp);
}

function getLevelTitle(level: number) {
  if (level <= 1) {
    return "Starten";
  }

  if (level <= 3) {
    return "Rytme";
  }

  if (level <= 6) {
    return "Stabilitet";
  }

  if (level <= 10) {
    return "Momentum";
  }

  return "Legacy";
}

function getTaskById(tasks: Task[], taskId: string) {
  return tasks.find((task) => task.id === taskId);
}

function mapCompletionToXpTask({
  record,
  tasks,
}: {
  record: CompletionRecord;
  tasks: Task[];
}): XpTask | null {
  const task = getTaskById(tasks, record.taskId);

  if (!task) {
    return null;
  }

  return {
    id: `${record.taskId}-${record.completedAt}`,
    title: task.title,
    scope: task.scope,
    xp: record.xp,
    completedAt: record.completedAt,
  };
}

function mapHistoryToXpTask(task: ArchivedTask): XpTask {
  return {
    id: `${task.taskId}-${task.completedAt}`,
    title: task.title,
    scope: task.scope,
    xp: task.xp,
    completedAt: task.completedAt,
  };
}

function readXpSummary(): XpSummary {
  const defaultTasks = createDefaultTasks(dailyTasks);
  const customTasks = readCustomTasks();
  const allActiveTasks = [...defaultTasks, ...customTasks];

  const completionRecords = readCompletionRecords();
  const taskHistory = readTaskHistory();

  const todayKey = getTodayKey();

  const todayXpTasks = completionRecords
    .map((record) =>
      mapCompletionToXpTask({
        record,
        tasks: allActiveTasks,
      })
    )
    .filter(Boolean) as XpTask[];

  const archivedXpTasks = taskHistory.map(mapHistoryToXpTask);

  const allXpTasks = [...todayXpTasks, ...archivedXpTasks];

  const totalXp = allXpTasks.reduce((sum, task) => sum + task.xp, 0);

  const todayXp = todayXpTasks
    .filter((task) => getDateKey(new Date(task.completedAt)) === todayKey)
    .reduce((sum, task) => sum + task.xp, 0);

  const personalXp = allXpTasks
    .filter((task) => task.scope === "personal")
    .reduce((sum, task) => sum + task.xp, 0);

  const familyXp = allXpTasks
    .filter((task) => task.scope === "family")
    .reduce((sum, task) => sum + task.xp, 0);

  const recentTasks = [...allXpTasks]
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
    .slice(0, 4);

  return {
    totalXp,
    todayXp,
    personalXp,
    familyXp,
    completedToday: todayXpTasks.length,
    completedTotal: allXpTasks.length,
    recentTasks,
  };
}

function formatCompletedTime(completedAt: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(completedAt));
}

export default function CharacterSummary() {
  const [summary, setSummary] = useState<XpSummary>({
    totalXp: 0,
    todayXp: 0,
    personalXp: 0,
    familyXp: 0,
    completedToday: 0,
    completedTotal: 0,
    recentTasks: [],
  });

  const level = getLevel(summary.totalXp);
  const currentLevelXp = getCurrentLevelXp(summary.totalXp);
  const xpToNextLevel = getXpToNextLevel(summary.totalXp);
  const progressPercentage = Math.round((currentLevelXp / XP_PER_LEVEL) * 100);
  const levelTitle = getLevelTitle(level);

  useEffect(() => {
    function updateXp() {
      setSummary(readXpSummary());
    }

    updateXp();

    window.addEventListener("project-legacy-xp-updated", updateXp);
    window.addEventListener("project-legacy-tasks-updated", updateXp);
    window.addEventListener("storage", updateXp);

    return () => {
      window.removeEventListener("project-legacy-xp-updated", updateXp);
      window.removeEventListener("project-legacy-tasks-updated", updateXp);
      window.removeEventListener("storage", updateXp);
    };
  }, []);

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#8D846F]">XP</p>

          <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
            Nivå {level}
          </h2>

          <p className="mt-1 text-sm text-stone-500">{levelTitle}</p>
        </div>

        <div className="rounded-2xl bg-[#F7F4EA] px-4 py-3 text-right">
          <p className="text-xs text-stone-500">Total XP</p>
          <p className="text-lg font-semibold text-[#24312A]">
            {summary.totalXp}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <p className="font-medium text-[#24312A]">Neste nivå</p>

          <p className="text-stone-500">
            {currentLevelXp} / {XP_PER_LEVEL} XP
          </p>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[#F7F4EA]">
          <div
            className="h-full rounded-full bg-[#8EB069] transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-stone-500">
          {xpToNextLevel} XP igjen til nivå {level + 1}.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#F7F4EA] p-4">
          <p className="text-xs text-stone-500">XP i dag</p>
          <p className="mt-1 text-xl font-semibold text-[#24312A]">
            {summary.todayXp}
          </p>
        </div>

        <div className="rounded-2xl bg-[#F7F4EA] p-4">
          <p className="text-xs text-stone-500">Fullført i dag</p>
          <p className="mt-1 text-xl font-semibold text-[#24312A]">
            {summary.completedToday}
          </p>
        </div>

        <div className="rounded-2xl bg-[#F7F4EA] p-4">
          <p className="text-xs text-stone-500">Egne oppgaver</p>
          <p className="mt-1 text-xl font-semibold text-[#24312A]">
            {summary.personalXp}
          </p>
        </div>

        <div className="rounded-2xl bg-[#F7F4EA] p-4">
          <p className="text-xs text-stone-500">Familieoppgaver</p>
          <p className="mt-1 text-xl font-semibold text-[#24312A]">
            {summary.familyXp}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-3xl bg-[#F7F4EA] p-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#8D846F]">
            Siste XP
          </h3>

          <p className="text-xs text-stone-400">
            {summary.completedTotal} totalt
          </p>
        </div>

        {summary.recentTasks.length === 0 ? (
          <p className="text-sm leading-6 text-stone-600">
            Fullfør en oppgave for å starte progresjonen.
          </p>
        ) : (
          <div className="space-y-2">
            {summary.recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[#24312A]">
                    {task.title}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    {getScopeLabel(task.scope)} ·{" "}
                    {formatCompletedTime(task.completedAt)}
                  </p>
                </div>

                <p className="rounded-full bg-[#F4F8EF] px-3 py-1 text-xs font-semibold text-[#6F8F54]">
                  +{task.xp} XP
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-sm leading-6 text-stone-600">
        XP kommer kun fra fullførte egne oppgaver og familieoppgaver.
      </p>
    </section>
  );
}