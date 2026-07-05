"use client";

import { usePathname } from "next/navigation";
import QuickAddMenu from "./QuickAddMenu";

const pageTitles: Record<string, string> = {
  "/": "Oversikt",
  "/family": "Familien",
  "/journal": "Journal",
  "/settings": "Innstillinger",
  "/archive": "Arkiv",
};

export default function Topbar() {
  const pathname = usePathname();

  const pageTitle = pageTitles[pathname] ?? "Project Legacy";

  return (
    <header className="flex items-center justify-between border-b border-stone-200 bg-[#F7F4EA] px-6 py-4">
      <div>
        <p className="text-sm font-medium text-[#8D846F]">{pageTitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-[#24312A]">
          Familien Lie
        </div>

        <QuickAddMenu />
      </div>
    </header>
  );
}