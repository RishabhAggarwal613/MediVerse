// src/services/dietClient.js
import api from '@/lib/axios.js';
import { API } from '@/lib/constants.js';

/**
 * Generate a diet plan based on user preferences/profile.
 * @param {object} payload
 * @param {AbortSignal} [signal]
 * @returns {Promise<{planId: string, plan: any}>}
 */
export async function createDietPlan(payload, signal) {
  const { data } = await api.post(API.DIET.PLAN, payload, { signal });
  return data;
}

/**
 * Download diet plan PDF.
 * @param {{ planId: string }} params
 * @param {AbortSignal} [signal]
 * @returns {Promise<Blob>} PDF blob
 */
export async function downloadDietPdf(params, signal) {
  const { data } = await api.get(API.DIET.DOWNLOAD, {
    params,
    responseType: 'blob',
    signal,
  });
  return data; // blob
}
