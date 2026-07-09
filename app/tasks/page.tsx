"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Archive,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  PackageCheck,
  Pencil,
  RotateCcw,
  Save,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import {
  Task,
  TaskCategory,
  TaskScope,
  TaskSubtask,
  deleteTask,
  formatTaskDateRange,
  getDateKey,
  getScopeLabel,
  getTaskCategoryLabel,
  getTodayKey,
  isTaskOverdue,
  isTaskForToday,
  readTasks,
  subscribeToTasks,
  toggleTaskCompleted,
  toggleTaskSubtask,
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

function TaskMetaLine({ task }: { task: Task }) {
  if (!task.subtitle && !task.createdBy && !task.completedBy) {
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
      {task.done &&
        task.completedBy &&
        (task.subtitle || task.createdBy ? (
          <CompletedByText completedBy={task.completedBy} />
        ) : (
          <span className="text-xs text-stone-400">
            Fullført av {getUserDisplayName(task.completedBy)}
          </span>
        ))}
    </p>
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

function isFutureTask(task: Task) {
  if (!task.date) {
    return false;
  }

  return task.date > getTodayKey();
}

function sortTasksByDateAndTime(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const dateA = a.date ?? getTodayKey();
    const dateB = b.date ?? getTodayKey();

    if (dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }

    return a.time.localeCompare(b.time);
  });
}

function TaskRow({
  task,
  activeUserId,
  onToggleTask,
  onToggleSubtask,
  onDeleteTask,
  onUpdateTask,
}: {
  task: Task;
  activeUserId: LegacyUserId;
  onToggleTask: (task: Task) => void;
  onToggleSubtask: (task: Task, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (
    task: Task,
    input: {
      title: string;
      subtitle?: string;
      date?: string;
      endDate?: string;
      scope: TaskScope;
      category: TaskCategory;
      subtasks?: TaskSubtask[];
    }
  ) => Promise<void>;
}) {
  const formattedDate = formatTaskDateRange(task.date, task.endDate);
  const isOwnCompletion = task.completedBy === activeUserId;
  const isOverdue = !task.done && isTaskOverdue(task);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editSubtitle, setEditSubtitle] = useState(task.subtitle);
  const [editDate, setEditDate] = useState(task.date ?? "");
  const [editEndDate, setEditEndDate] = useState(task.endDate ?? "");
  const [editScope, setEditScope] = useState<TaskScope>(task.scope);
  const [editCategory, setEditCategory] = useState<TaskCategory>(task.category);
  const [editSubtasks, setEditSubtasks] = useState(
    task.subtasks.map((subtask) => subtask.title).join("\n")
  );
  const [isSaving, setIsSaving] = useState(false);
  const completedSubtasks = task.subtasks.filter((subtask) => subtask.done);

  function startEditing() {
    setEditTitle(task.title);
    setEditSubtitle(task.subtitle);
    setEditDate(task.date ?? "");
    setEditEndDate(task.endDate ?? "");
    setEditScope(task.scope);
    setEditCategory(task.category);
    setEditSubtasks(task.subtasks.map((subtask) => subtask.title).join("\n"));
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditSubtitle(task.subtitle);
    setEditDate(task.date ?? "");
    setEditEndDate(task.endDate ?? "");
    setEditScope(task.scope);
    setEditCategory(task.category);
    setEditSubtasks(task.subtasks.map((subtask) => subtask.title).join("\n"));
  }

  function buildEditedSubtasks() {
    const existingByTitle = new Map(
      task.subtasks.map((subtask) => [subtask.title.trim(), subtask])
    );

    return editSubtasks
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const existingSubtask = existingByTitle.get(line);

        return {
          id: existingSubtask?.id ?? `${task.id}-subtask-${index}`,
          title: line,
          done: existingSubtask?.done ?? false,
        };
      });
  }

  async function saveTaskEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editTitle.trim()) {
      return;
    }

    setIsSaving(true);

    await onUpdateTask(task, {
      title: editTitle,
      subtitle: editSubtitle,
      date: editDate,
      endDate: editEndDate,
      scope: editScope,
      category: editCategory,
      subtasks: buildEditedSubtasks(),
    });

    setIsSaving(false);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <form
        onSubmit={saveTaskEdit}
        className="flex flex-col gap-4 px-4 py-4"
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,1fr)_minmax(180px,0.8fr)_150px_150px_180px]">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
              Tittel
            </span>

            <input
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-[#24312A] outline-none transition focus:border-[#8D846F]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
              Beskrivelse
            </span>

            <input
              value={editSubtitle}
              onChange={(event) => setEditSubtitle(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-[#24312A] outline-none transition focus:border-[#8D846F]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
              Dato
            </span>

            <input
              type="date"
              value={editDate}
              onChange={(event) => setEditDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-[#24312A] outline-none transition focus:border-[#8D846F]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
              Slutt
            </span>

            <input
              type="date"
              value={editEndDate}
              min={editDate}
              onChange={(event) => setEditEndDate(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-[#24312A] outline-none transition focus:border-[#8D846F]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
              Gjelder
            </span>

            <select
              value={editScope}
              onChange={(event) => setEditScope(event.target.value as TaskScope)}
              className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-[#24312A] outline-none transition focus:border-[#8D846F]"
            >
              <option value="personal">Egen</option>
              <option value="family">Familie</option>
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
              Type
            </span>

            <select
              value={editCategory}
              onChange={(event) =>
                setEditCategory(event.target.value as TaskCategory)
              }
              className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-[#24312A] outline-none transition focus:border-[#8D846F]"
            >
              <option value="task">Vanlig oppgave</option>
              <option value="purchase">Større oppgave</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
            Underpunkter
          </span>

          <textarea
            value={editSubtasks}
            onChange={(event) => setEditSubtasks(event.target.value)}
            className="mt-2 min-h-24 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-[#24312A] outline-none transition focus:border-[#8D846F]"
            placeholder="Ett underpunkt per linje"
          />
        </label>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={cancelEditing}
            className="flex items-center justify-center gap-1 rounded-2xl bg-white px-4 py-2 text-sm font-medium text-[#24312A] transition hover:brightness-95"
          >
            <X size={14} strokeWidth={2.25} />
            Avbryt
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-1 rounded-2xl bg-[#3F6F35] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={14} strokeWidth={2.25} />
            {isSaving ? "Lagrer" : "Lagre"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-start gap-3 text-left sm:items-center">
        <button
          type="button"
          onClick={() => onToggleTask(task)}
          aria-label={task.done ? `Angre ${task.title}` : `Fullfør ${task.title}`}
          className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full sm:mt-0 ${
            task.done
              ? "bg-[#8EB069] text-white"
              : "border border-stone-300 bg-white text-stone-300"
          }`}
        >
          {task.done ? (
            <Check size={13} strokeWidth={2.5} />
          ) : (
            <Circle size={13} strokeWidth={2} />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`font-medium ${
                task.done
                  ? "text-[#24312A] line-through decoration-stone-400"
                  : "text-[#24312A]"
              }`}
            >
              {task.title}
            </p>

            <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-[#8D846F]">
              {getScopeLabel(task.scope)}
            </span>

            <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-[#8D846F]">
              {getTaskCategoryLabel(task.category)}
            </span>

            {isOverdue && (
              <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                Forsinket
              </span>
            )}

            {task.done && isOwnCompletion && (
              <span className="rounded-full bg-[#F4F8EF] px-2 py-1 text-xs font-semibold text-[#6F8F54]">
                +{task.xp} XP
              </span>
            )}
          </div>

          <TaskMetaLine task={task} />

          {task.subtasks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {task.subtasks.slice(0, 4).map((subtask) => (
                <button
                  key={subtask.id}
                  type="button"
                  onClick={() => onToggleSubtask(task, subtask.id)}
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    subtask.done
                      ? "bg-[#EEF5E8] text-[#6F8F54]"
                      : "bg-white text-[#8D846F] hover:brightness-95"
                  }`}
                  aria-label={
                    subtask.done
                      ? `Marker ${subtask.title} som ikke gjort`
                      : `Marker ${subtask.title} som gjort`
                  }
                >
                  {subtask.done ? "✓ " : ""}
                  {subtask.title}
                </button>
              ))}

              {task.subtasks.length > 4 && (
                <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-[#8D846F]">
                  +{task.subtasks.length - 4}
                </span>
              )}
            </div>
          )}

          {task.subtasks.length > 0 && (
            <p className="mt-2 text-xs font-medium text-stone-400">
              {completedSubtasks.length}/{task.subtasks.length} underpunkter
            </p>
          )}
        </div>
      </div>

      <div className="ml-9 flex items-center justify-between gap-3 sm:ml-4 sm:justify-end">
        <div className="text-left sm:text-right">
          {formattedDate && (
            <p className="text-xs text-stone-400">{formattedDate}</p>
          )}

          <p className="flex items-center gap-1 text-sm text-stone-500 sm:justify-end">
            <Clock size={13} strokeWidth={2} />
            {task.time}
          </p>
        </div>

        {!task.done && (
          <>
            <button
              type="button"
              onClick={startEditing}
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
          </>
        )}

        {task.done && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startEditing}
              className="grid h-8 w-8 place-items-center rounded-full text-stone-400 transition hover:bg-white hover:text-[#24312A]"
              aria-label={`Rediger ${task.title}`}
              title="Rediger oppgave"
            >
              <Pencil size={15} strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={() => onToggleTask(task)}
              className="flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#24312A] transition hover:brightness-95"
            >
              <RotateCcw size={12} strokeWidth={2} />
              Angre
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskSection({
  title,
  description,
  tasks,
  activeUserId,
  emptyText,
  icon,
  onToggleTask,
  onToggleSubtask,
  onDeleteTask,
  onUpdateTask,
}: {
  title: string;
  description: string;
  tasks: Task[];
  activeUserId: LegacyUserId;
  emptyText: string;
  icon: React.ReactNode;
  onToggleTask: (task: Task) => void;
  onToggleSubtask: (task: Task, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (
    task: Task,
    input: {
      title: string;
      subtitle?: string;
      date?: string;
      endDate?: string;
      scope: TaskScope;
      category: TaskCategory;
      subtasks?: TaskSubtask[];
    }
  ) => Promise<void>;
}) {
  return (
    <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
      <div className="mb-5 flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F7F4EA] text-[#4F773D]">
          {icon}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
            {title}
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
            {tasks.length} oppgaver
          </h2>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            {description}
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] p-4">
          <p className="text-sm leading-6 text-stone-600">{emptyText}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA]">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              className={
                index !== tasks.length - 1 ? "border-b border-[#ECE3D4]" : ""
              }
            >
              <TaskRow
                task={task}
                activeUserId={activeUserId}
                onToggleTask={onToggleTask}
                onToggleSubtask={onToggleSubtask}
                onDeleteTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function TasksBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeUserId, setActiveUserId] = useState<LegacyUserId>("knut");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();
    updateActiveUser();

    const unsubscribeFromTasks = subscribeToTasks(loadTasks);

    window.addEventListener(
      "project-legacy-active-user-updated",
      updateActiveUser
    );
    window.addEventListener("project-legacy-tasks-updated", loadTasks);
    window.addEventListener("project-legacy-xp-updated", loadTasks);
    window.addEventListener("focus", loadTasks);

    return () => {
      unsubscribeFromTasks();
      window.removeEventListener(
        "project-legacy-active-user-updated",
        updateActiveUser
      );
      window.removeEventListener("project-legacy-tasks-updated", loadTasks);
      window.removeEventListener("project-legacy-xp-updated", loadTasks);
      window.removeEventListener("focus", loadTasks);
    };
  }, []);

  function updateActiveUser() {
    setActiveUserId(readActiveUser().id);
  }

  async function loadTasks() {
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
    await loadTasks();
  }

  async function handleToggleSubtask(task: Task, subtaskId: string) {
    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? {
              ...currentTask,
              subtasks: currentTask.subtasks.map((subtask) =>
                subtask.id === subtaskId
                  ? { ...subtask, done: !subtask.done }
                  : subtask
              ),
            }
          : currentTask
      )
    );

    await toggleTaskSubtask(task, subtaskId);
    await loadTasks();
  }

  async function handleDeleteTask(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    );

    await deleteTask(taskId);
    await loadTasks();
  }

  async function handleUpdateTask(
    task: Task,
    input: {
      title: string;
      subtitle?: string;
      date?: string;
      endDate?: string;
      scope: TaskScope;
      category: TaskCategory;
      subtasks?: TaskSubtask[];
    }
  ) {
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
    await loadTasks();
  }

  const visibleTasks = tasks.filter((task) =>
    isVisibleForActiveUser(task, activeUserId)
  );

  const regularTasks = visibleTasks.filter((task) => task.category === "task");
  const largeTasks = visibleTasks.filter(
    (task) => task.category === "purchase"
  );

  const overdueOpenTasks = sortTasksByDateAndTime(
    regularTasks.filter((task) => isTaskOverdue(task) && !task.done)
  );

  const todaysOpenTasks = sortTasksByDateAndTime(
    regularTasks.filter((task) => isTaskForToday(task) && !task.done)
  );

  const futureOpenTasks = sortTasksByDateAndTime(
    regularTasks.filter((task) => isFutureTask(task) && !task.done)
  );

  const openLargeTasks = sortTasksByDateAndTime(
    largeTasks.filter((task) => !task.done)
  );

  const completedToday = sortTasksByDateAndTime(
    visibleTasks.filter((task) => {
      if (!task.done || !task.completedAt) {
        return false;
      }

      return getDateKey(new Date(task.completedAt)) === getTodayKey();
    })
  );

  const ownCompletedToday = completedToday.filter(
    (task) => task.completedBy === activeUserId
  );

  const earnedXpToday = ownCompletedToday.reduce(
    (sum, task) => sum + task.xp,
    0
  );

  return (
    <main className="mx-auto w-full max-w-[1720px] space-y-7">
      <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
              Gjøremål
            </p>

            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-[#24312A] sm:text-5xl">
              Alt som skal gjøres.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
              Her ligger dagens oppgaver, fremtidige planer og større ting som
              skal kjøpes, avklares eller følges opp.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:grid-cols-6">
            <div className="rounded-2xl bg-[#F7F4EA] px-4 py-3 text-center">
              <p className="text-xs text-stone-500">Forsinket</p>
              <p className="mt-1 text-xl font-semibold text-[#24312A]">
                {isLoading ? "–" : overdueOpenTasks.length}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7F4EA] px-4 py-3 text-center">
              <p className="text-xs text-stone-500">I dag</p>
              <p className="mt-1 text-xl font-semibold text-[#24312A]">
                {isLoading ? "–" : todaysOpenTasks.length}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7F4EA] px-4 py-3 text-center">
              <p className="text-xs text-stone-500">Fremtidige</p>
              <p className="mt-1 text-xl font-semibold text-[#24312A]">
                {isLoading ? "–" : futureOpenTasks.length}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7F4EA] px-4 py-3 text-center">
              <p className="text-xs text-stone-500">Store ting</p>
              <p className="mt-1 text-xl font-semibold text-[#24312A]">
                {isLoading ? "–" : openLargeTasks.length}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7F4EA] px-4 py-3 text-center">
              <p className="text-xs text-stone-500">XP i dag</p>
              <p className="mt-1 text-xl font-semibold text-[#24312A]">
                {isLoading ? "–" : earnedXpToday}
              </p>
            </div>

            <Link
              href="/archive"
              className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-[#F7F4EA] px-4 py-3 text-sm font-medium text-[#24312A] transition hover:brightness-95 sm:col-span-5 lg:col-span-1"
            >
              <Archive size={16} strokeWidth={2.25} />
              Arkiv
            </Link>
          </div>
        </div>
      </section>

      <TaskSection
        title="Forsinket"
        description="Vanlige oppgaver med forfallsdato før i dag. De blir liggende til de fullføres, slettes eller arkiveres."
        tasks={overdueOpenTasks}
        activeUserId={activeUserId}
        emptyText="Ingen forsinkede oppgaver."
        icon={<Clock size={21} strokeWidth={2} />}
        onToggleTask={handleToggleTask}
        onToggleSubtask={handleToggleSubtask}
        onDeleteTask={handleDeleteTask}
        onUpdateTask={handleUpdateTask}
      />

      <TaskSection
        title="I dag"
        description="Vanlige oppgaver som gjelder i dag, eller oppgaver uten bestemt dato."
        tasks={todaysOpenTasks}
        activeUserId={activeUserId}
        emptyText="Ingen åpne oppgaver for i dag."
        icon={<CheckCircle2 size={21} strokeWidth={2} />}
        onToggleTask={handleToggleTask}
        onToggleSubtask={handleToggleSubtask}
        onDeleteTask={handleDeleteTask}
        onUpdateTask={handleUpdateTask}
      />

      <TaskSection
        title="Fremtidige"
        description="Planlagte vanlige oppgaver fremover. Kryss dem av allerede nå hvis de blir gjort tidlig."
        tasks={futureOpenTasks}
        activeUserId={activeUserId}
        emptyText="Ingen fremtidige oppgaver."
        icon={<Clock size={21} strokeWidth={2} />}
        onToggleTask={handleToggleTask}
        onToggleSubtask={handleToggleSubtask}
        onDeleteTask={handleDeleteTask}
        onUpdateTask={handleUpdateTask}
      />

      <TaskSection
        title="Store ting / innkjøp"
        description="Større ting som skal kjøpes, avklares eller følges opp. Dette er adskilt fra vanlig handleliste."
        tasks={openLargeTasks}
        activeUserId={activeUserId}
        emptyText="Ingen store ting eller innkjøp lagt inn."
        icon={<ShoppingBag size={21} strokeWidth={2} />}
        onToggleTask={handleToggleTask}
        onToggleSubtask={handleToggleSubtask}
        onDeleteTask={handleDeleteTask}
        onUpdateTask={handleUpdateTask}
      />

      <TaskSection
        title="Fullført i dag"
        description="Vanlige oppgaver og større ting som er fullført i dag. XP vises bare for den som faktisk fullførte."
        tasks={completedToday}
        activeUserId={activeUserId}
        emptyText="Ingen fullførte oppgaver i dag."
        icon={<PackageCheck size={21} strokeWidth={2} />}
        onToggleTask={handleToggleTask}
        onToggleSubtask={handleToggleSubtask}
        onDeleteTask={handleDeleteTask}
        onUpdateTask={handleUpdateTask}
      />
    </main>
  );
}
