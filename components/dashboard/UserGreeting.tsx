"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, HeartHandshake } from "lucide-react";
import { legacyUsers, readActiveUser } from "@/lib/users";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 6) {
    return "God natt";
  }

  if (hour < 12) {
    return "God morgen";
  }

  if (hour < 18) {
    return "God ettermiddag";
  }

  return "God kveld";
}

export default function UserGreeting() {
  const [activeUser, setActiveUser] = useState(legacyUsers[0]);
  const [greeting, setGreeting] = useState("Hei");

  useEffect(() => {
    function updateActiveUser() {
      setActiveUser(readActiveUser());
      setGreeting(getGreeting());
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
    <section className="overflow-hidden rounded-[2rem] border border-[#E2D8C7] bg-white/85 p-5 shadow-sm ring-1 ring-black/5 sm:rounded-[2.5rem] sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.75rem] border border-[#E2D8C7] bg-white shadow-sm ring-1 ring-black/5 sm:h-28 sm:w-28 sm:rounded-[2.25rem]">
            <Image
              src={activeUser.avatar}
              alt={`Avatar for ${activeUser.name}`}
              fill
              priority
              sizes="(max-width: 640px) 80px, 112px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8D846F]">
              Project Legacy
            </p>

            <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#24312A] sm:text-5xl">
              {greeting}, {activeUser.name}.
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
              Her er familiens rolige kontrollsenter for dagen, uken og alt som
              må huskes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:w-[360px]">
          <div className="rounded-2xl bg-[#F7F4EA] px-3 py-3 text-center">
            <CheckCircle2
              size={17}
              strokeWidth={2.25}
              className="mx-auto text-[#4F773D]"
            />
            <p className="mt-1 text-[11px] font-semibold text-[#8D846F]">
              Oppgaver
            </p>
          </div>

          <div className="rounded-2xl bg-[#F7F4EA] px-3 py-3 text-center">
            <CalendarDays
              size={17}
              strokeWidth={2.25}
              className="mx-auto text-[#4F773D]"
            />
            <p className="mt-1 text-[11px] font-semibold text-[#8D846F]">
              Kalender
            </p>
          </div>

          <div className="rounded-2xl bg-[#F7F4EA] px-3 py-3 text-center">
            <HeartHandshake
              size={17}
              strokeWidth={2.25}
              className="mx-auto text-[#4F773D]"
            />
            <p className="mt-1 text-[11px] font-semibold text-[#8D846F]">
              Familie
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}