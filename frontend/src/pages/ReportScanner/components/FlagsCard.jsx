// src/pages/ReportScanner/components/FlagsCard.jsx
import Card, { CardContent, CardHeader } from '@/components/ui/Card.jsx';

const badge = {
  low: 'bg-amber-500/15 text-amber-300',
  medium: 'bg-orange-500/15 text-orange-300',
  high: 'bg-red-500/15 text-red-300',
  critical: 'bg-red-600/20 text-red-300',
  info: 'bg-[#0F1412] text-gray-300 border border-[#1A1F1D]',
};

export default function FlagsCard({ flags = [] }) {
  return (
    <Card>
      <CardHeader
        title="Flags"
        description="Values outside normal ranges"
      />
      <CardContent className="space-y-3">
        {flags.length === 0 && <p className="text-sm text-gray-400">No flags detected.</p>}
        {flags.map((f, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#1A1F1D] bg-[#0B0F10] p-3 text-sm"
          >
            <div className="flex items-start gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs ${badge[f.severity] || badge.info}`}>
                {f.severity || 'info'}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-gray-100">
                  {f.name || f.marker}{' '}
                  {f.value != null && (
                    <span className="text-gray-400">
                      — {f.value} {f.unit || ''}
                    </span>
                  )}
                </p>
                <p className="text-gray-400">
                  {f.message || 'Out of reference range'}{' '}
                  {f.refLow != null && f.refHigh != null && (
                    <span className="text-gray-500">
                      (ref: {f.refLow}–{f.refHigh} {f.unit || ''})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
