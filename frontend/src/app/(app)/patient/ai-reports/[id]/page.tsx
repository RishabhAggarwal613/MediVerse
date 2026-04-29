"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  deleteAiReport,
  fetchAiReport,
  shareAiReport,
  unshareAiReport,
} from "@/lib/api/reports";
import { searchDoctors } from "@/lib/api/doctors";
import { unwrapApiErrorMessage } from "@/lib/api/errors";

function fmt(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function PatientAiReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const id = Number(params.id);
  const [doctorToShare, setDoctorToShare] = React.useState<string>("");

  const q = useQuery({
    queryKey: ["ai", "reports", id],
    queryFn: () => fetchAiReport(id),
    enabled: Number.isFinite(id),
    staleTime: 10_000,
  });

  const doctorsQ = useQuery({
    queryKey: ["doctors", "share-pick"],
    queryFn: () => searchDoctors({ page: 0, size: 50 }),
    enabled: q.data?.mayManage === true,
    staleTime: 60_000,
  });

  const shareMut = useMutation({
    mutationFn: (doctorId: number) => shareAiReport(id, doctorId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["ai", "reports", id] });
      void qc.invalidateQueries({ queryKey: ["ai", "reports"] });
    },
  });

  const unshareMut = useMutation({
    mutationFn: () => unshareAiReport(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["ai", "reports", id] });
      void qc.invalidateQueries({ queryKey: ["ai", "reports"] });
    },
  });

  const delMut = useMutation({
    mutationFn: () => deleteAiReport(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["ai", "reports"] });
      router.replace("/patient/ai-reports");
    },
  });

  const data = q.data;
  const err = q.error ? unwrapApiErrorMessage(q.error) : null;

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/patient/ai-reports"
          className="text-sm font-medium text-muted-foreground hover:text-brand-700"
        >
          ← All reports
        </Link>

        {q.isPending && <p className="text-sm text-muted-foreground">Loading…</p>}
        {err && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
            {err}
          </p>
        )}

        {data && (
          <>
            <header>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
                Report
              </p>
              <h1 className="mt-2 break-all text-2xl font-bold tracking-tight">
                {data.originalFilename}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">{fmt(data.createdAt)}</p>
            </header>

            {data.fileDownloadUrl ? (
              <p>
                <a
                  href={data.fileDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-brand-700 underline-offset-4 hover:underline dark:text-brand-300"
                >
                  Open original file
                </a>
              </p>
            ) : null}

            <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Summary
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{data.summary}</p>
            </section>

            {data.keyFindings.length > 0 && (
              <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Key findings
                </h2>
                <ul className="mt-3 space-y-3">
                  {data.keyFindings.map((f, idx) => (
                    <li
                      key={`${f.label}-${idx}`}
                      className="rounded-2xl border border-border/50 bg-background/80 px-4 py-3"
                    >
                      <p className="font-medium">{f.label || "Finding"}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {[f.value, f.unit].filter(Boolean).join(" ")}{" "}
                        {f.refRange ? `(ref ${f.refRange})` : ""}{" "}
                        {f.flag ? (
                          <span className="font-medium text-amber-700 dark:text-amber-400">
                            {f.flag}
                          </span>
                        ) : null}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Recommendations
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                {data.recommendations}
              </p>
            </section>

            {data.mayManage && (
              <section className="space-y-4 rounded-3xl border border-dashed border-brand-300/50 bg-brand-50/40 p-6 dark:bg-brand-950/25">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Sharing
                </h2>
                {data.sharedDoctorName ? (
                  <p className="text-sm">
                    Shared read-only with <strong>{data.sharedDoctorName}</strong>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Not shared yet. Verified doctors listed on MediVerse can be selected below.
                  </p>
                )}

                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex min-w-[220px] flex-1 flex-col gap-1">
                    <label htmlFor="doc-pick" className="text-xs text-muted-foreground">
                      Verified doctor
                    </label>
                    <select
                      id="doc-pick"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm dark:bg-background/70"
                      value={doctorToShare}
                      onChange={(e) => setDoctorToShare(e.target.value)}
                    >
                      <option value="">Select…</option>
                      {(doctorsQ.data?.content ?? []).map((d) => (
                        <option key={d.doctorId} value={String(d.doctorId)}>
                          {d.fullName}
                          {d.specialization ? ` — ${d.specialization}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    disabled={
                      shareMut.isPending || !doctorToShare || unshareMut.isPending || delMut.isPending
                    }
                    onClick={() => shareMut.mutate(Number(doctorToShare))}
                  >
                    {data.sharedDoctorId ? "Change share" : "Share"}
                  </Button>
                  {data.sharedDoctorId ? (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={unshareMut.isPending || shareMut.isPending}
                      onClick={() => unshareMut.mutate()}
                    >
                      Revoke sharing
                    </Button>
                  ) : null}
                </div>
                {(shareMut.error || unshareMut.error) && (
                  <p className="text-sm text-destructive">
                    {unwrapApiErrorMessage(shareMut.error ?? unshareMut.error!)}
                  </p>
                )}

                <div className="border-t border-border/40 pt-4">
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={delMut.isPending || shareMut.isPending || unshareMut.isPending}
                    onClick={() => {
                      if (globalThis.confirm("Delete this report forever?")) {
                        delMut.mutate();
                      }
                    }}
                  >
                    Delete report
                  </Button>
                  {delMut.error && (
                    <p className="mt-2 text-sm text-destructive">
                      {unwrapApiErrorMessage(delMut.error)}
                    </p>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Container>
  );
}
