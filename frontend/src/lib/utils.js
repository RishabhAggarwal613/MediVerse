// src/lib/utils.js
import clsx from 'clsx';

// classnames helper
export const cx = (...args) => clsx(...args);

// Promise helpers
export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
export const noop = () => {};

export function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function throttle(fn, wait = 200) {
  let last = 0;
  let timer;
  return (...args) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      clearTimeout(timer);
      last = now;
      fn(...args);
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now();
        timer = null;
        fn(...args);
      }, remaining);
    }
  };
}

// Numbers & bytes
export function formatNumber(n, digits = 2) {
  return typeof n === 'number'
    ? new Intl.NumberFormat('en-IN', { maximumFractionDigits: digits }).format(n)
    : n;
}
export function compactNumber(n) {
  return typeof n === 'number'
    ? new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
    : n;
}
export function formatBytes(bytes, decimals = 1) {
  if (!bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// Errors
export function getErrorMessage(err, fallback = 'Something went wrong') {
  const msg =
    err?.response?.data?.message ||
    err?.message ||
    (typeof err === 'string' ? err : null);
  return msg || fallback;
}

// Download helper
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Simple event bus
export const bus = (() => {
  const map = new Map();
  return {
    on(evt, fn) {
      const arr = map.get(evt) || [];
      arr.push(fn);
      map.set(evt, arr);
      return () => this.off(evt, fn);
    },
    off(evt, fn) {
      const arr = map.get(evt) || [];
      map.set(
        evt,
        arr.filter((f) => f !== fn)
      );
    },
    emit(evt, payload) {
      (map.get(evt) || []).forEach((fn) => fn(payload));
    },
  };
})();
