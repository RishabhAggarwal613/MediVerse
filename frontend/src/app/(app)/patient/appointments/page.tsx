"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, ChevronRight, Navigation, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { AppPageShell } from "@/components/app/app-page-shell";
import { GoogleCalendarAppointmentButton } from "@/components/appointments/google-calendar-appointment-button";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  cancelAppointment,
  fetchMyAppointments,
} from "@/lib/api/appointments";
import { unwrapApiErrorMessage } from "@/lib/api/errors";
import { googleMapsDirectionsUrl } from "@/lib/maps-links";
import { cn } from "@/lib/utils";
import type { AppointmentDto } from "@/types/appointments";

type PatientTab = "pending" | "upcoming" | "past" | "cancelled";

function navigateHref(a: AppointmentDto): string | null {
  if (a.consultationMode === "VIDEO") return null;
  return googleMapsDirectionsUrl({
    latitude: a.practiceLatitude ?? null,
    longitude: a.practiceLongitude ?? null,
    address: a.practiceAddressFormatted ?? null,
  });
}

function visitTypeLabel(mode: string | undefined | null) {
  if (mode === "VIDEO") return "Video consultation";
  return "In-clinic";
}

function formatWhen(isoLocal: string) {
  try {
    const d = new Date(isoLocal.replace(" ", "T"));
    if (Number.isNaN(d.getTime())) return isoLocal;
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoLocal;
  }
}

function parseLocalDate(isoLocal: string): Date | null {
  try {
    const d = new Date(isoLocal.replace(" ", "T"));
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function dayKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dayLabel(d: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function statusBadgeClasses(status: string): string {
  switch (status) {
    case "PENDING":
      return "border-amber-200/70 bg-amber-50 text-amber-900 dark:border-amber-800/70 dark:bg-amber-950/60 dark:text-amber-100";
    case "CONFIRMED":
      return "border-emerald-200/70 bg-emerald-50 text-emerald-900 dark:border-emerald-800/70 dark:bg-emerald-950/55 dark:text-emerald-100";
    case "COMPLETED":
      return "border-brand-200/70 bg-brand-50 text-brand-900 dark:border-brand-800/65 dark:bg-brand-950/50 dark:text-brand-100";
    case "CANCELLED":
    case "REJECTED":
      return "border-border bg-muted/60 text-muted-foreground";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
}

function tabButtonClasses(active: boolean) {
  return cn(
    "rounded-full",
    active
      ? "bg-brand-gradient text-white shadow-sm"
      : "border border-border/70 bg-white/70 text-foreground shadow-sm backdrop-blur dark:bg-white/[0.05]",
  );
}

export default function PatientAppointmentsPage() {
  const qc = useQueryClient();
  const { data, error, isPending } = useQuery({
    queryKey: ["appointments", "me"],
    queryFn: () => fetchMyAppointments(),
  });

  const cancelMut = useMutation({
    mutationFn: (id: number) => cancelAppointment(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const list: AppointmentDto[] = useMemo(() => data ?? [], [data]);
  const [tab, setTab] = useState<PatientTab>("upcoming");

  const classified = useMemo(() => {
    const now = new Date();
    const pending: AppointmentDto[] = [];
    const upcoming: AppointmentDto[] = [];
    const past: AppointmentDto[] = [];
    const cancelled: AppointmentDto[] = [];

    for (const a of list) {
      if (a.status === "PENDING") {
        pending.push(a);
        continue;
      }
      if (a.status === "CANCELLED" || a.status === "REJECTED") {
        cancelled.push(a);
        continue;
      }
      const dt = parseLocalDate(a.scheduledAt);
      if (a.status === "COMPLETED") {
        past.push(a);
      } else if (a.status === "CONFIRMED") {
        if (dt && dt.getTime() < now.getTime()) past.push(a);
        else upcoming.push(a);
      } else {
        // Fallback bucket for any future statuses
        if (dt && dt.getTime() < now.getTime()) past.push(a);
        else upcoming.push(a);
      }
    }

    const sortDesc = (a: AppointmentDto, b: AppointmentDto) =>
      (parseLocalDate(b.scheduledAt)?.getTime() ?? 0) -
      (parseLocalDate(a.scheduledAt)?.getTime() ?? 0);
    const sortAsc = (a: AppointmentDto, b: AppointmentDto) =>
      (parseLocalDate(a.scheduledAt)?.getTime() ?? 0) -
      (parseLocalDate(b.scheduledAt)?.getTime() ?? 0);

    pending.sort(sortAsc);
    upcoming.sort(sortAsc);
    past.sort(sortDesc);
    cancelled.sort(sortDesc);

    return { pending, upcoming, past, cancelled };
  }, [list]);

  const activeList =
    tab === "pending"
      ? classified.pending
      : tab === "past"
        ? classified.past
        : tab === "cancelled"
          ? classified.cancelled
          : classified.upcoming;

  const sections = useMemo(() => {
    const m = new Map<string, { day: Date; items: AppointmentDto[] }>();
    for (const a of activeList) {
      const dt = parseLocalDate(a.scheduledAt) ?? new Date();
      const key = dayKey(dt);
      const existing = m.get(key);
      if (existing) existing.items.push(a);
      else m.set(key, { day: dt, items: [a] });
    }
    const out = Array.from(m.values()).sort((x, y) => x.day.getTime() - y.day.getTime());
    if (tab === "past" || tab === "cancelled") out.reverse();
    return out;
  }, [activeList, tab]);

  return (
    <AppPageShell variant="patient">
      <Container className="relative z-[1] max-w-3xl">
        <AppPageHeader
          role="patient"
          pill="Your care"
          icon={CalendarClock}
          title="Appointments"
          description="Upcoming and past visits — cancel when your booking is still pending or confirmed and the visit hasn't passed."
          actions={
            <Button
              asChild
              variant="outline"
              size="sm"
              className="shrink-0 rounded-full border-brand-200/80 bg-white/85 shadow-sm backdrop-blur dark:bg-white/[0.06]"
            >
              <Link href="/patient/doctors" className="inline-flex gap-1">
                Book another
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          }
          className="mb-10"
        />

        {error && (
          <p className="mb-8 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {unwrapApiErrorMessage(error)}
          </p>
        )}

        {isPending && !data && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-3xl border border-white/60 bg-white/50 dark:bg-white/[0.04]"
              />
            ))}
          </div>
        )}

        {!isPending && list.length === 0 && (
          <div className="rounded-3xl border border-dashed border-brand-300/45 bg-brand-50/40 px-6 py-14 text-center dark:border-brand-800/70 dark:bg-brand-950/25">
            <p className="text-muted-foreground">
              No appointments yet.{" "}
              <Link
                href="/patient/doctors"
                className="font-medium text-brand-800 underline decoration-brand-300 underline-offset-2 dark:text-brand-300"
              >
                Book a slot
              </Link>
              .
            </p>
          </div>
        )}

        {!isPending && list.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="ghost"
              className={tabButtonClasses(tab === "pending")}
              onClick={() => setTab("pending")}
            >
              Pending ({classified.pending.length})
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={tabButtonClasses(tab === "upcoming")}
              onClick={() => setTab("upcoming")}
            >
              Upcoming ({classified.upcoming.length})
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={tabButtonClasses(tab === "past")}
              onClick={() => setTab("past")}
            >
              Past ({classified.past.length})
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={tabButtonClasses(tab === "cancelled")}
              onClick={() => setTab("cancelled")}
            >
              Cancelled ({classified.cancelled.length})
            </Button>
          </div>
        )}

        {!isPending && list.length > 0 && activeList.length === 0 && (
          <div className="rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center text-muted-foreground">
            Nothing in this section yet.
          </div>
        )}

        <div className="space-y-8">
          {sections.map((sec) => (
            <section key={dayKey(sec.day)}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{dayLabel(sec.day)}</p>
                <p className="text-xs text-muted-foreground">{sec.items.length} appointment(s)</p>
              </div>
              <ul className="space-y-4">
                {sec.items.map((a) => {
                  const navTo = navigateHref(a);
                  return (
                    <li key={a.id} className="surface-app overflow-hidden p-5 shadow-md">
                      <div className="flex flex-wrap items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-md shadow-brand-600/30">
                          <UserRound className="h-6 w-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                                statusBadgeClasses(a.status),
                              )}
                            >
                              {a.status.replaceAll("_", " ")}
                            </span>
                            {a.consultationMode ? (
                              <span className="rounded-full border border-border/70 bg-muted/40 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                {visitTypeLabel(a.consultationMode)}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-lg font-semibold tracking-tight">{a.doctorName}</p>
                          <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                            {formatWhen(a.scheduledAt)}
                          </p>
                          {a.meetJoinUrl &&
                            a.consultationMode === "VIDEO" &&
                            ["PENDING", "CONFIRMED", "COMPLETED"].includes(a.status) && (
                              <p className="mt-3 max-w-full text-xs leading-relaxed">
                                <span className="font-medium text-muted-foreground">Meeting link: </span>
                                <a
                                  href={a.meetJoinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="break-all font-medium text-sky-700 underline decoration-sky-400/70 underline-offset-2 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-300"
                                >
                                  {a.meetJoinUrl}
                                </a>
                              </p>
                            )}
                          {a.reason && (
                            <p className="mt-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground/90">
                              Reason: {a.reason}
                            </p>
                          )}
                        </div>
                        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:ml-auto sm:w-auto sm:flex-col sm:items-stretch">
                          <GoogleCalendarAppointmentButton appointment={a} role="patient" />
                          {navTo && (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="rounded-full border-brand-200/80 bg-white/90 shadow-sm backdrop-blur dark:bg-white/[0.06]"
                            >
                              <a
                                href={navTo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5"
                              >
                                <Navigation className="h-4 w-4 shrink-0" aria-hidden />
                                Navigate
                              </a>
                            </Button>
                          )}
                          {a.meetJoinUrl && (a.status === "CONFIRMED" || a.status === "PENDING") && (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="rounded-full border-sky-200/80 bg-sky-50/90 shadow-sm backdrop-blur dark:border-sky-900/50 dark:bg-sky-950/35"
                            >
                              <a href={a.meetJoinUrl} target="_blank" rel="noopener noreferrer">
                                Join video
                              </a>
                            </Button>
                          )}
                          {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                            <Button
                              variant="destructive"
                              size="sm"
                              className="rounded-full"
                              disabled={cancelMut.isPending}
                              onClick={() => cancelMut.mutate(a.id)}
                            >
                              {cancelMut.isPending ? "…" : "Cancel"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </Container>
    </AppPageShell>
  );
}
