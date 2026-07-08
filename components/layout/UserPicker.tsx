"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  LegacyUserId,
  hasSelectedActiveUser,
  legacyUsers,
  saveActiveUserId,
} from "@/lib/users";

export default function UserPicker({ children }: { children: React.ReactNode }) {
  const [hasCheckedUser, setHasCheckedUser] = useState(false);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      setHasUser(hasSelectedActiveUser());
      setHasCheckedUser(true);
    }, 0);

    return () => {
      window.clearTimeout(initialLoadTimer);
    };
  }, []);

  function chooseUser(userId: LegacyUserId) {
    saveActiveUserId(userId);
    setHasUser(true);
  }

  if (!hasCheckedUser) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--app-background)" }}
      />
    );
  }

  if (hasUser) {
    return <>{children}</>;
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-5 py-10 text-[#24312A]"
      style={{ background: "var(--app-background)" }}
    >
      <section className="w-full max-w-3xl rounded-[2.5rem] border border-[#E2D8C7] bg-white/80 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur-xl sm:p-9">
        <div className="mx-auto mb-8 grid h-14 w-14 place-items-center rounded-3xl bg-[#EEF5E8] text-2xl text-[#4F773D]">
          ❦
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8D846F]">
            Project Legacy
          </p>

          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#24312A] sm:text-5xl">
            Velkommen.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
            Velg hvem som bruker appen på denne enheten. Dette kan endres
            senere i toppen av appen.
          </p>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {legacyUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => chooseUser(user.id)}
              className="group rounded-[2rem] border border-[#ECE3D4] bg-[#F7F4EA] p-5 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.75rem] border border-[#E2D8C7] bg-white shadow-sm ring-1 ring-black/5">
                  <Image
                    src={user.avatar}
                    alt={`Avatar for ${user.name}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                    priority
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
                    Fortsett som
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
                    {user.name}
                  </h2>

                  <p className="mt-2 text-sm text-stone-500">
                    Åpne Project Legacy.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-[#3F6F35] transition group-hover:bg-[#EEF5E8]">
                Velg {user.name}
              </div>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-xs leading-5 text-stone-400">
          Beta uten innlogging. Valget lagres kun på denne enheten.
        </p>
      </section>
    </main>
  );
}
