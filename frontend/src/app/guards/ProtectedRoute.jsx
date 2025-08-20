// src/app/guards/ProtectedRoute.jsx
import { useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import FullScreenLoader from '@/components/ui/FullScreenLoader.jsx';

/**
 * Protect routes while allowing optional Guest access.
 * Usage:
 *   <Route element={<ProtectedRoute allowGuest />}> ... </Route>
 */
export default function ProtectedRoute({
  redirectTo = '/auth/login',
  allowGuest = false,
  children,
}) {
  const location = useLocation();
  const { isAuthenticated, token, status, user } = useSelector((s) => s.auth || {});
  const isGuest = user?.role === 'guest';

  // Back-compat: if token persistence is localStorage in your setup.
  const persisted =
    typeof window !== 'undefined' ? window.localStorage?.getItem('auth_token') : null;

  // Can pass if: real auth token present OR (guest session && allowed)
  const canPass = useMemo(() => {
    if (token || isAuthenticated || persisted) return true;
    if (allowGuest && isGuest) return true;
    return false;
  }, [token, isAuthenticated, persisted, allowGuest, isGuest]);

  if (status === 'loading') {
    return <FullScreenLoader />;
  }

  if (!canPass) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: { pathname: location.pathname, search: location.search } }}
      />
    );
  }

  return children ?? <Outlet />;
}
