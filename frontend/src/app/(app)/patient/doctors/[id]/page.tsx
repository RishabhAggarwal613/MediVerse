"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppPageShell } from "@/components/app/app-page-shell";
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
import { getBookingHorizonDays } from "@/lib/env";
import { googleMapsDirectionsUrl } from "@/lib/maps-links";
import { localDateInputValue } from "@/lib/date";
import type { AppointmentDto } from "@/types/appointments";
import type {
  ConsultationMode,
  DoctorAvailabilityRuleDto,
  TimeSlotItemDto,
} from "@/types/doctors";

/** Patient browse tab — flexible slots load with both filters. */
type VisitTypeFilter = "IN_CLINIC" | "VIDEO";

function padTime(isoLike: string) {
  if (!isoLike) return "";
  if (isoLike.length >= 16) return isoLike.slice(11, 16);
  if (isoLike.length === 8) return isoLike.slice(0, 5);
  return isoLike.slice(0, 5);
}

function addDaysIso(yyyyMmDd: string, days: number): string {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + days);
  return localDateInputValue(dt);
}

function formatLongWeekday(dateYmd: string) {
  const [y, m, d] = dateYmd.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(dt);
}

function bookingModeLabel(slot: Pick<TimeSlotItemDto, "requiresApproval">) {
  return slot.requiresApproval ? "Doctor review required" : "Instant confirmation";
}

function visitTypeShort(mode: ConsultationMode) {
  if (mode === "VIDEO") return "Video";
  return "In-clinic";
}

function BookingConfirmDialog({
  open,
  doctorName,
  feeLabel,
  slot,
  reasonTrimmed,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  doctorName: string;
  feeLabel: string | null;
  slot: TimeSlotItemDto | null;
  reasonTrimmed: string | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !slot) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-[1] w-full max-w-md rounded-2xl border border-border/80 bg-background p-6 shadow-xl">
        <h2 id="book-dialog-title" className="text-lg font-semibold">
          Confirm this appointment?
        </h2>
        <p className="mt-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{doctorName}</span>
          {feeLabel ? <span>{feeLabel}</span> : null}
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <span className="text-muted-foreground">Date</span>:{" "}
            {formatLongWeekday(slot.slotDate)}
          </li>
          <li>
            <span className="text-muted-foreground">Time</span>:{" "}
            {padTime(slot.startTime)} – {padTime(slot.endTime)}
          </li>
          <li>
            <span className="text-muted-foreground">Booking</span>:{" "}
            {bookingModeLabel(slot)}
          </li>
          <li>
            <span className="text-muted-foreground">Visit type</span>:{" "}
            {visitTypeShort(slot.consultationMode)}
          </li>
          {reasonTrimmed ? (
            <li>
              <span className="text-muted-foreground">Reason</span>: {reasonTrimmed}
            </li>
          ) : null}
        </ul>
        {slot.requiresApproval ? (
          <p className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
            The doctor will need to approve this request. You’ll see it as{" "}
            <strong>pending</strong> until then.
          </p>
        ) : (
          <p className="mt-4 rounded-lg border border-emerald-200/80 bg-emerald-50/90 px-3 py-2 text-xs text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100">
            This slot is held for you right away — no extra step from the doctor.
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" disabled={loading} onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={loading} onClick={onConfirm}>
            {loading ? "Booking…" : "Confirm booking"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PatientDoctorDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const bookingHorizon = getBookingHorizonDays();
  const today = localDateInputValue();
  const lastBookableDay = useMemo(() => addDaysIso(today, bookingHorizon), [today, bookingHorizon]);

  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [pickedSlot, setPickedSlot] = useState<TimeSlotItemDto | null>(null);
  const [bookingMode, setBookingMode] = useState<VisitTypeFilter>("IN_CLINIC");

  useEffect(() => {
    setDate(localDateInputValue());
  }, []);

  const { data: doctor, error: doctorErr } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => fetchDoctorPublic(id),
    enabled: Number.isFinite(id),
  });

  useEffect(() => {
    if (!doctor) return;
    if (doctor.offersInClinic && !doctor.offersVideo) {
      setBookingMode("IN_CLINIC");
    } else if (!doctor.offersInClinic && doctor.offersVideo) {
      setBookingMode("VIDEO");
    } else {
      setBookingMode("IN_CLINIC");
    }
  }, [doctor]);

  const { data: avail } = useQuery({
    queryKey: ["doctor", id, "availability"],
    queryFn: () => fetchDoctorAvailabilityPublic(id),
    enabled: Number.isFinite(id),
  });

  const dateForSlots = useMemo(() => date, [date]);
  const {
    data: slots,
    isFetching: slotsFetching,
  } = useQuery({
    queryKey: ["doctor", id, "slots", dateForSlots, bookingMode],
    queryFn: () => fetchDoctorSlots(id, dateForSlots, bookingMode),
    enabled:
      Number.isFinite(id) && dateForSlots.length === 10 && dateForSlots >= today && dateForSlots <= lastBookableDay,
  });

  const queryClient = useQueryClient();

  const closeDialog = useCallback(() => setPickedSlot(null), []);

  const bookMut = useMutation<
    AppointmentDto,
    unknown,
    { slotId: number; reason?: string; consultationMode: VisitTypeFilter },
    unknown
  >({
    mutationFn: ({
      slotId,
      reason: r,
      consultationMode: cm,
    }: {
      slotId: number;
      reason?: string;
      consultationMode: VisitTypeFilter;
    }) => bookAppointment({ slotId, reason: r, consultationMode: cm }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["appointments"] });
      void queryClient.invalidateQueries({ queryKey: ["doctor", id, "slots"] });
      setPickedSlot(null);
    },
  });

  const bookMutRef = useRef(bookMut);
  bookMutRef.current = bookMut;

  useEffect(() => {
    setPickedSlot(null);
    bookMutRef.current.reset();
  }, [date, id, bookingMode]);

  const reasonTrimmed = reason.trim().slice(0, 500) || null;

  const successBody = useMemo(() => {
    if (!bookMut.isSuccess || !bookMut.data) return null;
    const st = bookMut.data.status;
    if (st === "CONFIRMED") {
      return (
        <span>
          Your appointment is <strong>confirmed</strong>.{" "}
          <Link href="/patient/appointments" className="font-medium underline">
            View your appointments
          </Link>
          .
        </span>
      );
    }
    if (st === "PENDING") {
      return (
        <span>
          Request sent — waiting for the doctor to <strong>approve</strong>.{" "}
          <Link href="/patient/appointments" className="font-medium underline">
            Track it here
          </Link>
          .
        </span>
      );
    }
    return (
      <span>
        Booking saved ({st}).{" "}
        <Link href="/patient/appointments" className="font-medium underline">
          Appointments
        </Link>
        .
      </span>
    );
  }, [bookMut.isSuccess, bookMut.data]);

  if (!Number.isFinite(id)) {
    return (
      <AppPageShell variant="patient">
        <Container className="relative z-[1] py-16">
          <p className="text-destructive">Invalid doctor.</p>
        </Container>
      </AppPageShell>
    );
  }

  if (doctorErr) {
    return (
      <AppPageShell variant="patient">
        <Container className="relative z-[1] py-16">
          <p className="text-destructive">Doctor could not be loaded.</p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/patient/doctors">Back</Link>
          </Button>
        </Container>
      </AppPageShell>
    );
  }

  if (!doctor) {
    return (
      <AppPageShell variant="patient">
        <Container className="relative z-[1] py-16">
          <p className="text-muted-foreground">Loading…</p>
        </Container>
      </AppPageShell>
    );
  }

  const directionsUrl = googleMapsDirectionsUrl({
    latitude: doctor.practiceLatitude,
    longitude: doctor.practiceLongitude,
    address: doctor.practiceAddressFormatted,
  });

  return (
    <AppPageShell variant="patient">
      <BookingConfirmDialog
        open={pickedSlot !== null}
        doctorName={`Dr. ${doctor.practitioner.fullName}`}
        feeLabel={doctor.consultationFee != null ? ` · Fee ${Number(doctor.consultationFee).toFixed(2)} INR` : null}
        slot={pickedSlot}
        reasonTrimmed={reasonTrimmed}
        loading={bookMut.isPending}
        onClose={closeDialog}
        onConfirm={() => {
          if (!pickedSlot) return;
          bookMut.mutate({
            slotId: pickedSlot.id,
            reason: reasonTrimmed ?? undefined,
            consultationMode: pickedSlot.consultationMode,
          });
        }}
      />

      <Container className="relative z-[1] max-w-5xl py-10">
        <Button asChild variant="ghost" className="-ml-4 mb-4">
          <Link href="/patient/doctors">← Back to results</Link>
        </Button>

        <div className="surface-app p-8">
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
              <h1 className="mt-1 bg-gradient-to-r from-brand-800 via-teal-800 to-emerald-800 bg-clip-text text-3xl font-bold tracking-tight text-transparent dark:from-brand-200 dark:via-teal-200 dark:to-brand-300">
                Dr. {doctor.practitioner.fullName}
              </h1>
              <p className="mt-2 text-muted-foreground">{doctor.specialization ?? "—"}</p>
              {(doctor.practiceCity || doctor.languages) && (
                <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {doctor.practiceCity && <li>Practice: {doctor.practiceCity}</li>}
                  {doctor.languages && <li>Languages: {doctor.languages}</li>}
                </ul>
              )}
              {doctor.consultationFee != null && (
                <p className="mt-3 text-lg font-semibold text-brand-800 dark:text-brand-300">
                  Consultation fee: {Number(doctor.consultationFee).toFixed(2)} INR
                </p>
              )}
            </div>
          </div>

          {doctor.qualifications && (
            <p className="mt-6 text-sm">
              <span className="font-semibold text-foreground">Qualifications:</span>{" "}
              <span className="text-muted-foreground">{doctor.qualifications}</span>
            </p>
          )}

          {doctor.bio && (
            <p className="mt-8 text-sm leading-relaxed text-foreground/90">{doctor.bio}</p>
          )}

          {directionsUrl && doctor.offersInClinic && (
            <section className="mt-8 rounded-2xl border border-teal-200/50 bg-teal-50/50 p-5 dark:border-teal-900/40 dark:bg-teal-950/25">
              <h2 className="text-lg font-semibold">Practice location</h2>
              {doctor.practiceAddressFormatted && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
                  {doctor.practiceAddressFormatted}
                </p>
              )}
              <div className="mt-4">
                <Button asChild variant="default" className="rounded-full bg-gradient-to-r from-teal-600 to-sky-600">
                  <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                    Open in Google Maps
                  </a>
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Starts directions in a new tab using Google Maps (no MediVerse tracking).
              </p>
            </section>
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
                    <span className="mr-1 font-medium text-foreground/80">
                      ({visitTypeShort(row.consultationMode)})
                    </span>
                    {padTime(row.startTime)} – {padTime(row.endTime)} · Slot {row.slotDurationMinutes}{" "}
                    min
                    {row.requiresApproval ? (
                      <span className="text-amber-800 dark:text-amber-200">
                        {" "}
                        · doctor approves requests
                      </span>
                    ) : (
                      <span className="text-emerald-800 dark:text-emerald-200">
                        {" "}
                        · confirms automatically
                      </span>
                    )}
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
            <p className="mt-2 text-sm text-muted-foreground">
              Pick a date within the next{" "}
              <span className="font-medium text-foreground">{bookingHorizon} days</span>, choose an open
              time, then confirm. Each time slot shows whether the doctor confirms instantly or reviews
              your request first.
            </p>
            <div className="mt-4 grid gap-4 sm:max-w-xl sm:grid-cols-2">
              {doctor.offersInClinic && doctor.offersVideo ? (
                <div className="space-y-2 sm:col-span-2">
                  <Label>Visit type</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant={bookingMode === "IN_CLINIC" ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setBookingMode("IN_CLINIC")}
                    >
                      In-clinic
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={bookingMode === "VIDEO" ? "default" : "outline"}
                      className="rounded-full"
                      onClick={() => setBookingMode("VIDEO")}
                    >
                      Video
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Open times below are only for the selected visit type.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  {doctor.offersVideo && !doctor.offersInClinic
                    ? "This doctor offers video consultations only."
                    : "This doctor offers in-clinic visits only."}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  min={today}
                  max={lastBookableDay}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="rounded-xl border-border bg-background text-foreground dark:border-white/15 dark:bg-white/[0.08]"
                />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Input
                  id="reason"
                  placeholder="e.g. follow-up, symptoms"
                  value={reason}
                  maxLength={500}
                  onChange={(e) => setReason(e.target.value)}
                  className="rounded-xl border-border bg-background text-foreground dark:border-white/15 dark:bg-white/[0.08]"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1 dark:border-emerald-900/50 dark:bg-emerald-950/40">
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                Instant confirmation
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/80 px-2.5 py-1 dark:border-amber-900/50 dark:bg-amber-950/40">
                <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                Doctor reviews first
              </span>
            </div>

            {bookMut.isSuccess && (
              <p className="mt-4 text-sm text-green-700 dark:text-green-400">{successBody}</p>
            )}
            {bookMut.isError && (
              <p className="mt-4 text-sm text-destructive">{unwrapApiErrorMessage(bookMut.error)}</p>
            )}

            {date && date < today && (
              <p className="mt-4 text-sm text-destructive">Choose today or a future date.</p>
            )}
            {date && date > lastBookableDay && (
              <p className="mt-4 text-sm text-destructive">
                Bookings are limited to the next {bookingHorizon} days — pick an earlier date.
              </p>
            )}

            <div className="mt-6">
              {slotsFetching && !(slots ?? []).length ? (
                <p className="mb-3 text-xs text-muted-foreground">Loading open times…</p>
              ) : slotsFetching ? (
                <p className="mb-3 text-xs text-muted-foreground">Refreshing…</p>
              ) : null}
              <ul className="flex flex-wrap gap-2">
                {(slots ?? []).map((s) => (
                  <li key={s.id}>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className={
                        s.requiresApproval
                          ? "h-auto border-amber-200/80 bg-amber-50/90 whitespace-normal px-3 py-2 text-left text-xs leading-snug dark:border-amber-900/50 dark:bg-amber-950/35"
                          : "h-auto border-emerald-200/80 bg-emerald-50/90 whitespace-normal px-3 py-2 text-left text-xs leading-snug dark:border-emerald-900/50 dark:bg-emerald-950/35"
                      }
                      disabled={bookMut.isPending}
                      onClick={() => setPickedSlot(s)}
                    >
                      <span className="block font-medium text-foreground">
                        {padTime(s.startTime)} – {padTime(s.endTime)}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {bookingModeLabel(s)}
                      </span>
                    </Button>
                  </li>
                ))}
              </ul>
              {(slots ?? []).length === 0 &&
                date &&
                date.length === 10 &&
                date >= today &&
                date <= lastBookableDay &&
                !slotsFetching && (
                  <p className="mt-4 text-sm text-muted-foreground">No openings left on this day.</p>
                )}
            </div>
          </section>

          <p className="mt-10 text-xs text-muted-foreground">
            Email: {doctor.practitioner.email}
            {doctor.phone ? ` · Phone: ${doctor.phone}` : ""}
          </p>
        </div>
      </Container>
    </AppPageShell>
  );
}
