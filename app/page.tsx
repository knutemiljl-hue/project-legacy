import FamilyCalendar from "@/components/calendar/FamilyCalendar";
import CharacterSummary from "@/components/dashboard/CharacterSummary";
import DailyTasks from "@/components/dashboard/DailyTasks";
import FinanceSummary from "@/components/dashboard/FinanceSummary";
import ShoppingList from "@/components/shopping/ShoppingList";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1720px] space-y-7">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-3xl bg-[#EEF5E8] text-2xl text-[#4F773D]">
          ❦
        </div>

        <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#24312A]">
          God kveld, Knut Emil.
        </h1>
      </div>

      <section className="grid grid-cols-1 gap-7 xl:grid-cols-[1.08fr_1fr]">
        <div className="space-y-7">
          <ShoppingList compact />
          <DailyTasks />
          <FinanceSummary />
        </div>

        <div className="space-y-7">
          <CharacterSummary />
          <FamilyCalendar compact />
        </div>
      </section>
    </main>
  );
}