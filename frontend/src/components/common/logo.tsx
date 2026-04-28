import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="MediVerse home"
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-lg shadow-brand-500/30 transition-transform group-hover:-rotate-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M12 4v16M4 12h16" />
          <circle cx="12" cy="12" r="9" strokeOpacity="0.55" />
        </svg>
        <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full bg-cyan-400 ring-2 ring-white" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-tight text-foreground">
          Medi<span className="text-gradient-brand">Verse</span>
        </span>
        <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground sm:block">
          AI Healthcare
        </span>
      </span>
    </Link>
  );
}
