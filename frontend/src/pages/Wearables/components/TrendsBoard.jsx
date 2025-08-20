// src/pages/Wearables/components/TrendBoard.jsx
import Card, { CardContent, CardHeader } from '@/components/ui/Card.jsx';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import dayjs from 'dayjs';
import { axisStyle, tickStyle, chartTheme, AreaGradient, makeGradientId } from '@/lib/charts.js';

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

export default function TrendBoard({ data = [] }) {
  // expected data: [{ date, steps, hr, sleep }, ...]
  if (!data.length) return null;
  const gid = makeGradientId('wear-trend');

  return (
    <Card>
      <CardHeader title="Trends" description="Steps, heart rate, and sleep over time" />
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
            <defs>
              <AreaGradient id={gid} />
            </defs>
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
            <Area
              name="Steps"
              dataKey="steps"
              type="monotone"
              stroke={chartTheme.series[0]}
              fill={`url(#${gid})`}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Area
              name="Heart rate"
              dataKey="hr"
              type="monotone"
              stroke={chartTheme.series[1]}
              fill={`url(#${gid})`}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Area
              name="Sleep (h)"
              dataKey="sleep"
              type="monotone"
              stroke={chartTheme.series[2]}
              fill={`url(#${gid})`}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
