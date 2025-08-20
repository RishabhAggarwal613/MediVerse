// src/pages/Dashboard/components/Trends.jsx
import Card, { CardContent, CardHeader } from '@/components/ui/Card.jsx';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { axisStyle, tickStyle, chartTheme, makeGradientId, AreaGradient } from '@/lib/charts.js';
import dayjs from 'dayjs';

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#1A1F1D] bg-[#0F1412] px-3 py-2 text-sm">
      <p className="text-gray-300">{dayjs(label).format('DD MMM')}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-gray-400">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          <span>{p.name}</span>
          <span className="ml-auto text-gray-300">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Trends({ title = 'Health trends', data = [], series = [] }) {
  // data: [{date, steps, hr, sleep, ...}]
  // series: [{ dataKey: 'steps', label: 'Steps' }, ...]
  if (!data?.length || !series?.length) return null;

  const gid = makeGradientId('trends');

  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
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
            {series.map((s, idx) => (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.label || s.dataKey}
                stroke={chartTheme.series[idx % chartTheme.series.length]}
                fillOpacity={1}
                fill={`url(#${gid})`}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
