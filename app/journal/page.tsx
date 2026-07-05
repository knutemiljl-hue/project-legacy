import PastReflections from "@/components/journal/PastReflections";
import ReflectionCard from "@/components/journal/ReflectionCard";

export default function JournalPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[#8D846F]">Journal</p>

        <h1 className="mt-1 text-3xl font-semibold text-[#24312A]">
          Refleksjoner
        </h1>

        <p className="mt-2 text-sm leading-6 text-stone-600">
          Et rolig sted for å se tilbake, justere kursen og samle små øyeblikk.
        </p>
      </div>

      <ReflectionCard />

      <PastReflections />
    </main>
  );
}