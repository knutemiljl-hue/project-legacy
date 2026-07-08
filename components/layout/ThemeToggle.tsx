"use client";

import { Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ProjectLegacyTheme,
  applyProjectLegacyTheme,
  readProjectLegacyTheme,
  saveProjectLegacyTheme,
} from "@/lib/theme";

const themeOptions: Array<{
  label: string;
  value: ProjectLegacyTheme;
  icon: ReactNode;
}> = [
  { label: "Lys", value: "light", icon: <Sun size={15} strokeWidth={2.25} /> },
  { label: "Mørk", value: "dark", icon: <Moon size={15} strokeWidth={2.25} /> },
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ProjectLegacyTheme>("light");

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      const nextTheme = readProjectLegacyTheme();

      setTheme(nextTheme);
      applyProjectLegacyTheme(nextTheme);
    }, 0);

    function updateTheme() {
      const storedTheme = readProjectLegacyTheme();

      setTheme(storedTheme);
      applyProjectLegacyTheme(storedTheme);
    }

    window.addEventListener("project-legacy-theme-updated", updateTheme);
    window.addEventListener("storage", updateTheme);

    return () => {
      window.clearTimeout(initialLoadTimer);
      window.removeEventListener("project-legacy-theme-updated", updateTheme);
      window.removeEventListener("storage", updateTheme);
    };
  }, []);

  function changeTheme(nextTheme: ProjectLegacyTheme) {
    setTheme(nextTheme);
    saveProjectLegacyTheme(nextTheme);
  }

  return (
    <div
      className="flex items-center rounded-2xl border border-[#E2D8C7] bg-white/85 p-1 shadow-sm ring-1 ring-black/5"
      aria-label="Velg tema"
    >
      {themeOptions.map((option) => {
        const isActive = option.value === theme;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => changeTheme(option.value)}
            className={`flex h-8 items-center gap-1.5 rounded-xl px-2 text-xs font-semibold transition sm:px-2.5 ${
              isActive
                ? "bg-[#EEF5E8] text-[#4F773D] shadow-sm"
                : "text-stone-500 hover:bg-[#F7F4EA] hover:text-[#24312A]"
            }`}
            aria-pressed={isActive}
          >
            {option.icon}
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
