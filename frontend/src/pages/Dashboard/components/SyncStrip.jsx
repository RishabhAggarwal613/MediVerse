// src/pages/Dashboard/components/SyncStrip.jsx
import Button from '@/components/ui/Button.jsx';
import Card, { CardContent } from '@/components/ui/Card.jsx';
import { useState } from 'react';
import { syncNow } from '@/services/wearableClient.js';
import dayjs from 'dayjs';

export default function SyncStrip({ lastSync }) {
  const [syncing, setSyncing] = useState(false);
  const [ts, setTs] = useState(lastSync);

  async function onSync() {
    setSyncing(true);
    try {
      const res = await syncNow();
      setTs(res?.syncedAt || new Date().toISOString());
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-gray-300">Wearables sync</p>
          <p className="text-xs text-gray-500">
            Last sync:{' '}
            {ts ? dayjs(ts).format('DD MMM, HH:mm') : 'Not synced yet'}
          </p>
        </div>
        <Button onClick={onSync} loading={syncing}>
          {syncing ? 'Syncing…' : 'Sync now'}
        </Button>
      </CardContent>
    </Card>
  );
}
