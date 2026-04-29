"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Container } from "@/components/ui/container";
import { dashboardPath } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

const LINKS = [{ href: "/admin/verifications", label: "Verifications" }];

export function AdminAppNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const dash = user ? dashboardPath(user.role) : "/patient";

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
          href="/admin/verifications"
          className={cn(
            "group flex shrink-0 flex-col rounded-xl px-2 py-1 transition-colors sm:flex-row sm:items-baseline sm:gap-2 sm:rounded-full sm:px-3 sm:py-1.5",
            "text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-white/12",
          )}
        >
          <span className="text-[0.95rem] font-semibold tracking-tight">MediVerse</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600 opacity-90 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white sm:inline">
            Admin
          </span>
        </Link>

        <nav
          className={cn(
            "flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto overscroll-x-contain pb-px",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-1",
          )}
          aria-label="Admin navigation"
        >
          {LINKS.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-2 text-[13px] font-medium tracking-tight transition-colors sm:text-sm",
                  active
                    ? "bg-slate-200 text-slate-950 shadow-inner dark:bg-slate-700/80 dark:text-white"
                    : "text-muted-foreground hover:bg-slate-100 hover:text-foreground dark:hover:bg-white/10",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 pl-1 sm:gap-2.5">
          <Link
            href={dash}
            className="hidden rounded-full px-3 py-2 text-[13px] font-medium text-muted-foreground hover:bg-slate-100 hover:text-foreground sm:inline dark:hover:bg-white/10"
          >
            Dashboard
          </Link>
          <LogoutButton variant="nav" />
          <ThemeToggle accent="brand" />
        </div>
      </Container>
    </header>
  );
}
