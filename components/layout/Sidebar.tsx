"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Home,
  Leaf,
  Settings,
  Sprout,
  Users,
} from "lucide-react";
import { readActiveUser } from "@/lib/users";

const navigationItems = [
  {
    label: "Oversikt",
    href: "/",
    icon: Home,
  },
  {
    label: "Familien",
    href: "/family",
    icon: Users,
  },
  {
    label: "Journal",
    href: "/journal",
    icon: BookOpen,
  },
  {
    label: "Innstillinger",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [activeUser, setActiveUser] = useState(readActiveUser());

  useEffect(() => {
    function updateActiveUser() {
      setActiveUser(readActiveUser());
    }

    updateActiveUser();

    window.addEventListener(
      "project-legacy-active-user-updated",
      updateActiveUser
    );
    window.addEventListener("storage", updateActiveUser);

    return () => {
      window.removeEventListener(
        "project-legacy-active-user-updated",
        updateActiveUser
      );
      window.removeEventListener("storage", updateActiveUser);
    };
  }, []);

  return (
    <aside className="hidden min-h-screen w-64 shrink-0 border-r border-[#E2D8C7] bg-white/35 px-5 py-6 backdrop-blur-xl lg:flex lg:flex-col">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#EEF5E8] text-[#4F773D]">
          <Leaf size={21} strokeWidth={2} />
        </div>

        <div>
          <p className="text-xs font-medium text-[#8D846F]">Project</p>

          <h1 className="font-serif text-2xl font-semibold leading-none text-[#24312A]">
            Legacy
          </h1>
        </div>
      </div>

      <nav className="mt-12 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-white text-[#24312A] shadow-sm ring-1 ring-black/5"
                  : "text-stone-500 hover:bg-white/70 hover:text-[#24312A]"
              }`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-xl ${
                  isActive
                    ? "bg-[#F7F4EA] text-[#4F773D]"
                    : "bg-transparent text-stone-400"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
              </span>

              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl bg-white/55 p-4 shadow-sm ring-1 ring-black/5">
        <div className="mb-3 grid h-9 w-9 place-items-center rounded-2xl bg-[#EEF5E8] text-sm font-semibold text-[#4F773D]">
          {activeUser.initials}
        </div>

        <p className="text-sm font-semibold text-[#24312A]">
          {activeUser.name}
        </p>

        <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-stone-500">
          <Sprout
            size={16}
            strokeWidth={2}
            className="mt-1 shrink-0 text-[#4F773D]"
          />

          <p>Aktiv bruker i Project Legacy.</p>
        </div>
      </div>
    </aside>
  );
}