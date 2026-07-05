import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

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
            Et rolig sted for ukesreview, tanker, læring og små notater som
            gjør reisen lettere å se tilbake på.
          </p>
        </section>

        <Card>
          <p className="text-sm font-medium text-[#8D846F]">
            Kommer snart
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-[#24312A]">
            Ukentlig refleksjon
          </h2>

          <p className="mt-3 text-stone-600">
            Her kan vi senere legge inn tre enkle spørsmål: hva gikk bra, hva
            var vanskelig, og hva skal neste uke handle om?
          </p>
        </Card>
      </div>
    </AppShell>
  );
}