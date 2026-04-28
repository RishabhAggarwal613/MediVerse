import { cn } from "@/lib/utils";

export function DoctorIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 380"
      role="img"
      aria-label="Illustration of a doctor with a tablet and shield"
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <linearGradient id="bg-grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="coat-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
        <linearGradient id="brand-grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* soft backdrop */}
      <rect x="0" y="0" width="480" height="380" rx="32" fill="url(#bg-grad)" />

      {/* decorative dots */}
      <g fill="#10b981" opacity="0.18">
        <circle cx="60" cy="60" r="3" />
        <circle cx="100" cy="40" r="2" />
        <circle cx="420" cy="80" r="3" />
        <circle cx="440" cy="120" r="2" />
        <circle cx="50" cy="320" r="3" />
        <circle cx="430" cy="320" r="3" />
      </g>

      {/* subtle grid */}
      <g stroke="#10b981" strokeOpacity="0.08" strokeWidth="1">
        <path d="M0 200 L480 200" />
        <path d="M240 0 L240 380" />
      </g>

      {/* shield (background) */}
      <g transform="translate(330, 80)">
        <path
          d="M60 0 L120 22 V70 C120 105 95 130 60 145 C25 130 0 105 0 70 V22 Z"
          fill="url(#brand-grad)"
          opacity="0.15"
        />
        <path
          d="M60 12 L108 30 V70 C108 100 88 122 60 134 C32 122 12 100 12 70 V30 Z"
          fill="url(#brand-grad)"
          opacity="0.85"
        />
        <path
          d="M40 75 L55 90 L84 60"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* doctor body */}
      <g transform="translate(110, 60)">
        {/* head */}
        <circle cx="100" cy="60" r="38" fill="#fbcfa1" />
        {/* hair */}
        <path
          d="M62 50 C 65 25, 135 25, 138 50 C 138 38, 122 30, 100 30 C 78 30, 62 38, 62 50 Z"
          fill="#1f2937"
        />
        {/* neck */}
        <rect x="88" y="92" width="24" height="18" rx="6" fill="#fbcfa1" />
        {/* coat */}
        <path
          d="M40 220 C 40 165, 60 130, 100 130 C 140 130, 160 165, 160 220 Z"
          fill="url(#coat-grad)"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        {/* coat lapel */}
        <path
          d="M100 130 L80 175 L100 200 L120 175 Z"
          fill="#e2e8f0"
        />
        {/* shirt */}
        <path d="M88 130 L100 158 L112 130 Z" fill="#10b981" />
        {/* stethoscope */}
        <path
          d="M80 135 C 70 165, 80 195, 105 200"
          stroke="#0f172a"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="105" cy="200" r="6" fill="#0f172a" />
        <circle cx="105" cy="200" r="3" fill="#10b981" />
        {/* badge */}
        <rect x="118" y="158" width="22" height="14" rx="3" fill="#10b981" />
        <rect x="121" y="161" width="16" height="2" fill="#ffffff" />
        <rect x="121" y="165" width="10" height="2" fill="#ffffff" />
      </g>

      {/* floating heart pulse pill */}
      <g transform="translate(40, 240)">
        <rect x="0" y="0" width="170" height="48" rx="24" fill="#ffffff" stroke="#e5e7eb" />
        <circle cx="26" cy="24" r="12" fill="#fee2e2" />
        <path
          d="M19 26 c 0 -4, 6 -4, 7 0 c 1 -4, 7 -4, 7 0 c 0 4, -7 9, -7 9 c 0 0, -7 -5, -7 -9 z"
          fill="#ef4444"
        />
        <path
          d="M50 24 L62 24 L66 16 L72 32 L78 22 L84 26 L150 26"
          stroke="#10b981"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* floating chat bubble */}
      <g transform="translate(290, 240)">
        <rect x="0" y="0" width="150" height="56" rx="14" fill="#ffffff" stroke="#e5e7eb" />
        <path d="M16 56 L24 64 L32 56 Z" fill="#ffffff" stroke="#e5e7eb" />
        <circle cx="16" cy="20" r="3" fill="#10b981" />
        <circle cx="28" cy="20" r="3" fill="#06b6d4" opacity="0.6" />
        <circle cx="40" cy="20" r="3" fill="#a855f7" opacity="0.5" />
        <rect x="16" y="32" width="118" height="4" rx="2" fill="#e5e7eb" />
        <rect x="16" y="40" width="80" height="4" rx="2" fill="#e5e7eb" />
      </g>
    </svg>
  );
}
