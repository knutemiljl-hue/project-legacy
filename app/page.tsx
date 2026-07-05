import FamilyCalendar from "@/components/calendar/FamilyCalendar";
import CharacterSummary from "@/components/dashboard/CharacterSummary";
import DailyTasks from "@/components/dashboard/DailyTasks";
import FinanceSummary from "@/components/dashboard/FinanceSummary";
import LargeTasksSummary from "@/components/dashboard/LargeTasksSummary";
import UserGreeting from "@/components/dashboard/UserGreeting";
import ShoppingList from "@/components/shopping/ShoppingList";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1720px] space-y-5 sm:space-y-7">
      <UserGreeting />

      <section className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] xl:items-start">
        <div className="space-y-5 sm:space-y-6">
          <ShoppingList compact />
          <DailyTasks />
          <LargeTasksSummary />
        </div>

        <div className="space-y-5 sm:space-y-6 xl:sticky xl:top-24">
          <CharacterSummary />
          <FamilyCalendar compact />
          <FinanceSummary />
        </div>
      </section>
    </main>
  );
}