"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { logoutPost } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

export function LogoutButton() {
  const router = useRouter();
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [busy, setBusy] = useState(false);

  async function onLogout() {
    setBusy(true);
    try {
      if (refreshToken) {
        await logoutPost(refreshToken);
      }
    } catch {
      /* still clear local session */
    } finally {
      clearSession();
      setBusy(false);
      router.replace("/login");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={busy}
      onClick={() => void onLogout()}
    >
      Log out
    </Button>
  );
}
