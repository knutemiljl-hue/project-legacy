import FamilyCalendar from "@/components/calendar/FamilyCalendar";
import FamilyTasksSummary from "@/components/family/FamilyTasksSummary";
import ShoppingList from "@/components/shopping/ShoppingList";

export default function FamilyPage() {
  return (
    <main className="mx-auto w-full max-w-[1720px] space-y-7">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-3xl bg-[#EEF5E8] text-2xl text-[#4F773D]">
          ♧
        </div>

        <div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#24312A]">
            Familien
          </h1>

          <p className="mt-1 text-sm text-stone-500">
            Praktiske ting, felles avtaler og hverdagsflyt.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-7 xl:grid-cols-[1.05fr_0.95fr]">
        <FamilyTasksSummary />

        <ShoppingList />
      </section>

      <FamilyCalendar />
    </main>
  );
}