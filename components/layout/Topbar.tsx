"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import QuickAddMenu from "./QuickAddMenu";
import ThemeToggle from "./ThemeToggle";
import {
  LegacyUserId,
  legacyUsers,
  readActiveUser,
  saveActiveUserId,
} from "@/lib/users";

const pageTitles: Record<string, string> = {
  "/": "Oversikt",
  "/tasks": "Gjøremål",
  "/calendar": "Kalender",
  "/family": "Familien",
  "/journal": "Journal",
  "/settings": "Innstillinger",
  "/archive": "Arkiv",
};

export default function Topbar() {
  const pathname = usePathname();
  const [activeUserId, setActiveUserId] = useState<LegacyUserId>("knut");

  const pageTitle = pageTitles[pathname] ?? "Project Legacy";
  const activeUser = legacyUsers.find((user) => user.id === activeUserId);

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      setActiveUserId(readActiveUser().id);
    }, 0);

    function updateActiveUser() {
      setActiveUserId(readActiveUser().id);
    }

    window.addEventListener(
      "project-legacy-active-user-updated",
      updateActiveUser
    );
    window.addEventListener("storage", updateActiveUser);

    return () => {
      window.clearTimeout(initialLoadTimer);
      window.removeEventListener(
        "project-legacy-active-user-updated",
        updateActiveUser
      );
      window.removeEventListener("storage", updateActiveUser);
    };
  }, []);

  function changeUser(userId: LegacyUserId) {
    setActiveUserId(userId);
    saveActiveUserId(userId);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2D8C7] bg-[#F7F4EA]/90 px-3 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
      <div className="mx-auto flex w-full max-w-[1720px] items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-[#8D846F] sm:text-sm sm:normal-case sm:tracking-normal">
            {pageTitle}
          </p>

          <p className="mt-0.5 hidden text-xs text-stone-500 sm:block">
            Project Legacy
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <div className="flex max-w-[138px] items-center gap-2 rounded-2xl border border-[#E2D8C7] bg-white/85 px-2 py-2 shadow-sm ring-1 ring-black/5 sm:max-w-none sm:px-3">
            <div className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#EEF5E8] text-xs font-semibold text-[#4F773D]">
              {activeUser?.initials ?? "KE"}
            </div>

            <select
              value={activeUserId}
              onChange={(event) =>
                changeUser(event.target.value as LegacyUserId)
              }
              className="min-w-0 max-w-[82px] bg-transparent text-sm font-semibold text-[#24312A] outline-none sm:max-w-none"
              aria-label="Velg bruker"
            >
              {legacyUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <QuickAddMenu />
        </div>
      </div>
    </header>
  );
}
