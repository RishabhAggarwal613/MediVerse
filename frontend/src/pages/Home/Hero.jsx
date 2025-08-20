// src/pages/Home/Hero.jsx
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Button from '@/components/ui/Button.jsx';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import InsightsIcon from '@mui/icons-material/Insights';
import SecurityIcon from '@mui/icons-material/Security';
import BoltIcon from '@mui/icons-material/Bolt';

export default function Hero() {
  const { isAuthenticated, token } = useSelector((s) => s.auth || {});
  const authed = useMemo(
    () => isAuthenticated || Boolean(localStorage.getItem('auth_token') || token),
    [isAuthenticated, token]
  );

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#1A1F1D] bg-[#0F1412]">
      {/* ambient glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-28 h-96 w-96 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,.18),_transparent_60%)] blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,.15),_transparent_60%)] blur-3xl" />
      </div>

      <div className="relative p-6 sm:p-10">
        {/* Title */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-400/5 px-3 py-1 text-[13px] text-emerald-300">
          <BoltIcon fontSize="small" />
          MediVerse — AI Health Companion
        </div>

        <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="bg-gradient-to-br from-emerald-400 to-emerald-200 bg-clip-text text-transparent">
            Understand your health
          </span>{' '}
          with smart insights
        </h1>

        <p className="mt-3 max-w-2xl text-pretty text-gray-400 sm:text-lg">
          Chat with our AI, scan reports for instant highlights, sync wearables for trends, and
          get a personalized diet plan — all in one place.
        </p>

        {/* CTAs */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link to={authed ? '/medi-ai' : '/auth/login'}>
            <Button size="lg">Get started</Button>
          </Link>
          <a
            href="#features"
            className="rounded-xl px-4 py-2 text-sm text-gray-300 ring-1 ring-white/10 hover:bg-white/5"
            title="See what you can do with MediVerse"
          >
            Explore features →
          </a>
        </div>

        {/* Quick stats / value props */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ValueCard
            icon={<HealthAndSafetyIcon className="text-emerald-300" />}
            title="4 core modules"
            note="AI Chat · Reports · Wearables · Diet"
          />
          <ValueCard
            icon={<InsightsIcon className="text-emerald-300" />}
            title="Report insights"
            note="Flags, ranges & trends"
          />
          <ValueCard
            icon={<BoltIcon className="text-emerald-300" />}
            title="Realtime wearables"
            note="Metrics & streaks"
          />
          <ValueCard
            icon={<SecurityIcon className="text-emerald-300" />}
            title="Privacy-first"
            note="You control your data"
          />
        </div>
      </div>
    </section>
  );
}

function ValueCard({ icon, title, note }) {
  return (
    <div className="rounded-xl border border-[#1A1F1D] bg-[#0B0F10] p-4 transition-colors hover:border-emerald-500/30">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-400/10 ring-1 ring-emerald-400/20">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-100">{title}</p>
          <p className="text-xs text-gray-500">{note}</p>
        </div>
      </div>
    </div>
  );
}
