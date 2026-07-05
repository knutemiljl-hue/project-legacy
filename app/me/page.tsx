import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

export default function MePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section>
          <p className="text-sm font-medium text-[#8D846F]">Meg</p>

          <h1 className="mt-2 text-3xl font-semibold text-[#24312A]">
            Karakter
          </h1>

          <p className="mt-2 max-w-2xl text-stone-600">
            Din personlige utvikling: nivå, XP, helse, karriere, økonomi,
            milepæler og nåværende utfordringer.
          </p>
        </section>

        <Card>
          <p className="text-sm font-medium text-[#8D846F]">
            Kommer snart
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-[#24312A]">
            Personlig oversikt
          </h2>

          <p className="mt-3 text-stone-600">
            Her bygger vi senere karakterkort, oppdrag, XP, nivåer,
            achievements og personlige mål.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}