// src/pages/Home/FeatureGrid.jsx
import { Link } from 'react-router-dom';
import Card, { CardContent } from '@/components/ui/Card.jsx';
import Button from '@/components/ui/Button.jsx';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import WatchIcon from '@mui/icons-material/Watch';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import InsightsIcon from '@mui/icons-material/Insights';

const items = [
  { icon: ChatBubbleOutlineIcon, title: 'MediAI', desc: 'Ask symptom questions and get safe, structured answers.', to: '/medi-ai' },
  { icon: DocumentScannerIcon, title: 'Report Scanner', desc: 'Upload lab reports to see flags, ranges, and summaries.', to: '/report-scanner' },
  { icon: WatchIcon, title: 'Wearables', desc: 'Connect your watch to sync steps, HR, sleep and more.', to: '/wearables' },
  { icon: RestaurantIcon, title: 'Diet Planner', desc: 'Generate a personalized weekly/monthly meal plan.', to: '/diet-planner' },
  { icon: InsightsIcon, title: 'Dashboard', desc: 'Track trends and insights across all your health data.', to: '/dashboard' },
];

function FeatureCard({ icon: Icon, title, desc, to }) {
  return (
    <Card
      className="group h-full border-[#1A1F1D] bg-[#0B0F10] transition-all hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-[0_8px_30px_rgba(16,185,129,.12)] focus-within:border-emerald-500/40"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const a = e.currentTarget.querySelector('a[data-primary]');
          a?.click();
        }
      }}
    >
      <CardContent className="relative flex h-full flex-col">
        {/* subtle glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 0%, rgba(16,185,129,.08) 0%, rgba(16,185,129,0) 70%)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20">
            <Icon fontSize="small" />
          </span>
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
        </div>

        <p className="relative mt-2 text-sm text-gray-400">{desc}</p>

        <div className="relative mt-auto pt-5">
          <Link to={to} title={`Open ${title}`} data-primary>
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-400/10"
              aria-label={`Open ${title}`}
            >
              Open →
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FeatureGrid() {
  return (
    <section id="features" className="scroll-mt-20">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-400/5 px-3 py-1 text-[13px] text-emerald-300">
        MediVerse Features
      </div>
      <h2 className="mt-3 text-2xl font-semibold text-gray-100">What you can do</h2>
      <p className="mt-1 text-sm text-gray-400">
        Everything you need for AI-guided, privacy-first health tracking.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </section>
  );
}
