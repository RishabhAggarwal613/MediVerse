"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

import { logoutPost } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

export function LogoutButton({
  variant = "default",
  className,
}: {
  variant?: "default" | "nav";
  className?: string;
}) {
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
      aria-label="Log out"
      onClick={() => void onLogout()}
      className={cn(
        variant === "nav" &&
          "h-9 shrink-0 gap-1.5 rounded-full border-border/70 bg-white/90 px-3 text-xs font-medium shadow-sm backdrop-blur dark:bg-white/[0.06]",
        className,
      )}
    >
      {variant === "nav" ? (
        <>
          <LogOut className="h-[0.9rem] w-[0.9rem] opacity-90" />
          <span className="hidden sm:inline">Log out</span>
        </>
      ) : (
        "Log out"
      )}
    </Button>
  );
}
