import CurrentChallenge from "@/components/me/CurrentChallenge";
import NextMilestone from "@/components/me/NextMilestone";
import ProfileCard from "@/components/me/ProfileCard";
import SkillCard from "@/components/me/SkillCard";
import { skills } from "@/data/me";

export default function MePage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm font-medium text-[#8D846F]">Meg</p>

        <h1 className="mt-1 text-3xl font-semibold text-[#24312A]">
          Karakter
        </h1>

        <p className="mt-2 text-sm leading-6 text-stone-600">
          En rolig oversikt over utvikling, styrker og neste steg.
        </p>
      </div>

      <ProfileCard />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {skills.map((skill) => (
          <SkillCard
            key={skill.title}
            title={skill.title}
            level={skill.level}
            description={skill.description}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <CurrentChallenge />

        <NextMilestone />
      </section>
    </main>
  );
}