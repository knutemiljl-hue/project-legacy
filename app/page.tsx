import FamilyCalendar from "@/components/calendar/FamilyCalendar";
import CharacterSummary from "@/components/dashboard/CharacterSummary";
import DailyTasks from "@/components/dashboard/DailyTasks";
import FinanceSummary from "@/components/dashboard/FinanceSummary";
import UserGreeting from "@/components/dashboard/UserGreeting";
import ShoppingList from "@/components/shopping/ShoppingList";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1720px] space-y-7">
      <UserGreeting />

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