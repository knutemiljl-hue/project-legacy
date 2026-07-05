const tasks = [
  {
    title: "Tren styrke",
    subtitle: "Fullfør treningsøkt",
    time: "07:00",
    done: true,
  },
  {
    title: "Vær til stede hjemme",
    subtitle: "Ingen mobil under familietid",
    time: "17:00",
    done: false,
  },
  {
    title: "Forbered klientmøte",
    subtitle: "BAHR",
    time: "20:30",
    done: false,
  },
];

export default function DailyTasks() {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#8D846F]">
            Dagens oppdrag
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
            3 oppdrag
          </h2>
        </div>

        <p className="text-sm text-stone-500">1 / 3 fullført</p>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
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
