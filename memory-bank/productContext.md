# Product Context

Why MediVerse exists, how each role experiences it, and the decisions that
shape the product. The full UX walk-through is in
[`docs/WORKFLOWS.md`](../docs/WORKFLOWS.md); this file is a fast index.

## Why this product

People want quick health answers and frictionless access to specialists, but
real doctors should still be in the loop for anything serious. MediVerse pairs
an AI front line (general questions, report interpretation) with a verified
doctor directory and a simple booking flow.

## Locked product decisions (do not re-litigate without updating workflows)

| Decision | Value |
|---|---|
| Patient cancellation window | Up to **2 hours** before scheduled start |
| Slot booking horizon | **7 days** ahead |
| Doctor verification | License doc on signup → reviewed via `/admin/verifications` (email-allowlisted) |
| Doctor view of patient AI reports | **Only reports the patient explicitly shared** with that doctor |
| Appointment flow | **Hybrid** — per availability block: instant-book OR approval-required |
| Onboarding | Computed checklist on dashboard (auto-dismisses when items complete) |
| First-time auth | Email + password (with email verification) **or** Google OAuth |
| Forgot password | Email link → token → reset form |
| Primary brand color | Emerald |
| Visual style | Vibrant gradient, glass-morphism, animated hero |
| Landing page | Hero, Trust strip, Features (3), How-it-works (3), For Doctors, About, Testimonials, FAQ, CTA, Footer |
| Signup flow | `/signup` role-picker → `/signup/patient` or `/signup/doctor` |
| Login flow | Unified `/login` — backend resolves role and redirects |

## AI guardrails (non-negotiable)

The AI Health Assistant **must**:

- Always include a "consult a real doctor" disclaimer for anything clinical.
- Refuse to **diagnose** specific conditions.
- Refuse to **prescribe** medication.
- Keep replies concise (markdown supported).

The Report Scanner returns strict JSON: `{ summary, findings[], recommendations }`.
Findings include `flag` (e.g. `HIGH`, `LOW`, `NORMAL`) when the value is
out-of-range. Same disclaimer applies in the recommendations.

## Patient journey (happy path)

1. Lands on `/`, clicks **Sign Up** → role picker → patient form → email-verify
   token sent.
2. Verifies email → redirected to `/patient/dashboard`.
3. Onboarding checklist nudges: set profile pic, try AI assistant, find a doctor.
4. Uses **AI Assistant** for general questions (sessions persisted, last-N
   messages sent to Gemini for context).
5. Uses **Report Scanning** to upload a PDF/image — gets a summary + findings
   table; can optionally **share with a chosen doctor**.
6. Searches doctors by specialization → views profile + availability → picks a
   slot. Either auto-confirmed or pending depending on the block's mode.
7. Receives email on book / approve / reject / cancel / complete.
8. Cancels via UI (only allowed when `now < scheduled_at - 2h`).

## Doctor journey (happy path)

1. Signs up via `/signup/doctor` (multi-step) — uploads license document.
2. Account is unverified until an allowlisted reviewer approves on
   `/admin/verifications`.
3. Once verified, sets profile (specialization, qualifications, fee, bio,
   photo) and availability (weekly hours + overrides → slots auto-generated).
4. On dashboard sees: today's appointments timeline, pending approvals, weekly
   stat cards, next-patient highlight, availability status.
5. Approves/rejects pending appointments; runs them; marks complete.
6. Sees only AI reports a patient explicitly shared.

## Admin (the small carve-out)

There's no real admin role. A handful of email addresses listed in the
`mediverse.admin.emails` env var see a `/admin/verifications` page that lists
unverified doctors and their license document, with **Approve** / **Reject**
buttons. That's the entire admin surface in v1.

## What's deliberately out of scope for v1

Payments, telemedicine, patient–doctor chat, prescriptions, reviews/ratings,
streaming AI responses, multi-language, mobile apps, cloud deployment.
