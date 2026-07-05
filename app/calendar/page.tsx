import FamilyCalendar from "@/components/calendar/FamilyCalendar";

export default function CalendarPage() {
  return (
    <main className="mx-auto w-full max-w-[1720px] space-y-7">
      <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
          Kalender
        </p>

        <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-[#24312A] sm:text-5xl">
          Alt som skjer.
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
          Felles kalender for familien. Neste steg er fargemerking for Knut
          Emil, Ingrid og felles avtaler.
        </p>
      </section>

      <FamilyCalendar />
    </main>
  );
}