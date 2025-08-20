// src/lib/storage.js
// Simple namespaced storage with JSON helpers and in-memory fallback
const NS = 'mv';
const mem = new Map();

function k(key) {
  return `${NS}:${key}`;
}

function available() {
  try {
    const t = '__t__';
    localStorage.setItem(t, '1');
    localStorage.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

const hasLS = typeof window !== 'undefined' && available();

export const storage = {
  get(key, fallback = null) {
    if (hasLS) {
      const v = localStorage.getItem(k(key));
      return v ?? fallback;
    }
    return mem.has(key) ? mem.get(key) : fallback;
  },
  set(key, value) {
    if (hasLS) localStorage.setItem(k(key), String(value));
    else mem.set(key, String(value));
  },
  remove(key) {
    if (hasLS) localStorage.removeItem(k(key));
    else mem.delete(key);
  },
  getJSON(key, fallback = null) {
    const raw = this.get(key, null);
    if (raw == null) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  setJSON(key, obj) {
    try {
      this.set(key, JSON.stringify(obj));
    } catch {
      // ignore
    }
  },
  clearAll() {
    if (hasLS) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(`${NS}:`))
        .forEach((key) => localStorage.removeItem(key));
    } else {
      mem.clear();
    }
  },
};

export default storage;
