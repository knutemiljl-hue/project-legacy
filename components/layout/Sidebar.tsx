"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    label: "Oversikt",
    href: "/",
  },
  {
    label: "Familien",
    href: "/family",
  },
  {
    label: "Journal",
    href: "/journal",
  },
  {
    label: "Innstillinger",
    href: "/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-stone-200 bg-[#F7F4EA] px-5 py-6 lg:block">
      <div>
        <p className="text-sm font-medium text-[#8D846F]">Project</p>

        <h1 className="mt-1 text-2xl font-semibold text-[#24312A]">
          Legacy
        </h1>
      </div>

      <nav className="mt-10 space-y-2">
        {navigationItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-white text-[#24312A] shadow-sm"
                  : "text-stone-500 hover:bg-white/70 hover:text-[#24312A]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}