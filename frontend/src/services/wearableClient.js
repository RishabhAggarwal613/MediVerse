// src/services/wearableClient.js
import api from '@/lib/axios.js';
import { API } from '@/lib/constants.js';

/**
 * Begin OAuth/device connect for a wearable provider.
 * @param {{ provider: string, scopes?: string[] }} payload
 * @param {AbortSignal} [signal]
 * @returns {Promise<{authUrl?: string, status: string}>}
 */
export async function connectProvider(payload, signal) {
  const { data } = await api.post(API.WEARABLES.CONNECT, payload, { signal });
  return data;
}

/** @returns {Promise<{connected: boolean, providers: any[]}>} */
export async function getConnectStatus(signal) {
  const { data } = await api.get(API.WEARABLES.STATUS, { signal });
  return data;
}

/** @returns {Promise<{ok: boolean, syncedAt: string}>} */
export async function syncNow(signal) {
  const { data } = await api.post(API.WEARABLES.SYNC, null, { signal });
  return data;
}

/**
 * Fetch wearable metrics (steps, hr, sleep, etc.).
 * @param {{ from?: string, to?: string, metric?: string }} [params]
 * @param {AbortSignal} [signal]
 * @returns {Promise<{series: any[], summary?: any}>}
 */
export async function getMetrics(params = {}, signal) {
  const { data } = await api.get(API.WEARABLES.METRICS, { params, signal });
  return data;
}
