"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  FileSearch,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { AppPageShell } from "@/components/app/app-page-shell";
import { OnboardingChecklist } from "@/components/app/onboarding-checklist";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { fetchMyAppointments } from "@/lib/api/appointments";
import type { AppointmentDto } from "@/types/appointments";
import { useAuthStore } from "@/stores/auth-store";

function firstName(full: string | null | undefined): string {
  if (!full?.trim()) return "there";
  return full.trim().split(/\s+/)[0] ?? "there";
}

function nextUpcomingAppointment(appointments: AppointmentDto[] | undefined) {
  if (!appointments?.length) return null;
  const now = Date.now();

  const future = [...appointments]
    .filter(
      (a) =>
        ["PENDING", "CONFIRMED"].includes(a.status) &&
        !["CANCELLED", "REJECTED"].includes(a.status),
    )
    .filter((a) => new Date(a.scheduledAt).getTime() >= now);

  future.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  return future[0] ?? null;
}

function fmtApptShort(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

type ActionCardProps = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  className?: string;
  emphasis?: boolean;
};

function ActionCard({
  title,
  description,
  href,
  icon,
  className,
  emphasis,
}: ActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all duration-300",
        "border-white/60 bg-white/70 shadow-lg shadow-brand-950/5 backdrop-blur-xl",
        "hover:-translate-y-0.5 hover:border-brand-300/70 hover:bg-white/90 hover:shadow-xl hover:shadow-brand-500/10",
        "dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-brand-400/35 dark:hover:bg-white/[0.1]",
        emphasis &&
          "border-brand-200/90 bg-gradient-to-br from-brand-50/95 via-white/80 to-teal-50/50 dark:from-brand-950/60 dark:via-white/[0.07] dark:to-cyan-950/30",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
            emphasis
              ? "bg-brand-gradient text-white shadow-md shadow-brand-600/30"
              : "bg-brand-100 text-brand-700 dark:bg-brand-500/25 dark:text-brand-200",
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1 font-semibold tracking-tight text-foreground">
            {title}{" "}
            <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function PatientHomePage() {
  const user = useAuthStore((s) => s.user);
  const name = firstName(user?.fullName ?? null);

  const apptsQ = useQuery({
    queryKey: ["appointments", "me", "dash"],
    queryFn: () => fetchMyAppointments(),
    staleTime: 30_000,
  });

  const nextAppt = useMemo(
    () => nextUpcomingAppointment(apptsQ.data),
    [apptsQ.data],
  );

  const apptLoading = apptsQ.isPending;

  return (
    <AppPageShell variant="patient">
      <Container className="relative z-[1] max-w-6xl">
        <header className="flex flex-wrap items-start gap-6">
          <div className="max-w-xl flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200/80 bg-brand-50/90 px-3 py-1 text-xs font-medium text-brand-800 shadow-sm backdrop-blur dark:border-brand-500/30 dark:bg-brand-950/50 dark:text-brand-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Your care dashboard
            </div>
            <h1 className="mt-4 bg-gradient-to-r from-brand-800 via-teal-800 to-emerald-800 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-brand-200 dark:via-teal-200 dark:to-brand-300 sm:text-4xl">
              Hi {name},
              <br />
              <span className="font-semibold opacity-95">welcome back.</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Manage visits, tap into wellness AI, and keep your labs organized — one
              calm place built around you.
            </p>
          </div>
        </header>

        <div className="mt-8">
          <OnboardingChecklist variant="patient" />
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          {/* Next appointment highlight */}
          <div
            className={cn(
              "surface-app relative overflow-hidden p-6 shadow-md",
              "lg:col-span-5",
            )}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-500/10" />
            <div className="relative flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-brand-600/35">
                <CalendarClock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Next appointment
                </p>
                {apptLoading && (
                  <div className="mt-4 h-28 animate-pulse rounded-2xl bg-muted/70" />
                )}
                {!apptLoading && nextAppt && (
                  <>
                    <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                      {fmtApptShort(nextAppt.scheduledAt)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      with{" "}
                      <span className="font-medium text-foreground">{nextAppt.doctorName}</span>
                      {nextAppt.status === "PENDING" && (
                        <span className="ml-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950/70 dark:text-amber-200">
                          Awaiting confirmation
                        </span>
                      )}
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-5">
                      <Link href={`/patient/appointments`}>Open appointments →</Link>
                    </Button>
                  </>
                )}
                {!apptLoading && !nextAppt && (
                  <>
                    <p className="mt-3 max-w-[16rem] text-sm leading-relaxed text-muted-foreground">
                      No visits on the horizon — book care when you are ready.
                    </p>
                    <Button asChild className="mt-5 rounded-full px-6" size="sm">
                      <Link href="/patient/doctors">Find a doctor</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Mini stats */}
            {!apptLoading && apptsQ.data && (
              <dl className="relative mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-brand-100/80 bg-brand-50/50 p-4 dark:border-brand-900/60 dark:bg-black/25">
                {[
                  {
                    label: "Upcoming",
                    value: apptsQ.data.filter(
                      (a) =>
                        ["PENDING", "CONFIRMED"].includes(a.status) &&
                        !["CANCELLED", "REJECTED"].includes(a.status) &&
                        new Date(a.scheduledAt) >= new Date(),
                    ).length,
                  },
                  {
                    label: "All bookings",
                    value: apptsQ.data.length,
                  },
                  {
                    label: "Confirmed",
                    value: apptsQ.data.filter((a) => a.status === "CONFIRMED").length,
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="mt-1 text-xl font-semibold tabular-nums text-foreground">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Bento actions */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            <ActionCard
              emphasis
              title="AI health assistant"
              description="Answers and chat history — general wellness guidance, not a substitute for medical advice."
              href="/patient/ai-assistant"
              icon={<Bot className="h-6 w-6" />}
              className="sm:col-span-2"
            />
            <ActionCard
              title="Appointments"
              description="View and manage bookings, confirmations, and visit notes."
              href="/patient/appointments"
              icon={<Sparkles className="h-6 w-6" />}
            />
            <ActionCard
              title="Find doctors"
              description="Search specialties, browse profiles, and book verified slots."
              href="/patient/doctors"
              icon={<Stethoscope className="h-6 w-6" />}
            />
            <ActionCard
              title="Lab report scans"
              description="Upload PDFs or images for AI-assisted summaries."
              href="/patient/ai-reports"
              icon={<FileSearch className="h-6 w-6" />}
              className="sm:col-span-2"
            />
          </div>
        </div>

        <p className="mt-12 rounded-2xl border border-dashed border-brand-300/45 bg-brand-50/40 px-4 py-3 text-center text-xs text-muted-foreground dark:border-brand-800/80 dark:bg-brand-950/30">
          AI responses are informational. Always follow your clinician’s guidance for treatment
          and diagnosis.
        </p>
      </Container>
    </AppPageShell>
  );
}
