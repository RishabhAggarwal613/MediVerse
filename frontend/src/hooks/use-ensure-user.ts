"use client";

import { useEffect } from "react";

import { fetchCurrentUser } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";

/** If we have a token but no user (e.g. after hard refresh), load `/users/me`. */
export function useEnsureUser() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);

  useEffect(() => {
    if (!accessToken || user) return;
    let cancelled = false;
    void fetchCurrentUser()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) clearSession();
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, user, setUser, clearSession]);
}
