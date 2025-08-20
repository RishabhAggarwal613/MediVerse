// src/pages/Dashboard/components/ReportsVault.jsx
import Card, { CardContent, CardHeader } from '@/components/ui/Card.jsx';
import EmptyState from '@/components/ui/EmptyState.jsx';
import { Link } from 'react-router-dom';
import { formatBytes } from '@/lib/utils.js';

export default function ReportsVault({ items = [] }) {
  if (!items?.length) {
    return (
      <EmptyState
        title="No reports yet"
        description="Upload your lab report to get AI analysis, flags, and trends."
        actionLabel="Scan a report"
        onAction={() => (window.location.href = '/report-scanner')}
      />
    );
  }

  return (
    <Card>
      <CardHeader title="Reports vault" description="Your recent scans" />
      <CardContent className="divide-y divide-[#1A1F1D] p-0">
        {items.map((r) => (
          <Link
            key={r.id}
            to={`/report-scanner?report=${encodeURIComponent(r.id)}`}
            className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-white/5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-200">{r.title || r.filename}</p>
              <p className="truncate text-xs text-gray-500">
                {new Date(r.date || r.createdAt).toLocaleDateString()} • {formatBytes(r.size || 0)}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                r.status === 'ok'
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : r.status === 'flag'
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-gray-500/15 text-gray-300'
              }`}
            >
              {r.status || 'unknown'}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
