"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "patient" | "doctor";

const ambient: Record<
  Variant,
  { gradient: string; blobs: [string, string] }
> = {
  patient: {
    gradient:
      "bg-[linear-gradient(180deg,hsl(var(--background))_0%,rgba(236,253,245,0.35)_42%,transparent_100%)] dark:bg-[linear-gradient(180deg,hsl(var(--background))_0%,rgba(6,78,59,0.12)_48%,transparent_100%)]",
    blobs: [
      "pointer-events-none absolute -left-40 top-24 h-[28rem] w-[28rem] rounded-full bg-brand-400/25 blur-[100px] dark:bg-brand-500/15",
      "pointer-events-none absolute -right-28 top-[16rem] h-[22rem] w-[22rem] rounded-full bg-cyan-400/20 blur-[90px] dark:bg-cyan-500/12",
    ],
  },
  doctor: {
    gradient:
      "bg-[linear-gradient(165deg,hsl(var(--background))_0%,rgba(13,148,136,0.08)_38%,transparent_72%)] dark:bg-[linear-gradient(165deg,hsl(var(--background))_0%,rgba(15,118,110,0.14)_45%,transparent_75%)]",
    blobs: [
      "pointer-events-none absolute -right-32 top-0 h-[24rem] w-[24rem] rounded-full bg-teal-500/20 blur-[110px] dark:bg-teal-600/12",
      "pointer-events-none absolute -left-24 bottom-0 h-[20rem] w-[20rem] rounded-full bg-cyan-500/15 blur-[100px] dark:bg-cyan-600/10",
    ],
  },
};

type AppPageShellProps = {
  variant: Variant;
  children: ReactNode;
  className?: string;
  minHeight?: "screen" | "auto";
};

/**
 * Shared ambient background + blur orbs for authenticated patient vs doctor areas.
 */
export function AppPageShell({
  variant,
  children,
  className,
  minHeight = "screen",
}: AppPageShellProps) {
  const a = ambient[variant];
  return (
    <div
      className={cn(
        "relative overflow-hidden pb-24 pt-10",
        minHeight === "screen" && "min-h-[calc(100vh-4rem)]",
        className,
      )}
    >
      <div aria-hidden className={cn("pointer-events-none absolute inset-0", a.gradient)} />
      <div className={a.blobs[0]} aria-hidden />
      <div className={a.blobs[1]} aria-hidden />
      {children}
    </div>
  );
}
