"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchSpecializations, searchDoctors } from "@/lib/api/doctors";
import type { DoctorSummaryDto } from "@/types/doctors";

function DoctorCard({ d }: { d: DoctorSummaryDto }) {
  return (
    <Link
      href={`/patient/doctors/${d.doctorId}`}
      className="group flex gap-4 rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04]"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
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
    <Container className="py-10">
      <h1 className="text-2xl font-bold tracking-tight">Find a doctor</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Search verified specialists. Appointment booking arrives in Phase 5.
      </p>

      <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 p-6 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
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
            className="flex h-11 w-full rounded-2xl border border-border/80 bg-white/80 px-3 text-sm dark:bg-white/[0.06]"
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
        <p className="mt-6 text-sm text-destructive">
          Could not load doctors. Ensure you are logged in as a patient.
        </p>
      )}

      {isLoading && (
        <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
      )}

      {!isLoading && !error && list.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">
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
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={data.last}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </Container>
  );
}
