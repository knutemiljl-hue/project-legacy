"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CUSTOM_TASKS_KEY = "project-legacy-custom-daily-tasks";
const COMPLETION_RECORDS_KEY = "project-legacy-task-completions";
const COMPLETED_TASKS_KEY = "project-legacy-daily-tasks";
const TASK_HISTORY_KEY = "project-legacy-task-history";

const XP_PER_TASK = 5;

type TaskScope = "personal" | "family";

type Task = {
  id: string;
  title: string;
  subtitle: string;
  date?: string;
  time: string;
  scope?: TaskScope;
  done?: boolean;
  isCustom?: boolean;
};

type CompletionRecord = {
  taskId: string;
  completedAt: string;
  xp: number;
};

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

function notifyUpdates() {
  window.setTimeout(() => {
    window.dispatchEvent(new Event("project-legacy-xp-updated"));
    window.dispatchEvent(new Event("project-legacy-tasks-updated"));
  }, 0);
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTodayKey() {
  return getLocalDateKey();
}

function isTaskForToday(task: Task) {
  if (!task.date) {
    return true;
  }

  return task.date === getTodayKey();
}

function formatDate(date?: string) {
  if (!date) {
    return null;
  }

  const [year, month, day] = date.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(localDate);
}

function readFamilyTasks() {
  const storedTasks = window.localStorage.getItem(CUSTOM_TASKS_KEY);
  const parsedTasks: Task[] = storedTasks ? JSON.parse(storedTasks) : [];

  return parsedTasks
    .map((task) => ({
      ...task,
      scope: task.scope || "personal",
    }))
    .filter((task) => task.scope === "family");
}

function readCompletionRecords() {
  const storedRecords = window.localStorage.getItem(COMPLETION_RECORDS_KEY);

  return storedRecords ? JSON.parse(storedRecords) : [];
}

function readHistory() {
  const storedHistory = window.localStorage.getItem(TASK_HISTORY_KEY);

  return storedHistory ? JSON.parse(storedHistory) : [];
}

function saveCompletionRecords(records: CompletionRecord[]) {
  window.localStorage.setItem(COMPLETION_RECORDS_KEY, JSON.stringify(records));

  window.localStorage.setItem(
    COMPLETED_TASKS_KEY,
    JSON.stringify(records.map((record) => record.taskId))
  );

  notifyUpdates();
}

export default function FamilyTasksSummary() {
  const [familyTasks, setFamilyTasks] = useState<Task[]>([]);
  const [completionRecords, setCompletionRecords] = useState<
    CompletionRecord[]
  >([]);
  const [history, setHistory] = useState<ArchivedTask[]>([]);

  useEffect(() => {
    loadData();

    window.addEventListener("project-legacy-tasks-updated", loadData);
    window.addEventListener("project-legacy-xp-updated", loadData);
    window.addEventListener("focus", loadData);
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("project-legacy-tasks-updated", loadData);
      window.removeEventListener("project-legacy-xp-updated", loadData);
      window.removeEventListener("focus", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  function loadData() {
    setFamilyTasks(readFamilyTasks());
    setCompletionRecords(readCompletionRecords());
    setHistory(readHistory());
  }

  function toggleTask(taskId: string) {
    setCompletionRecords((currentRecords) => {
      const isCompleted = currentRecords.some(
        (record) => record.taskId === taskId
      );

      const nextRecords = isCompleted
        ? currentRecords.filter((record) => record.taskId !== taskId)
        : [
            ...currentRecords,
            {
              taskId,
              completedAt: new Date().toISOString(),
              xp: XP_PER_TASK,
            },
          ];

      saveCompletionRecords(nextRecords);

      return nextRecords;
    });
  }

  const completedTaskIds = completionRecords.map((record) => record.taskId);

  const todaysFamilyTasks = familyTasks.filter((task) => isTaskForToday(task));

  const openFamilyTasks = todaysFamilyTasks.filter(
    (task) => !completedTaskIds.includes(task.id)
  );

  const completedFamilyTasksToday = todaysFamilyTasks.filter((task) =>
    completedTaskIds.includes(task.id)
  );

  const archivedFamilyTasks = history.filter((task) => task.scope === "family");

  const familyXpToday = completedFamilyTasksToday.length * XP_PER_TASK;
  const familyXpArchived = archivedFamilyTasks.reduce(
    (sum, task) => sum + task.xp,
    0
  );

  const totalFamilyXp = familyXpToday + familyXpArchived;

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#8D846F]">
            Familieoppgaver
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
            Felles oppgaver
          </h2>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Oppgaver som gjelder hjemmet, barnet eller familien samlet.
          </p>
        </div>

        <div className="rounded-2xl bg-[#F4F8EF] px-4 py-3 text-right">
          <p className="text-xs text-[#6F8F54]">Familie-XP</p>
          <p className="text-lg font-semibold text-[#24312A]">
            {totalFamilyXp}
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[#F7F4EA] p-4">
          <p className="text-xs text-stone-500">Åpne i dag</p>
          <p className="mt-1 text-xl font-semibold text-[#24312A]">
            {openFamilyTasks.length}
          </p>
        </div>

        <div className="rounded-2xl bg-[#F7F4EA] p-4">
          <p className="text-xs text-stone-500">Fullført i dag</p>
          <p className="mt-1 text-xl font-semibold text-[#24312A]">
            {completedFamilyTasksToday.length}
          </p>
        </div>

        <div className="rounded-2xl bg-[#F7F4EA] p-4">
          <p className="text-xs text-stone-500">Arkivert</p>
          <p className="mt-1 text-xl font-semibold text-[#24312A]">
            {archivedFamilyTasks.length}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#8D846F]">
            Åpne i dag
          </h3>

          <Link
            href="/"
            className="text-sm font-medium text-[#24312A] transition hover:opacity-70"
          >
            Legg til ny →
          </Link>
        </div>

        {openFamilyTasks.length === 0 ? (
          <div className="rounded-2xl bg-[#F7F4EA] p-4">
            <p className="text-sm leading-6 text-stone-600">
              Ingen åpne familieoppgaver i dag.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {openFamilyTasks.map((task) => {
              const formattedDate = formatDate(task.date);

              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-2xl bg-[#F7F4EA] p-4"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-stone-300" />

                    <div>
                      <p className="font-medium text-[#24312A]">{task.title}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        {task.subtitle}
                      </p>
                    </div>
                  </button>

                  <div className="text-right">
                    {formattedDate && (
                      <p className="text-xs text-stone-400">{formattedDate}</p>
                    )}

                    <p className="text-sm text-stone-500">{task.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {completedFamilyTasksToday.length > 0 && (
        <div className="mt-6 rounded-3xl border border-[#DDE8D4] bg-[#F4F8EF] p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#6F8F54]">
                Fullført i dag
              </p>

              <p className="mt-1 text-sm text-stone-600">
                {completedFamilyTasksToday.length} familieoppgaver gjort
              </p>
            </div>

            <p className="rounded-full bg-[#8EB069] px-3 py-1 text-sm font-semibold text-white">
              +{familyXpToday} XP
            </p>
          </div>

          <div className="space-y-2">
            {completedFamilyTasksToday.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[#8EB069] text-xs text-white">
                    ✓
                  </span>

                  <p className="font-medium text-[#24312A]">{task.title}</p>
                </div>

                <button
                  onClick={() => toggleTask(task.id)}
                  className="rounded-full bg-[#F7F4EA] px-3 py-1 text-xs font-medium text-[#24312A] transition hover:brightness-95"
                >
                  Angre
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}