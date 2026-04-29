"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  cancelAppointment,
  fetchMyAppointments,
} from "@/lib/api/appointments";
import { unwrapApiErrorMessage } from "@/lib/api/errors";
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

export default function PatientAppointmentsPage() {
  const qc = useQueryClient();
  const { data, error, isPending } = useQuery({
    queryKey: ["appointments", "me"],
    queryFn: () => fetchMyAppointments(),
  });

  const cancelMut = useMutation({
    mutationFn: (id: number) => cancelAppointment(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const list: AppointmentDto[] = data ?? [];

  return (
    <Container className="py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
            Care
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upcoming visits you have booked across MediVerse.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/patient/doctors">Find a doctor</Link>
        </Button>
      </div>

      {error && (
        <p className="mt-8 text-sm text-destructive">
          {unwrapApiErrorMessage(error)}
        </p>
      )}

      {isPending && !data && (
        <p className="mt-10 text-muted-foreground">Loading…</p>
      )}

      {!isPending && list.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center text-muted-foreground">
          No appointments yet.{" "}
          <Link href="/patient/doctors" className="font-medium text-brand-700 underline dark:text-brand-400">
            Book a slot
          </Link>
          .
        </p>
      )}

      <ul className="mt-8 space-y-4">
        {list.map((a) => (
          <li
            key={a.id}
            className="rounded-2xl border border-border/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:bg-white/[0.04]"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {a.status.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-lg font-semibold">
                  Dr. {a.doctorName}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatWhen(a.scheduledAt)}
                </p>
                {a.reason && (
                  <p className="mt-2 text-sm text-foreground/80">
                    Reason: {a.reason}
                  </p>
                )}
              </div>
              {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                <Button
                  variant="destructive"
                  size="sm"
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
  );
}
