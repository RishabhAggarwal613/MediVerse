// src/pages/Dashboard/index.jsx
import { useQuery } from '@tanstack/react-query';
import { getOverview } from '@/services/dashboardClient.js';
import TodayTiles from './components/TodayTiles.jsx';
import Trends from './components/Trends.jsx';
import ReportsVault from './components/ReportsVault.jsx';
import DietSummary from './components/DietSummary.jsx';
import Insights from './components/Insights.jsx';
import SyncStrip from './components/SyncStrip.jsx';
import FullScreenLoader from '@/components/ui/FullScreenLoader.jsx';

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['overview', { range: '30d' }],
    queryFn: ({ queryKey, signal }) => getOverview(queryKey[1], signal),
    staleTime: 60_000,
  });

  if (isLoading) return <FullScreenLoader message="Loading dashboard…" />;
  if (error) {
    return (
      <div className="rounded-xl border border-[#1A1F1D] bg-[#0F1412] p-4 text-sm text-red-300">
        Failed to load dashboard.
      </div>
    );
  }

  const tiles = data?.tiles || [
    { label: 'Steps', value: 7421, delta: 320 },
    { label: 'Sleep (hrs)', value: 7.2, delta: -0.3, unit: 'h' },
    { label: 'Avg HR', value: 72, delta: -2, unit: 'bpm' },
    { label: 'Calories', value: 2150, delta: 120, unit: 'kcal' },
  ];

  const trendSeries = [
    { dataKey: 'steps', label: 'Steps' },
    { dataKey: 'hr', label: 'Heart rate' },
  ];
  const trends = data?.trends || [
    { date: new Date().toISOString(), steps: 6200, hr: 74 },
  ];

  const reports = data?.reports?.items || [];
  const diet = data?.diet || { calories: 2200, protein: 130, carbs: 240, fat: 70 };
  const insights = data?.insights || [
    { title: 'Great step count!', description: 'You exceeded your daily step goal.', severity: 'low' },
  ];
  const lastSync = data?.lastSync || null;

  return (
    <div className="space-y-6">
      <SyncStrip lastSync={lastSync} />
      <TodayTiles tiles={tiles} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Trends title="Activity & HR (30 days)" data={trends} series={trendSeries} />
        </div>
        <DietSummary summary={diet} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReportsVault items={reports} />
        </div>
        <Insights items={insights} />
      </div>
    </div>
  );
}
