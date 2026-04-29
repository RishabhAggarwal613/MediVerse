"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { AppPageShell } from "@/components/app/app-page-shell";
import { Container } from "@/components/ui/container";
import { fetchAiReport } from "@/lib/api/reports";
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

/** Read-only view when a patient has shared their scan with your doctor account. Deep-link: `/doctor/reports/[id]`. */
export default function DoctorSharedReportDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const q = useQuery({
    queryKey: ["ai", "reports", id],
    queryFn: () => fetchAiReport(id),
    enabled: Number.isFinite(id),
    staleTime: 10_000,
  });

  const data = q.data;
  const err = q.error ? unwrapApiErrorMessage(q.error) : null;

  return (
    <AppPageShell variant="doctor">
      <Container className="relative z-[1] py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link
          href="/doctor"
          className="text-sm font-medium text-muted-foreground hover:text-teal-700 dark:hover:text-teal-300"
        >
          ← Doctor home
        </Link>

        {q.isPending && <p className="text-sm text-muted-foreground">Loading shared report…</p>}
        {err && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
            {err}
          </p>
        )}

        {data && (
          <>
            <header>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Shared AI report · read-only
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
                  className="text-sm font-medium text-teal-800 underline-offset-4 hover:underline dark:text-teal-300"
                >
                  Download original attachment
                </a>
              </p>
            ) : null}

            <section className="surface-app p-6 shadow-md">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Summary
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{data.summary}</p>
            </section>

            {data.keyFindings.length > 0 && (
              <section className="surface-app p-6 shadow-md">
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

            <section className="surface-app p-6 shadow-md">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Recommendations
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                {data.recommendations}
              </p>
            </section>

            <p className="text-xs text-muted-foreground">
              For clinical decisions, rely on accredited lab results and formal documentation — AI
              output is adjunct only.
            </p>
          </>
        )}
      </div>
    </Container>
    </AppPageShell>
  );
}
