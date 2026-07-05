import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

export default function Home() {
  return (
    <AppShell>
      <div className="grid gap-6">
        <Card>
          <p className="text-sm text-[#8D846F]">Sprint 1.3</p>
          <h1 className="mt-2 text-3xl font-semibold">
            Project Legacy er i gang
          </h1>
          <p className="mt-3 text-stone-600">
            Grunnmuren er på plass: sidestruktur, toppmeny og første visuelle rammeverk.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}