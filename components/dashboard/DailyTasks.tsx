"use client";

import { useEffect, useState } from "react";
import { dailyTasks } from "@/data/dashboard";

const STORAGE_KEY = "project-legacy-daily-tasks";

export default function DailyTasks() {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  useEffect(() => {
    const storedTasks = window.localStorage.getItem(STORAGE_KEY);

    if (storedTasks) {
      setCompletedTasks(JSON.parse(storedTasks));
      return;
    }

    const defaultCompletedTasks = dailyTasks
      .filter((task) => task.done)
      .map((task) => task.id);

    setCompletedTasks(defaultCompletedTasks);

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultCompletedTasks)
    );
  }, []);

  function toggleTask(taskId: string) {
    setCompletedTasks((currentTasks) => {
      const isCompleted = currentTasks.includes(taskId);

      const nextTasks = isCompleted
        ? currentTasks.filter((id) => id !== taskId)
        : [...currentTasks, taskId];

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks));

      return nextTasks;
    });
  }

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#8D846F]">
            Dagens oppdrag
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
            {dailyTasks.length} oppdrag
          </h2>
        </div>

        <p className="text-sm text-stone-500">
          {completedTasks.length} / {dailyTasks.length} fullført
        </p>
      </div>

      <div className="space-y-3">
        {dailyTasks.map((task) => {
          const isCompleted = completedTasks.includes(task.id);

          return (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
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

              <p className="text-sm text-stone-500">{task.time}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}