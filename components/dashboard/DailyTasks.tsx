"use client";

import { useEffect, useState } from "react";
import { dailyTasks } from "@/data/dashboard";

const COMPLETED_TASKS_KEY = "project-legacy-daily-tasks";
const CUSTOM_TASKS_KEY = "project-legacy-custom-daily-tasks";

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

function formatDate(date?: string) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(date));
}

function TaskList({
  title,
  tasks,
  completedTasks,
  onToggleTask,
  onDeleteTask,
}: {
  title: string;
  tasks: Task[];
  completedTasks: string[];
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  const visibleTasks = tasks.filter(
    (task) => !completedTasks.includes(task.id)
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

export default function DailyTasks() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [customTasks, setCustomTasks] = useState<Task[]>([]);

  const defaultTasks: Task[] = dailyTasks.map((task) => ({
    id: task.id,
    title: task.title,
    subtitle: task.subtitle,
    time: task.time,
    scope: "personal",
    done: task.done,
    isCustom: false,
  }));

  const allTasks: Task[] = [...defaultTasks, ...customTasks];

  const personalTasks = allTasks.filter((task) => task.scope === "personal");
  const familyTasks = allTasks.filter((task) => task.scope === "family");

  const openTasks = allTasks.filter(
    (task) => !completedTasks.includes(task.id)
  );

  useEffect(() => {
    const storedCompletedTasks =
      window.localStorage.getItem(COMPLETED_TASKS_KEY);

    if (storedCompletedTasks) {
      setCompletedTasks(JSON.parse(storedCompletedTasks));
    } else {
      const defaultCompletedTasks = dailyTasks
        .filter((task) => task.done)
        .map((task) => task.id);

      setCompletedTasks(defaultCompletedTasks);

      window.localStorage.setItem(
        COMPLETED_TASKS_KEY,
        JSON.stringify(defaultCompletedTasks)
      );
    }

    loadCustomTasks();

    window.addEventListener("project-legacy-tasks-updated", loadCustomTasks);

    return () => {
      window.removeEventListener(
        "project-legacy-tasks-updated",
        loadCustomTasks
      );
    };
  }, []);

  function loadCustomTasks() {
    const storedCustomTasks = window.localStorage.getItem(CUSTOM_TASKS_KEY);
    const parsedCustomTasks = storedCustomTasks
      ? JSON.parse(storedCustomTasks)
      : [];

    const normalizedTasks: Task[] = parsedCustomTasks.map((task: Task) => ({
      ...task,
      scope: task.scope || "personal",
      isCustom: true,
    }));

    setCustomTasks(normalizedTasks);
  }

  function toggleTask(taskId: string) {
    setCompletedTasks((currentTasks) => {
      const isCompleted = currentTasks.includes(taskId);

      const nextTasks = isCompleted
        ? currentTasks.filter((id) => id !== taskId)
        : [...currentTasks, taskId];

      window.localStorage.setItem(
        COMPLETED_TASKS_KEY,
        JSON.stringify(nextTasks)
      );

      return nextTasks;
    });
  }

  function deleteTask(taskId: string) {
    const nextCustomTasks = customTasks.filter((task) => task.id !== taskId);

    setCustomTasks(nextCustomTasks);

    window.localStorage.setItem(
      CUSTOM_TASKS_KEY,
      JSON.stringify(nextCustomTasks)
    );

    setCompletedTasks((currentTasks) => {
      const nextCompletedTasks = currentTasks.filter((id) => id !== taskId);

      window.localStorage.setItem(
        COMPLETED_TASKS_KEY,
        JSON.stringify(nextCompletedTasks)
      );

      return nextCompletedTasks;
    });
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#8D846F]">
            Dagens oppdrag
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
            {openTasks.length} åpne oppdrag
          </h2>
        </div>

        <p className="text-sm text-stone-500">
          {completedTasks.length} fullført i dag
        </p>
      </div>

      <div className="space-y-8">
        <TaskList
          title="Egne oppgaver"
          tasks={personalTasks}
          completedTasks={completedTasks}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
        />

        <TaskList
          title="Familieoppgaver"
          tasks={familyTasks}
          completedTasks={completedTasks}
          onToggleTask={toggleTask}
          onDeleteTask={deleteTask}
        />
      </div>
    </section>
  );
}