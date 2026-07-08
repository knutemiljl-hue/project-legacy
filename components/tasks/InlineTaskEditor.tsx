"use client";

import { useState } from "react";
import { Save, X } from "lucide-react";
import { Task, TaskCategory, TaskScope } from "@/lib/tasks";

export type TaskEditInput = {
  title: string;
  date?: string;
  scope: TaskScope;
  category: TaskCategory;
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
  const [date, setDate] = useState(task.date ?? "");
  const [scope, setScope] = useState<TaskScope>(task.scope);
  const [category, setCategory] = useState<TaskCategory>(task.category);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    setIsSaving(true);

    await onSave({
      title,
      date,
      scope,
      category,
    });

    setIsSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,1fr)_170px_150px_180px]">
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
