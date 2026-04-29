"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FileSearch } from "lucide-react";

import { AppPageHeader } from "@/components/app/app-page-header";
import { AppPageShell } from "@/components/app/app-page-shell";
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
    <AppPageShell variant="patient">
      <Container className="relative z-[1] py-10">
        <div className="mx-auto max-w-3xl space-y-8">
          <AppPageHeader
            role="patient"
            pill="Reports"
            icon={FileSearch}
            title="Lab report scans"
            description="Upload PDF or images of lab work for a plain-language summary and key findings — always confirm results with your clinician."
            actions={
              <Button asChild className="rounded-full bg-brand-gradient hover:opacity-95">
                <Link href="/patient/ai-reports/scan">New scan</Link>
              </Button>
            }
          />

          {q.isPending && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-3xl border border-white/40 bg-muted/50" />
              ))}
            </div>
          )}
          {q.isError && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {(q.error as Error)?.message ?? "Could not load reports."}
            </p>
          )}
          {!q.isPending && !q.isError && rows.length === 0 && (
            <div className="surface-app p-8">
              <p className="text-sm text-muted-foreground">
                No scans yet. Upload your first report to see AI-assisted insights here.
              </p>
              <Button asChild className="mt-6 rounded-full">
                <Link href="/patient/ai-reports/scan">Scan a report</Link>
              </Button>
            </div>
          )}

          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/patient/ai-reports/${r.id}`}
                  className="surface-app flex flex-col gap-1 px-5 py-4 transition hover:border-brand-200/80 hover:shadow-brand-500/10 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{r.originalFilename}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{r.summarySnippet}</p>
                    {r.sharedDoctorName ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Shared with {r.sharedDoctorName}
                      </p>
                    ) : null}
                  </div>
                  <p className="mt-2 shrink-0 text-xs text-muted-foreground sm:mt-0">{fmt(r.createdAt)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </AppPageShell>
  );
}
