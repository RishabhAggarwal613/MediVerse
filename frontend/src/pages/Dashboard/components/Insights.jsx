// src/pages/Dashboard/components/Insights.jsx
import Card, { CardContent, CardHeader } from '@/components/ui/Card.jsx';

function Pill({ severity = 'info' }) {
  const map = {
    info: 'bg-[#0F1412] text-gray-300 border border-[#1A1F1D]',
    low: 'bg-emerald-500/15 text-emerald-300',
    medium: 'bg-amber-500/15 text-amber-300',
    high: 'bg-red-500/15 text-red-300',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${map[severity] || map.info}`}>
      {severity}
    </span>
  );
}

export default function Insights({ items = [] }) {
  if (!items?.length) return null;
  return (
    <Card>
      <CardHeader title="Insights" description="Key observations from your data" />
      <CardContent className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border border-[#1A1F1D] bg-[#0B0F10] p-3">
            <div className="flex items-start gap-2">
              <Pill severity={it.severity || 'info'} />
              <div className="min-w-0">
                <p className="font-medium text-gray-100">{it.title || 'Insight'}</p>
                {it.description && <p className="text-sm text-gray-400">{it.description}</p>}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
