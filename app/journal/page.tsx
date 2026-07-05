import AppShell from "@/components/layout/AppShell";
import ReflectionCard from "@/components/journal/ReflectionCard";
import PastReflections from "@/components/journal/PastReflections";

export default function JournalPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section>
          <p className="text-sm font-medium text-[#8D846F]">Journal</p>

          <h1 className="mt-2 text-3xl font-semibold text-[#24312A]">
            Refleksjoner
          </h1>

          <p className="mt-2 max-w-2xl text-stone-600">
            Et rolig sted for ukesreview, læring og små notater som gjør reisen
            lettere å se tilbake på.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <ReflectionCard />
          <PastReflections />
        </section>
      </div>
    </AppShell>
  );
}