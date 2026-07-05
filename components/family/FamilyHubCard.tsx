type FamilyHubCardProps = {
  title: string;
  description: string;
  action: string;
};

export default function FamilyHubCard({
  title,
  description,
  action,
}: FamilyHubCardProps) {
  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-[#8D846F]">Familien</p>

      <h2 className="mt-2 text-2xl font-semibold text-[#24312A]">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-stone-600">
        {description}
      </p>

      <button className="mt-6 rounded-2xl bg-[#F3D66B] px-4 py-2 text-sm font-medium text-[#24312A] transition hover:brightness-95">
        {action}
      </button>
    </article>
  );
}