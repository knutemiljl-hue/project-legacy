"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Task,
  XP_PER_LEVEL,
  getDateKey,
  getScopeLabel,
  getTodayKey,
  readCompletedTasks,
  subscribeToTasks,
} from "@/lib/tasks";
import { LegacyUserId, readActiveUser } from "@/lib/users";

const levelNames = [
  "Novise",
  "Vandrer",
  "Speider",
  "Vokter",
  "Strateg",
  "Banebryter",
  "Helt",
  "Legende",
  "Arving",
  "Legacy",
];

const MAX_LEVEL = levelNames.length;

type XpSummary = {
  totalXp: number;
  todayXp: number;
  completedToday: number;
  completedTotal: number;
  recentTasks: Task[];
};

function getLevel(totalXp: number) {
  const calculatedLevel = Math.floor(totalXp / XP_PER_LEVEL) + 1;

  return Math.min(calculatedLevel, MAX_LEVEL);
}

function getCurrentLevelXp(totalXp: number) {
  if (getLevel(totalXp) >= MAX_LEVEL) {
    return XP_PER_LEVEL;
  }

  return totalXp % XP_PER_LEVEL;
}

function getXpToNextLevel(totalXp: number) {
  if (getLevel(totalXp) >= MAX_LEVEL) {
    return 0;
  }

  return XP_PER_LEVEL - getCurrentLevelXp(totalXp);
}

function getLevelTitle(level: number) {
  return levelNames[level - 1] ?? "Legacy";
}

async function readXpSummary(activeUserId: LegacyUserId): Promise<XpSummary> {
  const completedTasks = await readCompletedTasks();

  const ownCompletedTasks = completedTasks.filter(
    (task) => task.completedBy === activeUserId
  );

  const todayKey = getTodayKey();

  const todayTasks = ownCompletedTasks.filter((task) => {
    if (!task.completedAt) {
      return false;
    }

    return getDateKey(new Date(task.completedAt)) === todayKey;
  });

  const totalXp = ownCompletedTasks.reduce((sum, task) => sum + task.xp, 0);
  const todayXp = todayTasks.reduce((sum, task) => sum + task.xp, 0);

  const recentTasks = ownCompletedTasks
    .filter((task) => task.completedAt)
    .sort(
      (a, b) =>
        new Date(b.completedAt as string).getTime() -
        new Date(a.completedAt as string).getTime()
    )
    .slice(0, 2);

  return {
    totalXp,
    todayXp,
    completedToday: todayTasks.length,
    completedTotal: ownCompletedTasks.length,
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
  const [activeUserId, setActiveUserId] = useState<LegacyUserId>("knut");
  const [summary, setSummary] = useState<XpSummary>({
    totalXp: 0,
    todayXp: 0,
    completedToday: 0,
    completedTotal: 0,
    recentTasks: [],
  });

  const level = getLevel(summary.totalXp);
  const currentLevelXp = getCurrentLevelXp(summary.totalXp);
  const xpToNextLevel = getXpToNextLevel(summary.totalXp);
  const progressPercentage = Math.round((currentLevelXp / XP_PER_LEVEL) * 100);
  const levelTitle = getLevelTitle(level);
  const hasReachedMaxLevel = level >= MAX_LEVEL;

  useEffect(() => {
    updateActiveUserAndXp();

    const unsubscribeFromTasks = subscribeToTasks(updateActiveUserAndXp);

    window.addEventListener(
      "project-legacy-active-user-updated",
      updateActiveUserAndXp
    );
    window.addEventListener("project-legacy-xp-updated", updateActiveUserAndXp);
    window.addEventListener(
      "project-legacy-tasks-updated",
      updateActiveUserAndXp
    );
    window.addEventListener("focus", updateActiveUserAndXp);

    return () => {
      unsubscribeFromTasks();
      window.removeEventListener(
        "project-legacy-active-user-updated",
        updateActiveUserAndXp
      );
      window.removeEventListener(
        "project-legacy-xp-updated",
        updateActiveUserAndXp
      );
      window.removeEventListener(
        "project-legacy-tasks-updated",
        updateActiveUserAndXp
      );
      window.removeEventListener("focus", updateActiveUserAndXp);
    };
  }, []);

  async function updateActiveUserAndXp() {
    const activeUser = readActiveUser();

    setActiveUserId(activeUser.id);

    const nextSummary = await readXpSummary(activeUser.id);

    setSummary(nextSummary);
  }

  return (
    <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-5 shadow-sm ring-1 ring-black/5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F7F4EA] text-[#4F773D]">
            <Sparkles size={21} strokeWidth={2} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
              XP
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
              Nivå {level}
            </h2>

            <p className="mt-1 text-sm text-stone-500">{levelTitle}</p>
          </div>
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
          <p className="font-medium text-[#24312A]">Fremdrift</p>

          <p className="text-stone-500">
            {currentLevelXp} / {XP_PER_LEVEL} XP
          </p>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[#F7F4EA]">
          <div
            className="h-full rounded-full bg-[#4F773D] transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-stone-500">
          {hasReachedMaxLevel
            ? "Maksnivå nådd for v1."
            : `${xpToNextLevel} XP igjen til nivå ${level + 1}: ${
                levelNames[level] ?? "Neste nivå"
              }.`}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
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
      </div>

      <div className="mt-4 rounded-3xl bg-[#F7F4EA] p-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
            Siste fullførte
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
                    {formatCompletedTime(task.completedAt as string)}
                  </p>
                </div>

                <p className="rounded-full bg-[#F4F8EF] px-3 py-1 text-xs font-semibold text-[#4F773D]">
                  +{task.xp} XP
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}