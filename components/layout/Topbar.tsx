import QuickAddMenu from "./QuickAddMenu";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-stone-200 bg-[#F7F4EA]/80 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-sm text-[#8D846F]">Oversikt</p>
        <h2 className="text-xl font-semibold text-[#24312A]">
          God kveld, Knut 👋
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden rounded-full border border-stone-200 bg-white px-4 py-2 text-sm md:block">
          Familien Lie
        </div>

        <QuickAddMenu />
      </div>
    </header>
  );
}