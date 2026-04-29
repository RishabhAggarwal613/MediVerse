"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { dashboardPath } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/common/logo";
import { useAuthStore } from "@/stores/auth-store";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#about", label: "About" },
  { href: "#faq", label: "FAQ" },
  { href: "#for-doctors", label: "For Doctors" },
];

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-white/75 backdrop-blur-xl shadow-sm dark:bg-background/70"
          : "bg-transparent"
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {mounted && user ? (
            <Button asChild size="sm">
              <Link href={dashboardPath(user.role)}>Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-foreground"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </Container>

      {mobileOpen && (
        <div className="border-t border-border/60 bg-white/95 backdrop-blur-xl md:hidden dark:bg-background/95">
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-brand-50 hover:text-brand-700"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border/60 pt-3">
              {mounted && user ? (
                <Button asChild onClick={() => setMobileOpen(false)}>
                  <Link href={dashboardPath(user.role)}>Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="outline"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild onClick={() => setMobileOpen(false)}>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
