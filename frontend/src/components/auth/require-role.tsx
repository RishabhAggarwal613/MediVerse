"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useEnsureUser } from "@/hooks/use-ensure-user";
import { dashboardPath } from "@/lib/nav";
import type { Role } from "@/types/api";
import { useAuthStore } from "@/stores/auth-store";

export function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  useEnsureUser();

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }
    if (user && user.role !== role) {
      router.replace(dashboardPath(user.role));
    }
  }, [accessToken, user, role, router]);

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

  if (user.role !== role) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Redirecting…
      </div>
    );
  }

  return <>{children}</>;
}
