"use client";

import { useEffect, useState } from "react";
import { readTotalXp, XP_PER_LEVEL } from "@/lib/tasks";

function getLevel(totalXp: number) {
  return Math.floor(totalXp / XP_PER_LEVEL) + 1;
}

function getCurrentLevelXp(totalXp: number) {
  return totalXp % XP_PER_LEVEL;
}

export default function CharacterSummary() {
  const [totalXp, setTotalXp] = useState(0);

  const level = getLevel(totalXp);
  const currentLevelXp = getCurrentLevelXp(totalXp);
  const progressPercentage = Math.round((currentLevelXp / XP_PER_LEVEL) * 100);

  useEffect(() => {
    function updateXp() {
      setTotalXp(readTotalXp());
    }

    updateXp();

    window.addEventListener("project-legacy-xp-updated", updateXp);
    window.addEventListener("storage", updateXp);

    return () => {
      window.removeEventListener("project-legacy-xp-updated", updateXp);
      window.removeEventListener("storage", updateXp);
    };
  }, []);

  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#8D846F]">Meg</p>

          <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
            Nivå {level}
          </h2>
        </div>

        <div className="rounded-2xl bg-[#F7F4EA] px-4 py-3 text-right">
          <p className="text-xs text-stone-500">Total XP</p>
          <p className="text-lg font-semibold text-[#24312A]">{totalXp}</p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <p className="font-medium text-[#24312A]">Kapittel I</p>
          <p className="text-stone-500">
            {currentLevelXp} / {XP_PER_LEVEL} XP
          </p>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[#F7F4EA]">
          <div
            className="h-full rounded-full bg-[#8EB069] transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-stone-600">
        XP kommer fra fullførte oppgaver. Hver oppgave gir 5 XP.
      </p>
    </section>
  );
}