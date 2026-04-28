import Link from "next/link";
import { ArrowRight, Calendar, Users, TrendingUp, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/common/reveal";
import { DoctorIllustration } from "@/components/marketing/illustrations/doctor-illustration";

const PERKS = [
  {
    icon: Users,
    title: "Reach more patients",
    body: "Show up in searches by specialization and city. Build your reputation with reviews.",
  },
  {
    icon: Calendar,
    title: "Smart scheduling",
    body: "Set weekly availability once. Configure instant-book or approval-required per slot.",
  },
  {
    icon: TrendingUp,
    title: "Insightful dashboard",
    body: "Track today's appointments, weekly trends, and total patients served.",
  },
  {
    icon: ShieldCheck,
    title: "Verified profile badge",
    body: "Stand out with a verified badge once your credentials are reviewed.",
  },
];

export function ForDoctors() {
  return (
    <section id="for-doctors" className="relative py-20 sm:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <Reveal direction="right" className="lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
              For Doctors
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Grow your practice on{" "}
              <span className="text-gradient-brand">MediVerse</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Join a network of verified specialists. Manage your schedule,
              connect with patients seamlessly, and review AI-curated health
              context shared securely with you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signup/doctor">
                  Join as a doctor
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#faq">Learn more</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal direction="left" delay={120} className="lg:col-span-7">
            <div className="relative rounded-3xl border border-white/60 bg-white/70 p-2 shadow-xl shadow-brand-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-cyan-50 p-4 dark:from-brand-500/10 dark:to-cyan-500/10">
                <DoctorIllustration className="mx-auto max-w-md" />

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {PERKS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <div
                        key={p.title}
                        className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/[0.06]"
                      >
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                          <Icon className="h-4 w-4" />
                        </div>
                        <h3 className="mt-3 text-sm font-semibold text-foreground">
                          {p.title}
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {p.body}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
