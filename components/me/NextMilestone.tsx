import { nextMilestone } from "@/data/me";

export default function NextMilestone() {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-[#8D846F]">Neste milepæl</p>

      <h2 className="mt-2 text-2xl font-semibold text-[#24312A]">
        {nextMilestone.title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-stone-600">
        {nextMilestone.description}
      </p>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm text-stone-600">
          <span>Fremgang</span>
          <span>{nextMilestone.progress}</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[#F7F4EA]">
          <div className="h-full w-[0%] rounded-full bg-[#8EB069]" />
        </div>
      </div>
    </section>
  );
}