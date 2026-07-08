"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";
import { Task, TaskCategory, TaskScope, TaskSubtask } from "@/lib/tasks";

export type TaskEditInput = {
  title: string;
  subtitle?: string;
  date?: string;
  endDate?: string;
  scope: TaskScope;
  category: TaskCategory;
  subtasks?: TaskSubtask[];
};

type InlineTaskEditorProps = {
  task: Task;
  onCancel: () => void;
  onSave: (input: TaskEditInput) => Promise<void>;
};

export default function InlineTaskEditor({
  task,
  onCancel,
  onSave,
}: InlineTaskEditorProps) {
  const [title, setTitle] = useState(task.title);
  const [subtitle, setSubtitle] = useState(task.subtitle);
  const [date, setDate] = useState(task.date ?? "");
  const [endDate, setEndDate] = useState(task.endDate ?? "");
  const [scope, setScope] = useState<TaskScope>(task.scope);
  const [category, setCategory] = useState<TaskCategory>(task.category);
  const [subtasksText, setSubtasksText] = useState(
    task.subtasks.map((subtask) => subtask.title).join("\n")
  );
  const [isSaving, setIsSaving] = useState(false);

  function buildSubtasks() {
    const existingByTitle = new Map(
      task.subtasks.map((subtask) => [subtask.title.trim(), subtask])
    );

    return subtasksText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const existingSubtask = existingByTitle.get(line);

        return {
          id: existingSubtask?.id ?? `subtask-${Date.now()}-${line}`,
          title: line,
          done: existingSubtask?.done ?? false,
        };
      });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    setIsSaving(true);

    await onSave({
      title,
      subtitle,
      date,
      endDate,
      scope,
      category,
      subtasks: buildSubtasks(),
    });

    setIsSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,1fr)_minmax(180px,0.8fr)_150px_150px_180px]">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
            Tittel
          </span>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-[#24312A] outline-none transition focus:border-[#8D846F]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
            Beskrivelse
          </span>

          <input
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-[#24312A] outline-none transition focus:border-[#8D846F]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
            Dato
          </span>

          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-[#24312A] outline-none transition focus:border-[#8D846F]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
            Slutt
          </span>

          <input
            type="date"
            value={endDate}
            min={date}
            onChange={(event) => setEndDate(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-[#24312A] outline-none transition focus:border-[#8D846F]"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
            Gjelder
          </span>

          <select
            value={scope}
            onChange={(event) => setScope(event.target.value as TaskScope)}
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
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as TaskCategory)
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
          value={subtasksText}
          onChange={(event) => setSubtasksText(event.target.value)}
          className="mt-2 min-h-24 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-[#24312A] outline-none transition focus:border-[#8D846F]"
          placeholder="Ett underpunkt per linje"
        />
      </label>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
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
