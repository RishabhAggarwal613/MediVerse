"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Clock,
  ClipboardList,
  Settings2,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import { AppPageShell } from "@/components/app/app-page-shell";
import { OnboardingChecklist } from "@/components/app/onboarding-checklist";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { fetchDoctorDashboardStats } from "@/lib/api/doctors";
import { useAuthStore } from "@/stores/auth-store";

function firstName(full: string | null | undefined): string {
  if (!full?.trim()) return "Doctor";
  return full.trim().split(/\s+/)[0] ?? "Doctor";
}

type GlassStatProps = {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
};

function GlassStat({ label, value, sub, icon }: GlassStatProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-teal-950/5 backdrop-blur-xl transition-all duration-300 hover:border-teal-300/50 hover:shadow-teal-700/15 dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-teal-500/30 dark:hover:bg-white/[0.09]">
      <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-teal-400/15 blur-2xl dark:bg-teal-500/15" />
      <div className="relative flex flex-col gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-500/25 dark:text-teal-100">
          {icon}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

type NavTileProps = {
  href: string;
  title: string;
  blurb: string;
  icon: ReactNode;
};

function NavTile({ href, title, blurb, icon }: NavTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/75 p-6 shadow-md shadow-slate-900/5 backdrop-blur-xl transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-teal-300/60 hover:bg-white/95 hover:shadow-lg hover:shadow-teal-600/10",
        "dark:border-white/10 dark:bg-white/[0.05] dark:hover:border-teal-500/35 dark:hover:bg-white/[0.09]",
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-sky-600 text-white shadow-md">
        {icon}
      </span>
      <div>
        <p className="flex items-center gap-1 text-base font-semibold tracking-tight">
          {title}
          <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{blurb}</p>
      </div>
    </Link>
  );
}

export default function DoctorHomePage() {
  const user = useAuthStore((s) => s.user);
  const name = firstName(user?.fullName ?? null);

  const statsQ = useQuery({
    queryKey: ["doctor", "dashboard", "stats"],
    queryFn: () => fetchDoctorDashboardStats(),
    staleTime: 20_000,
  });

  const s = statsQ.data;

  return (
    <AppPageShell variant="doctor">
      <Container className="relative z-[1] max-w-6xl">
        <header className="flex flex-wrap items-start gap-6">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/90 px-3 py-1 text-xs font-medium text-teal-900 shadow-sm backdrop-blur dark:border-teal-800/80 dark:bg-teal-950/60 dark:text-teal-100">
              <ClipboardList className="h-3.5 w-3.5" />
              Practice hub
            </p>
            <h1 className="mt-4 bg-gradient-to-r from-teal-900 via-sky-900 to-teal-800 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-teal-100 dark:via-sky-100 dark:to-teal-200 sm:text-4xl">
              Dr. {name}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Overview of bookings and quick access to your MediVerse practice tools —
              approvals, scheduling, and your public profile.
            </p>
          </div>
        </header>

        <div className="mt-8">
          <OnboardingChecklist variant="doctor" />
        </div>

        {/* KPI strip */}
        <section className="mt-12">
          {statsQ.isPending && (
            <div className="grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[9.5rem] animate-pulse rounded-2xl border border-muted bg-muted/50"
                />
              ))}
            </div>
          )}
          {statsQ.isError && (
            <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-muted-foreground">
              Stats could not be loaded — your profile actions below still work.
            </p>
          )}
          {s != null && !statsQ.isPending && (
            <div className="grid gap-4 sm:grid-cols-3">
              <GlassStat
                label="Today"
                value={s.appointmentsToday}
                sub="Visits booked for today"
                icon={<Clock className="h-5 w-5" />}
              />
              <GlassStat
                label="This week"
                value={s.weekAppointments}
                sub="Across the rolling 7 days"
                icon={<CalendarDays className="h-5 w-5" />}
              />
              <GlassStat
                label="Unique patients"
                value={s.totalPatientsBooked}
                sub="All-time bookings with you"
                icon={<Users className="h-5 w-5" />}
              />
            </div>
          )}
        </section>

        {/* Feature grid */}
        <section className="mt-14">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Quick access
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                Run your clinic day
              </h2>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/doctor/profile">
                <UserRound className="mr-2 h-4 w-4" />
                Profile & photo
              </Link>
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <NavTile
              href="/doctor/appointments"
              title="Appointments"
              blurb="Pending approvals, confirmations, completions, and day-of timelines."
              icon={<CalendarDays className="h-6 w-6" />}
            />
            <NavTile
              href="/doctor/availability"
              title="Availability & slots"
              blurb="Edit weekly rules — slots regenerate instantly for booking."
              icon={<Settings2 className="h-6 w-6" />}
            />
            <NavTile
              href="/doctor/profile"
              title="Public profile"
              blurb="How patients discover you — fees, specialties, and bio."
              icon={<Sparkles className="h-6 w-6" />}
            />
          </div>

          {/* Insight ribbon */}
          <div className="mt-10 rounded-3xl border border-teal-200/60 bg-gradient-to-r from-teal-50/90 via-white/85 to-sky-50/80 p-6 shadow-inner shadow-teal-500/10 dark:border-teal-900/70 dark:from-teal-950/50 dark:via-gray-950/80 dark:to-sky-950/40 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
            <div className="flex flex-1 items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-sky-600 text-white shadow-lg">
                <BarChart3 className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold tracking-tight text-foreground">
                  Stay verified & visible
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Keep licensing and specialization current so MediVerse can match you with patients
                  who need your expertise.
                </p>
              </div>
            </div>
            <Button
              asChild
              className="mt-6 bg-brand-gradient hover:opacity-95 md:mt-0 md:shrink-0 md:rounded-full"
            >
              <Link href="/doctor/appointments">Review queue</Link>
            </Button>
          </div>
        </section>
      </Container>
    </AppPageShell>
  );
}
