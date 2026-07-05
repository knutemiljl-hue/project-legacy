"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Archive,
  Check,
  CheckCircle2,
  Circle,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { dailyTasks } from "@/data/dashboard";
import {
  ArchivedTask,
  CompletionRecord,
  Task,
  XP_PER_TASK,
  createDefaultTasks,
  formatTaskDate,
  getDateKey,
  getScopeLabel,
  getTodayKey,
  isTaskForToday,
  notifyXpUpdated,
  readCompletionRecords,
  readCustomTasks,
  readStoredCompletedTaskIds,
  readTaskHistory,
  saveCompletionRecords,
  saveCustomTasks,
  saveTaskHistory,
} from "@/lib/tasks";
import {
  LegacyUserId,
  getUserDisplayName,
  readActiveUser,
} from "@/lib/users";

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

function isVisibleForActiveUser(task: Task, activeUserId: LegacyUserId) {
  if (task.scope === "family") {
    return true;
  }

  if (!task.createdBy) {
    return true;
  }

  return task.createdBy === activeUserId;
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
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
          {title}
        </h3>

        <p className="text-xs text-stone-400">{visibleTasks.length} åpne</p>
      </div>

      {visibleTasks.length === 0 ? (
        <div className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] px-4 py-3">
          <p className="text-sm text-stone-500">Ingen åpne oppgaver her.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA]">
          {visibleTasks.map((task, index) => {
            const formattedDate = formatTaskDate(task.date);

            return (
              <div
                key={task.id}
                className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                  index !== visibleTasks.length - 1
                    ? "border-b border-[#ECE3D4]"
                    : ""
                }`}
              >
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="flex flex-1 items-start gap-3 text-left sm:items-center"
                >
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-stone-300 bg-white text-stone-300 sm:mt-0">
                    <Circle size={13} strokeWidth={2} />
                  </span>

                  <div className="min-w-0">
                    <p className="font-medium text-[#24312A]">{task.title}</p>
                    <p className="mt-1 text-sm leading-5 text-stone-500">
                      {task.subtitle}
                      <CreatedByText createdBy={task.createdBy} />
                    </p>
                  </div>
                </button>

                <div className="ml-9 flex items-center justify-between gap-3 sm:ml-4 sm:justify-end">
                  <div className="text-left sm:text-right">
                    {formattedDate && (
                      <p className="text-xs text-stone-400">{formattedDate}</p>
                    )}

                    <p className="text-sm text-stone-500">{task.time}</p>
                  </div>

                  {task.isCustom && (
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="grid h-8 w-8 place-items-center rounded-full text-stone-400 transition hover:bg-white hover:text-red-600"
                      aria-label={`Slett ${task.title}`}
                      title="Slett oppgave"
                    >
                      <Trash2 size={15} strokeWidth={2} />
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
    <div className="rounded-3xl border border-[#DDE8D4] bg-[#F4F8EF] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6F8F54]">
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
          <div className="w-fit rounded-full bg-[#8EB069] px-3 py-1 text-sm font-semibold text-white">
            +{earnedXp} XP
          </div>
        )}
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm leading-6 text-stone-600">
          Når du huker av oppgaver, samles de her i dag.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white/70">
          {tasks.map((task, index) => {
            const formattedDate = formatTaskDate(task.date);

            return (
              <div
                key={task.id}
                className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                  index !== tasks.length - 1
                    ? "border-b border-[#E6EEDA]"
                    : ""
                }`}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#8EB069] text-white">
                      <Check size={13} strokeWidth={2.5} />
                    </span>

                    <p className="font-medium text-[#24312A]">{task.title}</p>

                    <span className="rounded-full bg-[#F4F8EF] px-2 py-1 text-xs font-semibold text-[#6F8F54]">
                      +{XP_PER_TASK} XP
                    </span>
                  </div>

                  <p className="mt-1 text-sm leading-5 text-stone-500">
                    {getScopeLabel(task.scope)}
                    {formattedDate ? ` · ${formattedDate}` : ""}
                    {task.time ? ` · ${task.time}` : ""}
                    <CreatedByText createdBy={task.createdBy} />
                  </p>
                </div>

                <button
                  onClick={() => onUndoTask(task.id)}
                  className="flex w-fit items-center gap-1 rounded-full bg-[#F7F4EA] px-3 py-1 text-xs font-medium text-[#24312A] transition hover:brightness-95"
                >
                  <RotateCcw size={12} strokeWidth={2} />
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
      className="flex items-center justify-between gap-3 rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] px-4 py-3 transition hover:brightness-95 sm:rounded-3xl sm:px-5 sm:py-4"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-white text-[#4F773D] sm:h-9 sm:w-9">
          <Archive size={16} strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
            Arkiv
          </p>

          <p className="mt-0.5 truncate text-xs text-stone-500 sm:text-sm">
            {history.length === 0
              ? "Ingen arkiverte oppgaver"
              : `${history.length} arkiverte oppgaver`}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden rounded-2xl bg-white px-4 py-2 text-right sm:block">
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
  const [activeUserId, setActiveUserId] = useState<LegacyUserId>("knut");

  const defaultTasks = createDefaultTasks(dailyTasks);
  const allTasks: Task[] = [...defaultTasks, ...customTasks];

  const visibleTasksForUser = allTasks.filter((task) =>
    isVisibleForActiveUser(task, activeUserId)
  );

  const todayTasks = visibleTasksForUser.filter((task) => isTaskForToday(task));

  const completedTaskIds = completionRecords.map((record) => record.taskId);

  const personalTasks = visibleTasksForUser.filter(
    (task) => task.scope === "personal"
  );

  const familyTasks = visibleTasksForUser.filter(
    (task) => task.scope === "family"
  );

  const openTasks = todayTasks.filter(
    (task) => !completedTaskIds.includes(task.id)
  );

  const completedTaskItems = todayTasks.filter((task) =>
    completedTaskIds.includes(task.id)
  );

  const earnedXpToday = completedTaskItems.length * XP_PER_TASK;

  useEffect(() => {
    initializeTasks();
    updateActiveUser();

    window.addEventListener("project-legacy-tasks-updated", loadCustomTasks);
    window.addEventListener(
      "project-legacy-active-user-updated",
      updateActiveUser
    );
    window.addEventListener("storage", updateActiveUser);

    return () => {
      window.removeEventListener(
        "project-legacy-tasks-updated",
        loadCustomTasks
      );
      window.removeEventListener(
        "project-legacy-active-user-updated",
        updateActiveUser
      );
      window.removeEventListener("storage", updateActiveUser);
    };
  }, []);

  function updateActiveUser() {
    setActiveUserId(readActiveUser().id);
  }

  function initializeTasks() {
    const loadedCustomTasks = readCustomTasks();
    const loadedHistory = readTaskHistory();

    const storedCompletionRecords = readCompletionRecords();
    const storedCompletedTaskIds = readStoredCompletedTaskIds();

    let records: CompletionRecord[] = [];

    if (storedCompletionRecords.length > 0) {
      records = storedCompletionRecords;
    } else if (storedCompletedTaskIds.length > 0) {
      records = storedCompletedTaskIds.map((taskId) => ({
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

    const allTasksForArchive = [
      ...createDefaultTasks(dailyTasks),
      ...loadedCustomTasks,
    ];

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
          createdBy: task.createdBy,
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

    saveTaskHistory(nextHistory);
    saveCustomTasks(remainingCustomTasks);
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
    saveCustomTasks(nextCustomTasks);

    setCompletionRecords((currentRecords) => {
      const nextRecords = currentRecords.filter(
        (record) => record.taskId !== taskId
      );

      saveCompletionRecords(nextRecords);

      return nextRecords;
    });
  }

  return (
    <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F7F4EA] text-[#4F773D]">
            <CheckCircle2 size={21} strokeWidth={2} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
              Dagens oppdrag
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
              {openTasks.length} åpne oppdrag
            </h2>
          </div>
        </div>

        <div className="ml-15 text-left sm:ml-0 sm:text-right">
          <p className="text-sm text-stone-500">
            {completedTaskItems.length} fullført i dag
          </p>

          <p className="mt-1 text-sm font-semibold text-[#6F8F54]">
            +{earnedXpToday} XP
          </p>
        </div>
      </div>

      <div className="space-y-5 sm:space-y-6">
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