// src/pages/DietPlanner/components/ProfileForm.jsx
import Input from '@/components/ui/Input.jsx';
import Select from '@/components/ui/Select.jsx';

export default function ProfileForm({ value, onChange }) {
  const v = value || {
    name: '',
    age: '',
    gender: 'other',
    heightCm: '',
    weightKg: '',
    allergies: '',
  };

  const set = (patch) => onChange?.({ ...v, ...patch });

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input label="Name" value={v.name} onChange={(e) => set({ name: e.target.value })} />
      <Select
        label="Gender"
        value={v.gender}
        onChange={(e) => set({ gender: e.target.value })}
      >
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </Select>
      <Input
        label="Age"
        type="number"
        value={v.age}
        onChange={(e) => set({ age: Number(e.target.value || 0) })}
      />
      <Input
        label="Height (cm)"
        type="number"
        value={v.heightCm}
        onChange={(e) => set({ heightCm: Number(e.target.value || 0) })}
      />
      <Input
        label="Weight (kg)"
        type="number"
        value={v.weightKg}
        onChange={(e) => set({ weightKg: Number(e.target.value || 0) })}
      />
      <Input
        className="sm:col-span-2"
        label="Allergies (comma-separated)"
        value={v.allergies}
        onChange={(e) => set({ allergies: e.target.value })}
        placeholder="e.g., peanuts, lactose"
      />
    </div>
  );
}
