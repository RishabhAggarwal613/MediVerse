// src/pages/Wearables/components/SyncStatus.jsx
import Card, { CardContent } from '@/components/ui/Card.jsx';
import Button from '@/components/ui/Button.jsx';
import dayjs from 'dayjs';

export default function SyncStatus({ status, onSync, syncing }) {
  const connected = Boolean(status?.connected);
  const providers = status?.providers || [];
  const lastSync = status?.lastSync || null;

  return (
    <Card>
      <CardContent className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-gray-300">
            {connected ? 'Device connected' : 'No device connected'}
          </p>
          <p className="text-xs text-gray-500">
            {connected
              ? `Providers: ${providers.map((p) => p.name || p.id).join(', ') || '—'}`
              : 'Connect to start syncing data'}
          </p>
          <p className="text-xs text-gray-500">
            Last sync: {lastSync ? dayjs(lastSync).format('DD MMM, HH:mm') : '—'}
          </p>
        </div>
        <Button onClick={onSync} loading={syncing} disabled={!connected}>
          {syncing ? 'Syncing…' : 'Sync now'}
        </Button>
      </CardContent>
    </Card>
  );
}
