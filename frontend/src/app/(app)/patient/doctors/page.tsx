"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Stethoscope } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { AppPageShell } from "@/components/app/app-page-shell";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { fetchSpecializations, searchDoctors } from "@/lib/api/doctors";
import type { DoctorSummaryDto } from "@/types/doctors";

/** Input + native select: readable in light and dark using semantic tokens. */
const FIND_DOCTOR_FIELD =
  "flex h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground shadow-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-brand-500/40 dark:border-white/15 dark:bg-white/[0.08]";

function DoctorCard({ d }: { d: DoctorSummaryDto }) {
  return (
    <Link
      href={`/patient/doctors/${d.doctorId}`}
      className={cn(
        "group flex gap-4 rounded-3xl border border-white/65 bg-white/85 p-5 shadow-xl shadow-brand-500/5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg",
        "dark:border-white/10 dark:bg-white/[0.06]",
      )}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border/40 bg-muted">
        {d.profilePictureUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={d.profilePictureUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-medium text-muted-foreground">
            {d.fullName.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground group-hover:text-brand-700 dark:group-hover:text-brand-300">
          Dr. {d.fullName}
        </p>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {d.specialization ?? "General practice"}
        </p>
        {d.consultationFee != null && (
          <p className="mt-2 text-xs font-medium text-brand-700 dark:text-brand-400">
            From {Number(d.consultationFee).toFixed(0)} INR
          </p>
        )}
        {d.availabilitySummary != null && d.availabilitySummary !== "" && (
          <p className="mt-2 line-clamp-2 text-xs leading-snug text-muted-foreground">
            {d.availabilitySummary}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function PatientDoctorsPage() {
  const [q, setQ] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [page, setPage] = useState(0);

  const { data: specs } = useQuery({
    queryKey: ["specializations"],
    queryFn: fetchSpecializations,
  });

  const query = useMemo(
    () => ({
      q: q.trim() || undefined,
      specialization: specialization.trim() || undefined,
      page,
      size: 12,
    }),
    [q, specialization, page],
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["doctors", "search", query],
    queryFn: () => searchDoctors(query),
  });

  const list = data?.content ?? [];

  return (
    <AppPageShell variant="patient">
      <Container className="relative z-[1] max-w-6xl">
        <AppPageHeader
          role="patient"
          pill="Find care"
          icon={Stethoscope}
          title="Find a doctor"
          description="Browse verified MediVerse practitioners by name or specialty, open a profile, and book from their live availability."
        />

        <div className="surface-app mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="q">Search</Label>
            <Input
              id="q"
              className={FIND_DOCTOR_FIELD}
              placeholder="Name or specialization"
              value={q}
              onChange={(e) => {
                setPage(0);
                setQ(e.target.value);
              }}
            />
          </div>
          <div className="w-full space-y-2 sm:max-w-xs">
            <Label htmlFor="spec">Specialization</Label>
            <select
              id="spec"
              className={FIND_DOCTOR_FIELD}
              value={specialization}
              onChange={(e) => {
                setPage(0);
                setSpecialization(e.target.value);
              }}
            >
              <option value="">Any</option>
              {specs?.map((s) => (
                <option key={s.code} value={s.label}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            Could not load doctors. Ensure you are logged in as a patient.
          </p>
        )}

        {isLoading && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-3xl border border-white/40 bg-muted/40 dark:bg-white/[0.04]"
              />
            ))}
          </div>
        )}

        {!isLoading && !error && list.length === 0 && (
          <p className="mt-10 rounded-3xl border border-dashed border-brand-300/45 bg-brand-50/40 px-6 py-10 text-center text-sm text-muted-foreground dark:border-brand-800/70 dark:bg-brand-950/25">
            No verified doctors match your filters yet.
          </p>
        )}

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => (
            <li key={d.doctorId}>
              <DoctorCard d={d} />
            </li>
          ))}
        </ul>

        {data && data.totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </Container>
    </AppPageShell>
  );
}
