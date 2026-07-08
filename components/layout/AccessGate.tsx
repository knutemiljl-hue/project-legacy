"use client";

import { useEffect, useState } from "react";

const ACCESS_GRANTED_KEY = "project-legacy-access-granted";

export default function AccessGate({ children }: { children: React.ReactNode }) {
  const [hasCheckedAccess, setHasCheckedAccess] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initialLoadTimer = window.setTimeout(() => {
      const storedAccess = window.localStorage.getItem(ACCESS_GRANTED_KEY);

      setHasAccess(storedAccess === "true");
      setHasCheckedAccess(true);
    }, 0);

    return () => {
      window.clearTimeout(initialLoadTimer);
    };
  }, []);

  async function verifyAccess(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!code.trim()) {
      setErrorMessage("Skriv inn koden.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const response = await fetch("/api/access/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.ok) {
      setErrorMessage(result?.message ?? "Kunne ikke verifisere kode.");
      setIsSubmitting(false);
      return;
    }

    window.localStorage.setItem(ACCESS_GRANTED_KEY, "true");
    setHasAccess(true);
    setIsSubmitting(false);
  }

  if (!hasCheckedAccess) {
    return (
      <div
        className="min-h-screen"
        style={{ background: "var(--app-background)" }}
      />
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-5 py-10 text-[#24312A]"
      style={{ background: "var(--app-background)" }}
    >
      <section className="w-full max-w-xl rounded-[2.5rem] border border-[#E2D8C7] bg-white/85 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur-xl sm:p-9">
        <div className="mx-auto mb-8 grid h-14 w-14 place-items-center rounded-3xl bg-[#EEF5E8] text-2xl text-[#4F773D]">
          ❦
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8D846F]">
            Project Legacy
          </p>

          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#24312A] sm:text-5xl">
            Familiekode
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-stone-600 sm:text-base">
            Skriv inn familiekoden for å åpne appen på denne enheten.
          </p>
        </div>

        <form onSubmit={verifyAccess} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#24312A]">Kode</span>

            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              type="password"
              autoComplete="current-password"
              className="mt-2 w-full rounded-2xl border border-stone-200 bg-[#F7F4EA] px-4 py-3 text-base text-[#24312A] outline-none transition placeholder:text-stone-400 focus:border-[#8D846F]"
              placeholder="Skriv inn kode"
            />
          </label>

          {errorMessage && (
            <div className="rounded-2xl bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">
                {errorMessage}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-[#3F6F35] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sjekker kode …" : "Åpne Project Legacy"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-stone-400">
          Tilgang lagres kun på denne enheten.
        </p>
      </section>
    </main>
  );
}
