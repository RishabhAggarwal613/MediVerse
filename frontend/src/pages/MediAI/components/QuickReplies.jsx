// src/pages/MediAi/components/QuickReplies.jsx
import Button from '@/components/ui/Button.jsx';

const SUGGESTIONS = [
  'I have a headache and fever—what could it be?',
  'My fasting sugar is 112 mg/dL—is that okay?',
  'How much water should I drink daily?',
  'What are healthy Indian breakfast ideas under 400 kcal?',
];

export default function QuickReplies({ onPick }) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUGGESTIONS.map((s, i) => (
        <Button
          key={i}
          variant="outline"
          size="sm"
          className="max-w-full truncate"
          onClick={() => onPick?.(s)}
          title={s}
        >
          {s}
        </Button>
      ))}
    </div>
  );
}
