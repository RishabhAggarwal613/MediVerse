// src/pages/Dashboard/components/TodayTiles.jsx
import Card, { CardContent } from '@/components/ui/Card.jsx';
import { formatNumber, compactNumber } from '@/lib/utils.js';

function Stat({ label, value, delta, unit }) {
  const trend = typeof delta === 'number' ? (delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat') : null;
  const trendClr =
    trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400';

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatNumber(value)} {unit || ''}
          </p>
        </div>
        {trend && (
          <span className={`text-xs ${trendClr}`}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '•'} {compactNumber(Math.abs(delta))}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export default function TodayTiles({ tiles = [] }) {
  // tiles: [{label, value, unit, delta}]
  if (!tiles?.length) return null;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t, i) => (
        <Stat key={i} {...t} />
      ))}
    </div>
  );
}
