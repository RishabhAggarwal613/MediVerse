import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, HeartPulse, Stethoscope } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/common/reveal";

export const metadata: Metadata = {
  title: "Sign up · MediVerse",
  description:
    "Create your MediVerse account as a patient or join as a verified doctor.",
};

const ROLES = [
  {
    href: "/signup/patient",
    icon: HeartPulse,
    title: "I'm a Patient",
    body: "Get AI health guidance, scan your reports, and book consultations with verified specialists.",
    perks: [
      "AI Health Assistant",
      "AI Report Scanning",
      "Easy Appointment Booking",
    ],
    accent: "from-brand-400/20 via-brand-100/40 to-cyan-100/30",
    iconClass: "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300",
  },
  {
    href: "/signup/doctor",
    icon: Stethoscope,
    title: "I'm a Doctor",
    body: "Reach more patients, manage your schedule, and grow your practice on MediVerse.",
    perks: [
      "Verified profile badge",
      "Smart scheduling",
      "Insightful dashboard",
    ],
    accent: "from-cyan-300/30 via-teal-100/40 to-violet-100/30",
    iconClass: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  },
];

export default function SignupRolePicker() {
  return (
    <section className="relative pt-28 pb-20 md:pt-32 md:pb-24">
      <Container>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
              Get started
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl md:text-5xl">
              How will you use{" "}
              <span className="text-gradient-brand">MediVerse</span>?
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Pick the option that describes you best — you can always switch
              later if needed.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          {ROLES.map((role, idx) => {
            const Icon = role.icon;
            return (
              <Reveal key={role.href} delay={120 * idx}>
                <Link
                  href={role.href}
                  className="group relative block h-full overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-8 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-2xl hover:shadow-brand-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-brand-700/60"
                >
                <div
                  className={`pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br ${role.accent} blur-2xl transition-opacity group-hover:opacity-90`}
                />

                <div
                  className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl ${role.iconClass}`}
                >
                  <Icon className="h-7 w-7" />
                </div>

                <h2 className="relative mt-6 text-xl font-semibold text-foreground sm:text-2xl">
                  {role.title}
                </h2>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {role.body}
                </p>

                <ul className="relative mt-5 flex flex-col gap-2">
                  {role.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-center gap-2 text-sm text-foreground/80"
                    >
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
                      {perk}
                    </li>
                  ))}
                </ul>

                  <span className="relative mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition-transform group-hover:translate-x-1 dark:text-brand-300">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-700 hover:underline dark:text-brand-300"
          >
            Login
          </Link>
        </p>
      </Container>
    </section>
  );
}
