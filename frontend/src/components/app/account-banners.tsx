"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { MailWarning, ShieldAlert, ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { resendVerificationEmail } from "@/lib/api/auth";
import { fetchMyDoctorProfile } from "@/lib/api/doctors";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function PatientEmailBanner() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const resend = useMutation({
    mutationFn: () => resendVerificationEmail(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["users", "me", "onboarding"] });
    },
  });

  if (!user || user.emailVerified) return null;

  return (
    <div className="border-b border-amber-200/80 bg-amber-50/95 dark:border-amber-900/50 dark:bg-amber-950/50">
      <Container className="flex max-w-[1400px] flex-wrap items-center gap-3 py-2.5 text-sm">
        <MailWarning className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
        <p className="min-w-0 flex-1 text-amber-950 dark:text-amber-100">
          Confirm your email to secure your account — check your inbox for the verification link.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full border-amber-300/90 dark:border-amber-700"
            disabled={resend.isPending}
            onClick={() => resend.mutate()}
          >
            {resend.isPending ? "Sending…" : "Resend email"}
          </Button>
          <Button asChild size="sm" variant="ghost" className="rounded-full">
            <Link href="/verify-email">I have a link</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}

export function DoctorVerificationBanner() {
  const q = useQuery({
    queryKey: ["doctors", "me", "profile"],
    queryFn: () => fetchMyDoctorProfile(),
    staleTime: 60_000,
  });

  const status = q.data?.verificationStatus;

  if (q.isPending || status == null || status === "APPROVED") return null;

  const isRejected = status === "REJECTED";

  return (
    <div
      className={cn(
        "border-b dark:border-opacity-80",
        isRejected
          ? "border-red-200/90 bg-red-50/95 dark:border-red-900/60 dark:bg-red-950/45"
          : "border-sky-200/80 bg-sky-50/95 dark:border-sky-900/55 dark:bg-sky-950/40",
      )}
    >
      <Container className="flex max-w-[1400px] flex-wrap items-start gap-3 py-3 text-sm">
        {isRejected ? (
          <ShieldOff className="mt-0.5 h-4 w-4 shrink-0 text-red-700 dark:text-red-400" />
        ) : (
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-sky-800 dark:text-sky-300" />
        )}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-medium",
              isRejected
                ? "text-red-950 dark:text-red-100"
                : "text-sky-950 dark:text-sky-100",
            )}
          >
            {isRejected
              ? "Your practitioner application was not approved."
              : "Your license is under review."}
          </p>
          <p
            className={cn(
              "mt-1 text-muted-foreground",
              isRejected
                ? "dark:text-red-200/85"
                : "dark:text-sky-200/90",
            )}
          >
            {isRejected
              ? "You can update your profile if you believe this was a mistake."
              : "Patients will see you once an administrator approves your documents."}
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="shrink-0 rounded-full">
          <Link href="/doctor/profile">Profile</Link>
        </Button>
      </Container>
    </div>
  );
}
