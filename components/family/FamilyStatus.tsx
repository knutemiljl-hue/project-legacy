const items = [
  {
    label: "Felles oppgaver",
    value: "3",
  },
  {
    label: "Avtaler denne uken",
    value: "4",
  },
  {
    label: "Åpne huskelister",
    value: "2",
  },
];

export default function FamilyStatus() {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-[#8D846F]">Familiestatus</p>

      <h2 className="mt-2 text-2xl font-semibold text-[#24312A]">
        Familien Lie
      </h2>

      <p className="mt-2 text-sm text-stone-600">
        Felles oversikt for avtaler, gjøremål og praktiske ting.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl bg-[#F7F4EA] p-4"
          >
            <p className="text-2xl font-semibold text-[#24312A]">
              {item.value}
            </p>
            <p className="mt-1 text-sm text-stone-500">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}