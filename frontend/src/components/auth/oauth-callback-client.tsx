"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Container } from "@/components/ui/container";
import { fetchCurrentUser } from "@/lib/api/auth";
import { dashboardPath } from "@/lib/nav";
import { useAuthStore } from "@/stores/auth-store";

function OAuthCallbackInner() {
  const router = useRouter();
  const search = useSearchParams();
  const setOAuthTokens = useAuthStore((s) => s.setOAuthTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const err = search.get("error");
    if (err) {
      setMessage(`Google sign-in could not complete (${err}).`);
      clearSession();
      const t = setTimeout(() => router.replace("/login"), 2200);
      return () => clearTimeout(t);
    }

    const token = search.get("token");
    const refresh = search.get("refresh");
    const expiresAt = search.get("expires_at");
    if (!token || !refresh || !expiresAt) {
      setMessage("Missing authentication parameters.");
      clearSession();
      const t = setTimeout(() => router.replace("/login"), 1800);
      return () => clearTimeout(t);
    }

    let cancelled = false;
    void (async () => {
      setOAuthTokens({
        accessToken: token,
        refreshToken: refresh,
        accessTokenExpiresAt: expiresAt,
      });
      try {
        const user = await fetchCurrentUser();
        if (cancelled) return;
        setUser(user);
        router.replace(dashboardPath(user.role));
      } catch {
        if (cancelled) return;
        clearSession();
        setMessage("Could not load your profile after Google sign-in.");
        setTimeout(() => router.replace("/login"), 2000);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [search, router, setOAuthTokens, setUser, clearSession]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white/80 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
          Completing sign-in
        </p>
        <h1 className="mt-2 text-xl font-bold tracking-tight">
          {message ?? "Finishing Google login…"}
        </h1>
      </div>
    </Container>
  );
}

export function OAuthCallbackClient() {
  return (
    <Suspense
      fallback={
        <Container className="flex min-h-[60vh] items-center justify-center py-24">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </Container>
      }
    >
      <OAuthCallbackInner />
    </Suspense>
  );
}
