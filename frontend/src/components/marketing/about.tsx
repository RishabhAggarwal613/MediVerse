import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/marketing/features";
import { Reveal } from "@/components/common/reveal";

export function About() {
  return (
    <section id="about" className="relative py-20 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="About MediVerse"
            title="Healthcare that meets you where you are"
          />
        </Reveal>

        <Reveal delay={100}>
          <div className="mx-auto mt-10 max-w-3xl space-y-5 text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              MediVerse was built on a simple belief: people deserve clarity
              about their health, fast. Yet most of us spend hours in waiting
              rooms, or squinting at lab reports we don&apos;t fully understand.
            </p>
            <p>
              We pair the latest AI with verified human specialists, so you can
              ask questions without judgement, get instant insights from your
              reports, and book a consultation when you really need one — all
              from a single, calming place.
            </p>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-6 rounded-3xl border border-border/60 bg-white/70 p-6 backdrop-blur-md sm:p-8 dark:bg-white/[0.04]">
            <Stat label="Avg. response time" value="< 2 min" />
            <Stat label="Reports analyzed" value="50K+" />
            <Stat label="Languages supported" value="3+" />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-sm">
        {label}
      </p>
    </div>
  );
}
