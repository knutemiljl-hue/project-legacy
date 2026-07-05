"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Circle,
  Clock,
  PackageCheck,
  RotateCcw,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import {
  Task,
  deleteTask,
  formatTaskDate,
  getDateKey,
  getScopeLabel,
  getTaskCategoryLabel,
  getTodayKey,
  isPurchaseTask,
  isRegularTask,
  isTaskForToday,
  readTasks,
  subscribeToTasks,
  toggleTaskCompleted,
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
  onDeleteTask,
}: {
  task: Task;
  activeUserId: LegacyUserId;
  onToggleTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  const formattedDate = formatTaskDate(task.date);
  const isOwnCompletion = task.completedBy === activeUserId;

  return (
    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={() => onToggleTask(task)}
        className="flex flex-1 items-start gap-3 text-left sm:items-center"
      >
        <span
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
        </span>

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

            {task.done && isOwnCompletion && (
              <span className="rounded-full bg-[#F4F8EF] px-2 py-1 text-xs font-semibold text-[#6F8F54]">
                +{task.xp} XP
              </span>
            )}
          </div>

          <p className="mt-1 text-sm leading-5 text-stone-500">
            {task.subtitle}
            <CreatedByText createdBy={task.createdBy} />
            {task.done && <CompletedByText completedBy={task.completedBy} />}
          </p>
        </div>
      </button>

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
          <button
            type="button"
            onClick={() => onDeleteTask(task.id)}
            className="grid h-8 w-8 place-items-center rounded-full text-stone-400 transition hover:bg-white hover:text-red-600"
            aria-label={`Slett ${task.title}`}
            title="Slett oppgave"
          >
            <Trash2 size={15} strokeWidth={2} />
          </button>
        )}

        {task.done && (
          <button
            type="button"
            onClick={() => onToggleTask(task)}
            className="flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#24312A] transition hover:brightness-95"
          >
            <RotateCcw size={12} strokeWidth={2} />
            Angre
          </button>
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
  onDeleteTask,
}: {
  title: string;
  description: string;
  tasks: Task[];
  activeUserId: LegacyUserId;
  emptyText: string;
  icon: React.ReactNode;
  onToggleTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
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
                onDeleteTask={onDeleteTask}
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

  async function handleDeleteTask(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    );

    await deleteTask(taskId);
    await loadTasks();
  }

  const visibleTasks = tasks.filter((task) =>
    isVisibleForActiveUser(task, activeUserId)
  );

  const regularTasks = visibleTasks.filter(isRegularTask);
  const largerTasks = visibleTasks.filter(isPurchaseTask);

  const todaysOpenTasks = sortTasksByDateAndTime(
    regularTasks.filter((task) => isTaskForToday(task) && !task.done)
  );

  const futureOpenTasks = sortTasksByDateAndTime(
    regularTasks.filter((task) => isFutureTask(task) && !task.done)
  );

  const openLargerTasks = sortTasksByDateAndTime(
    largerTasks.filter((task) => !task.done)
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

          <div className="grid grid-cols-4 gap-3">
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
                {isLoading ? "–" : openLargerTasks.length}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F7F4EA] px-4 py-3 text-center">
              <p className="text-xs text-stone-500">XP i dag</p>
              <p className="mt-1 text-xl font-semibold text-[#24312A]">
                {isLoading ? "–" : earnedXpToday}
              </p>
            </div>
          </div>
        </div>
      </section>

      <TaskSection
        title="I dag"
        description="Vanlige oppgaver som gjelder i dag, eller oppgaver uten bestemt dato."
        tasks={todaysOpenTasks}
        activeUserId={activeUserId}
        emptyText="Ingen åpne oppgaver for i dag."
        icon={<CheckCircle2 size={21} strokeWidth={2} />}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />

      <TaskSection
        title="Fremtidige"
        description="Planlagte vanlige oppgaver fremover. Kryss dem av allerede nå hvis de blir gjort tidlig."
        tasks={futureOpenTasks}
        activeUserId={activeUserId}
        emptyText="Ingen fremtidige oppgaver."
        icon={<Clock size={21} strokeWidth={2} />}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />

      <TaskSection
        title="Store ting / innkjøp"
        description="Større ting som skal kjøpes, avklares eller følges opp. Dette er adskilt fra vanlig handleliste."
        tasks={openLargerTasks}
        activeUserId={activeUserId}
        emptyText="Ingen store ting eller innkjøp lagt inn."
        icon={<ShoppingBag size={21} strokeWidth={2} />}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />

      <TaskSection
        title="Fullført i dag"
        description="Vanlige oppgaver og større ting som er fullført i dag. XP vises bare for den som faktisk fullførte."
        tasks={completedToday}
        activeUserId={activeUserId}
        emptyText="Ingen fullførte oppgaver i dag."
        icon={<PackageCheck size={21} strokeWidth={2} />}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />
    </main>
  );
}