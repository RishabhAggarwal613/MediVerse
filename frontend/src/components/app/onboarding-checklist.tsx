"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Circle } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { fetchOnboarding } from "@/lib/api/auth";

function actionForItem(
  id: string,
  variant: "patient" | "doctor",
): { label: string; href: string } | null {
  switch (id) {
    case "verify_email":
      return null;
    case "profile_photo":
      return {
        label: "Open profile",
        href: variant === "patient" ? "/patient/profile" : "/doctor/profile",
      };
    case "basic_profile":
      return { label: "Complete profile", href: "/patient/profile" };
    case "doctor_verified":
      return null;
    case "doctor_profile":
      return { label: "Edit profile", href: "/doctor/profile" };
    default:
      return null;
  }
}

export function OnboardingChecklist({
  variant,
}: {
  variant: "patient" | "doctor";
}) {
  const q = useQuery({
    queryKey: ["users", "me", "onboarding"],
    queryFn: () => fetchOnboarding(),
    staleTime: 30_000,
  });

  if (q.isPending || q.isError || !q.data) return null;

  const { items, completedCount, totalCount } = q.data;

  if (completedCount >= totalCount) return null;

  return (
    <section
      className={cn(
        "surface-app relative overflow-hidden rounded-3xl border p-6 shadow-md",
        variant === "patient"
          ? "border-brand-200/60 dark:border-brand-900/50"
          : "border-teal-200/55 dark:border-teal-900/45",
      )}
    >
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight">
          Get set up
        </h2>
        <p className="text-xs font-medium text-muted-foreground">
          {completedCount} / {totalCount} done
        </p>
      </div>
      <ul className="space-y-3">
        {items.map((item) => {
          const action = !item.complete ? actionForItem(item.id, variant) : null;
          return (
            <li
              key={item.id}
              className="flex gap-3 rounded-2xl border border-border/50 bg-background/50 px-3 py-2.5 dark:bg-black/20"
            >
              <span className="mt-0.5 shrink-0">
                {item.complete ? (
                  <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/60" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug">{item.label}</p>
                {!item.complete && action && item.id !== "verify_email" && (
                  <Link
                    href={action.href}
                    className={cn(
                      "mt-1 inline-block text-xs font-medium underline-offset-4 hover:underline",
                      variant === "patient"
                        ? "text-brand-800 dark:text-brand-300"
                        : "text-teal-800 dark:text-teal-300",
                    )}
                  >
                    {action.label} →
                  </Link>
                )}
                {!item.complete && item.id === "verify_email" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use the banner above to resend, or open your verification email.
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
