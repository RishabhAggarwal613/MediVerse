"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { dashboardPath } from "@/lib/nav";
import { useAuthStore } from "@/stores/auth-store";

function isAuthMarketingPath(pathname: string): boolean {
  if (pathname === "/login") return true;
  if (pathname === "/signup" || pathname.startsWith("/signup/")) return true;
  if (pathname === "/forgot-password") return true;
  return false;
}

/**
 * Phase 3: when session + user exist, visiting login/signup/forgot redirects to role dashboard.
 */
export function RedirectIfAuthenticated() {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!token || !user) return;
    if (!isAuthMarketingPath(pathname)) return;
    router.replace(dashboardPath(user.role));
  }, [pathname, router, token, user]);

  return null;
}
