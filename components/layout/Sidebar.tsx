import Link from "next/link";

const navItems = [
  {
    label: "Oversikt",
    href: "/",
  },
  {
    label: "Familien",
    href: "/family",
  },
  {
    label: "Meg",
    href: "/me",
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
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-stone-200 bg-[#F7F4EA] p-6 lg:block">
      <div className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-[#8D846F]">
          Project
        </p>

        <h1 className="mt-1 text-2xl font-semibold text-[#24312A]">
          Legacy
        </h1>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-[#24312A] transition hover:bg-[#E5DB8E]/40"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}