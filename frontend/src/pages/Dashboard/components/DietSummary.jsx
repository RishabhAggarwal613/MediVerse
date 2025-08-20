// src/pages/Dashboard/components/DietSummary.jsx
import Card, { CardContent, CardHeader } from '@/components/ui/Card.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';
import { chartTheme } from '@/lib/charts.js';

export default function DietSummary({ summary }) {
  // summary: { calories, protein, carbs, fat }
  if (!summary) return null;
  const data = [
    { name: 'Protein', value: summary.protein || 0 },
    { name: 'Carbs', value: summary.carbs || 0 },
    { name: 'Fat', value: summary.fat || 0 },
  ];
  const colors = chartTheme.series;

  return (
    <Card>
      <CardHeader
        title="Diet summary"
        description={`Daily target: ${summary.calories ? `${summary.calories} kcal` : '—'}`}
      />
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <RTooltip
                contentStyle={{
                  background: '#0F1412',
                  border: '1px solid #1A1F1D',
                  color: '#E5E7EB',
                }}
              />
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2 text-sm">
          {data.map((d, i) => (
            <li key={d.name} className="flex items-center gap-3">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: colors[i % colors.length] }}
              />
              <span className="text-gray-300">{d.name}</span>
              <span className="ml-auto text-gray-400">{d.value} g</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
