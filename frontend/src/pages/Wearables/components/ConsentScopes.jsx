// src/pages/Wearables/components/ConsentScopes.jsx
import { useMemo } from 'react';

const DEFAULT_SCOPES = [
  { key: 'activity', label: 'Activity (steps, distance)', desc: 'Daily activity metrics' },
  { key: 'hr', label: 'Heart rate', desc: 'Resting and active HR' },
  { key: 'sleep', label: 'Sleep', desc: 'Sleep duration & stages' },
  { key: 'body', label: 'Body metrics', desc: 'Weight, BMI (if available)' },
];

export default function ConsentScopes({ value = [], onChange, scopes = DEFAULT_SCOPES }) {
  const set = (key, checked) => {
    const next = checked ? Array.from(new Set([...value, key])) : value.filter((k) => k !== key);
    onChange?.(next);
  };

  const allSelected = useMemo(() => scopes.every((s) => value.includes(s.key)), [scopes, value]);

  return (
    <div className="rounded-2xl border border-[#1A1F1D] bg-[#0B0F10] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-200">Consent scopes</p>
        <button
          type="button"
          onClick={() => onChange?.(allSelected ? [] : scopes.map((s) => s.key))}
          className="text-xs text-emerald-400 hover:text-emerald-300"
        >
          {allSelected ? 'Clear all' : 'Select all'}
        </button>
      </div>
      <ul className="space-y-2">
        {scopes.map((s) => (
          <li key={s.key} className="flex items-start gap-3">
            <input
              id={`scope-${s.key}`}
              type="checkbox"
              checked={value.includes(s.key)}
              onChange={(e) => set(s.key, e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-[#1A1F1D] bg-[#0B0F10] text-emerald-500 focus:ring-emerald-500/60"
            />
            <label htmlFor={`scope-${s.key}`} className="flex-1">
              <p className="text-sm text-gray-200">{s.label}</p>
              <p className="text-xs text-gray-500">{s.desc}</p>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
