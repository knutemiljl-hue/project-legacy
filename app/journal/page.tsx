const reflections = [
  {
    title: "Hva fungerte bra denne uken?",
    description:
      "Noter små ting som ga ro, energi eller fremdrift hjemme.",
  },
  {
    title: "Hva bør vi gjøre enklere?",
    description:
      "Finn én ting i hverdagen som kan forenkles eller fjernes.",
  },
  {
    title: "Hva vil vi huske fra denne perioden?",
    description:
      "Små øyeblikk, rutiner, hendelser eller tanker verdt å ta vare på.",
  },
];

const recentEntries = [
  {
    title: "Første versjon av hverdagsflyten",
    date: "Denne uken",
    text: "Gjøremål, handleliste og kalender er samlet på ett sted.",
  },
  {
    title: "Familie først",
    date: "Prinsipp",
    text: "Systemet skal støtte hverdagen, ikke gjøre den tyngre.",
  },
];

export default function JournalPage() {
  return (
    <main className="mx-auto w-full max-w-[1720px] space-y-7">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-3xl bg-[#EEF5E8] text-2xl text-[#4F773D]">
          □
        </div>

        <div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[#24312A]">
            Journal
          </h1>

          <p className="mt-1 text-sm text-stone-500">
            Et rolig sted for refleksjon, retning og små øyeblikk.
          </p>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-7 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-5 flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F7F4EA] text-lg text-[#4F773D]">
              ✎
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
                Dagens refleksjon
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
                Skriv kort
              </h2>

              <p className="mt-2 text-sm leading-6 text-stone-600">
                Journalen trenger ikke være lang. Ett avsnitt er nok.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-[#ECE3D4] bg-[#F7F4EA] p-4">
            <label className="block">
              <span className="text-sm font-medium text-[#24312A]">
                Hva vil du huske fra i dag?
              </span>

              <textarea
                className="mt-3 min-h-40 w-full resize-none rounded-2xl border border-[#ECE3D4] bg-white px-4 py-3 text-sm text-[#24312A] outline-none transition placeholder:text-stone-400 focus:border-[#8D846F]"
                placeholder="Skriv en kort refleksjon..."
              />
            </label>

            <div className="mt-4 flex justify-end">
              <button className="rounded-2xl bg-[#3F6F35] px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:brightness-110">
                Lagre refleksjon
              </button>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-stone-500">
            Lagring av journal bygger vi senere. Foreløpig setter vi formen og
            flyten.
          </p>
        </section>

        <section className="rounded-3xl border border-[#E2D8C7] bg-white/85 p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-5 flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F7F4EA] text-lg text-[#4F773D]">
              ◌
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
                Spørsmål
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
                Refleksjonskort
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {reflections.map((reflection) => (
              <div
                key={reflection.title}
                className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] p-4"
              >
                <p className="font-medium text-[#24312A]">
                  {reflection.title}
                </p>

                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {reflection.description}
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
              ◇
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
                Arkiv
              </p>

              <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
                Tidligere refleksjoner
              </h2>
            </div>
          </div>

          <div className="rounded-2xl bg-[#F7F4EA] px-4 py-3 text-right">
            <p className="text-xs text-stone-500">Notater</p>
            <p className="text-lg font-semibold text-[#24312A]">
              {recentEntries.length}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA]">
          {recentEntries.map((entry, index) => (
            <div
              key={entry.title}
              className={`px-4 py-4 ${
                index !== recentEntries.length - 1
                  ? "border-b border-[#ECE3D4]"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-[#24312A]">{entry.title}</p>

                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {entry.text}
                  </p>
                </div>

                <p className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-500">
                  {entry.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}