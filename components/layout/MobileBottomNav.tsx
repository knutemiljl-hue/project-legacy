"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CheckCircle2, Home, Settings, Users } from "lucide-react";

const navigationItems = [
  { label: "Oversikt", href: "/", icon: Home },
  { label: "Gjøremål", href: "/tasks", icon: CheckCircle2 },
  { label: "Kalender", href: "/calendar", icon: CalendarDays },
  { label: "Familien", href: "/family", icon: Users },
  { label: "Innst.", href: "/settings", icon: Settings },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-3 lg:hidden">
      <nav className="pointer-events-auto rounded-[2rem] border border-[#E2D8C7] bg-white/90 p-2 shadow-xl ring-1 ring-black/5 backdrop-blur-xl">
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
                className={`flex flex-col items-center justify-center gap-1 rounded-3xl px-1.5 py-2 text-[11px] font-medium transition ${
                  isActive
                    ? "bg-[#EEF5E8] text-[#3F6F35]"
                    : "text-stone-400 hover:bg-[#F7F4EA] hover:text-[#24312A]"
                }`}
              >
                <Icon size={18} strokeWidth={2.2} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}