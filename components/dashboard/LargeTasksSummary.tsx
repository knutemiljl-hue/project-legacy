"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Circle, Pencil, ShoppingBag } from "lucide-react";
import InlineTaskEditor, {
  TaskEditInput,
} from "@/components/tasks/InlineTaskEditor";
import {
  Task,
  formatTaskDateRange,
  getScopeLabel,
  isPurchaseTask,
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
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

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

  const visibleLargeTasks = sortTasksByDateAndTime(
    tasks
      .filter(isPurchaseTask)
      .filter((task) => isVisibleForActiveUser(task, activeUserId))
      .filter((task) => !task.done)
  );

  const visiblePreviewTasks = visibleLargeTasks.slice(0, 4);

  return (
    <section className="legacy-dark-panel legacy-dark-panel-purple rounded-3xl border border-[#D9C7E8] bg-[#F7F1FB] p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#EADCF5] text-[#6F4D8B]">
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

        <div className="rounded-2xl bg-white/80 px-4 py-3 text-right">
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
        <div className="space-y-3">
          {visiblePreviewTasks.map((task) => {
            const formattedDate = formatTaskDateRange(task.date, task.endDate);
            const isEditing = editingTaskId === task.id;
            const completedSubtasks = task.subtasks.filter(
              (subtask) => subtask.done
            );

            return (
              <div
                key={task.id}
                className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] px-4 py-4"
              >
                {isEditing ? (
                  <div className="w-full">
                    <InlineTaskEditor
                      task={task}
                      onCancel={() => setEditingTaskId(null)}
                      onSave={async (input) => {
                        await handleUpdateTask(task, input);
                        setEditingTaskId(null);
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task)}
                        className="flex flex-1 items-start gap-3 text-left"
                      >
                        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-stone-300 bg-white text-stone-300">
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

                      <div className="ml-9 flex items-center justify-between gap-3 sm:ml-4 sm:justify-end">
                        <div className="text-left sm:text-right">
                          {formattedDate && (
                            <p className="text-xs text-stone-400">
                              {formattedDate}
                            </p>
                          )}

                          {task.subtasks.length > 0 ? (
                            <p className="text-sm font-medium text-[#6F8F54]">
                              {completedSubtasks.length}/{task.subtasks.length} punkt
                            </p>
                          ) : (
                            <p className="flex items-center gap-1 text-sm text-stone-500 sm:justify-end">
                              <Check size={13} strokeWidth={2} />
                              Kryss av
                            </p>
                          )}
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
                      </div>
                    </div>

                    {task.subtasks.length > 0 && (
                      <div className="mt-4 grid gap-2 pl-9 sm:grid-cols-2">
                        {task.subtasks.slice(0, 4).map((subtask) => (
                          <button
                            key={subtask.id}
                            type="button"
                            onClick={() => handleToggleSubtask(task, subtask.id)}
                            className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs font-medium transition ${
                              subtask.done
                                ? "bg-[#EEF5E8] text-[#6F8F54]"
                                : "bg-white text-[#8D846F] hover:brightness-95"
                            }`}
                          >
                            <span
                              className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${
                                subtask.done
                                  ? "bg-[#8EB069] text-white"
                                  : "border border-stone-300 text-transparent"
                              }`}
                            >
                              <Check size={10} strokeWidth={2.5} />
                            </span>
                            {subtask.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
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
