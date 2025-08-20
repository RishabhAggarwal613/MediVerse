// src/components/ui/Tabs.jsx
import { useId, useState } from 'react';
import clsx from 'clsx';

export default function Tabs({
  tabs = [],
  defaultValue,
  value,
  onValueChange,
  className,
}) {
  const id = useId();
  const controlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? tabs[0]?.value);
  const current = controlled ? value : internal;

  const setValue = (v) => {
    if (!controlled) setInternal(v);
    onValueChange?.(v);
  };

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="flex gap-2 rounded-xl border border-[#1A1F1D] bg-[#0F1412] p-1"
      >
        {tabs.map((t) => (
          <button
            key={t.value}
            id={`${id}-${t.value}`}
            role="tab"
            aria-selected={current === t.value}
            onClick={() => setValue(t.value)}
            className={clsx(
              'flex-1 rounded-lg px-3 py-2 text-sm transition',
              current === t.value
                ? 'bg-emerald-500 text-black'
                : 'text-gray-300 hover:bg-white/5'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabs.map(
        (t) =>
          current === t.value && (
            <div
              key={t.value}
              role="tabpanel"
              aria-labelledby={`${id}-${t.value}`}
              className="mt-3"
            >
              {t.content}
            </div>
          )
      )}
    </div>
  );
}
