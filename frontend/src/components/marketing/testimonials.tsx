import { Quote } from "lucide-react";

import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/marketing/features";
import { Reveal } from "@/components/common/reveal";

const TESTIMONIALS = [
  {
    quote:
      "The AI report scanner caught a borderline reading I'd missed for months. It even suggested the right specialist — booking took two clicks.",
    name: "Riya Sharma",
    role: "Patient",
    initials: "RS",
    color: "from-brand-300 to-teal-300",
  },
  {
    quote:
      "Setting up my schedule once and letting patients book themselves saved my practice hours every week. The shared report context is game-changing.",
    name: "Dr. Aisha Khan",
    role: "Cardiologist",
    initials: "AK",
    color: "from-cyan-300 to-sky-300",
  },
  {
    quote:
      "I never knew how to read my mother's blood test reports until MediVerse. Plain-language summaries with clear recommendations — finally.",
    name: "Mohit Verma",
    role: "Patient",
    initials: "MV",
    color: "from-violet-300 to-fuchsia-300",
  },
];

export function Testimonials() {
  return (
    <section className="relative bg-gradient-to-b from-white via-brand-50/30 to-white py-20 sm:py-24 dark:from-background dark:via-brand-500/5 dark:to-background">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Loved by patients & doctors"
            title="What our community says"
            subtitle="Real stories from people who trust MediVerse with their health."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, idx) => (
            <Reveal key={t.name} delay={120 * idx}>
              <article className="relative flex h-full flex-col rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-xl hover:shadow-brand-500/10 sm:p-8 dark:border-white/10 dark:bg-white/[0.04]">
                <Quote className="h-7 w-7 text-brand-300 dark:text-brand-700" />
                <p className="mt-4 flex-1 text-base leading-relaxed text-foreground">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white shadow-md`}
                  >
                    {t.initials}
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-foreground">
                      {t.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t.role}
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
