export default function SettingsPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[#8D846F]">Innstillinger</p>

        <h1 className="mt-1 text-3xl font-semibold text-[#24312A]">
          Innstillinger
        </h1>

        <p className="mt-2 text-sm leading-6 text-stone-600">
          Her kommer valg for familie, visning, data og personlige innstillinger.
        </p>
      </div>

      <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-[#8D846F]">Kommer snart</p>

        <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
          Rolig kontroll
        </h2>

        <p className="mt-3 text-sm leading-6 text-stone-600">
          Innstillinger bygges når vi faktisk trenger dem. Foreløpig holder vi
          appen enkel.
        </p>
      </section>
    </main>
  );
}