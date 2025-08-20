// src/pages/ReportScanner/components/AnalysisView.jsx
import SummaryCard from './SummaryCard';
import FlagsCard from './FlagsCard';
import RangeTable from './RangeTable';
import TrendsCard from './TrendsCard'; // works for ./TrendsCard.jsx or ./TrendsCard/index.jsx

export default function AnalysisView({ result }) {
  if (!result) return null;

  const summary = result.summary ?? null;
  const flags = result.flags ?? [];
  const panel = result.panel ?? result.tests ?? [];
  const trends = result.trends ?? [];

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* main */}
      <div className="lg:col-span-2 space-y-6">
        {summary && <SummaryCard summary={summary} />}
        <RangeTable panel={panel} />
      </div>

      {/* sidebar */}
      <aside className="space-y-6 lg:sticky lg:top-20 h-fit">
        <FlagsCard flags={flags} />
        {trends.length > 0 && <TrendsCard trends={trends} />}
      </aside>
    </section>
  );
}
