import AppShell from "@/components/layout/AppShell";
import ProfileCard from "@/components/me/ProfileCard";
import SkillCard from "@/components/me/SkillCard";
import CurrentChallenge from "@/components/me/CurrentChallenge";
import NextMilestone from "@/components/me/NextMilestone";

const skills = [
  {
    title: "Familie",
    level: "Nivå 1",
    description:
      "Tilstedeværelse, omsorg og praktisk støtte hjemme.",
  },
  {
    title: "Helse",
    level: "Nivå 1",
    description:
      "Trening, søvn, energi og kroppen du ønsker å ha over tid.",
  },
  {
    title: "Karriere",
    level: "Nivå 1",
    description:
      "Partner-track, klientarbeid, faglig utvikling og synlighet.",
  },
  {
    title: "Økonomi",
    level: "Nivå 1",
    description:
      "Trygghet, sparing, investeringer og langsiktig handlingsrom.",
  },
];

export default function MePage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section>
          <p className="text-sm font-medium text-[#8D846F]">Meg</p>

          <h1 className="mt-2 text-3xl font-semibold text-[#24312A]">
            Karakter
          </h1>

          <p className="mt-2 max-w-2xl text-stone-600">
            Din personlige utvikling samlet på ett sted. Diskret inspirert av
            spill, men laget for livet.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <ProfileCard />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {skills.map((skill) => (
              <SkillCard
                key={skill.title}
                title={skill.title}
                level={skill.level}
                description={skill.description}
              />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CurrentChallenge />
          <NextMilestone />
        </section>
      </div>
    </AppShell>
  );
}