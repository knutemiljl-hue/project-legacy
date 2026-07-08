"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Archive,
  Check,
  CheckCircle2,
  Circle,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import InlineTaskEditor, {
  TaskEditInput,
} from "@/components/tasks/InlineTaskEditor";
import {
  ArchivedTask,
  Task,
  deleteTask,
  formatTaskDate,
  getDateKey,
  getScopeLabel,
  getTodayKey,
  isTaskForToday,
  readArchivedTasks,
  readTasks,
  subscribeToTasks,
  toggleTaskCompleted,
  updateTask,
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

function CompletedByText({ completedBy }: { completedBy?: string }) {
  if (!completedBy) {
    return null;
  }

  return (
    <span className="text-xs text-stone-400">
      · Fullført av {getUserDisplayName(completedBy)}
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
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
}: {
  title: string;
  tasks: Task[];
  onToggleTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (task: Task, input: TaskEditInput) => Promise<void>;
}) {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const visibleTasks = tasks.filter((task) => isTaskForToday(task) && !task.done);

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
            const isEditing = editingTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                  index !== visibleTasks.length - 1
                    ? "border-b border-[#ECE3D4]"
                    : ""
                }`}
              >
                {isEditing ? (
                  <div className="w-full">
                    <InlineTaskEditor
                      task={task}
                      onCancel={() => setEditingTaskId(null)}
                      onSave={async (input) => {
                        await onUpdateTask(task, input);
                        setEditingTaskId(null);
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onToggleTask(task)}
                      className="flex flex-1 items-start gap-3 text-left sm:items-center"
                    >
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-stone-300 bg-white text-stone-300 sm:mt-0">
                        <Circle size={13} strokeWidth={2} />
                      </span>

                      <div className="min-w-0">
                        <p className="font-medium text-[#24312A]">
                          {task.title}
                        </p>

                        <p className="mt-1 text-sm leading-5 text-stone-500">
                          {task.subtitle}
                          <CreatedByText createdBy={task.createdBy} />
                        </p>
                      </div>
                    </button>

                    <div className="ml-9 flex items-center justify-between gap-3 sm:ml-4 sm:justify-end">
                      <div className="text-left sm:text-right">
                        {formattedDate && (
                          <p className="text-xs text-stone-400">
                            {formattedDate}
                          </p>
                        )}

                        <p className="text-sm text-stone-500">{task.time}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEditingTaskId(task.id)}
                        className="grid h-8 w-8 place-items-center rounded-full text-stone-400 transition hover:bg-white hover:text-[#24312A]"
                        aria-label={`Rediger ${task.title}`}
                        title="Rediger oppgave"
                      >
                        <Pencil size={15} strokeWidth={2} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteTask(task.id)}
                        className="grid h-8 w-8 place-items-center rounded-full text-stone-400 transition hover:bg-white hover:text-red-600"
                        aria-label={`Slett ${task.title}`}
                        title="Slett oppgave"
                      >
                        <Trash2 size={15} strokeWidth={2} />
                      </button>
                    </div>
                  </>
                )}
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
  activeUserId,
  onUndoTask,
}: {
  tasks: Task[];
  activeUserId: LegacyUserId;
  onUndoTask: (task: Task) => void;
}) {
  const ownCompletedTasks = tasks.filter(
    (task) => task.completedBy === activeUserId
  );

  const earnedXp = ownCompletedTasks.reduce((sum, task) => sum + task.xp, 0);

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

          {earnedXp > 0 && (
            <p className="mt-1 text-sm font-medium text-[#6F8F54]">
              +{earnedXp} XP opptjent av deg i dag
            </p>
          )}
        </div>

        {earnedXp > 0 && (
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
            const isOwnCompletion = task.completedBy === activeUserId;

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

                    {isOwnCompletion && (
                      <span className="rounded-full bg-[#F4F8EF] px-2 py-1 text-xs font-semibold text-[#6F8F54]">
                        +{task.xp} XP
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm leading-5 text-stone-500">
                    {getScopeLabel(task.scope)}
                    {formattedDate ? ` · ${formattedDate}` : ""}
                    {task.time ? ` · ${task.time}` : ""}
                    <CreatedByText createdBy={task.createdBy} />
                    <CompletedByText completedBy={task.completedBy} />
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onUndoTask(task)}
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskHistory, setTaskHistory] = useState<ArchivedTask[]>([]);
  const [activeUserId, setActiveUserId] = useState<LegacyUserId>("knut");
  const [isLoading, setIsLoading] = useState(true);

  const visibleTasksForUser = tasks.filter((task) =>
    isVisibleForActiveUser(task, activeUserId)
  );

  const todayTasks = visibleTasksForUser.filter((task) => isTaskForToday(task));

  const personalTasks = visibleTasksForUser.filter(
    (task) => task.scope === "personal"
  );

  const familyTasks = visibleTasksForUser.filter(
    (task) => task.scope === "family"
  );

  const openTasks = todayTasks.filter((task) => !task.done);

  const completedTaskItems = todayTasks.filter((task) => {
    if (!task.done || !task.completedAt) {
      return false;
    }

    return getDateKey(new Date(task.completedAt)) === getTodayKey();
  });

  const completedByActiveUserToday = completedTaskItems.filter(
    (task) => task.completedBy === activeUserId
  );

  const earnedXpToday = completedByActiveUserToday.reduce(
    (sum, task) => sum + task.xp,
    0
  );

  useEffect(() => {
    loadData();
    updateActiveUser();

    const unsubscribeFromTasks = subscribeToTasks(loadData);

    window.addEventListener(
      "project-legacy-active-user-updated",
      updateActiveUser
    );
    window.addEventListener("project-legacy-tasks-updated", loadData);
    window.addEventListener("focus", loadData);

    return () => {
      unsubscribeFromTasks();
      window.removeEventListener(
        "project-legacy-active-user-updated",
        updateActiveUser
      );
      window.removeEventListener("project-legacy-tasks-updated", loadData);
      window.removeEventListener("focus", loadData);
    };
  }, []);

  function updateActiveUser() {
    setActiveUserId(readActiveUser().id);
  }

  async function loadData() {
    setIsLoading(true);

    const [nextTasks, nextHistory] = await Promise.all([
      readTasks(),
      readArchivedTasks(),
    ]);

    setTasks(nextTasks);
    setTaskHistory(nextHistory);
    setIsLoading(false);
  }

  async function handleToggleTask(task: Task) {
    const activeUser = readActiveUser();

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? {
              ...currentTask,
              done: !currentTask.done,
              completedBy: !currentTask.done ? activeUser.id : undefined,
              completedAt: !currentTask.done
                ? new Date().toISOString()
                : undefined,
            }
          : currentTask
      )
    );

    await toggleTaskCompleted(task);
    await loadData();
  }

  async function handleDeleteTask(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    );

    await deleteTask(taskId);
    await loadData();
  }

  async function handleUpdateTask(task: Task, input: TaskEditInput) {
    const nextTitle = input.title.trim();

    if (!nextTitle) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? {
              ...currentTask,
              title: nextTitle,
              date: input.date || undefined,
              scope: input.scope,
              category: input.category,
            }
          : currentTask
      )
    );

    await updateTask(task.id, {
      ...input,
      title: nextTitle,
    });
    await loadData();
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
              {isLoading
                ? "Henter oppgaver …"
                : `${openTasks.length} åpne oppdrag`}
            </h2>
          </div>
        </div>

        <div className="ml-15 text-left sm:ml-0 sm:text-right">
          <p className="text-sm text-stone-500">
            {completedByActiveUserToday.length} fullført av deg i dag
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
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onUpdateTask={handleUpdateTask}
        />

        <TaskList
          title="Familieoppgaver"
          tasks={familyTasks}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          onUpdateTask={handleUpdateTask}
        />

        <CompletedTasks
          tasks={completedTaskItems}
          activeUserId={activeUserId}
          onUndoTask={handleToggleTask}
        />

        <TaskHistorySummary history={taskHistory} />
      </div>
    </section>
  );
}
