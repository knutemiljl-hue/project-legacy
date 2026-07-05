export default function CharacterSummary() {
  return (
    <section className="rounded-3xl bg-[#8D846F] p-6 text-white shadow-sm">
      <p className="text-sm font-medium text-[#F3D66B]">Meg</p>

      <h2 className="mt-2 text-2xl font-semibold">
        Knut Emil Johannesen Lie
      </h2>

      <p className="mt-1 text-sm text-white/75">
        Nivå 1 · Kapittel I
      </p>

      <div className="mt-6">
        <div className="mb-2 flex justify-between text-sm">
          <span>XP</span>
          <span>0 / 500</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-[0%] rounded-full bg-[#F3D66B]" />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white/10 p-4">
        <p className="text-sm text-[#F3D66B]">
          Nåværende utfordring
        </p>

        <p className="mt-1 font-medium">Nyfødt-søvn</p>
      </div>
    </section>
  );
}