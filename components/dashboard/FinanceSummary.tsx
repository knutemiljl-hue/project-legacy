import { WalletCards } from "lucide-react";
import { financeItems } from "@/data/dashboard";

export default function FinanceSummary() {
  return (
    <section className="rounded-3xl border border-teal-200 bg-teal-50/90 p-6 shadow-sm ring-1 ring-black/5">
      <div className="mb-5 flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal-100 text-teal-700">
          <WalletCards size={21} strokeWidth={2} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8D846F]">
            Økonomi
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
            Status
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {financeItems.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-[#ECE3D4] bg-[#F7F4EA] px-4 py-4"
          >
            <p className="text-sm text-stone-500">{item.label}</p>

            <p className="mt-1 text-lg font-semibold text-[#24312A]">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
