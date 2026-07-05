type SkillCardProps = {
  title: string;
  level: string;
  description: string;
};

export default function SkillCard({
  title,
  level,
  description,
}: SkillCardProps) {
  return (
    <article className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-[#8D846F]">{title}</p>

      <h3 className="mt-2 text-2xl font-semibold text-[#24312A]">
        {level}
      </h3>

      <p className="mt-3 text-sm leading-6 text-stone-600">
        {description}
      </p>
    </article>
  );
}