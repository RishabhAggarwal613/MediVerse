// src/pages/Wearables/components/ProviderConnect.jsx
import { useState } from 'react';
import Card, { CardContent, CardHeader } from '@/components/ui/Card.jsx';
import Button from '@/components/ui/Button.jsx';
import ConsentScopes from './ConsentScopes.jsx';
import { connectProvider } from '@/services/wearableClient.js';

const PROVIDERS = [
  { id: 'google-fit', name: 'Google Fit' },
  { id: 'fitbit', name: 'Fitbit' },
  { id: 'garmin', name: 'Garmin' },
];

export default function ProviderConnect({ onConnected }) {
  const [provider, setProvider] = useState(PROVIDERS[0].id);
  const [scopes, setScopes] = useState(['activity', 'hr', 'sleep']);
  const [loading, setLoading] = useState(false);

  async function onConnect() {
    setLoading(true);
    try {
      const res = await connectProvider({ provider, scopes });
      if (res?.authUrl) {
        // Redirect to provider OAuth
        window.location.href = res.authUrl;
      } else {
        // Some backends immediately connect for device-code flows
        onConnected?.(res);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Connect a provider"
        description="Choose your wearable provider and consent scopes."
      />
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr,2fr]">
        <div className="rounded-2xl border border-[#1A1F1D] bg-[#0B0F10] p-4">
          <label className="mb-2 block text-sm text-gray-300">Provider</label>
          <select
            className="w-full rounded-xl border border-[#1A1F1D] bg-[#0B0F10] px-3 py-2 text-sm text-gray-100 focus:ring-2 focus:ring-emerald-500/60"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            {PROVIDERS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <Button className="mt-4 w-full" onClick={onConnect} loading={loading}>
            {loading ? 'Connecting…' : 'Connect'}
          </Button>
        </div>

        <ConsentScopes value={scopes} onChange={setScopes} />
      </CardContent>
    </Card>
  );
}
