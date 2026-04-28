import { MessageSquareText, FileScan, CalendarCheck2 } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/common/reveal";

const FEATURES = [
  {
    icon: MessageSquareText,
    title: "AI Health Assistant",
    body: "Ask anything about symptoms, conditions, or wellness. Get clear, conversational answers — anytime.",
    accent: "from-brand-400/20 to-brand-100/40",
    iconBg: "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300",
  },
  {
    icon: FileScan,
    title: "AI Report Scanning",
    body: "Upload a lab report, get a plain-language summary, color-coded findings, and lifestyle suggestions in seconds.",
    accent: "from-cyan-300/30 to-teal-100/50",
    iconBg: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  },
  {
    icon: CalendarCheck2,
    title: "Easy Appointment Booking",
    body: "Browse verified specialists, see real-time availability, and book a slot in two clicks. No phone calls.",
    accent: "from-violet-300/25 to-fuchsia-100/40",
    iconBg: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="Features"
            title="Everything you need for proactive care"
            subtitle="Three pillars that work together — so you understand your health, and act on it."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, idx) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={120 * idx}>
                <div className="group relative h-full overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/10 sm:p-8 dark:border-white/10 dark:bg-white/[0.04]">
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-gradient-to-br ${f.accent} blur-2xl transition-opacity group-hover:opacity-80`}
                  />

                  <div
                    className={`relative inline-flex h-12 w-12 items-center justify-center rounded-2xl ${f.iconBg}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="relative mt-5 text-lg font-semibold text-foreground sm:text-xl">
                    {f.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {f.body}
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

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-2xl ${alignment}`}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
