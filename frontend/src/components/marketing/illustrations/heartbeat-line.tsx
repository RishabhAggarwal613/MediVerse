import { cn } from "@/lib/utils";

export function HeartbeatLine({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 80"
      preserveAspectRatio="none"
      className={cn("h-12 w-full", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="hb-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
          <stop offset="20%" stopColor="#10b981" stopOpacity="1" />
          <stop offset="80%" stopColor="#06b6d4" stopOpacity="1" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 40 L120 40 L150 40 L165 20 L180 60 L195 10 L210 70 L225 40 L260 40 L290 40 L305 30 L320 50 L335 20 L350 60 L365 40 L500 40 L520 40 L535 22 L550 58 L565 12 L580 68 L595 40 L640 40 L800 40"
        fill="none"
        stroke="url(#hb-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
