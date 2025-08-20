// src/pages/DietPlanner/index.jsx
import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button.jsx';
import Card, { CardContent, CardHeader } from '@/components/ui/Card.jsx';
import { validate, dietPreferencesSchema, profileSchema } from '@/lib/validators.js';
import { getErrorMessage } from '@/lib/utils.js';
import { createDietPlan } from '@/services/dietClient.js';
import ProfileForm from './components/ProfileForm.jsx';
import PlanOptions from './components/PlanOptions.jsx';
import PlanPreview from './components/PlanPreview.jsx';

export default function DietPlannerPage() {
  const [profile, setProfile] = useState(null);
  const [prefs, setPrefs] = useState({
    dietType: 'balanced',
    caloriesTarget: 2200,
    mealsPerDay: 3,
    duration: 'week',
    allergies: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [planId, setPlanId] = useState(null);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    document.title = 'Diet Planner • MediVerse';
  }, []);

  const canGenerate = useMemo(() => !!profile, [profile]);

  async function onGenerate() {
    // Validate profile and prefs with zod
    const profileData = {
      name: profile?.name || 'User',
      age: Number(profile?.age || 0),
      gender: profile?.gender || 'other',
      heightCm: Number(profile?.heightCm || 0),
      weightKg: Number(profile?.weightKg || 0),
    };
    const prefData = {
      dietType: prefs.dietType,
      caloriesTarget: Number(prefs.caloriesTarget || 0),
      mealsPerDay: Number(prefs.mealsPerDay || 3),
      duration: prefs.duration,
      allergies:
        (profile?.allergies || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean) || [],
    };

    const p1 = validate(profileSchema, profileData);
    const p2 = validate(dietPreferencesSchema, prefData);
    if (!p1.ok || !p2.ok) {
      setErrors({ profile: p1.errors, prefs: p2.errors });
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const res = await createDietPlan({ profile: profileData, preferences: prefData });
      setPlanId(res?.planId || null);
      setPlan(res?.plan || null);
    } catch (e) {
      alert(getErrorMessage(e, 'Failed to generate plan'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Profile */}
      <Card>
        <CardHeader
          title="1) Your profile"
          description="Tell us about you so we can personalize the plan."
        />
        <CardContent>
          <ProfileForm value={profile || {}} onChange={setProfile} />
        </CardContent>
      </Card>

      {/* Step 2: Preferences */}
      <Card>
        <CardHeader
          title="2) Preferences"
          description="Choose diet style, calories and duration."
        />
        <CardContent>
          <PlanOptions value={prefs} onChange={setPrefs} />
          {Object.keys(errors?.prefs || {}).length > 0 && (
            <p className="mt-3 text-sm text-amber-300">
              Some preferences are invalid — please review.
            </p>
          )}
          <div className="mt-4 flex justify-end">
            <Button onClick={onGenerate} loading={loading} disabled={!canGenerate}>
              {loading ? 'Generating…' : 'Generate plan'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Preview */}
      {plan && (
        <PlanPreview plan={plan} planId={planId} />
      )}
    </div>
  );
}
