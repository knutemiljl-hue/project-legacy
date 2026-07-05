"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Settings, Users } from "lucide-react";

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
    label: "Innst.",
    href: "/settings",
    icon: Settings,
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 rounded-[2rem] border border-[#E2D8C7] bg-white/90 p-2 shadow-xl ring-1 ring-black/5 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-4 gap-1">
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
              className={`flex flex-col items-center justify-center gap-1 rounded-3xl px-2 py-2 text-xs font-medium transition ${
                isActive
                  ? "bg-[#EEF5E8] text-[#3F6F35]"
                  : "text-stone-400 hover:bg-[#F7F4EA] hover:text-[#24312A]"
              }`}
            >
              <Icon size={19} strokeWidth={2.2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}