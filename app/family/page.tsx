import AppShell from "@/components/layout/AppShell";
import FamilyHubCard from "@/components/family/FamilyHubCard";
import FamilyStatus from "@/components/family/FamilyStatus";
import { familyCards } from "@/data/family";

export default function FamilyPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section>
          <p className="text-sm font-medium text-[#8D846F]">Familien</p>

          <h1 className="mt-2 text-3xl font-semibold text-[#24312A]">
            Familiesenter
          </h1>

          <p className="mt-2 max-w-2xl text-stone-600">
            Et delt sted for det som gjelder dere begge: kalender, huskelister,
            handleliste og praktiske ting i hverdagen.
          </p>
        </section>

        <FamilyStatus />

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {familyCards.map((card) => (
            <FamilyHubCard
              key={card.title}
              title={card.title}
              description={card.description}
              action={card.action}
            />
          ))}
        </section>
      </div>
    </AppShell>
  );
}