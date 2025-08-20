// src/lib/constants.js
export const APP_NAME = 'MediVerse';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  MEDI_AI: '/medi-ai',
  REPORT_SCANNER: '/report-scanner',
  WEARABLES: '/wearables',
  DIET_PLANNER: '/diet-planner',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
};

export const API = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    ME: '/auth/me',
  },
  MEDI_AI: '/ai/chat',
  REPORTS: {
    UPLOAD: '/reports/upload',
    ANALYZE: '/reports/analyze',
    LIST: '/reports',
  },
  WEARABLES: {
    CONNECT: '/wearables/connect',
    STATUS: '/wearables/status',
    SYNC: '/wearables/sync',
    METRICS: '/wearables/metrics',
  },
  DIET: {
    PLAN: '/diet/plan',
    DOWNLOAD: '/diet/plan/pdf',
  },
  DASHBOARD: '/dashboard/overview',
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  PREFS: 'mv_user_prefs',
};

export const LIMITS = {
  REPORT_MAX_MB: 10,
  UPLOAD_TIMEOUT_MS: 60_000,
};

export const MIME = {
  REPORTS: ['application/pdf', 'image/png', 'image/jpeg'],
};

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export const THEME = {
  bg: '#0B0F10',
  surface: '#0F1412',
  divider: '#1A1F1D',
  text: '#E5E7EB',
  textMuted: '#9CA3AF',
  primary: '#22C55E',
  primaryHover: '#16A34A',
};
