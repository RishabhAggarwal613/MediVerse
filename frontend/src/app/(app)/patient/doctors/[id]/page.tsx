"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchDoctorAvailabilityPublic,
  fetchDoctorPublic,
  fetchDoctorSlots,
} from "@/lib/api/doctors";
import { bookAppointment } from "@/lib/api/appointments";
import { unwrapApiErrorMessage } from "@/lib/api/errors";
import type { DoctorAvailabilityRuleDto } from "@/types/doctors";

function padTime(isoLike: string) {
  if (!isoLike) return "";
  if (isoLike.length >= 16) return isoLike.slice(11, 16);
  if (isoLike.length === 8) return isoLike.slice(0, 5);
  return isoLike.slice(0, 5);
}

export default function PatientDoctorDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    setDate(new Date().toISOString().slice(0, 10));
  }, []);

  const { data: doctor, error: doctorErr } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => fetchDoctorPublic(id),
    enabled: Number.isFinite(id),
  });

  const { data: avail } = useQuery({
    queryKey: ["doctor", id, "availability"],
    queryFn: () => fetchDoctorAvailabilityPublic(id),
    enabled: Number.isFinite(id),
  });

  const dateForSlots = useMemo(() => date, [date]);
  const { data: slots } = useQuery({
    queryKey: ["doctor", id, "slots", dateForSlots],
    queryFn: () => fetchDoctorSlots(id, dateForSlots),
    enabled: Number.isFinite(id) && dateForSlots.length === 10,
  });

  const queryClient = useQueryClient();

  const bookMut = useMutation({
    mutationFn: (slotId: number) =>
      bookAppointment({
        slotId,
        reason: reason.trim() ? reason.trim().slice(0, 500) : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      void queryClient.invalidateQueries({
        queryKey: ["doctor", id, "slots", dateForSlots],
      });
    },
  });

  /** Clear stale success/errors when browsing another day. */
  useEffect(() => {
    bookMut.reset();
  }, [date, bookMut]);

  if (!Number.isFinite(id)) {
    return (
      <Container className="py-16">
        <p className="text-destructive">Invalid doctor.</p>
      </Container>
    );
  }

  if (doctorErr) {
    return (
      <Container className="py-16">
        <p className="text-destructive">Doctor could not be loaded.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/patient/doctors">Back</Link>
        </Button>
      </Container>
    );
  }

  if (!doctor) {
    return (
      <Container className="py-16">
        <p className="text-muted-foreground">Loading…</p>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <Button asChild variant="ghost" className="-ml-4 mb-4">
        <Link href="/patient/doctors">← Back to results</Link>
      </Button>

      <div className="rounded-3xl border border-white/60 bg-white/80 p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-wrap gap-6">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted">
            {doctor.practitioner.profilePictureUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={doctor.practitioner.profilePictureUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-2xl font-bold text-muted-foreground">
                {doctor.practitioner.fullName.slice(0, 1)}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Specialist
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">
              Dr. {doctor.practitioner.fullName}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {doctor.specialization ?? "—"}
            </p>
            {doctor.consultationFee != null && (
              <p className="mt-3 text-lg font-semibold text-brand-800 dark:text-brand-300">
                Consultation fee: {Number(doctor.consultationFee).toFixed(2)} INR
              </p>
            )}
          </div>
        </div>

        {doctor.bio && (
          <p className="mt-8 text-sm leading-relaxed text-foreground/90">
            {doctor.bio}
          </p>
        )}

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Weekly availability</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {(avail ?? []).map((row: DoctorAvailabilityRuleDto) => (
              <li
                key={row.id}
                className="flex flex-wrap gap-2 rounded-xl border border-border/60 px-3 py-2"
              >
                <span className="font-medium">{row.dayOfWeek}</span>
                <span className="text-muted-foreground">
                  {padTime(row.startTime)} – {padTime(row.endTime)} · Slot{" "}
                  {row.slotDurationMinutes} min
                  {row.requiresApproval ? " · approval requested" : ""}
                </span>
              </li>
            ))}
          </ul>
          {avail && avail.length === 0 && (
            <p className="mt-4 text-sm text-muted-foreground">
              This doctor has not published hours yet.
            </p>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-dashed border-brand-200/70 bg-brand-50/40 p-6 dark:bg-brand-950/30">
          <h2 className="text-lg font-semibold">Book an appointment</h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Choose a date and reserve a slot. Some doctors approve each request
            before it is confirmed.
          </p>
          <div className="mt-4 max-w-xs space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="mt-6 max-w-md space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              placeholder="e.g. follow-up, symptoms"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          {bookMut.isSuccess && (
            <p className="mt-4 text-sm text-green-700 dark:text-green-400">
              Booked.{" "}
              <Link
                href="/patient/appointments"
                className="font-medium underline"
              >
                View your appointments
              </Link>
              .
            </p>
          )}
          {bookMut.isError && (
            <p className="mt-4 text-sm text-destructive">
              {unwrapApiErrorMessage(bookMut.error)}
            </p>
          )}
          <ul className="mt-6 flex flex-wrap gap-2">
            {(slots ?? []).map((s) => (
              <li key={s.id}>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-auto whitespace-normal px-3 py-2 text-left text-xs leading-snug"
                  disabled={bookMut.isPending}
                  onClick={() => bookMut.mutate(s.id)}
                >
                  {padTime(s.startTime)} – {padTime(s.endTime)}
                  {s.requiresApproval ? " • awaits approval" : " • confirmed"}
                  {bookMut.isPending && bookMut.variables === s.id ? " …" : ""}
                </Button>
              </li>
            ))}
          </ul>
          {(slots ?? []).length === 0 && date && (
            <p className="mt-4 text-sm text-muted-foreground">
              No openings on this day.
            </p>
          )}
        </section>

        <p className="mt-10 text-xs text-muted-foreground">
          Email: {doctor.practitioner.email}
          {doctor.phone ? ` · Phone: ${doctor.phone}` : ""}
        </p>
      </div>
    </Container>
  );
}
