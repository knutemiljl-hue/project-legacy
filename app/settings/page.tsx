import PushNotificationSettings from "@/components/settings/PushNotificationSettings";

const settingsSections = [
  {
    title: "Bruker",
    description: "Navn, profil og hvem som bruker appen.",
    status: "Knut Emil",
  },
  {
    title: "Familie",
    description: "Felles visning, familieoppgaver og delte moduler.",
    status: "Aktiv",
  },
  {
    title: "Data",
    description: "Lokal lagring, eksport og fremtidig sikkerhetskopi.",
    status: "Lokalt",
  },
  {
    title: "Design",
    description: "Tema, farger og visuelle preferanser.",
    status: "Legacy Green",
  },
];

const principles = [
  "Appen skal hjelpe familien – aldri konkurrere med den.",
  "Enkelhet vinner alltid.",
  "Data skal gi ro og klarhet.",
];

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-[1720px] space-y-7">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-3xl bg-[#EEF5E8] text-2xl text-[#4F773D]">
          ⚙
        </div>

        <div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#24312A]">
            Innstillinger
          </h1>

          <p className="mt-1 text-sm text-stone-500">
            Rolig kontroll over familie, data og visning.
          </p>
        </div>
      </div>

      <PushNotificationSettings />

      <section className="grid grid-cols-1 gap-7 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-5 flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F7F4EA] text-lg text-[#4F773D]">
              ◇
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
                Kontrollpanel
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
                Appinnstillinger
              </h2>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA]">
            {settingsSections.map((section, index) => (
              <div
                key={section.title}
                className={`flex items-center justify-between gap-4 px-4 py-4 ${
                  index !== settingsSections.length - 1
                    ? "border-b border-[#ECE3D4]"
                    : ""
                }`}
              >
                <div>
                  <p className="font-medium text-[#24312A]">{section.title}</p>

                  <p className="mt-1 text-sm leading-6 text-stone-600">
                    {section.description}
                  </p>
                </div>

                <p className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#8D846F]">
                  {section.status}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm leading-6 text-stone-500">
            Disse valgene er foreløpig visuelle. Faktisk redigering bygger vi
            når appen trenger det.
          </p>
        </section>

        <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-5 flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F7F4EA] text-lg text-[#4F773D]">
              ❦
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
                Project Legacy
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
                Prinsipper
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {principles.map((principle) => (
              <div
                key={principle}
                className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] p-4"
              >
                <p className="text-sm leading-6 text-[#24312A]">
                  {principle}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-6 shadow-sm ring-1 ring-black/5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F7F4EA] text-lg text-[#4F773D]">
              ⌂
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
                Status
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
                Funksjoner
              </h2>
            </div>
          </div>

          <div className="rounded-2xl bg-[#F7F4EA] px-4 py-3 text-right">
            <p className="text-xs text-stone-500">Versjon</p>
            <p className="text-lg font-semibold text-[#24312A]">v1</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {["Gjøremål", "Handleliste", "Kalender", "XP"].map((feature) => (
            <div
              key={feature}
              className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] p-4"
            >
              <p className="text-sm font-medium text-[#24312A]">{feature}</p>

              <p className="mt-2 text-xs text-[#6F8F54]">Aktiv</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
