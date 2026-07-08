"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
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
  Task,
  deleteTask,
  formatTaskDateRange,
  getDateKey,
  getScopeLabel,
  getTodayKey,
  isRegularTask,
  isTaskDueTodayOrOverdue,
  isTaskOverdue,
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

function TaskMetaLine({ task }: { task: Task }) {
  if (!task.subtitle && !task.createdBy) {
    return null;
  }

  return (
    <p className="mt-1 text-sm leading-5 text-stone-500">
      {task.subtitle}
      {task.createdBy &&
        (task.subtitle ? (
          <CreatedByText createdBy={task.createdBy} />
        ) : (
          <span className="text-xs text-stone-400">
            Lagt til av {getUserDisplayName(task.createdBy)}
          </span>
        ))}
    </p>
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
  const visibleTasks = tasks.filter(
    (task) => isTaskDueTodayOrOverdue(task) && !task.done
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
            const formattedDate = formatTaskDateRange(task.date, task.endDate);
            const isEditing = editingTaskId === task.id;
            const isOverdue = isTaskOverdue(task);

            return (
              <div
                key={task.id}
                className={`${
                  index >= 3 ? "hidden sm:flex" : "flex"
                } flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
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
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-[#24312A]">
                            {task.title}
                          </p>

                          {isOverdue && (
                            <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                              Forsinket
                            </span>
                          )}
                        </div>

                        <TaskMetaLine task={task} />
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

      {visibleTasks.length > 3 && (
        <Link
          href="/tasks"
          className="mt-3 flex items-center justify-center rounded-2xl bg-[#F7F4EA] px-4 py-3 text-sm font-medium text-[#24312A] transition hover:brightness-95 sm:hidden"
        >
          Se alle {visibleTasks.length} oppgaver
        </Link>
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
    <div
      className={`rounded-3xl border border-[#DDE8D4] bg-[#F4F8EF] p-4 sm:p-5 ${
        tasks.length === 0 ? "hidden sm:block" : ""
      }`}
    >
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
            const formattedDate = formatTaskDateRange(task.date, task.endDate);
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

export default function DailyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeUserId, setActiveUserId] = useState<LegacyUserId>("knut");
  const [isLoading, setIsLoading] = useState(true);

  const visibleTasksForUser = tasks.filter((task) =>
    isVisibleForActiveUser(task, activeUserId)
  );

  const regularTasksForUser = visibleTasksForUser.filter(isRegularTask);

  const todayTasks = regularTasksForUser.filter((task) =>
    isTaskDueTodayOrOverdue(task)
  );

  const personalTasks = regularTasksForUser.filter(
    (task) => task.scope === "personal"
  );

  const familyTasks = regularTasksForUser.filter(
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

    const nextTasks = await readTasks();

    setTasks(nextTasks);
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
              subtitle: input.subtitle?.trim() || currentTask.subtitle,
              date: input.date || undefined,
              endDate: input.endDate || undefined,
              scope: input.scope,
              category: input.category,
              subtasks: input.subtasks ?? currentTask.subtasks,
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
    <section className="rounded-3xl border border-[#CFE4C5] bg-[#F3FAF1] p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#E2F1D8] text-[#3F6F35]">
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

        <div className="ml-15 flex items-center gap-3 sm:ml-0 sm:block sm:text-right">
          <p className="text-sm text-stone-500">
            {completedByActiveUserToday.length} fullført av deg i dag
          </p>

          <p className="text-sm font-semibold text-[#6F8F54] sm:mt-1">
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
      </div>
    </section>
  );
}
