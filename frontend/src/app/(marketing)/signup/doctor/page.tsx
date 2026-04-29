import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { DoctorSignupForm } from "@/components/forms/doctor-signup-form";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Join as a Doctor · MediVerse",
};

export default function DoctorSignupPage() {
  return (
    <Container className="flex min-h-[80vh] flex-col items-center justify-center py-24">
      <div className="w-full max-w-2xl rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-brand-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
          Doctor signup
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Register as a healthcare provider
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Upload your license so we can verify your practice. You will receive
          full access after review.
        </p>
        <DoctorSignupForm />
        <div className="mt-8">
          <Button asChild variant="outline" className="w-full">
            <Link href="/signup">
              <ArrowLeft className="h-4 w-4" />
              Change role
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
