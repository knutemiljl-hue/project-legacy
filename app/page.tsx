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
        <div className="order-1 xl:order-1">
          <ShoppingList compact />
        </div>

        <div className="order-2 xl:order-3">
          <DailyTasks />
        </div>

        <div className="order-3 xl:order-4">
          <FamilyCalendar compact />
        </div>

        <div className="order-4 xl:order-5">
          <FinanceSummary />
        </div>

        <div className="order-5 xl:order-2">
          <CharacterSummary />
        </div>
      </section>
    </main>
  );
}