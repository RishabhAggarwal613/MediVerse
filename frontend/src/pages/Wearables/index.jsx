// src/pages/Wearables/index.jsx
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProviderConnect from './components/ProviderConnect';
import SyncStatus from './components/SyncStatus';
import MetricTiles from './components/MetricsTiles';
import TrendBoard from './components/TrendsBoard';
import { getConnectStatus, getMetrics, syncNow } from '@/services/wearableClient';
import FullScreenLoader from '@/components/ui/FullScreenLoader';
import dayjs from 'dayjs';

export default function WearablesPage() {
  const qc = useQueryClient();
  const [syncing, setSyncing] = useState(false);
  useEffect(() => {
    document.title = 'Wearables • MediVerse';
  }, []);

  const statusQ = useQuery({
    queryKey: ['wearables', 'status'],
    queryFn: ({ signal }) => getConnectStatus(signal),
    staleTime: 60_000,
  });

  const metricsQ = useQuery({
    queryKey: ['wearables', 'metrics', { range: '30d' }],
    queryFn: ({ queryKey, signal }) => getMetrics(queryKey[2], signal),
    enabled: Boolean(statusQ.data?.connected),
    staleTime: 60_000,
  });

  async function handleSync() {
    setSyncing(true);
    try {
      await syncNow();
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['wearables', 'status'] }),
        qc.invalidateQueries({ queryKey: ['wearables', 'metrics'] }),
      ]);
    } finally {
      setSyncing(false);
    }
  }

  const connected = Boolean(statusQ.data?.connected);
  const summary = metricsQ.data?.summary || {
    steps: 7200,
    stepsGoal: 8000,
    hr: 72,
    hrRest: 60,
    sleep: 7.1,
    sleepQuality: 'Good',
    calories: 2150,
    calGoal: 2300,
  };

  const series = useMemo(() => {
    const s = metricsQ.data?.series;
    if (Array.isArray(s) && s.length) return s;
    // fallback demo series
    const today = dayjs();
    return Array.from({ length: 14 }, (_, i) => {
      const d = today.subtract(13 - i, 'day').format('YYYY-MM-DD');
      return {
        date: d,
        steps: 5000 + Math.round(Math.random() * 4000),
        hr: 65 + Math.round(Math.random() * 15),
        sleep: Math.round((5.5 + Math.random() * 3) * 10) / 10,
      };
    });
  }, [metricsQ.data]);

  if (statusQ.isLoading) return <FullScreenLoader message="Checking wearable status…" />;

  return (
    <div className="space-y-6">
      {!connected && (
        <ProviderConnect onConnected={() => statusQ.refetch()} />
      )}

      <SyncStatus status={statusQ.data} onSync={handleSync} syncing={syncing} />

      <Card>
        <CardHeader title="Today" description="Key metrics from your latest sync" />
        <CardContent>
          <MetricTiles summary={summary} />
        </CardContent>
      </Card>

      <TrendBoard data={series} />
    </div>
  );
}
