"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Circle, ShoppingBag } from "lucide-react";
import {
  Task,
  formatTaskDate,
  getScopeLabel,
  isPurchaseTask,
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

function isVisibleForActiveUser(task: Task, activeUserId: LegacyUserId) {
  if (task.scope === "family") {
    return true;
  }

  if (!task.createdBy) {
    return true;
  }

  return task.createdBy === activeUserId;
}

function sortTasksByDateAndTime(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const dateA = a.date ?? "9999-12-31";
    const dateB = b.date ?? "9999-12-31";

    if (dateA !== dateB) {
      return dateA.localeCompare(dateB);
    }

    return a.time.localeCompare(b.time);
  });
}

export default function LargeTasksSummary() {
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

  const visibleLargeTasks = sortTasksByDateAndTime(
    tasks
      .filter(isPurchaseTask)
      .filter((task) => isVisibleForActiveUser(task, activeUserId))
      .filter((task) => !task.done)
  );

  const visiblePreviewTasks = visibleLargeTasks.slice(0, 4);

  return (
    <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F7F4EA] text-[#4F773D]">
            <ShoppingBag size={21} strokeWidth={2} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
              Store ting / innkjøp
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
              Større ting å følge opp
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-600">
              Ting som er større enn vanlig handleliste, men som ikke bør
              forsvinne i hverdagen.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-[#F7F4EA] px-4 py-3 text-right">
          <p className="text-xs text-stone-500">Åpne</p>
          <p className="text-lg font-semibold text-[#24312A]">
            {isLoading ? "–" : visibleLargeTasks.length}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl bg-[#F7F4EA] p-4">
          <p className="text-sm leading-6 text-stone-600">
            Henter store ting …
          </p>
        </div>
      ) : visibleLargeTasks.length === 0 ? (
        <div className="rounded-2xl bg-[#F7F4EA] p-4">
          <p className="text-sm leading-6 text-stone-600">
            Ingen store ting eller innkjøp lagt inn. Legg til via{" "}
            <strong>+ Ny</strong> og velg <strong>Større oppgave</strong>.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA]">
          {visiblePreviewTasks.map((task, index) => {
            const formattedDate = formatTaskDate(task.date);

            return (
              <div
                key={task.id}
                className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                  index !== visiblePreviewTasks.length - 1
                    ? "border-b border-[#ECE3D4]"
                    : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleTask(task)}
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

                      <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-[#8D846F]">
                        {getScopeLabel(task.scope)}
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-5 text-stone-500">
                      {task.subtitle}
                      <CreatedByText createdBy={task.createdBy} />
                    </p>
                  </div>
                </button>

                <div className="ml-9 text-left sm:ml-4 sm:text-right">
                  {formattedDate && (
                    <p className="text-xs text-stone-400">{formattedDate}</p>
                  )}

                  <p className="flex items-center gap-1 text-sm text-stone-500 sm:justify-end">
                    <Check size={13} strokeWidth={2} />
                    Kryss av
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {visibleLargeTasks.length > 4 && (
        <Link
          href="/tasks"
          className="mt-4 block rounded-2xl bg-[#F7F4EA] px-4 py-3 text-center text-sm font-medium text-[#24312A] transition hover:brightness-95"
        >
          Se alle store ting / innkjøp →
        </Link>
      )}
    </section>
  );
}