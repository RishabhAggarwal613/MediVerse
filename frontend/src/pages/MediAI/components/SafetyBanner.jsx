// src/pages/MediAi/components/SafetyBanner.jsx
import Card, { CardContent } from '@/components/ui/Card.jsx';

export default function SafetyBanner() {
  return (
    <Card className="mb-4">
      <CardContent className="flex items-start gap-3 text-sm text-gray-300">
        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">!</span>
        <p>
          MediAI provides educational information, not a diagnosis. If you’re experiencing an emergency or worsening symptoms, seek professional medical care.
        </p>
      </CardContent>
    </Card>
  );
}
