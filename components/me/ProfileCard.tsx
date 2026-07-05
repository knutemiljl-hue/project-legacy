export default function ProfileCard() {
  return (
    <section className="rounded-3xl bg-[#8D846F] p-6 text-white shadow-sm">
      <p className="text-sm font-medium text-[#F3D66B]">Karakter</p>

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

      <p className="mt-6 text-sm leading-6 text-white/80">
        Hovedmålet er å bli en pappa, ektemann, advokat og mann du er stolt av
        å se tilbake på.
      </p>
    </section>
  );
}