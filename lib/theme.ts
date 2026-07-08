export const THEME_STORAGE_KEY = "project-legacy-theme";

export type ProjectLegacyTheme = "light" | "dark";

export function isProjectLegacyTheme(value: string | null): value is ProjectLegacyTheme {
  return value === "light" || value === "dark";
}

export function applyProjectLegacyTheme(theme: ProjectLegacyTheme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.remove("theme-light", "theme-dark");
  document.documentElement.classList.add(`theme-${theme}`);
  document.documentElement.dataset.theme = theme;
}

export function readProjectLegacyTheme(): ProjectLegacyTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  return isProjectLegacyTheme(storedTheme) ? storedTheme : "light";
}

export function saveProjectLegacyTheme(theme: ProjectLegacyTheme) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyProjectLegacyTheme(theme);
  window.dispatchEvent(new Event("project-legacy-theme-updated"));
}
