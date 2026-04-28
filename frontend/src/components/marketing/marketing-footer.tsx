import Link from "next/link";
import { Mail } from "lucide-react";

import { Container } from "@/components/ui/container";
import { Logo } from "@/components/common/logo";

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.852 3.37-1.852 3.602 0 4.268 2.37 4.268 5.455v6.288zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9H7.12v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const PRODUCT = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
  { href: "/signup", label: "Get started" },
];

const COMPANY = [
  { href: "#about", label: "About" },
  { href: "#for-doctors", label: "For Doctors" },
  { href: "mailto:hello@mediverse.local", label: "Contact" },
];

const LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/security", label: "Security" },
];

export function MarketingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-gradient-to-b from-white to-brand-50/40 dark:from-background dark:to-brand-500/5">
      <Container className="grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            AI-powered healthcare platform connecting patients with verified
            specialists. Get instant insights, book consultations, and stay on
            top of your health.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <SocialLink href="#" label="X (Twitter)">
              <XIcon className="h-4 w-4" />
            </SocialLink>
            <SocialLink href="#" label="LinkedIn">
              <LinkedInIcon className="h-4 w-4" />
            </SocialLink>
            <SocialLink href="mailto:hello@mediverse.local" label="Email">
              <Mail className="h-4 w-4" />
            </SocialLink>
          </div>
        </div>

        <FooterColumn title="Product" links={PRODUCT} className="md:col-span-3" />
        <FooterColumn title="Company" links={COMPANY} className="md:col-span-2" />
        <FooterColumn title="Legal" links={LEGAL} className="md:col-span-3" />
      </Container>

      <div className="border-t border-border/60">
        <Container className="flex flex-col items-start justify-between gap-2 py-5 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} MediVerse. All rights reserved.</p>
          <p>
            Built with care • Not a substitute for professional medical advice.
          </p>
        </Container>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  className,
}: {
  title: string;
  links: { href: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="mb-4 text-sm font-semibold tracking-wide text-foreground">
        {title}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-brand-700 dark:hover:text-brand-300"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-white text-foreground/70 transition-colors hover:border-brand-300 hover:text-brand-700 dark:bg-white/5 dark:hover:text-brand-300"
    >
      {children}
    </Link>
  );
}
