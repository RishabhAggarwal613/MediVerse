"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { verifyEmailPost } from "@/lib/api/auth";
import { ApiRequestError } from "@/lib/api/errors";

export function VerifyEmailClient({ token }: { token: string }) {
  const [status, setStatus] = useState<"pending" | "ok" | "error">("pending");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token in the link.");
      return;
    }
    let cancelled = false;
    void verifyEmailPost(token)
      .then(() => {
        if (!cancelled) setStatus("ok");
      })
      .catch((e) => {
        if (cancelled) return;
        setStatus("error");
        if (e instanceof ApiRequestError) {
          setMessage(e.message);
        } else {
          setMessage("Verification failed.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="mt-8 space-y-6 text-center">
      {status === "pending" && (
        <p className="text-sm text-muted-foreground">Verifying your email…</p>
      )}
      {status === "ok" && (
        <>
          <p className="text-sm text-foreground">
            Your email is verified. You can sign in anytime.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Go to login</Link>
          </Button>
        </>
      )}
      {status === "error" && (
        <>
          <p className="text-sm text-destructive">{message}</p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        </>
      )}
    </div>
  );
}
