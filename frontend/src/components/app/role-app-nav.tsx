"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const PATIENT_LINKS = [
  { href: "/patient", label: "Home" },
  { href: "/patient/appointments", label: "Appointments" },
  { href: "/patient/doctors", label: "Find doctors" },
  { href: "/patient/ai-assistant", label: "AI assistant" },
  { href: "/patient/ai-reports", label: "Reports" },
  { href: "/patient/profile", label: "Profile" },
];

const DOCTOR_LINKS = [
  { href: "/doctor", label: "Home" },
  { href: "/doctor/appointments", label: "Appointments" },
  { href: "/doctor/availability", label: "Availability" },
  { href: "/doctor/profile", label: "Profile" },
];

export function RoleAppNav({ variant }: { variant: "patient" | "doctor" }) {
  const pathname = usePathname();
  const links = variant === "patient" ? PATIENT_LINKS : DOCTOR_LINKS;
  const home = variant === "patient" ? "/patient" : "/doctor";
  const accent = variant === "patient" ? "brand" : "teal";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-border/45",
        "bg-white/85 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] backdrop-blur-xl",
        "dark:border-white/10 dark:bg-gray-950/75 dark:shadow-black/30",
      )}
    >
      <Container className="flex min-h-[3.5rem] max-w-[1400px] items-center gap-2 py-2 sm:gap-3">
        <Link
          href={home}
          className={cn(
            "group flex shrink-0 flex-col rounded-xl px-2 py-1 transition-colors sm:flex-row sm:items-baseline sm:gap-2 sm:rounded-full sm:px-3 sm:py-1.5",
            variant === "patient"
              ? "text-brand-900 hover:bg-brand-100 hover:text-brand-950 dark:text-brand-100 dark:hover:bg-white/12 dark:hover:text-white"
              : "text-teal-950 hover:bg-teal-50 dark:text-teal-50 dark:hover:bg-teal-950/45",
          )}
        >
          <span className="text-[0.95rem] font-semibold tracking-tight">MediVerse</span>
          <span
            className={cn(
              "text-[10px] font-medium uppercase tracking-wider opacity-75 sm:inline",
              variant === "patient"
                ? "text-brand-700 group-hover:text-brand-950 dark:text-brand-300 dark:group-hover:text-white"
                : "text-teal-800 dark:text-teal-200/90",
            )}
          >
            {variant === "patient" ? "Patient" : "Doctor"}
          </span>
        </Link>

        <nav
          className={cn(
            "flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto overscroll-x-contain pb-px",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-1",
          )}
          aria-label="Main navigation"
        >
          {links.map((link) => {
            const isRoot = link.href === "/patient" || link.href === "/doctor";
            const active = isRoot
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-2 text-[13px] font-medium tracking-tight transition-colors sm:text-sm",
                  active
                    ? variant === "patient"
                      ? "bg-brand-100 text-brand-900 shadow-inner shadow-brand-900/5 dark:bg-emerald-950/75 dark:text-emerald-100 dark:shadow-none"
                      : "bg-teal-100 text-teal-950 shadow-inner shadow-teal-900/5 dark:bg-teal-500/25 dark:text-teal-50"
                    : variant === "patient"
                      ? "text-muted-foreground hover:bg-brand-100/90 hover:text-brand-950 dark:hover:bg-white/10 dark:hover:text-foreground"
                      : "text-muted-foreground hover:bg-teal-50/90 hover:text-teal-950 dark:hover:bg-teal-950/40 dark:hover:text-teal-50",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 pl-1 sm:gap-2.5">
          <LogoutButton variant="nav" />
          <ThemeToggle accent={accent} />
        </div>
      </Container>
    </header>
  );
}
