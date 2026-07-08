"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CheckCircle2, Home, Settings, Users } from "lucide-react";

const navigationItems = [
  { label: "Oversikt", href: "/", icon: Home },
  { label: "Gjøremål", href: "/tasks", icon: CheckCircle2 },
  { label: "Kalender", href: "/calendar", icon: CalendarDays },
  { label: "Familien", href: "/family", icon: Users },
  { label: "Innstillinger", href: "/settings", icon: Settings },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-2 pb-2 sm:px-3 sm:pb-3 lg:hidden">
      <nav className="pointer-events-auto rounded-[1.75rem] border border-[#E2D8C7] bg-white/92 p-1.5 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl sm:rounded-[2rem] sm:p-2">
        <div className="grid grid-cols-5 gap-1">
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
                aria-label={item.label}
                title={item.label}
                className={`flex min-h-12 items-center justify-center rounded-3xl px-1.5 py-2 transition ${
                  isActive
                    ? "bg-[#EEF5E8] text-[#3F6F35] shadow-sm"
                    : "text-stone-400 hover:bg-[#F7F4EA] hover:text-[#24312A]"
                }`}
              >
                <Icon size={21} strokeWidth={2.25} />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
