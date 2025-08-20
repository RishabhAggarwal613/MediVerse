// src/pages/ReportScanner/components/RangeTable.jsx
import Card, { CardContent, CardHeader } from '@/components/ui/Card.jsx';

function FlagChip({ flag }) {
  if (!flag) return null;
  const map = {
    high: 'bg-red-500/15 text-red-300',
    low: 'bg-amber-500/15 text-amber-300',
    normal: 'bg-emerald-500/15 text-emerald-300',
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs ${map[flag] || 'bg-[#0F1412] text-gray-300 border border-[#1A1F1D]'}`}>{flag}</span>;
}

export default function RangeTable({ panel = [] }) {
  return (
    <Card>
      <CardHeader title="Reference ranges" description="Detailed values per test" />
      <CardContent className="p-0">
        <div className="thin-scroll max-h-[50vh] overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-[#0F1412] text-left text-gray-300">
              <tr className="border-b border-[#1A1F1D]">
                <th className="px-5 py-3">Test</th>
                <th className="px-5 py-3">Value</th>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1F1D]">
              {panel.map((row, i) => (
                <tr key={i} className="hover:bg-white/5">
                  <td className="px-5 py-3 text-gray-200">{row.name}</td>
                  <td className="px-5 py-3 text-gray-300">
                    {row.value} {row.unit || ''}
                  </td>
                  <td className="px-5 py-3 text-gray-400">
                    {row.refLow != null && row.refHigh != null
                      ? `${row.refLow}–${row.refHigh} ${row.unit || ''}`
                      : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <FlagChip flag={row.flag} />
                  </td>
                </tr>
              ))}
              {panel.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-4 text-center text-gray-400">
                    No tests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
