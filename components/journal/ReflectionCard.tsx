import { reflectionQuestions } from "@/data/journal";

export default function ReflectionCard() {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-[#8D846F]">
        Ukentlig refleksjon
      </p>

      <h2 className="mt-2 text-2xl font-semibold text-[#24312A]">
        Hva tar du med deg fra denne uken?
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
        Dette skal være lavterskel. Tre korte svar er nok. Målet er ikke å
        skrive dagbok, men å lagre små øyeblikk du kan se tilbake på.
      </p>

      <div className="mt-6 space-y-5">
        {reflectionQuestions.map((question) => (
          <label key={question} className="block">
            <span className="text-sm font-medium text-[#24312A]">
              {question}
            </span>

            <textarea
              className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-stone-200 bg-[#F7F4EA] p-4 text-sm outline-none transition focus:border-[#8D846F]"
              placeholder="Skriv noen linjer..."
            />
          </label>
        ))}
      </div>

      <button className="mt-6 rounded-2xl bg-[#F3D66B] px-5 py-3 text-sm font-medium text-[#24312A] transition hover:brightness-95">
        Lagre refleksjon
      </button>
    </section>
  );
}