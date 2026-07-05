import CharacterSummary from "@/components/dashboard/CharacterSummary";
import DailyTasks from "@/components/dashboard/DailyTasks";
import FinanceSummary from "@/components/dashboard/FinanceSummary";
import StatusCard from "@/components/dashboard/StatusCard";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import { statusCards } from "@/data/dashboard";

export default function Home() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[#8D846F]">Oversikt</p>

        <h1 className="mt-1 text-3xl font-semibold text-[#24312A]">
          God kveld, Knut.
        </h1>

        <p className="mt-2 text-sm leading-6 text-stone-600">
          Kapittel I – The Beginning. Små valg hver dag bygger et stort liv.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statusCards.map((card) => (
          <StatusCard
            key={card.title}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <DailyTasks />
          <FinanceSummary />
        </div>

        <div className="space-y-6">
          <CharacterSummary />
          <UpcomingEvents />
        </div>
      </section>
    </main>
  );
}