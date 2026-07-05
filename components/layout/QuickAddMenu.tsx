"use client";

import { useState } from "react";

const actions = [
  {
    title: "Nytt gjøremål",
    description: "Legg til en oppgave for deg eller familien.",
  },
  {
    title: "Ny huskeliste",
    description: "Opprett en liste for ting som må huskes.",
  },
  {
    title: "Ny kalenderoppføring",
    description: "Legg inn en avtale eller hendelse.",
  },
  {
    title: "Økonomioppdatering",
    description: "Oppdater fond, buffer, gjeld eller nettoformue.",
  },
];

export default function QuickAddMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-2xl bg-[#F3D66B] px-4 py-2 font-medium text-[#24312A] transition hover:brightness-95"
      >
        + Ny
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/25"
        >
          <div className="flex min-h-screen items-start justify-center px-6 pt-36">
            <div
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-6 shadow-xl"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#8D846F]">
                    Legg til nytt
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
                    Hva vil du opprette?
                  </h2>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full bg-[#F7F4EA] px-3 py-1 text-sm font-medium text-[#24312A] transition hover:brightness-95"
                >
                  Lukk
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {actions.map((action) => (
                  <button
                    key={action.title}
                    className="rounded-2xl bg-[#F7F4EA] p-4 text-left transition hover:brightness-95"
                  >
                    <p className="font-semibold text-[#24312A]">
                      {action.title}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}