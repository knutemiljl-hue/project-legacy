"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Circle,
  RotateCcw,
} from "lucide-react";
import {
  ArchivedTask,
  CompletionRecord,
  Task,
  XP_PER_TASK,
  formatTaskDate,
  isTaskForToday,
  notifyTaskAndXpUpdates,
  readCompletionRecords,
  readCustomTasks,
  readTaskHistory,
  saveCompletionRecords,
} from "@/lib/tasks";
import { getUserDisplayName } from "@/lib/users";

function readFamilyTasks() {
  return readCustomTasks().filter((task) => task.scope === "family");
}

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

export default function FamilyTasksSummary() {
  const [familyTasks, setFamilyTasks] = useState<Task[]>([]);
  const [completionRecords, setCompletionRecords] = useState<
    CompletionRecord[]
  >([]);
  const [history, setHistory] = useState<ArchivedTask[]>([]);

  useEffect(() => {
    loadData();

    window.addEventListener("project-legacy-tasks-updated", loadData);
    window.addEventListener("project-legacy-xp-updated", loadData);
    window.addEventListener("focus", loadData);
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("project-legacy-tasks-updated", loadData);
      window.removeEventListener("project-legacy-xp-updated", loadData);
      window.removeEventListener("focus", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  function loadData() {
    setFamilyTasks(readFamilyTasks());
    setCompletionRecords(readCompletionRecords());
    setHistory(readTaskHistory());
  }

  function toggleTask(taskId: string) {
    setCompletionRecords((currentRecords) => {
      const isCompleted = currentRecords.some(
        (record) => record.taskId === taskId
      );

      const nextRecords = isCompleted
        ? currentRecords.filter((record) => record.taskId !== taskId)
        : [
            ...currentRecords,
            {
              taskId,
              completedAt: new Date().toISOString(),
              xp: XP_PER_TASK,
            },
          ];

      saveCompletionRecords(nextRecords);
      notifyTaskAndXpUpdates();

      return nextRecords;
    });
  }

  const completedTaskIds = completionRecords.map((record) => record.taskId);

  const todaysFamilyTasks = familyTasks.filter((task) => isTaskForToday(task));

  const openFamilyTasks = todaysFamilyTasks.filter(
    (task) => !completedTaskIds.includes(task.id)
  );

  const completedFamilyTasksToday = todaysFamilyTasks.filter((task) =>
    completedTaskIds.includes(task.id)
  );

  const archivedFamilyTasks = history.filter((task) => task.scope === "family");

  const familyXpToday = completedFamilyTasksToday.length * XP_PER_TASK;
  const familyXpArchived = archivedFamilyTasks.reduce(
    (sum, task) => sum + task.xp,
    0
  );

  const totalFamilyXp = familyXpToday + familyXpArchived;

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
          <p className="text-xs text-stone-500">Familie-XP</p>
          <p className="text-lg font-semibold text-[#24312A]">
            {totalFamilyXp}
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] p-4">
          <p className="text-xs text-stone-500">Åpne i dag</p>
          <p className="mt-1 text-xl font-semibold text-[#24312A]">
            {openFamilyTasks.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] p-4">
          <p className="text-xs text-stone-500">Fullført</p>
          <p className="mt-1 text-xl font-semibold text-[#24312A]">
            {completedFamilyTasksToday.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] p-4">
          <p className="text-xs text-stone-500">Arkivert</p>
          <p className="mt-1 text-xl font-semibold text-[#24312A]">
            {archivedFamilyTasks.length}
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

        {openFamilyTasks.length === 0 ? (
          <div className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] p-4">
            <p className="text-sm leading-6 text-stone-600">
              Ingen åpne familieoppgaver i dag.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA]">
            {openFamilyTasks.map((task, index) => {
              const formattedDate = formatTaskDate(task.date);

              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between gap-4 px-4 py-3 ${
                    index !== openFamilyTasks.length - 1
                      ? "border-b border-[#ECE3D4]"
                      : ""
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-stone-300 bg-white text-stone-300">
                      <Circle size={13} strokeWidth={2} />
                    </span>

                    <div>
                      <p className="font-medium text-[#24312A]">{task.title}</p>

                      <p className="mt-1 text-sm text-stone-500">
                        {task.subtitle}
                        <CreatedByText createdBy={task.createdBy} />
                      </p>
                    </div>
                  </button>

                  <div className="text-right">
                    {formattedDate && (
                      <p className="text-xs text-stone-400">{formattedDate}</p>
                    )}

                    <p className="text-sm text-stone-500">{task.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {completedFamilyTasksToday.length > 0 && (
        <div className="mt-5 rounded-3xl border border-[#DDE8D4] bg-[#F4F8EF] p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#6F8F54]">
                Fullført i dag
              </p>

              <p className="mt-1 text-sm text-stone-600">
                {completedFamilyTasksToday.length} familieoppgaver gjort
              </p>
            </div>

            <p className="rounded-full bg-[#8EB069] px-3 py-1 text-sm font-semibold text-white">
              +{familyXpToday} XP
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white/70">
            {completedFamilyTasksToday.map((task, index) => (
              <div
                key={task.id}
                className={`flex items-center justify-between gap-4 px-4 py-3 ${
                  index !== completedFamilyTasksToday.length - 1
                    ? "border-b border-[#E6EEDA]"
                    : ""
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#8EB069] text-white">
                      <Check size={13} strokeWidth={2.5} />
                    </span>

                    <p className="font-medium text-[#24312A]">{task.title}</p>
                  </div>

                  <p className="mt-1 text-sm text-stone-500">
                    {task.time}
                    <CreatedByText createdBy={task.createdBy} />
                  </p>
                </div>

                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center gap-1 rounded-full bg-[#F7F4EA] px-3 py-1 text-xs font-medium text-[#24312A] transition hover:brightness-95"
                >
                  <RotateCcw size={12} strokeWidth={2} />
                  Angre
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}