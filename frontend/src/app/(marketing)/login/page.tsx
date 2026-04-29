import Link from "next/link";
import type { Metadata } from "next";

import { LoginForm } from "@/components/forms/login-form";
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
          Use email and password or continue with Google.
        </p>
        <LoginForm />
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-brand-700 hover:underline dark:text-brand-300"
          >
            Sign up
          </Link>
        </p>
      </div>
    </Container>
  );
}
