"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

type ThemeAccent = "brand" | "teal";

export function ThemeToggle({
  className,
  accent = "brand",
}: {
  className?: string;
  /** Patient / marketing: brand emerald; doctor app: teal accents. */
  accent?: ThemeAccent;
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const current = (theme === "system" ? resolvedTheme : theme) ?? "light";
  const next = current === "dark" ? "light" : "dark";

  const accentRing =
    accent === "teal"
      ? "hover:border-teal-400/70 hover:text-teal-800 focus-visible:ring-teal-500/40 dark:hover:text-teal-200"
      : "hover:border-brand-300 hover:text-brand-700 focus-visible:ring-brand-500/35 dark:hover:text-brand-300";

  return (
    <button
      type="button"
      aria-label={`Switch to ${next} mode`}
      title={mounted ? `Switch to ${next} mode` : "Toggle theme"}
      onClick={() => setTheme(next)}
      className={cn(
        "relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-white/70 text-foreground/80 backdrop-blur-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:bg-white/5",
        accentRing,
        className
      )}
    >
      <Sun
        className={cn(
          "h-[1.1rem] w-[1.1rem] transition-all duration-300",
          mounted && current === "dark"
            ? "-rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        )}
      />
      <Moon
        className={cn(
          "absolute h-[1.05rem] w-[1.05rem] transition-all duration-300",
          mounted && current === "dark"
            ? "rotate-0 scale-100 opacity-100"
            : "rotate-90 scale-0 opacity-0"
        )}
      />
    </button>
  );
}
