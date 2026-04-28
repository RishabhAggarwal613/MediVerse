import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Login · MediVerse",
  description: "Sign in to your MediVerse account.",
};

export default function LoginPage() {
  return (
    <Container className="flex min-h-[80vh] flex-col items-center justify-center py-24">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl shadow-brand-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
          Welcome back
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Sign in to MediVerse
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The login form arrives in <strong>Phase 3</strong>. For now, this
          page is a placeholder so the navigation flow works end-to-end.
        </p>

        <div className="mt-8 flex flex-col gap-2.5">
          <Button asChild>
            <Link href="/">
              Back to home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/signup">Don&apos;t have an account? Sign up</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
