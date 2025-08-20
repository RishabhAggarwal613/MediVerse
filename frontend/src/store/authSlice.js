// src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { setAuthToken, clearAuthToken } from '@/lib/axios';

// --- Helpers ---------------------------------------------------------------
const createEphemeralGuestToken = () => {
  // lightweight unsigned "JWT-like" token for guest sessions (frontend-only)
  const b64 = (obj) => btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  const header = { alg: 'none', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: 'guest',
    role: 'guest',
    iat: now,
    exp: now + 60 * 60 * 6, // 6 hours
  };
  return `${b64(header)}.${b64(payload)}.`; // no signature
};

// --- State ----------------------------------------------------------------
const initialState = {
  user: null,
  token: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  isAuthenticated: false, // true for both registered users and guest session
};

// --- Slice ----------------------------------------------------------------
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.status = 'loading';
      state.error = null;
    },
    loginSuccess(state, action) {
      const { user, token } = action.payload || {};
      state.user = user ?? null;
      state.token = token ?? null;
      state.isAuthenticated = Boolean(token);
      state.status = 'succeeded';
      state.error = null;
    },
    loginFailure(state, action) {
      state.status = 'failed';
      state.error = action.payload || 'Login failed';
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    updateUser(state, action) {
      state.user = action.payload ?? state.user;
    },
    logout() {
      return { ...initialState };
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, updateUser } = authSlice.actions;

// Alias for compatibility with earlier code that imports `setCredentials`
export const setCredentials = loginSuccess;

// --- Thunks (side effects) -------------------------------------------------

/**
 * Guest login (frontend-only).
 * Generates an ephemeral token, stores it via axios helper, and commits to state.
 */
export const loginGuest = () => (dispatch) => {
  dispatch(loginStart());
  try {
    const token = createEphemeralGuestToken();
    const user = { id: 'guest', name: 'Guest', email: null, avatar: null, role: 'guest' };
    setAuthToken(token);
    dispatch(loginSuccess({ user, token }));
  } catch (err) {
    dispatch(loginFailure('Unable to start guest session'));
  }
};

/**
 * Clear credentials everywhere.
 * Use this instead of dispatching `logout()` directly when you also want to clear axios token.
 */
export const doLogout = () => (dispatch) => {
  try {
    clearAuthToken();
  } finally {
    dispatch(logout());
  }
};

// --- Selectors -------------------------------------------------------------
export const selectAuth = (s) => s.auth;
export const selectUser = (s) => s.auth.user;
export const selectToken = (s) => s.auth.token;
export const selectIsAuthenticated = (s) => s.auth.isAuthenticated;
export const selectIsGuest = (s) => s.auth.user?.role === 'guest';

export default authSlice.reducer;
