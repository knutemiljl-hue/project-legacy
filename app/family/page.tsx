import Link from "next/link";
import FamilyCalendar from "@/components/calendar/FamilyCalendar";
import FamilyTasksSummary from "@/components/family/FamilyTasksSummary";
import ShoppingList from "@/components/shopping/ShoppingList";

export default function FamilyPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-[#8D846F]">Familien</p>

            <h1 className="mt-1 text-3xl font-semibold text-[#24312A]">
              Familiesenter
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Felles oversikt for praktiske ting hjemme.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-2xl bg-[#F7F4EA] px-4 py-2 text-sm font-medium text-[#24312A] transition hover:brightness-95"
          >
            Til forsiden
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <FamilyTasksSummary />
        <ShoppingList />
      </section>

      <FamilyCalendar />
    </main>
  );
}