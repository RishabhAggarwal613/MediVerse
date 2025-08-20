// src/lib/axios.js
import axios from 'axios';

/**
 * API base + behavior flags
 * - VITE_API_URL: backend base URL (default '/api')
 * - VITE_WITH_CREDENTIALS: send cookies (needed for refresh cookies)
 * - VITE_GUEST_MODE: true = skip refresh flow (no backend required)
 * - VITE_PERSIST_TOKEN: 'local' | 'memory' | 'none' (default 'memory')
 */
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const WITH_CREDENTIALS = String(import.meta.env.VITE_WITH_CREDENTIALS || 'false') === 'true';
const GUEST_MODE = String(import.meta.env.VITE_GUEST_MODE || 'false') === 'true';
const PERSIST_MODE = (import.meta.env.VITE_PERSIST_TOKEN || 'memory').toLowerCase();

/** Storage keys */
const TOKEN_KEY = 'auth_token';

/** In-memory token (default). Safer than localStorage. */
let memoryToken = null;

/** Helpers to get/set/clear token across memory/localStorage */
const readStoredToken = () => {
  if (PERSIST_MODE === 'local') {
    try {
      return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    } catch {
      return null;
    }
  }
  if (PERSIST_MODE === 'memory') return memoryToken;
  return null; // 'none'
};

const writeStoredToken = (token) => {
  if (PERSIST_MODE === 'local') {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  } else if (PERSIST_MODE === 'memory') {
    memoryToken = token || null;
  }
};

/** Axios instance */
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: WITH_CREDENTIALS,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

/** Public API: set/clear token on client + axios */
export function setAuthToken(token) {
  writeStoredToken(token || null);
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;

  // Broadcast token changes (optional listener in app)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:token-updated', { detail: { token } }));
  }
}
export function clearAuthToken() {
  setAuthToken(null);
}
export function getAuthToken() {
  return readStoredToken();
}

/** Initialize bearer from storage at import time */
(() => {
  const t = readStoredToken();
  if (t) api.defaults.headers.common.Authorization = `Bearer ${t}`;
})();

/** REQUEST: attach latest token if missing */
api.interceptors.request.use((cfg) => {
  if (!cfg.headers?.Authorization) {
    const t = readStoredToken();
    if (t) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${t}` };
  }
  return cfg;
});

/** Simple refresh gate (skips in guest mode) */
let refreshPromise = null;
async function refreshToken() {
  if (GUEST_MODE) throw new Error('guest-mode-refresh-disabled');
  if (!refreshPromise) {
    refreshPromise = api
      .post('/auth/refresh') // expects { accessToken }
      .then((res) => {
        const next = res?.data?.accessToken;
        if (!next) throw new Error('no-access-token');
        setAuthToken(next);
        return next;
      })
      .catch((err) => {
        clearAuthToken();
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/** RESPONSE: on 401, try refresh once; else emit unauthorized event */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    const original = error?.config;

    // Bubble network timeouts etc.
    if (!status) return Promise.reject(error);

    if (status === 401) {
      // Notify app when unauthorized (even if we’ll try refresh)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { error } }));
      }

      // If already retried or guest mode → hard reject
      if (original?._retry || GUEST_MODE) {
        return Promise.reject(error);
      }

      // Mark and try refresh
      original._retry = true;
      try {
        const newToken = await refreshToken();
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newToken}` };
        return api(original);
      } catch {
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

/** Helper: subscribe to unauthorized events */
export function onUnauthorized(handler) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('auth:unauthorized', handler);
  return () => window.removeEventListener('auth:unauthorized', handler);
}

/** Helper: subscribe to token updates */
export function onTokenUpdated(handler) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('auth:token-updated', handler);
  return () => window.removeEventListener('auth:token-updated', handler);
}

export default api;
