import { supabase } from "@/lib/supabase";
import { LegacyUserId, readActiveUser } from "@/lib/users";

export const XP_PER_TASK = 5;
export const XP_PER_LEVEL = 500;

export type TaskScope = "personal" | "family";

export type Task = {
  id: string;
  title: string;
  subtitle: string;
  date?: string;
  time: string;
  scope: TaskScope;
  done: boolean;
  isCustom: boolean;
  createdBy?: LegacyUserId;
  completedBy?: LegacyUserId;
  completedAt?: string;
  archivedAt?: string;
  xp: number;
};

export type CompletionRecord = {
  taskId: string;
  completedAt: string;
  xp: number;
};

export type ArchivedTask = {
  id: string;
  taskId: string;
  title: string;
  subtitle: string;
  date?: string;
  time: string;
  scope: TaskScope;
  completedAt: string;
  xp: number;
  createdBy?: LegacyUserId;
  completedBy?: LegacyUserId;
};

export type DashboardTask = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  done: boolean;
};

export type TaskInput = {
  title: string;
  subtitle?: string;
  date?: string;
  time?: string;
  scope: TaskScope;
};

type TaskRow = {
  id: string;
  title: string;
  subtitle: string | null;
  task_date: string | null;
  task_time: string | null;
  scope: TaskScope;
  is_done: boolean;
  is_archived: boolean;
  created_by: LegacyUserId | null;
  completed_by: LegacyUserId | null;
  completed_at: string | null;
  archived_at: string | null;
  xp: number | null;
  created_at: string;
};

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || "Egendefinert oppgave",
    date: row.task_date ?? undefined,
    time: row.task_time || "Hele dagen",
    scope: row.scope,
    done: row.is_done,
    isCustom: true,
    createdBy: row.created_by ?? undefined,
    completedBy: row.completed_by ?? undefined,
    completedAt: row.completed_at ?? undefined,
    archivedAt: row.archived_at ?? undefined,
    xp: row.xp ?? XP_PER_TASK,
  };
}

export function notifyXpUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("project-legacy-xp-updated"));
}

export function notifyTasksUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("project-legacy-tasks-updated"));
}

export function notifyTaskAndXpUpdates() {
  notifyTasksUpdated();
  notifyXpUpdated();
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getDateKey(date: Date) {
  return getLocalDateKey(date);
}

export function getTodayKey() {
  return getLocalDateKey();
}

export function isTaskForToday(task: Pick<Task, "date">) {
  if (!task.date) {
    return true;
  }

  return task.date === getTodayKey();
}

export function formatTaskDate(date?: string) {
  if (!date) {
    return null;
  }

  const [year, month, day] = date.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(localDate);
}

export function getScopeLabel(scope: TaskScope) {
  return scope === "family" ? "Familie" : "Egen";
}

export function createDefaultTasks(_tasks: DashboardTask[]): Task[] {
  return [];
}

export async function readTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("legacy_tasks")
    .select(
      "id, title, subtitle, task_date, task_time, scope, is_done, is_archived, created_by, completed_by, completed_at, archived_at, xp, created_at"
    )
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Kunne ikke hente oppgaver:", error);
    return [];
  }

  return (data ?? []).map((task) => mapTask(task as TaskRow));
}

export async function readArchivedTasks(): Promise<ArchivedTask[]> {
  const { data, error } = await supabase
    .from("legacy_tasks")
    .select(
      "id, title, subtitle, task_date, task_time, scope, is_done, is_archived, created_by, completed_by, completed_at, archived_at, xp, created_at"
    )
    .eq("is_archived", true)
    .order("archived_at", { ascending: false });

  if (error) {
    console.error("Kunne ikke hente arkiverte oppgaver:", error);
    return [];
  }

  return (data ?? [])
    .map((task) => mapTask(task as TaskRow))
    .filter((task) => task.completedAt)
    .map((task) => ({
      id: task.id,
      taskId: task.id,
      title: task.title,
      subtitle: task.subtitle,
      date: task.date,
      time: task.time,
      scope: task.scope,
      completedAt: task.completedAt as string,
      xp: task.xp,
      createdBy: task.createdBy,
      completedBy: task.completedBy,
    }));
}

export async function readCompletedTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("legacy_tasks")
    .select(
      "id, title, subtitle, task_date, task_time, scope, is_done, is_archived, created_by, completed_by, completed_at, archived_at, xp, created_at"
    )
    .eq("is_done", true)
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("Kunne ikke hente fullførte oppgaver:", error);
    return [];
  }

  return (data ?? []).map((task) => mapTask(task as TaskRow));
}

export async function addTask(input: TaskInput) {
  const title = input.title.trim();

  if (!title) {
    return;
  }

  const activeUser = readActiveUser();

  const { error } = await supabase.from("legacy_tasks").insert({
    title,
    subtitle: input.subtitle?.trim() || "Egendefinert oppgave",
    task_date: input.date || null,
    task_time: input.time || "Hele dagen",
    scope: input.scope,
    is_done: false,
    is_archived: false,
    created_by: activeUser.id,
    completed_by: null,
    completed_at: null,
    xp: XP_PER_TASK,
  });

  if (error) {
    console.error("Kunne ikke legge til oppgave:", error);
    return;
  }

  notifyTaskAndXpUpdates();
}

export async function toggleTaskCompleted(task: Task) {
  const activeUser = readActiveUser();
  const nextDone = !task.done;

  const { error } = await supabase
    .from("legacy_tasks")
    .update({
      is_done: nextDone,
      completed_by: nextDone ? activeUser.id : null,
      completed_at: nextDone ? new Date().toISOString() : null,
      xp: XP_PER_TASK,
    })
    .eq("id", task.id);

  if (error) {
    console.error("Kunne ikke oppdatere oppgave:", error);
    return;
  }

  notifyTaskAndXpUpdates();
}

export async function deleteTask(taskId: string) {
  const { error } = await supabase.from("legacy_tasks").delete().eq("id", taskId);

  if (error) {
    console.error("Kunne ikke slette oppgave:", error);
    return;
  }

  notifyTaskAndXpUpdates();
}

export async function archiveCompletedTask(taskId: string) {
  const { error } = await supabase
    .from("legacy_tasks")
    .update({
      is_archived: true,
      archived_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("is_done", true);

  if (error) {
    console.error("Kunne ikke arkivere oppgave:", error);
    return;
  }

  notifyTaskAndXpUpdates();
}

export async function readTotalXp(userId?: LegacyUserId) {
  const completedTasks = await readCompletedTasks();

  return completedTasks
    .filter((task) => {
      if (!userId) {
        return true;
      }

      return task.completedBy === userId;
    })
    .reduce((sum, task) => sum + task.xp, 0);
}

export function subscribeToTasks(onChange: () => void) {
  const channelName = `legacy-tasks-${crypto.randomUUID()}`;

  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "legacy_tasks",
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}