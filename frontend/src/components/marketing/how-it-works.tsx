import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/marketing/features";
import { Reveal } from "@/components/common/reveal";
import {
  StepSignupIllustration,
  StepFindIllustration,
  StepCareIllustration,
} from "@/components/marketing/illustrations/step-illustrations";

const STEPS = [
  {
    Illustration: StepSignupIllustration,
    title: "Sign up free",
    body: "Create your patient account in under a minute. Email or Google — your choice.",
  },
  {
    Illustration: StepFindIllustration,
    title: "Find a doctor or use AI",
    body: "Browse verified specialists, or chat with the AI assistant for quick health guidance.",
  },
  {
    Illustration: StepCareIllustration,
    title: "Get expert care",
    body: "Book a slot, attend the consultation, and follow up with shared reports — all tracked.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative bg-gradient-to-b from-brand-50/40 via-white to-white py-20 sm:py-24 dark:from-brand-500/5 dark:via-background dark:to-background"
    >
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="How it works"
            title="From signup to care, in three steps"
            subtitle="Designed to feel effortless. No friction, no jargon."
          />
        </Reveal>

        <div className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-6">
          {/* Connecting line on md+ */}
          <div className="pointer-events-none absolute inset-x-12 top-24 hidden h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent md:block dark:via-brand-700" />

          {STEPS.map((s, idx) => {
            const Illus = s.Illustration;
            return (
              <Reveal key={s.title} delay={140 * idx}>
                <div className="relative flex flex-col items-center text-center">
                  <div className="relative">
                    <Illus className="h-40 w-full max-w-[16rem]" />
                    <span className="absolute -top-2 left-1/2 inline-flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-brand-gradient text-sm font-bold text-white shadow-lg shadow-brand-500/30">
                      {idx + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
