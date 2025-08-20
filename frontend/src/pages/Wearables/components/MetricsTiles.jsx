// src/pages/Wearables/components/MetricTiles.jsx
import Card, { CardContent } from '@/components/ui/Card.jsx';

function Tile({ label, value, unit, sub }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="mt-1 text-2xl font-semibold">
          {value ?? '—'} {unit}
        </p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function MetricTiles({ summary }) {
  const s = summary || {};
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Tile label="Steps" value={s.steps} unit="" sub={s.stepsGoal ? `Goal: ${s.stepsGoal}` : ''} />
      <Tile label="Avg HR" value={s.hr} unit="bpm" sub={s.hrRest ? `Rest: ${s.hrRest}` : ''} />
      <Tile label="Sleep" value={s.sleep} unit="h" sub={s.sleepQuality ? s.sleepQuality : ''} />
      <Tile label="Calories" value={s.calories} unit="kcal" sub={s.calGoal ? `Goal: ${s.calGoal}` : ''} />
    </div>
  );
}
