// src/pages/ReportScanner/components/SummaryCard.jsx
import Card, { CardContent, CardHeader } from '@/components/ui/Card.jsx';

export default function SummaryCard({ summary }) {
  if (!summary) return null;

  const bullets =
    Array.isArray(summary) ? summary : summary.points || [];

  return (
    <Card>
      <CardHeader title="Summary" description="AI overview of your report" />
      <CardContent>
        {bullets.length ? (
          <ul className="list-disc space-y-2 pl-5 text-sm text-gray-300">
            {bullets.map((b, i) => (
              <li key={i}>{typeof b === 'string' ? b : b?.text}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No summary available.</p>
        )}
      </CardContent>
    </Card>
  );
}
