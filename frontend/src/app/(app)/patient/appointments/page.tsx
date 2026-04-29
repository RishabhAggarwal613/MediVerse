"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, ChevronRight, UserRound } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { AppPageShell } from "@/components/app/app-page-shell";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  cancelAppointment,
  fetchMyAppointments,
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

  const list: AppointmentDto[] = data ?? [];

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

        <ul className="space-y-4">
          {list.map((a) => (
            <li
              key={a.id}
              className="surface-app overflow-hidden p-5 shadow-md"
            >
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
                  </div>
                  <p className="mt-2 text-lg font-semibold tracking-tight">{a.doctorName}</p>
                  <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                    {formatWhen(a.scheduledAt)}
                  </p>
                  {a.reason && (
                    <p className="mt-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-sm text-foreground/90">
                      Reason: {a.reason}
                    </p>
                  )}
                </div>
                {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="shrink-0 rounded-full"
                    disabled={cancelMut.isPending}
                    onClick={() => cancelMut.mutate(a.id)}
                  >
                    {cancelMut.isPending ? "…" : "Cancel"}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </AppPageShell>
  );
}
