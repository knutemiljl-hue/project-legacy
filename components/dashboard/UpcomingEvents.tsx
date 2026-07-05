const events = [
  {
    title: "Helsestasjon",
    date: "Tirsdag 9. juli",
    time: "09:30",
  },
  {
    title: "Klientmøte – BAHR",
    date: "Tirsdag 9. juli",
    time: "13:00",
  },
  {
    title: "Date night med Ingrid",
    date: "Fredag 12. juli",
    time: "19:00",
  },
];

export default function UpcomingEvents() {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#8D846F]">Familien</p>
          <h2 className="mt-1 text-2xl font-semibold text-[#24312A]">
            Neste avtaler
          </h2>
        </div>

        <button className="text-sm font-medium text-[#8D846F]">
          Se alle
        </button>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.title}
            className="flex items-center justify-between rounded-2xl bg-[#F7F4EA] p-4"
          >
            <div>
              <p className="font-medium text-[#24312A]">{event.title}</p>
              <p className="text-sm text-stone-500">{event.date}</p>
            </div>

            <p className="text-sm font-medium text-[#8D846F]">
              {event.time}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}