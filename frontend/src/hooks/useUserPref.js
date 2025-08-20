// src/hooks/useUserPref.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const STORAGE_KEY = 'mv_user_prefs';

const defaultPrefs = {
  theme: 'dark', // 'dark' | 'light' | 'system'
  density: 'comfortable', // 'comfortable' | 'compact'
  language: 'en',
  reduceMotion: false,
};

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultPrefs, ...JSON.parse(raw) } : { ...defaultPrefs };
  } catch {
    return { ...defaultPrefs };
  }
}

export default function useUserPref() {
  const { i18n } = useTranslation();
  const [prefs, setPrefs] = useState(defaultPrefs);

  // hydrate from storage once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const initial = loadPrefs();

    // respect prefers-reduced-motion
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    initial.reduceMotion = media.matches;

    setPrefs(initial);

    const listener = (e) => {
      setPrefs((p) => ({ ...p, reduceMotion: e.matches }));
    };
    media.addEventListener?.('change', listener);
    return () => media.removeEventListener?.('change', listener);
  }, []);

  // persist + side effects
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // save
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

    // html theme class
    const root = document.documentElement;
    const resolvedTheme =
      prefs.theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : prefs.theme;

    root.classList.toggle('dark', resolvedTheme === 'dark');

    // language
    if (i18n.language !== prefs.language) {
      i18n.changeLanguage(prefs.language).catch(() => {});
    }
  }, [prefs, i18n]);

  const setTheme = useCallback((theme) => {
    setPrefs((p) => ({ ...p, theme }));
  }, []);

  const toggleTheme = useCallback(() => {
    setPrefs((p) => ({ ...p, theme: p.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  const setDensity = useCallback((density) => {
    setPrefs((p) => ({ ...p, density }));
  }, []);

  const setLanguage = useCallback((language) => {
    setPrefs((p) => ({ ...p, language }));
  }, []);

  const value = useMemo(
    () => ({
      prefs,
      theme: prefs.theme,
      density: prefs.density,
      language: prefs.language,
      reduceMotion: prefs.reduceMotion,
      setTheme,
      toggleTheme,
      setDensity,
      setLanguage,
    }),
    [prefs, setTheme, toggleTheme, setDensity, setLanguage]
  );

  return value;
}
