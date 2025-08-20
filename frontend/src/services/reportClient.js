// src/services/reportClient.js
import api from '@/lib/axios.js';
import { API } from '@/lib/constants.js';

/**
 * Upload a medical report file.
 * @param {File} file
 * @param {{ signal?: AbortSignal, onUploadProgress?: (e: ProgressEvent) => void }} [opts]
 * @returns {Promise<{uploadId: string, filename: string, size: number}>}
 */
export async function uploadReport(file, opts = {}) {
  const form = new FormData();
  form.append('file', file);

  const { data } = await api.post(API.REPORTS.UPLOAD, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    signal: opts.signal,
    onUploadProgress: opts.onUploadProgress,
  });
  return data;
}

/**
 * Trigger analysis for an uploaded report.
 * @param {{ uploadId: string }} payload
 * @param {AbortSignal} [signal]
 * @returns {Promise<{analysis: any, flags?: any[], summary?: any}>}
 */
export async function analyzeReport(payload, signal) {
  const { data } = await api.post(API.REPORTS.ANALYZE, payload, { signal });
  return data;
}

/**
 * List previously processed reports.
 * @param {AbortSignal} [signal]
 * @returns {Promise<{items: any[], total: number}>}
 */
export async function listReports(signal) {
  const { data } = await api.get(API.REPORTS.LIST, { signal });
  return data;
}
