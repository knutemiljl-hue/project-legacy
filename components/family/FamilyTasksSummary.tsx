"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, CheckCircle2, Circle, Pencil, RotateCcw } from "lucide-react";
import InlineTaskEditor, {
  TaskEditInput,
} from "@/components/tasks/InlineTaskEditor";
import {
  ArchivedTask,
  Task,
  formatTaskDate,
  getDateKey,
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

export default function FamilyTasksSummary() {
  const [familyTasks, setFamilyTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<ArchivedTask[]>([]);
  const [activeUserId, setActiveUserId] = useState<LegacyUserId>("knut");
  const [isLoading, setIsLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    updateActiveUser();

    const unsubscribeFromTasks = subscribeToTasks(loadData);

    window.addEventListener(
      "project-legacy-active-user-updated",
      updateActiveUser
    );
    window.addEventListener("project-legacy-tasks-updated", loadData);
    window.addEventListener("project-legacy-xp-updated", loadData);
    window.addEventListener("focus", loadData);

    return () => {
      unsubscribeFromTasks();
      window.removeEventListener(
        "project-legacy-active-user-updated",
        updateActiveUser
      );
      window.removeEventListener("project-legacy-tasks-updated", loadData);
      window.removeEventListener("project-legacy-xp-updated", loadData);
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

    setFamilyTasks(nextTasks.filter((task) => task.scope === "family"));
    setHistory(nextHistory.filter((task) => task.scope === "family"));
    setIsLoading(false);
  }

  async function handleToggleTask(task: Task) {
    const activeUser = readActiveUser();

    setFamilyTasks((currentTasks) =>
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

  async function handleUpdateTask(task: Task, input: TaskEditInput) {
    const nextTitle = input.title.trim();

    if (!nextTitle) {
      return;
    }

    setFamilyTasks((currentTasks) =>
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

  const todaysFamilyTasks = familyTasks.filter((task) => isTaskForToday(task));

  const openFamilyTasks = todaysFamilyTasks.filter((task) => !task.done);

  const completedFamilyTasksToday = todaysFamilyTasks.filter((task) => {
    if (!task.done || !task.completedAt) {
      return false;
    }

    return getDateKey(new Date(task.completedAt)) === getTodayKey();
  });

  const completedByActiveUserToday = completedFamilyTasksToday.filter(
    (task) => task.completedBy === activeUserId
  );

  const activeUserFamilyXpToday = completedByActiveUserToday.reduce(
    (sum, task) => sum + task.xp,
    0
  );

  const activeUserArchivedFamilyXp = history
    .filter((task) => task.completedBy === activeUserId)
    .reduce((sum, task) => sum + task.xp, 0);

  const activeUserTotalFamilyXp =
    activeUserFamilyXpToday + activeUserArchivedFamilyXp;

  return (
    <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F7F4EA] text-[#4F773D]">
            <CheckCircle2 size={21} strokeWidth={2} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
              Familieoppgaver
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
              Felles oppgaver
            </h2>
          </div>
        </div>

        <div className="rounded-2xl bg-[#F7F4EA] px-4 py-3 text-right">
          <p className="text-xs text-stone-500">Din familie-XP</p>
          <p className="text-lg font-semibold text-[#24312A]">
            {activeUserTotalFamilyXp}
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] p-4">
          <p className="text-xs text-stone-500">Åpne i dag</p>
          <p className="mt-1 text-xl font-semibold text-[#24312A]">
            {isLoading ? "–" : openFamilyTasks.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] p-4">
          <p className="text-xs text-stone-500">Fullført</p>
          <p className="mt-1 text-xl font-semibold text-[#24312A]">
            {isLoading ? "–" : completedFamilyTasksToday.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] p-4">
          <p className="text-xs text-stone-500">Arkivert</p>
          <p className="mt-1 text-xl font-semibold text-[#24312A]">
            {isLoading ? "–" : history.length}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
            Åpne i dag
          </h3>

          <Link
            href="/"
            className="text-sm font-medium text-[#24312A] transition hover:opacity-70"
          >
            Legg til ny →
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] p-4">
            <p className="text-sm leading-6 text-stone-600">
              Henter familieoppgaver …
            </p>
          </div>
        ) : openFamilyTasks.length === 0 ? (
          <div className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] p-4">
            <p className="text-sm leading-6 text-stone-600">
              Ingen åpne familieoppgaver i dag.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA]">
            {openFamilyTasks.map((task, index) => {
              const formattedDate = formatTaskDate(task.date);
              const isEditing = editingTaskId === task.id;

              return (
                <div
                  key={task.id}
                  className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                    index !== openFamilyTasks.length - 1
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
                          await handleUpdateTask(task, input);
                          setEditingTaskId(null);
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task)}
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
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {completedFamilyTasksToday.length > 0 && (
        <div className="mt-5 rounded-3xl border border-[#DDE8D4] bg-[#F4F8EF] p-5">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6F8F54]">
                Fullført i dag
              </p>

              <p className="mt-1 text-sm text-stone-600">
                {completedFamilyTasksToday.length} familieoppgaver gjort
              </p>

              {activeUserFamilyXpToday > 0 && (
                <p className="mt-1 text-sm font-medium text-[#6F8F54]">
                  +{activeUserFamilyXpToday} XP opptjent av deg
                </p>
              )}
            </div>

            {activeUserFamilyXpToday > 0 && (
              <p className="w-fit rounded-full bg-[#8EB069] px-3 py-1 text-sm font-semibold text-white">
                +{activeUserFamilyXpToday} XP
              </p>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl bg-white/70">
            {completedFamilyTasksToday.map((task, index) => {
              const isOwnCompletion = task.completedBy === activeUserId;

              return (
                <div
                  key={task.id}
                  className={`flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${
                    index !== completedFamilyTasksToday.length - 1
                      ? "border-b border-[#E6EEDA]"
                      : ""
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#8EB069] text-white">
                        <Check size={13} strokeWidth={2.5} />
                      </span>

                      <p className="font-medium text-[#24312A]">
                        {task.title}
                      </p>

                      {isOwnCompletion && (
                        <span className="rounded-full bg-[#F4F8EF] px-2 py-1 text-xs font-semibold text-[#6F8F54]">
                          +{task.xp} XP
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm leading-5 text-stone-500">
                      {task.time}
                      <CreatedByText createdBy={task.createdBy} />
                      <CompletedByText completedBy={task.completedBy} />
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleTask(task)}
                    className="flex w-fit items-center gap-1 rounded-full bg-[#F7F4EA] px-3 py-1 text-xs font-medium text-[#24312A] transition hover:brightness-95"
                  >
                    <RotateCcw size={12} strokeWidth={2} />
                    Angre
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
