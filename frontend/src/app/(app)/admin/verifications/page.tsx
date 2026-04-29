"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AppPageShell } from "@/components/app/app-page-shell";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiRequestError } from "@/lib/api/errors";
import {
  approveDoctor,
  fetchPendingDoctors,
  rejectDoctor,
} from "@/lib/api/admin";
import { dashboardPath } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

function fmtInstant(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function AdminVerificationsPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const backHref = user ? dashboardPath(user.role) : "/login";
  const [page] = useState(0);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const listQ = useQuery({
    queryKey: ["admin", "doctors", "pending", page],
    queryFn: () => fetchPendingDoctors(page, 20),
  });

  const approveM = useMutation({
    mutationFn: (doctorId: number) => approveDoctor(doctorId),
    onSuccess: () => {
      setActionMsg("Doctor approved.");
      void qc.invalidateQueries({ queryKey: ["admin", "doctors", "pending"] });
    },
    onError: (e: unknown) => {
      setActionMsg(
        e instanceof ApiRequestError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Approve failed",
      );
    },
  });

  const rejectM = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string | null }) =>
      rejectDoctor(id, reason),
    onSuccess: () => {
      setActionMsg("Doctor rejected.");
      setRejectingId(null);
      setRejectReason("");
      void qc.invalidateQueries({ queryKey: ["admin", "doctors", "pending"] });
    },
    onError: (e: unknown) => {
      setActionMsg(
        e instanceof ApiRequestError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Reject failed",
      );
    },
  });

  const forbidden =
    listQ.error instanceof ApiRequestError &&
    listQ.error.code === "FORBIDDEN";

  return (
    <AppPageShell variant="patient" className="pt-8">
      <Container className="relative z-[1] max-w-5xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Doctor verifications
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Review pending license submissions. Only emails in{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">ADMIN_EMAILS</code>{" "}
            can use this queue.
          </p>
        </header>

        {actionMsg && (
          <p
            className="mb-4 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm"
            role="status"
          >
            {actionMsg}
          </p>
        )}

        {listQ.isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading queue…
          </div>
        )}

        {forbidden && (
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-4 text-sm dark:border-amber-900/60 dark:bg-amber-950/40">
            <p className="font-medium text-amber-950 dark:text-amber-100">
              Access denied
            </p>
            <p className="mt-1 text-muted-foreground dark:text-amber-200/80">
              Your account is not on the admin allowlist, or the server has no
              admins configured. Ask a maintainer to add your email to{" "}
              <code className="rounded bg-black/5 px-1 dark:bg-white/10">
                ADMIN_EMAILS
              </code>
              .
            </p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href={backHref}>Back to app</Link>
            </Button>
          </div>
        )}

        {!forbidden && listQ.isError && !(listQ.error instanceof ApiRequestError) && (
          <p className="text-sm text-destructive">Could not load pending doctors.</p>
        )}

        {listQ.data && listQ.data.content.length === 0 && (
          <p className="rounded-2xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            No doctors waiting for verification.
          </p>
        )}

        {listQ.data && listQ.data.content.length > 0 && (
          <div className="space-y-4">
            {listQ.data.content.map((row) => (
              <div
                key={row.doctorId}
                className={cn(
                  "rounded-2xl border border-border/80 bg-card/60 p-5 shadow-sm backdrop-blur",
                  "dark:border-white/10 dark:bg-white/[0.04]",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold tracking-tight">{row.fullName}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{row.email}</p>
                    <dl className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                      <div>
                        <dt className="inline font-medium text-foreground">License</dt>{" "}
                        <dd className="inline">{row.licenseNumber}</dd>
                      </div>
                      <div>
                        <dt className="inline font-medium text-foreground">
                          Specialization
                        </dt>{" "}
                        <dd className="inline">
                          {row.specialization ?? "—"}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="inline font-medium text-foreground">Applied</dt>{" "}
                        <dd className="inline">{fmtInstant(row.createdAt)}</dd>
                      </div>
                    </dl>
                    {row.licenseDocumentUrl && (
                      <a
                        href={row.licenseDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-sm font-medium text-brand-700 underline-offset-4 hover:underline dark:text-brand-300"
                      >
                        View license document
                      </a>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                    <Button
                      size="sm"
                      className="rounded-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={approveM.isPending || rejectM.isPending}
                      onClick={() => {
                        setActionMsg(null);
                        approveM.mutate(row.doctorId);
                      }}
                    >
                      <Check className="mr-1.5 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10"
                      disabled={approveM.isPending || rejectM.isPending}
                      onClick={() => {
                        setActionMsg(null);
                        setRejectingId(
                          rejectingId === row.doctorId ? null : row.doctorId,
                        );
                        if (rejectingId === row.doctorId) setRejectReason("");
                      }}
                    >
                      <X className="mr-1.5 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>

                {rejectingId === row.doctorId && (
                  <div className="mt-4 border-t border-border pt-4">
                    <Label htmlFor={`reason-${row.doctorId}`} className="text-xs">
                      Reason (optional)
                    </Label>
                    <Input
                      id={`reason-${row.doctorId}`}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Short note emailed to the doctor"
                      className="mt-1.5"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="mt-3 rounded-full"
                      disabled={rejectM.isPending}
                      onClick={() => {
                        setActionMsg(null);
                        rejectM.mutate({
                          id: row.doctorId,
                          reason: rejectReason.trim() || null,
                        });
                      }}
                    >
                      Confirm rejection
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Container>
    </AppPageShell>
  );
}
