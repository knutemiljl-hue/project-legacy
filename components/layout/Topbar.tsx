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
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#E2D8C7] bg-[#F7F4EA]/80 px-6 py-4 backdrop-blur-xl">
      <div>
        <p className="text-sm font-medium text-[#8D846F]">{pageTitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-[#E2D8C7] bg-white/80 px-4 py-2 text-sm font-medium text-[#24312A] shadow-sm">
          Knut Emil
        </div>

        <QuickAddMenu />
      </div>
    </header>
  );
}