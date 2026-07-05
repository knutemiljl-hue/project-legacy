"use client";

import { useState } from "react";

const actions = [
  "Nytt gjøremål",
  "Ny huskeliste",
  "Ny kalenderoppføring",
  "Økonomioppdatering",
];

export default function QuickAddMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((value) => !value)}
        className="rounded-2xl bg-[#F3D66B] px-4 py-2 font-medium text-[#24312A] transition hover:brightness-95"
      >
        + Ny
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-3xl border border-stone-200 bg-white p-2 shadow-lg">
          {actions.map((action) => (
            <button
              key={action}
              className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-[#24312A] transition hover:bg-[#F7F4EA]"
            >
              {action}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}