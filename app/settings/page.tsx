import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section>
          <p className="text-sm font-medium text-[#8D846F]">
            Innstillinger
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-[#24312A]">
            Oppsett
          </h1>

          <p className="mt-2 max-w-2xl text-stone-600">
            Her samles senere brukere, deling mellom Knut og Ingrid, tema,
            dataimport og andre innstillinger.
          </p>
        </section>

        <Card>
          <p className="text-sm font-medium text-[#8D846F]">
            Kommer snart
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-[#24312A]">
            Project Legacy
          </h2>

          <p className="mt-3 text-stone-600">
            Foreløpig holder vi denne siden enkel. Innstillinger kommer først
            når vi faktisk trenger dem.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}