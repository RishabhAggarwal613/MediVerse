import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Forgot password · MediVerse",
};

export default function ForgotPasswordPage() {
  return (
    <Container className="flex min-h-[80vh] flex-col items-center justify-center py-24">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-brand-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
          Reset access
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Forgot your password?
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send a reset link if an account exists.
        </p>
        <ForgotPasswordForm />
      </div>
    </Container>
  );
}
