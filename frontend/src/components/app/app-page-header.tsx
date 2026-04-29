import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Role = "patient" | "doctor";

const pillStyles: Record<Role, string> = {
  patient:
    "border-brand-200/80 bg-brand-50/90 text-brand-800 dark:border-brand-500/30 dark:bg-brand-950/50 dark:text-brand-200",
  doctor:
    "border-teal-200/80 bg-teal-50/90 text-teal-900 dark:border-teal-800/80 dark:bg-teal-950/60 dark:text-teal-100",
};

const titleStyles: Record<Role, string> = {
  patient:
    "bg-gradient-to-r from-brand-800 via-teal-800 to-emerald-800 bg-clip-text text-transparent dark:from-brand-200 dark:via-teal-200 dark:to-brand-300",
  doctor:
    "bg-gradient-to-r from-teal-900 via-cyan-900 to-teal-800 bg-clip-text text-transparent dark:from-teal-100 dark:via-cyan-100 dark:to-teal-200",
};

type AppPageHeaderProps = {
  role: Role;
  pill: string;
  title: ReactNode;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  actions?: ReactNode;
};

/** Consistent page title block for app (patient / doctor) routes. */
export function AppPageHeader({
  role,
  pill,
  title,
  description,
  icon: Icon,
  className,
  actions,
}: AppPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-start justify-between gap-6",
        actions && "lg:items-center",
        className,
      )}
    >
      <div className="max-w-2xl">
        <p
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-sm backdrop-blur",
            pillStyles[role],
          )}
        >
          {Icon && <Icon className="h-3.5 w-3.5" />}
          {pill}
        </p>
        <h1
          className={cn(
            "mt-4 text-3xl font-bold tracking-tight sm:text-4xl",
            titleStyles[role],
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {actions}
    </header>
  );
}
