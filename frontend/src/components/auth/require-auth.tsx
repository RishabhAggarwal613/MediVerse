"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useEnsureUser } from "@/hooks/use-ensure-user";
import { useAuthStore } from "@/stores/auth-store";

/** Any authenticated user (used for admin allowlist pages). */
export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  useEnsureUser();

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
    }
  }, [accessToken, router]);

  if (!accessToken) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Redirecting…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
