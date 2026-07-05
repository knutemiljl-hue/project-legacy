"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const TASK_HISTORY_KEY = "project-legacy-task-history";

type TaskScope = "personal" | "family";

type ArchivedTask = {
  id: string;
  taskId: string;
  title: string;
  subtitle: string;
  date?: string;
  time: string;
  scope: TaskScope;
  completedAt: string;
  xp: number;
};

function getScopeLabel(scope: TaskScope) {
  return scope === "family" ? "Familie" : "Egen";
}

function formatCompletedAt(completedAt: string) {
  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(completedAt));
}

export default function ArchivePage() {
  const [history, setHistory] = useState<ArchivedTask[]>([]);

  useEffect(() => {
    const storedHistory = window.localStorage.getItem(TASK_HISTORY_KEY);
    const parsedHistory: ArchivedTask[] = storedHistory
      ? JSON.parse(storedHistory)
      : [];

    const sortedHistory = parsedHistory.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    setHistory(sortedHistory);
  }, []);

  const totalXp = history.reduce((sum, task) => sum + task.xp, 0);
  const familyTasks = history.filter((task) => task.scope === "family");
  const personalTasks = history.filter((task) => task.scope === "personal");

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#8D846F]">Arkiv</p>

          <h1 className="mt-1 text-3xl font-semibold text-[#24312A]">
            Fullførte oppgaver
          </h1>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Her samles oppgaver som er fullført tidligere dager.
          </p>
        </div>

        <Link
          href="/"
          className="rounded-2xl bg-[#F7F4EA] px-4 py-2 text-sm font-medium text-[#24312A] transition hover:brightness-95"
        >
          Til forsiden
        </Link>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Arkiverte oppgaver</p>
          <p className="mt-2 text-2xl font-semibold text-[#24312A]">
            {history.length}
          </p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Total XP</p>
          <p className="mt-2 text-2xl font-semibold text-[#24312A]">
            {totalXp}
          </p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-stone-500">Fordeling</p>
          <p className="mt-2 text-sm font-medium text-[#24312A]">
            {personalTasks.length} egne · {familyTasks.length} familie
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#8D846F]">
              Oppgavehistorikk
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
              Tidligere fullført
            </h2>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl bg-[#F7F4EA] p-5">
            <p className="text-sm leading-6 text-stone-600">
              Ingen oppgaver er arkivert ennå. Fullførte oppgaver flyttes hit
              automatisk når en ny dag starter.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-2xl bg-[#F7F4EA] p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#8EB069] text-xs text-white">
                      ✓
                    </span>

                    <p className="font-medium text-[#24312A]">{task.title}</p>

                    <span className="rounded-full bg-[#EEF5E8] px-2 py-1 text-xs font-semibold text-[#6F8F54]">
                      +{task.xp} XP
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-stone-500">
                    {task.subtitle}
                  </p>

                  <p className="mt-1 text-xs text-stone-400">
                    {getScopeLabel(task.scope)} · {formatCompletedAt(task.completedAt)}
                  </p>
                </div>

                <p className="text-sm text-stone-500">{task.time}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}