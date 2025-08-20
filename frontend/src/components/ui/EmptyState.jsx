// src/components/ui/EmptyState.jsx
import Button from './Button.jsx';

export default function EmptyState({
  icon,
  title = 'Nothing here yet',
  description = 'When you add data, you’ll see it show up here.',
  actionLabel,
  onAction,
}) {
  const Icon = icon;
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#1A1F1D] bg-[#0F1412] px-6 py-12 text-center">
      {Icon && <Icon className="mb-3 h-10 w-10 text-emerald-500" />}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 max-w-prose text-sm text-gray-400">{description}</p>
      {actionLabel && (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
