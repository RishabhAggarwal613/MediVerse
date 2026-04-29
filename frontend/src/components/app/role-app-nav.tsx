"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const PATIENT_LINKS = [
  { href: "/patient", label: "Home" },
  { href: "/patient/doctors", label: "Find doctors" },
  { href: "/patient/appointments", label: "Appointments" },
  { href: "/patient/ai-assistant", label: "AI assistant" },
];

const DOCTOR_LINKS = [
  { href: "/doctor", label: "Home" },
  { href: "/doctor/profile", label: "Profile" },
  { href: "/doctor/availability", label: "Availability" },
  { href: "/doctor/appointments", label: "Appointments" },
];

export function RoleAppNav({ variant }: { variant: "patient" | "doctor" }) {
  const pathname = usePathname();
  const links = variant === "patient" ? PATIENT_LINKS : DOCTOR_LINKS;

  return (
    <div className="border-b border-border/60 bg-white/70 backdrop-blur-md dark:bg-background/70">
      <Container className="flex flex-wrap gap-1 py-3">
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
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-300"
                  : "text-muted-foreground hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </Container>
    </div>
  );
}
