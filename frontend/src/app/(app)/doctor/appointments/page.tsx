"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  approveAppointment,
  completeAppointment,
  fetchMyAppointments,
  rejectAppointment,
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

export default function DoctorAppointmentsPage() {
  const qc = useQueryClient();
  const { data, error, isPending } = useQuery({
    queryKey: ["appointments", "me", "doctor"],
    queryFn: () => fetchMyAppointments(),
  });

  const invalidate = () =>
    void qc.invalidateQueries({ queryKey: ["appointments"] });

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
    <Container className="py-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
          Practice
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review pending requests and complete visits after they happen.
        </p>
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
          No bookings yet — patients will appear here once they reserve a slot.
        </p>
      )}

      <ul className="mt-8 space-y-6">
        {list.map((a) => (
          <li
            key={a.id}
            className="rounded-2xl border border-border/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:bg-white/[0.04]"
          >
            <div className="flex flex-wrap gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {a.status.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-lg font-semibold">{a.patientName}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatWhen(a.scheduledAt)}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {a.patientEmail}
                </p>
                {a.reason && (
                  <p className="mt-3 text-sm text-foreground/80">
                    Reason: {a.reason}
                  </p>
                )}
                {a.doctorNote && a.status === "COMPLETED" && (
                  <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
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
        <Button
          size="sm"
          disabled={busy}
          onClick={() => approveMut.mutate(a.id)}
        >
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => rejectMut.mutate(a.id)}
        >
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
