// src/pages/ReportScanner/components/TrendsCard.jsx
import Card, { CardContent, CardHeader } from '@/components/ui/Card.jsx';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import dayjs from 'dayjs';
import { axisStyle, tickStyle, chartTheme } from '@/lib/charts.js';

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#1A1F1D] bg-[#0F1412] px-3 py-2 text-sm">
      <p className="text-gray-300">{dayjs(label).format('DD MMM')}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-gray-400">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span>{p.name}</span>
          <span className="ml-auto text-gray-300">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * trends: [
 *   { name: 'Hemoglobin', unit: 'g/dL', points: [{ date: '2025-01-01', value: 13.4 }, ...] },
 *   ...
 * ]
 */
export default function TrendsCard({ trends = [] }) {
  if (!trends.length) return null;

  // Normalize into chart data keyed by date
  const dateMap = new Map();
  trends.forEach((series) => {
    series.points?.forEach((pt) => {
      const key = pt.date;
      if (!dateMap.has(key)) dateMap.set(key, { date: key });
      dateMap.get(key)[series.name] = pt.value;
    });
  });
  const data = Array.from(dateMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <Card>
      <CardHeader title="Trends" description="Selected markers over time" />
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
            <CartesianGrid stroke={chartTheme.grid} vertical={false} />
            <XAxis
              dataKey="date"
              stroke={axisStyle.stroke}
              tick={{ ...tickStyle }}
              tickFormatter={(v) => dayjs(v).format('DD MMM')}
              minTickGap={28}
            />
            <YAxis stroke={axisStyle.stroke} tick={{ ...tickStyle }} />
            <RTooltip content={<TooltipContent />} />
            <Legend />
            {trends.map((s, idx) => (
              <Line
                key={s.name}
                type="monotone"
                dataKey={s.name}
                name={`${s.name}${s.unit ? ` (${s.unit})` : ''}`}
                stroke={chartTheme.series[idx % chartTheme.series.length]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
