export default function CurrentChallenge() {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-[#8D846F]">
        Nåværende utfordring
      </p>

      <h2 className="mt-2 text-2xl font-semibold text-[#24312A]">
        Nyfødt-søvn
      </h2>

      <p className="mt-3 text-sm leading-6 text-stone-600">
        Målet er ikke perfekt søvn, men å bevare ro, struktur og overskudd i en
        periode der livet naturlig er uforutsigbart.
      </p>

      <div className="mt-5 rounded-2xl bg-[#F7F4EA] p-4">
        <p className="text-sm font-medium text-[#24312A]">
          Svakhet
        </p>
        <p className="mt-1 text-sm text-stone-600">
          Rutiner, lave terskler og tydelig fordeling hjemme.
        </p>
      </div>
    </section>
  );
}