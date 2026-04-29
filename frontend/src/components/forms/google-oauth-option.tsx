"use client";

import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { fetchHealthFeatures } from "@/lib/api/health";
import { getGoogleOAuthUrl } from "@/lib/env";

/**
 * Shows the Google OAuth button only when `/api/health` reports OAuth is wired
 * ({@code googleOAuthAvailable}). Otherwise surfaces a short note so users are not sent to a
 * broken {@code /oauth2/authorization/google} endpoint.
 */
export function GoogleOAuthOption() {
  const { data, isPending, isFetching } = useQuery({
    queryKey: ["health-features"],
    queryFn: fetchHealthFeatures,
    staleTime: 60_000,
  });

  const busy = isPending || isFetching;
  const oauth = Boolean(data?.googleOAuthAvailable);

  if (busy) {
    return null;
  }

  if (!oauth) {
    return (
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        Google sign-in is off until you set backend env vars{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
          GOOGLE_CLIENT_ID
        </code>{" "}
        and{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
          GOOGLE_CLIENT_SECRET
        </code>
        , then restart the API. Redirect URI must include{" "}
        <code className="break-all rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
          http://localhost:8080/login/oauth2/code/google
        </code>
        .
      </p>
    );
  }

  return (
    <>
      <div className="relative py-1 text-center text-xs text-muted-foreground">
        <span className="relative z-10 bg-white/80 px-2 dark:bg-background/80">
          or continue with
        </span>
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
      </div>

      <Button type="button" variant="outline" className="w-full" asChild>
        <a href={getGoogleOAuthUrl()}>Google</a>
      </Button>
    </>
  );
}
