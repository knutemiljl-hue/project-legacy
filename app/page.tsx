import FamilyCalendar from "@/components/calendar/FamilyCalendar";
import CharacterSummary from "@/components/dashboard/CharacterSummary";
import DailyTasks from "@/components/dashboard/DailyTasks";
import LargeTasksSummary from "@/components/dashboard/LargeTasksSummary";
import UserGreeting from "@/components/dashboard/UserGreeting";
import ShoppingList from "@/components/shopping/ShoppingList";

export default function Home() {
  return (
    <main className="legacy-dark-dashboard mx-auto w-full max-w-[1720px] space-y-5 sm:space-y-7">
      <UserGreeting />

      <section className="grid grid-cols-1 gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)] xl:items-start">
        <div className="space-y-5 sm:space-y-6">
          <DailyTasks />
          <div className="xl:hidden">
            <FamilyCalendar compact />
          </div>
          <ShoppingList compact />
          <LargeTasksSummary />
          <div className="xl:hidden">
            <CharacterSummary />
          </div>
        </div>

        <div className="space-y-5 sm:space-y-6 xl:sticky xl:top-24">
          <div className="hidden xl:block">
            <FamilyCalendar compact />
          </div>
          <div className="hidden xl:block">
            <CharacterSummary />
          </div>
        </div>
      </section>
    </main>
  );
}
