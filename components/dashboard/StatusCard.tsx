type StatusCardProps = {
  title: string;
  value: string;
  subtitle: string;
};

export default function StatusCard({
  title,
  value,
  subtitle,
}: StatusCardProps) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-[#8D846F]">{title}</p>
      <h3 className="mt-3 text-2xl font-semibold text-[#24312A]">
        {value}
      </h3>
      <p className="mt-2 text-sm text-stone-500">{subtitle}</p>
    </div>
  );
}