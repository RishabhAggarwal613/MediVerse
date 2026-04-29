"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Mail, UserRound } from "lucide-react";

import { AppPageShell } from "@/components/app/app-page-shell";
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

export default function DoctorAppointmentsPage() {
  const qc = useQueryClient();
  const { data, error, isPending } = useQuery({
    queryKey: ["appointments", "me", "doctor"],
    queryFn: () => fetchMyAppointments(),
  });

  const invalidate = () => void qc.invalidateQueries({ queryKey: ["appointments"] });

  const approveMut = useMutation({
    mutationFn: (id: number) => approveAppointment(id),
    onSuccess: invalidate,
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

  const list: AppointmentDto[] = data ?? [];

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

        <ul className="space-y-6">
          {list.map((a) => (
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
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                      statusBadgeClasses(a.status),
                    )}
                  >
                    {a.status.replaceAll("_", " ")}
                  </span>
                  <p className="mt-2 text-lg font-semibold tracking-tight">{a.patientName}</p>
                  <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                    {formatWhen(a.scheduledAt)}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{a.patientEmail}</span>
                  </p>
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
                <AppointmentActions
                  a={a}
                  approveMut={approveMut}
                  rejectMut={rejectMut}
                  completeMut={completeMut}
                />
              </div>
            </li>
          ))}
        </ul>
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
