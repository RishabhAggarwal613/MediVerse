// src/services/aiClient.js
import api from '@/lib/axios.js';
import { API } from '@/lib/constants.js';

/**
 * Send a chat message to MediAI.
 * @param {{ message: string, context?: object }} payload
 * @param {AbortSignal} [signal]
 * @returns {Promise<{reply: string, sources?: any[]}>}
 */
export async function askAI(payload, signal) {
  const { data } = await api.post(API.MEDI_AI, payload, { signal });
  return data;
}
