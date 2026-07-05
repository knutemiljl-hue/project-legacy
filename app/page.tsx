import AppShell from "@/components/layout/AppShell";
import StatusCard from "@/components/dashboard/StatusCard";
import DailyTasks from "@/components/dashboard/DailyTasks";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import FinanceSummary from "@/components/dashboard/FinanceSummary";
import CharacterSummary from "@/components/dashboard/CharacterSummary";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section>
          <p className="text-sm font-medium text-[#8D846F]">Oversikt</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#24312A]">
            God kveld, Knut.
          </h1>
          <p className="mt-2 text-stone-600">
            Kapittel I – The Beginning. Små valg hver dag bygger et stort liv.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          <StatusCard
            title="Familie"
            value="Rolig"
            subtitle="2 felles oppgaver"
          />
          <StatusCard
            title="Helse"
            value="Stabil"
            subtitle="1 oppdrag i dag"
          />
          <StatusCard
            title="Karriere"
            value="Fokus"
            subtitle="Deep work planlagt"
          />
          <StatusCard
            title="Økonomi"
            value="Oversikt"
            subtitle="Sist oppdatert i dag"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <DailyTasks />
            <FinanceSummary />
          </div>

          <div className="space-y-6">
            <CharacterSummary />
            <UpcomingEvents />
          </div>
        </section>
      </div>
    </AppShell>
  );
}