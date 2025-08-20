// src/services/dashboardClient.js
import api from '@/lib/axios.js';
import { API } from '@/lib/constants.js';

/**
 * Get dashboard overview aggregating AI chat insights, reports, wearables, and diet.
 * @param {{ range?: '7d'|'30d'|'90d' }} [params]
 * @param {AbortSignal} [signal]
 * @returns {Promise<{today: any, tiles: any[], trends: any[], insights: any[]}>}
 */
export async function getOverview(params = {}, signal) {
  const { data } = await api.get(API.DASHBOARD, { params, signal });
  return data;
}
export * from './dashboardClient.js';
