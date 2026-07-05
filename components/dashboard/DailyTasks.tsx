"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { dailyTasks } from "@/data/dashboard";

const COMPLETED_TASKS_KEY = "project-legacy-daily-tasks";
const CUSTOM_TASKS_KEY = "project-legacy-custom-daily-tasks";
const COMPLETION_RECORDS_KEY = "project-legacy-task-completions";
const TASK_HISTORY_KEY = "project-legacy-task-history";

const XP_PER_TASK = 5;

type TaskScope = "personal" | "family";

type Task = {
  id: string;
  title: string;
  subtitle: string;
  date?: string;
  time: string;
  scope: TaskScope;
  done: boolean;
  isCustom: boolean;
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

function notifyXpUpdated() {
  window.setTimeout(() => {
    window.dispatchEvent(new Event("project-legacy-xp-updated"));
  }, 0);
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDateKey(date: Date) {
  return getLocalDateKey(date);
}

function getTodayKey() {
  return getLocalDateKey();
}

function isTaskForToday(task: Task) {
  if (!task.isCustom) {
    return true;
  }

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

function getScopeLabel(scope: TaskScope) {
  return scope === "family" ? "Familie" : "Egen";
}

function getDefaultTasks(): Task[] {
  return dailyTasks.map((task) => ({
    id: task.id,
    title: task.title,
    subtitle: task.subtitle,
    time: task.time,
    scope: "personal",
    done: task.done,
    isCustom: false,
  }));
}

function readCustomTasks(): Task[] {
  const storedCustomTasks = window.localStorage.getItem(CUSTOM_TASKS_KEY);
  const parsedCustomTasks = storedCustomTasks
    ? JSON.parse(storedCustomTasks)
    : [];

  return parsedCustomTasks.map((task: Task) => ({
    ...task,
    scope: task.scope || "personal",
    isCustom: true,
  }));
}

function readTaskHistory(): ArchivedTask[] {
  const storedHistory = window.localStorage.getItem(TASK_HISTORY_KEY);

  return storedHistory ? JSON.parse(storedHistory) : [];
}

function saveCompletionRecords(records: CompletionRecord[]) {
  window.localStorage.setItem(COMPLETION_RECORDS_KEY, JSON.stringify(records));

  window.localStorage.setItem(
    COMPLETED_TASKS_KEY,
    JSON.stringify(records.map((record) => record.taskId))
  );

  notifyXpUpdated();
}

function TaskList({
  title,
  tasks,
  completedRecords,
  onToggleTask,
  onDeleteTask,
}: {
  title: string;
  tasks: Task[];
  completedRecords: CompletionRecord[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  const completedTaskIds = completedRecords.map((record) => record.taskId);

  const visibleTasks = tasks.filter(
    (task) => isTaskForToday(task) && !completedTaskIds.includes(task.id)
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#8D846F]">
          {title}
        </h3>

        <p className="text-xs text-stone-400">
          {visibleTasks.length} åpne oppgaver
        </p>
      </div>

      {visibleTasks.length === 0 ? (
        <div className="rounded-2xl bg-[#F7F4EA] p-4">
          <p className="text-sm text-stone-500">Ingen åpne oppgaver her.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleTasks.map((task) => {
            const formattedDate = formatDate(task.date);

            return (
              <div
                key={task.id}
                className="flex w-full items-center justify-between rounded-2xl bg-[#F7F4EA] p-4 transition hover:brightness-95"
              >
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-stone-300" />

                  <div>
                    <p className="font-medium text-[#24312A]">{task.title}</p>
                    <p className="text-sm text-stone-500">{task.subtitle}</p>
                  </div>
                </button>

                <div className="ml-4 flex items-center gap-4">
                  <div className="text-right">
                    {formattedDate && (
                      <p className="text-xs text-stone-400">{formattedDate}</p>
                    )}

                    <p className="text-sm text-stone-500">{task.time}</p>
                  </div>

                  {task.isCustom && (
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="rounded-full px-3 py-1 text-sm font-medium text-stone-400 transition hover:bg-white hover:text-red-600"
                      aria-label={`Slett ${task.title}`}
                      title="Slett oppgave"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CompletedTasks({
  tasks,
  onUndoTask,
}: {
  tasks: Task[];
  onUndoTask: (taskId: string) => void;
}) {
  const earnedXp = tasks.length * XP_PER_TASK;

  return (
    <div className="rounded-3xl border border-[#DDE8D4] bg-[#F4F8EF] p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#6F8F54]">
            Fullført i dag
          </p>

          <h3 className="mt-1 text-xl font-semibold text-[#24312A]">
            {tasks.length === 0
              ? "Ingen fullførte oppgaver ennå"
              : `${tasks.length} oppgaver gjort`}
          </h3>

          {tasks.length > 0 && (
            <p className="mt-1 text-sm font-medium text-[#6F8F54]">
              +{earnedXp} XP opptjent i dag
            </p>
          )}
        </div>

        {tasks.length > 0 && (
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#8EB069] text-sm font-semibold text-white">
            +{earnedXp}
          </div>
        )}
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm leading-6 text-stone-600">
          Når dere huker av oppgaver, samles de her i dag. I morgen flyttes de
          automatisk til arkivet.
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const formattedDate = formatDate(task.date);

            return (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#8EB069] text-xs text-white">
                      ✓
                    </span>

                    <p className="font-medium text-[#24312A]">{task.title}</p>

                    <span className="rounded-full bg-[#EEF5E8] px-2 py-1 text-xs font-semibold text-[#6F8F54]">
                      +{XP_PER_TASK} XP
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-stone-500">
                    {getScopeLabel(task.scope)}
                    {formattedDate ? ` · ${formattedDate}` : ""}
                    {task.time ? ` · ${task.time}` : ""}
                  </p>
                </div>

                <button
                  onClick={() => onUndoTask(task.id)}
                  className="rounded-full bg-[#F7F4EA] px-3 py-1 text-xs font-medium text-[#24312A] transition hover:brightness-95"
                >
                  Angre
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TaskHistorySummary({ history }: { history: ArchivedTask[] }) {
  const totalXp = history.reduce((sum, task) => sum + task.xp, 0);

  return (
    <Link
      href="/archive"
      className="flex items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-[#F7F4EA] px-5 py-4 transition hover:brightness-95"
    >
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8D846F]">
          Arkiv
        </p>

        <p className="mt-1 text-sm text-stone-600">
          {history.length === 0
            ? "Ingen arkiverte oppgaver ennå"
            : `${history.length} arkiverte oppgaver`}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white px-4 py-2 text-right">
          <p className="text-xs text-stone-500">XP</p>
          <p className="text-sm font-semibold text-[#24312A]">{totalXp}</p>
        </div>

        <p className="text-sm font-medium text-[#24312A]">Åpne →</p>
      </div>
    </Link>
  );
}

export default function DailyTasks() {
  const [completionRecords, setCompletionRecords] = useState<
    CompletionRecord[]
  >([]);
  const [customTasks, setCustomTasks] = useState<Task[]>([]);
  const [taskHistory, setTaskHistory] = useState<ArchivedTask[]>([]);

  const defaultTasks = getDefaultTasks();
  const allTasks: Task[] = [...defaultTasks, ...customTasks];
  const todayTasks = allTasks.filter((task) => isTaskForToday(task));

  const completedTaskIds = completionRecords.map((record) => record.taskId);

  const personalTasks = allTasks.filter((task) => task.scope === "personal");
  const familyTasks = allTasks.filter((task) => task.scope === "family");

  const openTasks = todayTasks.filter(
    (task) => !completedTaskIds.includes(task.id)
  );

  const completedTaskItems = todayTasks.filter((task) =>
    completedTaskIds.includes(task.id)
  );

  const earnedXpToday = completedTaskItems.length * XP_PER_TASK;

  useEffect(() => {
    initializeTasks();

    window.addEventListener("project-legacy-tasks-updated", loadCustomTasks);

    return () => {
      window.removeEventListener(
        "project-legacy-tasks-updated",
        loadCustomTasks
      );
    };
  }, []);

  function initializeTasks() {
    const loadedCustomTasks = readCustomTasks();
    const loadedHistory = readTaskHistory();

    const storedCompletionRecords = window.localStorage.getItem(
      COMPLETION_RECORDS_KEY
    );

    const storedCompletedTaskIds =
      window.localStorage.getItem(COMPLETED_TASKS_KEY);

    let records: CompletionRecord[] = [];

    if (storedCompletionRecords) {
      records = JSON.parse(storedCompletionRecords);
    } else if (storedCompletedTaskIds) {
      const parsedTaskIds: string[] = JSON.parse(storedCompletedTaskIds);

      records = parsedTaskIds.map((taskId) => ({
        taskId,
        completedAt: new Date().toISOString(),
        xp: XP_PER_TASK,
      }));
    } else {
      records = dailyTasks
        .filter((task) => task.done)
        .map((task) => ({
          taskId: task.id,
          completedAt: new Date().toISOString(),
          xp: XP_PER_TASK,
        }));
    }

    const todayKey = getTodayKey();

    const todayRecords = records.filter(
      (record) => getDateKey(new Date(record.completedAt)) === todayKey
    );

    const oldRecords = records.filter(
      (record) => getDateKey(new Date(record.completedAt)) !== todayKey
    );

    const allTasksForArchive = [...getDefaultTasks(), ...loadedCustomTasks];

    const archivedTasks: ArchivedTask[] = oldRecords
      .map((record) => {
        const task = allTasksForArchive.find(
          (item) => item.id === record.taskId
        );

        if (!task) {
          return null;
        }

        return {
          id: `${record.taskId}-${record.completedAt}`,
          taskId: record.taskId,
          title: task.title,
          subtitle: task.subtitle,
          date: task.date,
          time: task.time,
          scope: task.scope,
          completedAt: record.completedAt,
          xp: record.xp,
        };
      })
      .filter(Boolean) as ArchivedTask[];

    const existingHistoryIds = new Set(
      loadedHistory.map((task) => `${task.taskId}-${task.completedAt}`)
    );

    const newArchivedTasks = archivedTasks.filter(
      (task) => !existingHistoryIds.has(`${task.taskId}-${task.completedAt}`)
    );

    const nextHistory = [...loadedHistory, ...newArchivedTasks];

    const archivedTaskIds = new Set(oldRecords.map((record) => record.taskId));

    const remainingCustomTasks = loadedCustomTasks.filter(
      (task) => !archivedTaskIds.has(task.id)
    );

    window.localStorage.setItem(
      TASK_HISTORY_KEY,
      JSON.stringify(nextHistory)
    );

    window.localStorage.setItem(
      CUSTOM_TASKS_KEY,
      JSON.stringify(remainingCustomTasks)
    );

    saveCompletionRecords(todayRecords);

    setCustomTasks(remainingCustomTasks);
    setCompletionRecords(todayRecords);
    setTaskHistory(nextHistory);

    notifyXpUpdated();
  }

  function loadCustomTasks() {
    setCustomTasks(readCustomTasks());
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

  function deleteTask(taskId: string) {
    const nextCustomTasks = customTasks.filter((task) => task.id !== taskId);

    setCustomTasks(nextCustomTasks);

    window.localStorage.setItem(
      CUSTOM_TASKS_KEY,
      JSON.stringify(nextCustomTasks)
    );

    setCompletionRecords((currentRecords) => {
      const nextRecords = currentRecords.filter(
        (record) => record.taskId !== taskId
      );

      saveCompletionRecords(nextRecords);

      return nextRecords;
    });
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#8D846F]">
            Dagens oppdrag
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
            {openTasks.length} åpne oppdrag
          </h2>
        </div>

        <div className="text-right">
          <p className="text-sm text-stone-500">
            {completedTaskItems.length} fullført i dag
          </p>

          <p className="mt-1 text-sm font-semibold text-[#6F8F54]">
            +{earnedXpToday} XP
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <TaskList
          title="Egne oppgaver"
          tasks={personalTasks}
          completedRecords={completionRecords}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
        />

        <TaskList
          title="Familieoppgaver"
          tasks={familyTasks}
          completedRecords={completionRecords}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
        />

        <CompletedTasks tasks={completedTaskItems} onUndoTask={toggleTask} />

        <TaskHistorySummary history={taskHistory} />
      </div>
    </section>
  );
}