// src/pages/DietPlanner/components/PlanOptions.jsx
import Select from '@/components/ui/Select.jsx';
import Input from '@/components/ui/Input.jsx';
import Tabs from '@/components/ui/Tabs.jsx';

const DIET_TYPES = [
  { value: 'balanced', label: 'Balanced' },
  { value: 'keto', label: 'Keto' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'low-carb', label: 'Low carb' },
  { value: 'high-protein', label: 'High protein' },
];

export default function PlanOptions({ value, onChange }) {
  const v = value || {
    dietType: 'balanced',
    caloriesTarget: 2200,
    mealsPerDay: 3,
    duration: 'week',
    allergies: [],
  };

  const set = (patch) => onChange?.({ ...v, ...patch });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Select
        label="Diet type"
        value={v.dietType}
        onChange={(e) => set({ dietType: e.target.value })}
      >
        {DIET_TYPES.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </Select>

      <Input
        label="Daily calories target"
        type="number"
        value={v.caloriesTarget}
        onChange={(e) => set({ caloriesTarget: Number(e.target.value || 0) })}
        helperText="Customize as needed (kcal)"
      />

      <Input
        label="Meals per day"
        type="number"
        value={v.mealsPerDay}
        onChange={(e) => set({ mealsPerDay: Math.max(1, Number(e.target.value || 1)) })}
      />

      <Tabs
        className="sm:col-span-2"
        tabs={[
          { value: 'week', label: '1 Week', content: null },
          { value: 'month', label: '1 Month', content: null },
        ]}
        value={v.duration}
        onValueChange={(duration) => set({ duration })}
      />
    </div>
  );
}
