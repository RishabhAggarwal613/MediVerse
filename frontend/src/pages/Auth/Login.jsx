// src/pages/Auth/Login.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button.jsx';
import Input from '@/components/ui/Input.jsx';
import Card, { CardContent, CardHeader } from '@/components/ui/Card.jsx';
import Spinner from '@/components/ui/Spinner.jsx';
import useAuth from '@/hooks/useAuth.js';
import { loginSchema, validate } from '@/lib/validators.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWith, loginGuest, status, error: authError, isAuthenticated } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const from = useMemo(() => {
    const p = location.state?.from?.pathname;
    const s = location.state?.from?.search || '';
    return p ? p + s : '/dashboard';
  }, [location.state]);

  useEffect(() => {
    document.title = 'Login • MediVerse';
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    const { ok, errors: fieldErrors } = validate(loginSchema, form);
    if (!ok) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      // If your useAuth.login expects (email, password), pass them separately:
      // await login(form.email, form.password);
      await login(form);
      navigate(from, { replace: true });
    } catch {
      // handled by authError
    } finally {
      setSubmitting(false);
    }
  }

  function handleGuest() {
    // Frontend-only guest (no backend)
    loginGuest();
    navigate(from, { replace: true });
  }

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center">
      <Card className="w-full border-emerald-600/30 bg-[#0F1517] text-white">
        <CardHeader
          title={<span>Welcome back to <span className="text-emerald-400">MediVerse</span></span>}
          description="Sign in with Email, Google, GitHub, or continue as Guest"
          className="pb-2"
        />
        <CardContent>
          {authError && (
            <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {authError}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              error={errors?.email?.[0]}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              error={errors?.password?.[0]}
              placeholder="••••••••"
            />

            <Button type="submit" className="w-full" loading={submitting || status === 'loading'}>
              {submitting || status === 'loading' ? (
                <>
                  <Spinner className="h-4 w-4" /> Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3 text-gray-400">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs">or continue with</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Social + Guest */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              type="button"
              onClick={() => loginWith?.('google')}
              className="w-full border border-white/10 bg-[#121a1c] hover:bg-[#1a2326]"
            >
              Google
            </Button>
            <Button
              type="button"
              onClick={() => loginWith?.('github')}
              className="w-full border border-white/10 bg-[#121a1c] hover:bg-[#1a2326]"
            >
              GitHub
            </Button>
            <Button
              type="button"
              onClick={handleGuest}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-semibold"
            >
              Guest
            </Button>
          </div>

          <p className="mt-4 text-center text-sm text-gray-400">
            Don’t have an account?{' '}
            <Link className="text-emerald-400 hover:text-emerald-300" to="/auth/signup">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
