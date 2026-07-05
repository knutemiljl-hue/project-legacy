import { pastReflections } from "@/data/journal";

export default function PastReflections() {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-[#8D846F]">Tidligere</p>

      <h2 className="mt-2 text-2xl font-semibold text-[#24312A]">
        Refleksjoner
      </h2>

      <div className="mt-5 space-y-3">
        {pastReflections.map((reflection) => (
          <article
            key={reflection.week}
            className="rounded-2xl bg-[#F7F4EA] p-4"
          >
            <p className="text-sm font-medium text-[#8D846F]">
              {reflection.week}
            </p>

            <h3 className="mt-1 font-semibold text-[#24312A]">
              {reflection.title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-stone-600">
              {reflection.summary}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}