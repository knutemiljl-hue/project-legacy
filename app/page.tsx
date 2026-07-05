import FamilyCalendar from "@/components/calendar/FamilyCalendar";
import CharacterSummary from "@/components/dashboard/CharacterSummary";
import DailyTasks from "@/components/dashboard/DailyTasks";
import FinanceSummary from "@/components/dashboard/FinanceSummary";
import ShoppingList from "@/components/shopping/ShoppingList";

export default function Home() {
  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#24312A]">
          God kveld, Knut Emil.
        </h1>
      </div>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <ShoppingList compact />
          <DailyTasks />
          <FinanceSummary />
        </div>

        <div className="space-y-6">
          <CharacterSummary />
          <FamilyCalendar compact />
        </div>
      </section>
    </main>
  );
}