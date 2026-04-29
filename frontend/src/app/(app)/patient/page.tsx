import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function PatientHomePage() {
  return (
    <Container className="py-24">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
              Patient
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              Your dashboard
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Bookings, reports, and AI tools will land in later phases. You are
              signed in.
            </p>
            <div className="mt-6">
              <Button asChild variant="outline" size="sm">
                <Link href="/patient/doctors">Find doctors</Link>
              </Button>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </Container>
  );
}
