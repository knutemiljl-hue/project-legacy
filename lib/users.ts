export const ACTIVE_USER_KEY = "project-legacy-active-user";

export type LegacyUserId = "knut" | "ingrid";

export type LegacyUser = {
  id: LegacyUserId;
  name: string;
  initials: string;
};

export const legacyUsers: LegacyUser[] = [
  {
    id: "knut",
    name: "Knut Emil",
    initials: "KE",
  },
  {
    id: "ingrid",
    name: "Ingrid",
    initials: "I",
  },
];

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getUserById(userId?: string | null) {
  return legacyUsers.find((user) => user.id === userId) ?? null;
}

export function getUserDisplayName(userId?: string | null) {
  return getUserById(userId)?.name ?? "Ukjent";
}

export function readActiveUserId(): LegacyUserId {
  if (!canUseStorage()) {
    return "knut";
  }

  const storedUserId = window.localStorage.getItem(ACTIVE_USER_KEY);

  if (storedUserId === "knut" || storedUserId === "ingrid") {
    return storedUserId;
  }

  return "knut";
}

export function readActiveUser() {
  const activeUserId = readActiveUserId();

  return getUserById(activeUserId) ?? legacyUsers[0];
}

export function saveActiveUserId(userId: LegacyUserId) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACTIVE_USER_KEY, userId);
  window.dispatchEvent(new Event("project-legacy-active-user-updated"));
}