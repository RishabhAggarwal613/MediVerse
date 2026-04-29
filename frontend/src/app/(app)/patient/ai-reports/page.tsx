"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { fetchAiReports } from "@/lib/api/reports";

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

export default function PatientAiReportsPage() {
  const q = useQuery({
    queryKey: ["ai", "reports"],
    queryFn: () => fetchAiReports(),
    staleTime: 15_000,
  });

  const rows = q.data ?? [];

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
              AI reports
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Lab report scans
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Upload PDF or images of lab work for a plain-language summary and key
              findings — always confirm results with your clinician.
            </p>
          </div>
          <Button asChild>
            <Link href="/patient/ai-reports/scan">New scan</Link>
          </Button>
        </div>

        {q.isPending && (
          <p className="text-sm text-muted-foreground">Loading history…</p>
        )}
        {q.isError && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
            {(q.error as Error)?.message ?? "Could not load reports."}
          </p>
        )}
        {!q.isPending && !q.isError && rows.length === 0 && (
          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-sm text-muted-foreground">
              No scans yet. Upload your first report to see AI-assisted insights here.
            </p>
            <Button asChild className="mt-6">
              <Link href="/patient/ai-reports/scan">Scan a report</Link>
            </Button>
          </div>
        )}

        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/patient/ai-reports/${r.id}`}
                className="flex flex-col gap-1 rounded-2xl border border-white/60 bg-white/80 px-5 py-4 shadow-sm backdrop-blur-xl transition hover:bg-brand-50/80 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-brand-950/40 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p className="font-medium">{r.originalFilename}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {r.summarySnippet}
                  </p>
                  {r.sharedDoctorName ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Shared with {r.sharedDoctorName}
                    </p>
                  ) : null}
                </div>
                <p className="mt-2 shrink-0 text-xs text-muted-foreground sm:mt-0">
                  {fmt(r.createdAt)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  );
}
