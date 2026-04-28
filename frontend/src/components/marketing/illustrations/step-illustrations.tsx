import { cn } from "@/lib/utils";

const baseProps = {
  viewBox: "0 0 200 160",
  xmlns: "http://www.w3.org/2000/svg" as const,
};

const gradientDefs = (id: string) => (
  <defs>
    <linearGradient id={`${id}-bg`} x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stopColor="#d1fae5" />
      <stop offset="100%" stopColor="#cffafe" />
    </linearGradient>
    <linearGradient id={`${id}-accent`} x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stopColor="#10b981" />
      <stop offset="100%" stopColor="#06b6d4" />
    </linearGradient>
  </defs>
);

export function StepSignupIllustration({ className }: { className?: string }) {
  return (
    <svg
      {...baseProps}
      className={cn("h-auto w-full", className)}
      aria-hidden
    >
      {gradientDefs("s1")}
      <rect width="200" height="160" rx="20" fill="url(#s1-bg)" />

      {/* form card */}
      <rect x="34" y="30" width="132" height="100" rx="14" fill="#ffffff" stroke="#e5e7eb" />
      <circle cx="56" cy="54" r="12" fill="#d1fae5" />
      <path
        d="M50 56 c 0 -3 4 -3 5 0 c 0 -3 5 -3 5 0 c 0 3 -5 7 -5 7 c 0 0 -5 -4 -5 -7 z"
        fill="#10b981"
      />
      <rect x="76" y="46" width="78" height="6" rx="3" fill="#e5e7eb" />
      <rect x="76" y="56" width="50" height="5" rx="2.5" fill="#f1f5f9" />

      <rect x="48" y="80" width="104" height="10" rx="5" fill="#f1f5f9" />
      <rect x="48" y="96" width="104" height="10" rx="5" fill="#f1f5f9" />

      <rect x="48" y="114" width="60" height="14" rx="7" fill="url(#s1-accent)" />
      <text
        x="78"
        y="124"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui"
        fontSize="8"
        fontWeight="700"
        fill="#ffffff"
      >
        Sign up
      </text>

      {/* checkmark */}
      <circle cx="156" cy="38" r="11" fill="url(#s1-accent)" />
      <path
        d="M151 38 l 4 4 l 7 -8"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function StepFindIllustration({ className }: { className?: string }) {
  return (
    <svg
      {...baseProps}
      className={cn("h-auto w-full", className)}
      aria-hidden
    >
      {gradientDefs("s2")}
      <rect width="200" height="160" rx="20" fill="url(#s2-bg)" />

      {/* search bar */}
      <rect x="22" y="26" width="156" height="22" rx="11" fill="#ffffff" stroke="#e5e7eb" />
      <circle cx="36" cy="37" r="4" fill="none" stroke="#10b981" strokeWidth="2" />
      <line x1="39" y1="40" x2="44" y2="45" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      <rect x="50" y="33" width="80" height="3" rx="1.5" fill="#e5e7eb" />
      <rect x="50" y="39" width="40" height="3" rx="1.5" fill="#f1f5f9" />

      {/* doctor cards */}
      {[0, 1].map((i) => (
        <g key={i} transform={`translate(${22 + i * 80}, 60)`}>
          <rect width="76" height="80" rx="10" fill="#ffffff" stroke="#e5e7eb" />
          <circle cx="22" cy="22" r="11" fill="url(#s2-accent)" opacity="0.18" />
          <circle cx="22" cy="22" r="9" fill="#ffffff" />
          <circle cx="22" cy="20" r="3" fill="#94a3b8" />
          <rect x="17" y="24" width="10" height="6" rx="2" fill="#94a3b8" />
          <rect x="38" y="14" width="32" height="4" rx="2" fill="#1f2937" />
          <rect x="38" y="22" width="22" height="3" rx="1.5" fill="#94a3b8" />
          <g transform="translate(38, 30)">
            {[0, 1, 2, 3, 4].map((s) => (
              <path
                key={s}
                d="M3 0 L3.7 1.9 L5.7 1.9 L4.1 3.1 L4.7 5 L3 3.9 L1.3 5 L1.9 3.1 L0.3 1.9 L2.3 1.9 Z"
                fill={s < 4 ? "#fbbf24" : "#e5e7eb"}
                transform={`translate(${s * 6}, 0)`}
              />
            ))}
          </g>
          <rect x="10" y="48" width="56" height="8" rx="4" fill="#f1f5f9" />
          <rect x="10" y="62" width="36" height="10" rx="5" fill="url(#s2-accent)" />
          <text
            x="28"
            y="69"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui"
            fontSize="6"
            fontWeight="700"
            fill="#ffffff"
          >
            Book
          </text>
        </g>
      ))}
    </svg>
  );
}

export function StepCareIllustration({ className }: { className?: string }) {
  return (
    <svg
      {...baseProps}
      className={cn("h-auto w-full", className)}
      aria-hidden
    >
      {gradientDefs("s3")}
      <rect width="200" height="160" rx="20" fill="url(#s3-bg)" />

      {/* video call frame */}
      <rect x="22" y="26" width="156" height="100" rx="12" fill="#0f172a" />

      {/* doctor avatar bubble */}
      <circle cx="68" cy="76" r="22" fill="url(#s3-accent)" opacity="0.25" />
      <circle cx="68" cy="76" r="18" fill="#ffffff" />
      <circle cx="68" cy="70" r="6" fill="#94a3b8" />
      <path d="M52 92 q 16 -14 32 0" fill="#94a3b8" />

      {/* small self-view */}
      <rect x="138" y="36" width="32" height="22" rx="6" fill="#ffffff" />
      <circle cx="154" cy="46" r="4" fill="#94a3b8" />
      <path d="M146 56 q 8 -6 16 0" fill="#94a3b8" />

      {/* call controls */}
      <circle cx="86" cy="116" r="8" fill="#ffffff" opacity="0.18" />
      <rect x="82" y="113" width="8" height="6" rx="1.5" fill="#ffffff" />

      <circle cx="106" cy="116" r="8" fill="#ef4444" />
      <path
        d="M101 113 l 10 6 M111 113 l -10 6"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <circle cx="126" cy="116" r="8" fill="#ffffff" opacity="0.18" />
      <path
        d="M121 116 c 1 -3 3 -3 5 0 c 0 -3 4 -3 4 0 c 0 2 -4 5 -4 5 c 0 0 -5 -3 -5 -5 z"
        fill="#10b981"
      />

      {/* heartbeat at bottom */}
      <path
        d="M22 144 L60 144 L66 138 L72 150 L78 134 L84 146 L100 144 L130 144 L136 140 L142 148 L148 134 L154 144 L178 144"
        stroke="url(#s3-accent)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
