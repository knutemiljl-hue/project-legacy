export const COMPLETED_TASKS_KEY = "project-legacy-daily-tasks";
export const CUSTOM_TASKS_KEY = "project-legacy-custom-daily-tasks";
export const COMPLETION_RECORDS_KEY = "project-legacy-task-completions";
export const TASK_HISTORY_KEY = "project-legacy-task-history";

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
};

export type DashboardTask = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  done: boolean;
};

function canUseStorage() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  const storedValue = window.localStorage.getItem(key);

  if (!storedValue) {
    return fallback;
  }

  try {
    return JSON.parse(storedValue) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function notifyXpUpdated() {
  if (!canUseStorage()) {
    return;
  }

  window.setTimeout(() => {
    window.dispatchEvent(new Event("project-legacy-xp-updated"));
  }, 0);
}

export function notifyTasksUpdated() {
  if (!canUseStorage()) {
    return;
  }

  window.setTimeout(() => {
    window.dispatchEvent(new Event("project-legacy-tasks-updated"));
  }, 0);
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

export function isTaskForToday(task: Pick<Task, "date" | "isCustom">) {
  if (!task.isCustom) {
    return true;
  }

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

export function createDefaultTasks(tasks: DashboardTask[]): Task[] {
  return tasks.map((task) => ({
    id: task.id,
    title: task.title,
    subtitle: task.subtitle,
    time: task.time,
    scope: "personal",
    done: task.done,
    isCustom: false,
  }));
}

export function readCustomTasks(): Task[] {
  const parsedTasks = readJson<Partial<Task>[]>(CUSTOM_TASKS_KEY, []);

  return parsedTasks.map((task) => ({
    id: task.id ?? `custom-${Date.now()}`,
    title: task.title ?? "Uten tittel",
    subtitle: task.subtitle ?? "Egendefinert oppgave",
    date: task.date,
    time: task.time ?? "Hele dagen",
    scope: task.scope ?? "personal",
    done: task.done ?? false,
    isCustom: true,
  }));
}

export function saveCustomTasks(tasks: Task[]) {
  writeJson(CUSTOM_TASKS_KEY, tasks);
}

export function readCompletionRecords(): CompletionRecord[] {
  return readJson<CompletionRecord[]>(COMPLETION_RECORDS_KEY, []);
}

export function readStoredCompletedTaskIds(): string[] {
  return readJson<string[]>(COMPLETED_TASKS_KEY, []);
}

export function saveCompletionRecords(records: CompletionRecord[]) {
  writeJson(COMPLETION_RECORDS_KEY, records);
  writeJson(
    COMPLETED_TASKS_KEY,
    records.map((record) => record.taskId)
  );

  notifyXpUpdated();
}

export function readTaskHistory(): ArchivedTask[] {
  return readJson<ArchivedTask[]>(TASK_HISTORY_KEY, []);
}

export function saveTaskHistory(history: ArchivedTask[]) {
  writeJson(TASK_HISTORY_KEY, history);
}

export function readTotalXp() {
  const completions = readCompletionRecords();
  const history = readTaskHistory();

  const todayXp = completions.reduce((sum, record) => sum + record.xp, 0);
  const historyXp = history.reduce((sum, task) => sum + task.xp, 0);

  return todayXp + historyXp;
}