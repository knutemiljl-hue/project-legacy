import { supabase } from "@/lib/supabase";
import { LegacyUserId, readActiveUser } from "@/lib/users";

export const XP_PER_TASK = 5;
export const XP_PER_LEVEL = 500;
export const MAX_RECURRENCE_ITEMS = 52;

export type TaskScope = "personal" | "family";
export type TaskCategory = "task" | "purchase";
export type RecurrenceFrequency = "none" | "weekly" | "biweekly" | "monthly";

export type TaskSubtask = {
  id: string;
  title: string;
  done: boolean;
};

export type Task = {
  id: string;
  title: string;
  subtitle: string;
  date?: string;
  endDate?: string;
  time: string;
  scope: TaskScope;
  category: TaskCategory;
  subtasks: TaskSubtask[];
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
  endDate?: string;
  time: string;
  scope: TaskScope;
  category: TaskCategory;
  subtasks: TaskSubtask[];
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
  endDate?: string;
  time?: string;
  scope: TaskScope;
  category?: TaskCategory;
  subtasks?: Array<string | TaskSubtask>;
};

export type RecurringTaskInput = TaskInput & {
  recurrenceFrequency?: RecurrenceFrequency;
  recurrenceUntil?: string;
};

export type TaskUpdateInput = {
  title: string;
  subtitle?: string;
  date?: string;
  endDate?: string;
  scope: TaskScope;
  category: TaskCategory;
  subtasks?: Array<string | TaskSubtask>;
};

type TaskRow = {
  id: string;
  title: string;
  subtitle: string | null;
  task_date: string | null;
  task_time: string | null;
  scope: TaskScope;
  task_category: TaskCategory | null;
  is_done: boolean;
  is_archived: boolean;
  created_by: LegacyUserId | null;
  completed_by: LegacyUserId | null;
  completed_at: string | null;
  archived_at: string | null;
  xp: number | null;
  created_at: string;
};

const TASK_DETAILS_PREFIX = "__legacy_task_details_v1__:";

type EncodedTaskDetails = {
  description?: string;
  endDate?: string;
  subtasks?: TaskSubtask[];
};

function createTaskSubtaskId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `subtask-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normalizeTaskSubtasks(
  subtasks?: Array<string | TaskSubtask>
): TaskSubtask[] {
  return (subtasks ?? [])
    .map((subtask) => {
      if (typeof subtask === "string") {
        return {
          id: createTaskSubtaskId(),
          title: subtask.trim(),
          done: false,
        };
      }

      return {
        id: subtask.id || createTaskSubtaskId(),
        title: subtask.title.trim(),
        done: subtask.done,
      };
    })
    .filter((subtask) => subtask.title.length > 0);
}

function parseTaskDetails(subtitle: string | null): EncodedTaskDetails {
  if (!subtitle) {
    return {};
  }

  if (!subtitle.startsWith(TASK_DETAILS_PREFIX)) {
    return { description: subtitle };
  }

  try {
    const details = JSON.parse(
      subtitle.slice(TASK_DETAILS_PREFIX.length)
    ) as EncodedTaskDetails;

    return {
      description: details.description,
      endDate: details.endDate,
      subtasks: normalizeTaskSubtasks(details.subtasks),
    };
  } catch (error) {
    console.error("Kunne ikke lese oppgavedetaljer:", error);
    return { description: subtitle };
  }
}

function encodeTaskDetails({
  description,
  endDate,
  subtasks,
}: {
  description?: string;
  endDate?: string;
  subtasks?: Array<string | TaskSubtask>;
}) {
  const nextDescription = description?.trim() ?? "";
  const normalizedSubtasks = normalizeTaskSubtasks(subtasks);
  const nextEndDate = endDate || undefined;

  if (!nextEndDate && normalizedSubtasks.length === 0) {
    return nextDescription || null;
  }

  return `${TASK_DETAILS_PREFIX}${JSON.stringify({
    description: nextDescription,
    endDate: nextEndDate,
    subtasks: normalizedSubtasks,
  })}`;
}

function normalizeTaskSubtitle(description: string | undefined, category: TaskCategory) {
  const trimmedDescription = description?.trim() ?? "";

  if (category === "task" && trimmedDescription === "Egendefinert oppgave") {
    return "";
  }

  if (category === "task") {
    return trimmedDescription;
  }

  return trimmedDescription || "Større oppgave";
}

function mapTask(row: TaskRow): Task {
  const details = parseTaskDetails(row.subtitle);
  const category = row.task_category ?? "task";
  const subtitle = normalizeTaskSubtitle(details.description, category);

  return {
    id: row.id,
    title: row.title,
    subtitle,
    date: row.task_date ?? undefined,
    endDate: details.endDate,
    time: row.task_time || "Hele dagen",
    scope: row.scope,
    category,
    subtasks: details.subtasks ?? [],
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

export function isTaskForToday(task: Pick<Task, "date" | "endDate">) {
  if (!task.date) {
    return true;
  }

  const today = getTodayKey();
  const endDate = task.endDate && task.endDate > task.date ? task.endDate : task.date;

  return task.date <= today && endDate >= today;
}

export function isTaskOverdue(task: Pick<Task, "date" | "endDate">) {
  if (!task.date) {
    return false;
  }

  const endDate = task.endDate && task.endDate > task.date ? task.endDate : task.date;

  return endDate < getTodayKey();
}

export function isTaskDueTodayOrOverdue(task: Pick<Task, "date" | "endDate">) {
  return isTaskForToday(task) || isTaskOverdue(task);
}

export function isRegularTask(task: Pick<Task, "category">) {
  return task.category === "task";
}

export function isPurchaseTask(task: Pick<Task, "category">) {
  return task.category === "purchase";
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

function formatShortDateKey(date: string, includeYear = false) {
  const [year, month, day] = date.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "short",
    year: includeYear ? "numeric" : undefined,
  }).format(localDate);
}

export function formatTaskDateRange(date?: string, endDate?: string) {
  if (!date) {
    return null;
  }

  if (!endDate || endDate <= date) {
    return formatTaskDate(date);
  }

  const startYear = date.slice(0, 4);
  const endYear = endDate.slice(0, 4);

  return `${formatShortDateKey(date, startYear !== endYear)} - ${formatShortDateKey(
    endDate,
    startYear !== endYear
  )}`;
}

export function getScopeLabel(scope: TaskScope) {
  return scope === "family" ? "Familie" : "Egen";
}

export function getTaskCategoryLabel(category: TaskCategory) {
  return category === "purchase" ? "Større oppgave" : "Vanlig oppgave";
}

export function getRecurrenceLabel(frequency: RecurrenceFrequency) {
  const labels: Record<RecurrenceFrequency, string> = {
    none: "Gjentas ikke",
    weekly: "Ukentlig",
    biweekly: "Annenhver uke",
    monthly: "Månedlig",
  };

  return labels[frequency];
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function getLastDayOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function addMonthsClamped(date: Date, monthsToAdd: number, preferredDay: number) {
  const year = date.getFullYear();
  const monthIndex = date.getMonth() + monthsToAdd;
  const target = new Date(year, monthIndex, 1);
  const lastDay = getLastDayOfMonth(target.getFullYear(), target.getMonth());

  target.setDate(Math.min(preferredDay, lastDay));

  return target;
}

export function buildRecurringDateKeys({
  startDate,
  untilDate,
  frequency,
}: {
  startDate?: string;
  untilDate?: string;
  frequency: RecurrenceFrequency;
}) {
  if (frequency === "none" || !startDate || !untilDate) {
    return startDate ? [startDate] : [];
  }

  const start = parseDateKey(startDate);
  const until = parseDateKey(untilDate);

  if (start > until) {
    return [startDate];
  }

  const dates: string[] = [];
  let current = new Date(start);
  const preferredMonthDay = start.getDate();

  while (current <= until && dates.length < MAX_RECURRENCE_ITEMS) {
    dates.push(getLocalDateKey(current));

    if (frequency === "weekly") {
      current.setDate(current.getDate() + 7);
    }

    if (frequency === "biweekly") {
      current.setDate(current.getDate() + 14);
    }

    if (frequency === "monthly") {
      current = addMonthsClamped(current, 1, preferredMonthDay);
    }
  }

  return dates;
}

export function createDefaultTasks(): Task[] {
  return [];
}

export async function readTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("legacy_tasks")
    .select(
      "id, title, subtitle, task_date, task_time, scope, task_category, is_done, is_archived, created_by, completed_by, completed_at, archived_at, xp, created_at"
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
      "id, title, subtitle, task_date, task_time, scope, task_category, is_done, is_archived, created_by, completed_by, completed_at, archived_at, xp, created_at"
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
      endDate: task.endDate,
      time: task.time,
      scope: task.scope,
      category: task.category,
      subtasks: task.subtasks,
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
      "id, title, subtitle, task_date, task_time, scope, task_category, is_done, is_archived, created_by, completed_by, completed_at, archived_at, xp, created_at"
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
  const defaultSubtitle =
    input.category === "purchase" ? "Større oppgave" : "";

  const { error } = await supabase.from("legacy_tasks").insert({
    title,
    subtitle: encodeTaskDetails({
      description: input.subtitle?.trim() || defaultSubtitle,
      endDate: input.endDate,
      subtasks: input.subtasks,
    }),
    task_date: input.date || null,
    task_time: input.time || "Hele dagen",
    scope: input.scope,
    task_category: input.category ?? "task",
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

export async function addRecurringTasks(input: RecurringTaskInput) {
  const title = input.title.trim();

  if (!title) {
    return;
  }

  const frequency = input.recurrenceFrequency ?? "none";

  if (frequency === "none" || !input.date || !input.recurrenceUntil) {
    await addTask(input);
    return;
  }

  const activeUser = readActiveUser();
  const dates = buildRecurringDateKeys({
    startDate: input.date,
    untilDate: input.recurrenceUntil,
    frequency,
  });

  if (dates.length === 0) {
    await addTask(input);
    return;
  }

  const subtitle =
    input.subtitle?.trim() ||
    (input.category === "purchase" ? "Større oppgave" : "");
  const encodedSubtitle = encodeTaskDetails({
    description: subtitle,
    endDate: input.endDate,
    subtasks: input.subtasks,
  });

  const { error } = await supabase.from("legacy_tasks").insert(
    dates.map((date) => ({
      title,
      subtitle: encodedSubtitle,
      task_date: date,
      task_time: input.time || "Hele dagen",
      scope: input.scope,
      task_category: input.category ?? "task",
      is_done: false,
      is_archived: false,
      created_by: activeUser.id,
      completed_by: null,
      completed_at: null,
      xp: XP_PER_TASK,
    }))
  );

  if (error) {
    console.error("Kunne ikke legge til gjentakende oppgaver:", error);
    return;
  }

  notifyTaskAndXpUpdates();
}

export async function toggleTaskCompleted(task: Task) {
  const activeUser = readActiveUser();
  const nextDone = !task.done;
  const completedAt = new Date().toISOString();

  const update = nextDone
    ? {
        is_done: true,
        is_archived: true,
        completed_by: activeUser.id,
        completed_at: completedAt,
        archived_at: completedAt,
        xp: task.xp ?? XP_PER_TASK,
      }
    : {
        is_done: false,
        is_archived: false,
        completed_by: null,
        completed_at: null,
        archived_at: null,
        xp: task.xp ?? XP_PER_TASK,
      };

  let query = supabase.from("legacy_tasks").update(update).eq("id", task.id);

  query = nextDone ? query.eq("is_done", false) : query.eq("is_done", true);

  const { error } = await query;

  if (error) {
    console.error("Kunne ikke oppdatere oppgave:", error);
    return;
  }

  notifyTaskAndXpUpdates();
}

export async function updateTask(taskId: string, input: TaskUpdateInput) {
  const title = input.title.trim();

  if (!title) {
    return;
  }

  const { error } = await supabase
    .from("legacy_tasks")
    .update({
      title,
      subtitle: encodeTaskDetails({
        description: input.subtitle,
        endDate: input.endDate,
        subtasks: input.subtasks,
      }),
      task_date: input.date || null,
      scope: input.scope,
      task_category: input.category,
    })
    .eq("id", taskId);

  if (error) {
    console.error("Kunne ikke oppdatere oppgave:", error);
    return;
  }

  notifyTaskAndXpUpdates();
}

export async function toggleTaskSubtask(task: Task, subtaskId: string) {
  const nextSubtasks = task.subtasks.map((subtask) =>
    subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask
  );

  const { error } = await supabase
    .from("legacy_tasks")
    .update({
      subtitle: encodeTaskDetails({
        description: task.subtitle,
        endDate: task.endDate,
        subtasks: nextSubtasks,
      }),
    })
    .eq("id", task.id);

  if (error) {
    console.error("Kunne ikke oppdatere underpunkt:", error);
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
  const channelName = `legacy-tasks-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

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


