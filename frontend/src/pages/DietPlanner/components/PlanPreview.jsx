// src/pages/DietPlanner/components/PlanPreview.jsx
import Card, { CardContent, CardHeader } from '@/components/ui/Card.jsx';
import DownloadPDFButton from './DownloadPDFButton.jsx';

function DayCard({ day }) {
  return (
    <div className="rounded-xl border border-[#1A1F1D] bg-[#0B0F10] p-4">
      <p className="mb-2 text-sm text-gray-400">{day.title || day.date}</p>
      <ul className="space-y-2">
        {day.meals?.map((m, i) => (
          <li key={i} className="rounded-lg border border-[#1A1F1D] bg-[#0F1412] p-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-200">{m.name}</span>
              <span className="ml-auto text-xs text-gray-400">{m.kcal} kcal</span>
            </div>
            {m.items?.length ? (
              <p className="mt-1 text-xs text-gray-400">{m.items.join(', ')}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PlanPreview({ plan, planId }) {
  if (!plan) return null;

  const days = plan.days?.length
    ? plan.days
    : [
        {
          title: 'Day 1',
          meals: [
            { name: 'Breakfast', kcal: 450, items: ['Oats', 'Milk', 'Banana'] },
            { name: 'Lunch', kcal: 700, items: ['Grilled paneer', 'Quinoa', 'Salad'] },
            { name: 'Dinner', kcal: 650, items: ['Dal', 'Brown rice', 'Mixed veg'] },
          ],
        },
      ];

  return (
    <Card>
      <CardHeader
        title="Plan preview"
        description={plan.summary || 'Generated meal plan based on your preferences'}
        actions={<DownloadPDFButton planId={planId} />}
      />
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {days.map((d, i) => (
          <DayCard key={i} day={d} />
        ))}
      </CardContent>
    </Card>
  );
}
