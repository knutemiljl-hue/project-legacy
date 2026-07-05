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
}: {
  title: string;
  tasks: Task[];
  completedTasks: string[];
  onToggleTask: (taskId: string) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#8D846F]">
          {title}
        </h3>

        <p className="text-xs text-stone-400">{tasks.length} oppgaver</p>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-2xl bg-[#F7F4EA] p-4">
          <p className="text-sm text-stone-500">Ingen oppgaver her ennå.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isCompleted = completedTasks.includes(task.id);
            const formattedDate = formatDate(task.date);

            return (
              <button
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className="flex w-full items-center justify-between rounded-2xl bg-[#F7F4EA] p-4 text-left transition hover:brightness-95"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-6 w-6 place-items-center rounded-full border ${
                      isCompleted
                        ? "border-[#8EB069] bg-[#8EB069] text-white"
                        : "border-stone-300"
                    }`}
                  >
                    {isCompleted ? "✓" : ""}
                  </div>

                  <div>
                    <p className="font-medium text-[#24312A]">{task.title}</p>
                    <p className="text-sm text-stone-500">{task.subtitle}</p>
                  </div>
                </div>

                <div className="text-right">
                  {formattedDate && (
                    <p className="text-xs text-stone-400">{formattedDate}</p>
                  )}

                  <p className="text-sm text-stone-500">{task.time}</p>
                </div>
              </button>
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
  }));

  const allTasks: Task[] = [...defaultTasks, ...customTasks];

  const personalTasks = allTasks.filter((task) => task.scope === "personal");
  const familyTasks = allTasks.filter((task) => task.scope === "family");

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

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#8D846F]">
            Dagens oppdrag
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
            {allTasks.length} oppdrag
          </h2>
        </div>

        <p className="text-sm text-stone-500">
          {completedTasks.length} / {allTasks.length} fullført
        </p>
      </div>

      <div className="space-y-8">
        <TaskList
          title="Egne oppgaver"
          tasks={personalTasks}
          completedTasks={completedTasks}
          onToggleTask={toggleTask}
        />

        <TaskList
          title="Familieoppgaver"
          tasks={familyTasks}
          completedTasks={completedTasks}
          onToggleTask={toggleTask}
        />
      </div>
    </section>
  );
}