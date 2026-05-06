"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Mail, UserRound } from "lucide-react";
import { useMemo, useState } from "react";

import { AppPageShell } from "@/components/app/app-page-shell";
import { GoogleCalendarAppointmentButton } from "@/components/appointments/google-calendar-appointment-button";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  approveAppointment,
  completeAppointment,
  fetchMyAppointments,
  rejectAppointment,
} from "@/lib/api/appointments";
import { unwrapApiErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import type { AppointmentDto } from "@/types/appointments";

type DoctorTab = "pending" | "today" | "upcoming" | "past" | "cancelled";

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
      return "border-teal-200/80 bg-teal-50 text-teal-900 dark:border-teal-800/65 dark:bg-teal-950/55 dark:text-teal-100";
    case "COMPLETED":
      return "border-sky-200/70 bg-sky-50 text-sky-950 dark:border-sky-800/65 dark:bg-sky-950/55 dark:text-sky-50";
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
      ? "bg-gradient-to-r from-teal-600 to-sky-600 text-white shadow-sm"
      : "border border-border/70 bg-white/70 text-foreground shadow-sm backdrop-blur dark:bg-white/[0.05]",
  );
}

export default function DoctorAppointmentsPage() {
  const qc = useQueryClient();
  const { data, error, isPending } = useQuery({
    queryKey: ["appointments", "me", "doctor"],
    queryFn: () => fetchMyAppointments(),
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["appointments"] });

  const approveMut = useMutation({
    mutationFn: (id: number) => approveAppointment(id),
    onSuccess: (appt) => {
      void invalidate();
      if (appt.consultationMode === "VIDEO") {
        const raw = appt.googleCalendarHtmlLink?.trim();
        if (typeof window !== "undefined" && raw && raw.length > 0) {
          window.open(raw, "_blank", "noopener,noreferrer");
        }
      }
    },
  });
  const rejectMut = useMutation({
    mutationFn: (id: number) => rejectAppointment(id),
    onSuccess: invalidate,
  });
  const completeMut = useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) =>
      completeAppointment(id, note ? { doctorNote: note } : {}),
    onSuccess: invalidate,
  });

  const list: AppointmentDto[] = useMemo(() => data ?? [], [data]);
  const [tab, setTab] = useState<DoctorTab>("pending");

  const classified = useMemo(() => {
    const now = new Date();
    const todayKey = dayKey(now);
    const pending: AppointmentDto[] = [];
    const today: AppointmentDto[] = [];
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
      const dk = dt ? dayKey(dt) : "";
      if (a.status === "COMPLETED") {
        past.push(a);
      } else if (a.status === "CONFIRMED") {
        if (dk === todayKey) today.push(a);
        else if (dt && dt.getTime() < now.getTime()) past.push(a);
        else upcoming.push(a);
      } else {
        if (dt && dt.getTime() < now.getTime()) past.push(a);
        else upcoming.push(a);
      }
    }

    const sortDesc = (a: AppointmentDto, b: AppointmentDto) =>
      (parseLocalDate(b.scheduledAt)?.getTime() ?? 0) -
      (parseLocalDate(a.scheduledAt)?.getTime() ?? 0);

    // pending/today/upcoming in chronological order, past/cancelled newest first
    pending.sort((a, b) => (parseLocalDate(a.scheduledAt)?.getTime() ?? 0) - (parseLocalDate(b.scheduledAt)?.getTime() ?? 0));
    today.sort((a, b) => (parseLocalDate(a.scheduledAt)?.getTime() ?? 0) - (parseLocalDate(b.scheduledAt)?.getTime() ?? 0));
    upcoming.sort((a, b) => (parseLocalDate(a.scheduledAt)?.getTime() ?? 0) - (parseLocalDate(b.scheduledAt)?.getTime() ?? 0));
    past.sort(sortDesc);
    cancelled.sort(sortDesc);

    return { pending, today, upcoming, past, cancelled };
  }, [list]);

  const activeList =
    tab === "today"
      ? classified.today
      : tab === "upcoming"
        ? classified.upcoming
        : tab === "past"
          ? classified.past
          : tab === "cancelled"
            ? classified.cancelled
            : classified.pending;

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
    <AppPageShell variant="doctor">
      <Container className="relative z-[1] max-w-3xl">
        <header className="mb-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50/90 px-3 py-1 text-xs font-medium text-teal-900 shadow-sm backdrop-blur dark:border-teal-800/80 dark:bg-teal-950/60 dark:text-teal-100">
            <CalendarClock className="h-3.5 w-3.5" />
            Practice
          </p>
          <h1 className="mt-4 bg-gradient-to-r from-teal-900 via-sky-900 to-teal-800 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-teal-100 dark:via-sky-100 dark:to-teal-200 sm:text-4xl">
            Appointments
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            Review pending booking requests and complete visits afterward. Patient email stays on each
            card for quick reference.
          </p>
        </header>

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
                className="h-36 animate-pulse rounded-3xl border border-white/60 bg-white/50 dark:bg-white/[0.04]"
              />
            ))}
          </div>
        )}

        {!isPending && list.length === 0 && (
          <div className="rounded-3xl border border-dashed border-teal-300/45 bg-teal-50/40 px-6 py-14 text-center text-muted-foreground dark:border-teal-800/70 dark:bg-teal-950/25">
            No bookings yet — patients will appear here once they reserve your slots.
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
              className={tabButtonClasses(tab === "today")}
              onClick={() => setTab("today")}
            >
              Today ({classified.today.length})
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
              <ul className="space-y-6">
                {sec.items.map((a) => (
                  <li
                    key={a.id}
                    className={cn(
                      "overflow-hidden rounded-3xl border border-white/65 bg-white/85 p-5 shadow-xl shadow-teal-950/8 backdrop-blur-xl",
                      "dark:border-white/10 dark:bg-white/[0.06]",
                    )}
                  >
                    <div className="flex flex-wrap gap-5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-sky-600 text-white shadow-lg">
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
                        <p className="mt-2 text-lg font-semibold tracking-tight">{a.patientName}</p>
                        <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                          {formatWhen(a.scheduledAt)}
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{a.patientEmail}</span>
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
                        {a.doctorNote && a.status === "COMPLETED" && (
                          <p className="mt-3 rounded-xl border border-teal-200/50 bg-teal-50/50 px-3 py-2 text-sm dark:border-teal-900/60 dark:bg-teal-950/40">
                            Your note: {a.doctorNote}
                          </p>
                        )}
                      </div>
                      <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:min-w-[10.75rem] sm:shrink-0 sm:items-stretch">
                        <GoogleCalendarAppointmentButton appointment={a} role="doctor" />
                        {a.meetJoinUrl &&
                          a.consultationMode === "VIDEO" &&
                          (a.status === "CONFIRMED" || a.status === "PENDING") && (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="rounded-full border-sky-200/80 bg-sky-50/90 shadow-sm backdrop-blur dark:border-sky-900/55 dark:bg-sky-950/40"
                            >
                              <a
                                href={a.meetJoinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={a.meetJoinUrl}
                              >
                                Join video
                              </a>
                            </Button>
                          )}
                        <AppointmentActions
                          a={a}
                          approveMut={approveMut}
                          rejectMut={rejectMut}
                          completeMut={completeMut}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Container>
    </AppPageShell>
  );
}

function AppointmentActions({
  a,
  approveMut,
  rejectMut,
  completeMut,
}: {
  a: AppointmentDto;
  approveMut: {
    isPending: boolean;
    mutate: (id: number) => void;
  };
  rejectMut: {
    isPending: boolean;
    mutate: (id: number) => void;
  };
  completeMut: {
    isPending: boolean;
    mutate: (args: { id: number; note?: string }) => void;
  };
}) {
  const busy =
    approveMut.isPending || rejectMut.isPending || completeMut.isPending;

  if (a.status === "PENDING") {
    return (
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        <Button size="sm" className="rounded-full" disabled={busy} onClick={() => approveMut.mutate(a.id)}>
          Approve
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => rejectMut.mutate(a.id)}>
          Reject
        </Button>
      </div>
    );
  }

  if (a.status === "CONFIRMED") {
    return (
      <div className="flex shrink-0 flex-col gap-2">
        <Button
          size="sm"
          className="rounded-full bg-gradient-to-r from-teal-600 to-sky-600"
          disabled={busy}
          onClick={() => completeMut.mutate({ id: a.id })}
        >
          Mark complete
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          onClick={() => {
            const note =
              typeof window !== "undefined"
                ? window.prompt("Optional note for the patient (visible in email):")
                : "";
            completeMut.mutate({
              id: a.id,
              note: note && note.trim() ? note.trim() : undefined,
            });
          }}
        >
          Complete with note
        </Button>
      </div>
    );
  }

  return null;
}
