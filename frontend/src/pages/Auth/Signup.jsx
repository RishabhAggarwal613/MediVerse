// src/pages/Auth/Signup.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button.jsx';
import Input from '@/components/ui/Input.jsx';
import Card, { CardContent, CardHeader } from '@/components/ui/Card.jsx';
import Spinner from '@/components/ui/Spinner.jsx';
import useAuth from '@/hooks/useAuth.js';
import { signupSchema, validate } from '@/lib/validators.js';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loginWith, loginGuest, status, error: authError } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Sign up • MediVerse';
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    const { ok, errors: fieldErrors } = validate(signupSchema, {
      name: form.name,
      email: form.email,
      password: form.password,
    });

    const extra = {};
    if (form.password !== form.confirm) extra.confirm = ['Passwords do not match'];

    const mergedErrors = { ...fieldErrors, ...(extra.confirm ? { confirm: extra.confirm } : {}) };
    if (!ok || extra.confirm) {
      setErrors(mergedErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const res = await signup({ name: form.name, email: form.email, password: form.password });
      // If backend auto-logs in, go to MediAI; otherwise send to login.
      navigate(res?.accessToken ? '/mediAI' : '/auth/login', { replace: true });
    } catch {
      // handled by authError
    } finally {
      setSubmitting(false);
    }
  }

  function handleGuest() {
    // Frontend-only guest (no backend required)
    loginGuest();
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-md place-items-center">
      <Card className="w-full border-emerald-600/30 bg-[#0F1517] text-white">
        <CardHeader
          title={<span>Create your <span className="text-emerald-400">MediVerse</span> account</span>}
          description="Email & password, Google, GitHub — or continue as Guest"
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
              label="Full name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              error={errors?.name?.[0]}
              placeholder="Alex Johnson"
              autoComplete="name"
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              error={errors?.email?.[0]}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              error={errors?.password?.[0]}
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
            <Input
              label="Confirm password"
              type="password"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              error={errors?.confirm?.[0]}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />

            <Button type="submit" className="w-full" loading={submitting || status === 'loading'}>
              {submitting || status === 'loading' ? (
                <>
                  <Spinner className="h-4 w-4" /> Creating account…
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3 text-gray-400">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs">or sign up with</span>
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
            Already have an account?{' '}
            <Link className="text-emerald-400 hover:text-emerald-300" to="/auth/login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
