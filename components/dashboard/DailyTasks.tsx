import { dailyTasks } from "@/data/dashboard";

export default function DailyTasks() {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#8D846F]">
            Dagens oppdrag
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
            {dailyTasks.length} oppdrag
          </h2>
        </div>

        <p className="text-sm text-stone-500">
          {dailyTasks.filter((task) => task.done).length} / {dailyTasks.length}{" "}
          fullført
        </p>
      </div>

      <div className="space-y-3">
        {dailyTasks.map((task) => (
          <div
            key={task.title}
            className="flex items-center justify-between rounded-2xl bg-[#F7F4EA] p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={`grid h-6 w-6 place-items-center rounded-full border ${
                  task.done
                    ? "border-[#8EB069] bg-[#8EB069] text-white"
                    : "border-stone-300"
                }`}
              >
                {task.done ? "✓" : ""}
              </div>

              <div>
                <p className="font-medium text-[#24312A]">{task.title}</p>
                <p className="text-sm text-stone-500">{task.subtitle}</p>
              </div>
            </div>

            <p className="text-sm text-stone-500">{task.time}</p>
          </div>
        ))}
      </div>
    </section>
  );
}