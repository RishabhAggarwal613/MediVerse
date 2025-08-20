// src/pages/Profile/index.jsx
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import Card, { CardContent, CardHeader, CardFooter } from '@/components/ui/Card.jsx';
import Input from '@/components/ui/Input.jsx';
import Select from '@/components/ui/Select.jsx';
import Button from '@/components/ui/Button.jsx';
import Spinner from '@/components/ui/Spinner.jsx';
import { updateUser } from '@/store/authSlice.js';
import useAuth from '@/hooks/useAuth.js';
import useUserPref from '@/hooks/useUserPref.js';
import api from '@/lib/axios.js';
import { getErrorMessage } from '@/lib/utils.js';
import { Avatar } from '@mui/material';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user, fetchMe } = useAuth();
  const { language, setLanguage, density, setDensity } = useUserPref();

  const initial = useMemo(
    () => ({
      name: user?.name || '',
      email: user?.email || '',
      gender: user?.gender || 'other',
      age: user?.age ?? '',
      heightCm: user?.heightCm ?? '',
      weightKg: user?.weightKg ?? '',
      avatarUrl: user?.avatarUrl || '',
    }),
    [user]
  );

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    document.title = 'Profile • MediVerse';
  }, []);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const onChange = (patch) => setForm((f) => ({ ...f, ...patch }));

  async function onSave() {
    setSaving(true);
    setSavedMsg('');
    setErrorMsg('');
    try {
      // Patch to your backend; adjust fields to match your DTO
      const { data } = await api.patch('/auth/me', {
        name: form.name,
        gender: form.gender,
        age: Number(form.age || 0) || null,
        heightCm: Number(form.heightCm || 0) || null,
        weightKg: Number(form.weightKg || 0) || null,
        avatarUrl: form.avatarUrl || null,
      });
      // Refresh store
      dispatch(updateUser(data));
      // Or re-fetch from server
      fetchMe().catch(() => {});
      setSavedMsg('Profile updated successfully.');
    } catch (e) {
      setErrorMsg(getErrorMessage(e, 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Profile" description="Manage your personal information." />
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto,1fr]">
            {/* Avatar + preview */}
            <div className="flex flex-col items-center gap-3">
              <Avatar
                src={form.avatarUrl || undefined}
                alt={form.name || 'User'}
                sx={{
                  width: 96,
                  height: 96,
                  bgcolor: '#22C55E',
                  color: '#06140B',
                  fontWeight: 700,
                  border: '2px solid #1A1F1D',
                }}
              >
                {(form.name || 'U')
                  .split(' ')
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </Avatar>
              <Input
                label="Avatar URL"
                value={form.avatarUrl}
                onChange={(e) => onChange({ avatarUrl: e.target.value })}
                placeholder="https://…/me.jpg"
                className="w-64"
              />
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={form.name}
                onChange={(e) => onChange({ name: e.target.value })}
                placeholder="Your name"
              />
              <Input
                label="Email"
                value={form.email}
                readOnly
                helperText="Email can be managed from account settings"
              />
              <Select
                label="Gender"
                value={form.gender}
                onChange={(e) => onChange({ gender: e.target.value })}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </Select>
              <Input
                label="Age"
                type="number"
                value={form.age}
                onChange={(e) => onChange({ age: e.target.value })}
              />
              <Input
                label="Height (cm)"
                type="number"
                value={form.heightCm}
                onChange={(e) => onChange({ heightCm: e.target.value })}
              />
              <Input
                label="Weight (kg)"
                type="number"
                value={form.weightKg}
                onChange={(e) => onChange({ weightKg: e.target.value })}
              />
            </div>
          </div>

          {/* Save / messages */}
          {errorMsg && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {errorMsg}
            </div>
          )}
          {savedMsg && (
            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              {savedMsg}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <Spinner className="h-4 w-4" /> Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader title="Preferences" description="UI and language preferences (local only)." />
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </Select>
          <Select
            label="Density"
            value={density}
            onChange={(e) => setDensity(e.target.value)}
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </Select>
          <p className="sm:col-span-2 text-sm text-gray-500">
            These preferences are saved in your browser and do not affect server data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
