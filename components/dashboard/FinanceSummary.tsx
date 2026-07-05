import { financeItems } from "@/data/dashboard";

export default function FinanceSummary() {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-[#8D846F]">Økonomi</p>

        <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
          Status
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {financeItems.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl bg-[#F7F4EA] p-4"
          >
            <p className="text-sm text-stone-500">{item.label}</p>

            <p className="mt-1 text-xl font-semibold text-[#24312A]">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}