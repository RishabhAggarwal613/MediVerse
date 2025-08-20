// src/hooks/useAuth.js
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api, { setAuthToken, clearAuthToken, onUnauthorized, getAuthToken } from '@/lib/axios.js';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  updateUser,
  doLogout,
  loginGuest as loginGuestThunk,
} from '@/store/authSlice.js';

export default function useAuth() {
  const dispatch = useDispatch();
  const { user, token, status, error } = useSelector((s) => s.auth || {});

  // Derived: auth status
  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  // Keep axios token in sync if store reloads from persisted token mode
  useEffect(() => {
    const current = token || getAuthToken?.();
    if (current) setAuthToken(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Auto-logout on 401 (emitted by axios interceptor)
  useEffect(() => {
    const off = onUnauthorized?.(() => {
      dispatch(doLogout());
    });
    return () => { if (off) off(); };
  }, [dispatch]);

  // --- Actions -------------------------------------------------------------

  const login = useCallback(
    async ({ email, password }) => {
      dispatch(loginStart());
      try {
        const res = await api.post('/auth/login', { email, password });
        const data = res?.data || {};
        const jwt = data.accessToken || data.token;
        const me = data.user ?? null;
        if (!jwt) throw new Error('Missing token from server');
        setAuthToken(jwt);
        dispatch(loginSuccess({ user: me, token: jwt }));
        return me;
      } catch (e) {
        const message = e?.response?.data?.message || e.message || 'Login failed';
        dispatch(loginFailure(message));
        throw new Error(message);
      }
    },
    [dispatch]
  );

  const signup = useCallback(
    async (payload) => {
      dispatch(loginStart());
      try {
        // Prefer /auth/signup; if backend uses /auth/register, fall back.
        let res;
        try {
          res = await api.post('/auth/signup', payload);
        } catch {
          res = await api.post('/auth/register', payload);
        }
        const data = res?.data || {};
        const jwt = data.accessToken || data.token;
        const me = data.user ?? null;

        if (jwt) {
          setAuthToken(jwt);
          dispatch(loginSuccess({ user: me, token: jwt }));
          return me;
        }

        // No token returned → require manual login, but keep UX clean
        dispatch(loginFailure(null));
        return data;
      } catch (e) {
        const message = e?.response?.data?.message || e.message || 'Signup failed';
        dispatch(loginFailure(message));
        throw new Error(message);
      }
    },
    [dispatch]
  );

  const loginWith = useCallback((provider) => {
    const base = import.meta.env.VITE_API_URL || '/api';
    window.location.href = `${base}/auth/oauth/${provider}`;
  }, []);

  const loginGuest = useCallback(() => {
    // Fully client-side guest session
    dispatch(loginGuestThunk());
  }, [dispatch]);

  const fetchMe = useCallback(async () => {
    const res = await api.get('/auth/me');
    dispatch(updateUser(res.data));
    return res.data;
  }, [dispatch]);

  const setToken = useCallback(
    (jwt) => {
      if (jwt) {
        setAuthToken(jwt);
        dispatch(loginSuccess({ user: user ?? null, token: jwt }));
      } else {
        clearAuthToken();
        dispatch(doLogout());
      }
    },
    [dispatch, user]
  );

  const logout = useCallback(() => {
    clearAuthToken();
    dispatch(doLogout());
  }, [dispatch]);

  return {
    user,
    token,
    status,
    error,
    isAuthenticated,
    login,
    signup,
    loginWith,
    loginGuest,
    logout,
    fetchMe,
    setToken,
  };
}
