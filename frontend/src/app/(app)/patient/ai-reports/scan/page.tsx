"use client";

import Link from "next/link";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { unwrapApiErrorMessage } from "@/lib/api/errors";
import { scanAiReport } from "@/lib/api/reports";

export default function PatientAiReportsScanPage() {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const mut = useMutation({
    mutationFn: (file: File) => scanAiReport(file),
    onSuccess: (detail) => {
      router.replace(`/patient/ai-reports/${detail.id}`);
    },
    onError: () => {},
  });

  function onPick() {
    inputRef.current?.click();
  }

  function onFile(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0];
    if (!f) return;
    mut.mutate(f);
    ev.target.value = "";
  }

  const errMsg = mut.error ? unwrapApiErrorMessage(mut.error) : null;

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-xl space-y-8">
        <Link
          href="/patient/ai-reports"
          className="text-sm font-medium text-muted-foreground hover:text-brand-700"
        >
          ← Back to history
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
            New scan
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Upload a report</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            JPEG, PNG, WebP, or PDF up to 25&nbsp;MB. MediVerse runs Gemini Vision analysis
            and stores results in your account — this is not medical advice.
          </p>
        </div>

        <div
          className="cursor-pointer rounded-3xl border border-dashed border-brand-300/80 bg-brand-50/50 p-10 text-center shadow-inner dark:border-brand-500/30 dark:bg-brand-950/20"
          onClick={() => !mut.isPending && onPick()}
          role="presentation"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf,.pdf"
            className="hidden"
            onChange={onFile}
          />
          {mut.isPending ? (
            <p className="text-sm font-medium">Analyzing with AI — hang tight…</p>
          ) : (
            <>
              <p className="text-sm font-semibold">Tap to choose a file</p>
              <p className="mt-2 text-xs text-muted-foreground">
                For best results use a clear scan or export.
              </p>
            </>
          )}
        </div>

        {errMsg ? (
          <p className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
            {errMsg}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onPick} disabled={mut.isPending}>
            Choose file
          </Button>
          <Button asChild variant="ghost">
            <Link href="/patient/ai-reports">Cancel</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
