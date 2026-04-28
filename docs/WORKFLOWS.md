# MediVerse — User Workflows

> Companion to `ARCHITECTURE.md`. Every user-facing journey for **Patient** and **Doctor** roles, with decisions captured.

---

## Decisions snapshot

| Decision                          | Value                                                                                       |
|-----------------------------------|---------------------------------------------------------------------------------------------|
| Patient cancellation window       | **Up to 2 hours before** appointment start                                                  |
| Doctor verification               | **Document upload on signup** → reviewed via tiny `/admin/verifications` page gated by env-var email list |
| Slot booking horizon              | **7 days** ahead                                                                            |
| Doctor's view of patient reports  | **Only reports the patient explicitly shared** with that doctor                              |
| Landing site sections             | Hero, Trust strip, Features (3 cards), How-it-works (3 steps), For Doctors, About, Testimonials, FAQ, CTA band, Footer |
| Landing nav                       | Logo · Features · How-it-works · About · FAQ · For Doctors · **Login** (ghost) · **Sign Up** (primary) |
| Signup flow                       | **`/signup` role-picker page** with two big cards (Patient / Doctor) → role-specific form    |
| Login flow                        | **Unified `/login`** — backend resolves role and redirects to `/patient/dashboard` or `/doctor/dashboard` |
| Visual style                      | **Vibrant gradient** — bold gradients, glassy cards, animated hero                          |
| Primary brand color               | **Emerald** (health/wellness)                                                               |
| Patient dashboard layout          | Top banner for next appointment + grid (AI Assistant widget, "Find a Doctor" CTA, "Scan Report" CTA, Recent Reports, Daily Health Tip) |
| Doctor dashboard layout           | Today's appointments timeline + pending approvals + stats cards + next-patient highlight + availability status |
| Onboarding                        | **Checklist on dashboard** (e.g. "Set profile pic", "Try AI Assistant", "Find a doctor") — auto-dismisses when items complete |
| First-time auth                   | Email + password (with email verification link) **or** Google OAuth                           |
| Forgot password                   | Email link → token → reset form                                                             |

---

## Public Site / Landing (L)

The landing site at `/` is the marketing surface and the entry point to authentication. It's fully public (no auth required), responsive, and uses the **emerald + vibrant-gradient** theme.

### Page map (public routes)

| Route                | Page                                            |
|----------------------|-------------------------------------------------|
| `/`                  | Landing                                         |
| `/login`             | Unified login (email/password + Google)         |
| `/signup`            | Role picker (two cards: Patient / Doctor)       |
| `/signup/patient`    | Patient registration form                       |
| `/signup/doctor`     | Doctor multi-step registration (incl. license upload) |
| `/forgot-password`   | Request password reset                          |
| `/reset-password`    | Set new password (via token from email)         |
| `/verify-email`      | Confirm email via token                         |
| `/oauth/callback`    | Google OAuth redirect handler                   |

### L1 — Landing page sections (top to bottom)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ▶ NAV — sticky, blurred glass background                                    │
│   [MediVerse logo]  Features  How it works  About  FAQ  For Doctors        │
│                                          [Login] [Sign Up]  ←── primary    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ▶ HERO                                                                      │
│   ┌─────────────────────────────────┐  ┌────────────────────────────────┐  │
│   │  Tagline pill: ✨ AI-powered     │  │                                │  │
│   │      healthcare                  │  │   Animated gradient blob /     │  │
│   │                                  │  │   doctor-patient illustration  │  │
│   │  ## Your health, powered by      │  │                                │  │
│   │     AI and trusted doctors       │  │                                │  │
│   │                                  │  │                                │  │
│   │  Subhead: Chat with an AI       │  │                                │  │
│   │  assistant, scan reports        │  │                                │  │
│   │  instantly, book consultations  │  │                                │  │
│   │  with verified specialists.     │  │                                │  │
│   │                                  │  │                                │  │
│   │  [Get started free →] [Login]   │  │                                │  │
│   └─────────────────────────────────┘  └────────────────────────────────┘  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▶ TRUST STRIP — emerald gradient band                                       │
│   "Trusted by 10,000+ patients"   "200+ verified doctors"   "50+ specs"    │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▶ FEATURES (3 cards, glass-morphism)                                        │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│   │ 💬 AI Health  │  │ 📄 AI Report │  │ 🗓 Book      │                     │
│   │   Assistant  │  │   Scanning   │  │   Appointments│                     │
│   │ 24/7 chat    │  │ Instant      │  │ Verified      │                     │
│   │ for health   │  │ findings &   │  │ specialists,  │                     │
│   │ questions    │  │ summaries    │  │ instant slots │                     │
│   └──────────────┘  └──────────────┘  └──────────────┘                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▶ HOW IT WORKS (3 steps with connecting line)                               │
│   ① Sign up free  →  ② Find a doctor or use AI  →  ③ Get expert care        │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▶ FOR DOCTORS (split: text left, illustration right)                        │
│   ## Grow your practice with MediVerse                                      │
│   • Reach more patients                                                     │
│   • Manage your schedule                                                    │
│   • View shared AI report history                                           │
│   [Join as a doctor →]                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▶ ABOUT                                                                     │
│   Mission statement (2-3 paragraphs) + small stat row                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▶ TESTIMONIALS (carousel/grid, placeholder content for v1)                  │
│   3 quote cards — Patient, Doctor, Patient                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▶ FAQ (collapsible accordion, ~6 Q&A)                                       │
│   • Is MediVerse free to use?                                               │
│   • How is my data protected?                                               │
│   • Can the AI replace a doctor?  ← clear NO                                │
│   • How are doctors verified?                                               │
│   • What kinds of reports can I scan?                                       │
│   • How do I cancel an appointment?                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▶ FINAL CTA BAND (full-width emerald gradient)                              │
│   ## Ready to take charge of your health?                                   │
│   [Sign up free →]                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▶ FOOTER                                                                    │
│   Logo + tagline | Product (Features, How it works, FAQ) | Company (About, │
│   Contact) | Legal (Privacy, Terms) | Social icons                         │
│   © 2026 MediVerse. All rights reserved.                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Design notes**
- **Theme:** vibrant gradient — emerald (`#10b981`) primary + teal/cyan accents on a near-white background; selected sections use a dark emerald-to-teal gradient.
- **Glass-morphism cards** on Features section: `bg-white/60 backdrop-blur` + soft shadow.
- **Animated hero blob** behind illustration (CSS-only or framer-motion).
- **Smooth scroll** for nav anchor links (`#features`, `#how-it-works`, `#about`, `#faq`).
- **Mobile**: nav collapses to hamburger; hero stacks; sections single-column.
- **Buttons**: primary = emerald solid; secondary = ghost with emerald border.

### L2 — Sign up flow (role picker)

```
User                         Frontend
  │ Click "Sign Up" on /         │
  │ ──────────────────────────► │ navigate to /signup
  │                              │
  │ /signup loads: 2 large cards │
  │   ┌───────────────┐  ┌────────────────┐
  │   │ 🧑 I'm a       │  │ 👨‍⚕️ I'm a       │
  │   │   Patient      │  │    Doctor      │
  │   │  Get AI care   │  │  Reach more    │
  │   │  & book docs   │  │   patients     │
  │   │ [Continue →]   │  │ [Continue →]   │
  │   └───────────────┘  └────────────────┘
  │  "Already have an account? Login"
  │
  │ Click Patient card           │
  │ ──────────────────────────► │ navigate to /signup/patient
  │                              │  → patient registration form (P1)
  │                              │
  │ OR Click Doctor card         │
  │ ──────────────────────────► │ navigate to /signup/doctor
  │                              │  → doctor multi-step form (D1)
```

### L3 — Login flow (unified)

```
User                Frontend                          Backend
  │ Click "Login"      │                                 │
  │ on / or /signup    │                                 │
  │ ─────────────────► │ navigate to /login              │
  │                    │                                 │
  │  Email + password  │                                 │
  │  [Login]           │ POST /api/auth/login            │
  │                    │ {email, password}               │
  │                    │ ──────────────────────────────► │
  │                    │                                 │ - bcrypt check
  │                    │                                 │ - read user.role
  │                    │                                 │ - issue JWT pair
  │                    │ ◄───── { access, refresh,       │
  │                    │           user: {role, ...} } ──│
  │                    │                                 │
  │                    │ Read role → redirect:           │
  │                    │   PATIENT → /patient/dashboard  │
  │                    │   DOCTOR  → /doctor/dashboard   │
  │                    │                                 │
  │                    │ "Continue with Google"          │
  │                    │ ─────────► /oauth2/google ─────►│ Google OAuth
  │                    │ ◄────── /oauth/callback ─────── │ → JWT pair
  │                    │ Same role-based redirect.       │
  │                    │                                 │
  │  "Forgot password?" link → /forgot-password (X2)
  │  "Don't have an account? Sign up" link → /signup
```

**Backend role resolution:** the auth response always returns the user's `role`, so the frontend can route without an extra request. If the user's account is disabled, returns `403 ACCOUNT_DISABLED` with a friendly message.

### L4 — Public-page guards
- Already-authenticated users hitting `/`, `/login`, or `/signup`:
  - **Patient** → auto-redirect to `/patient/dashboard`
  - **Doctor** → auto-redirect to `/doctor/dashboard`
- This is handled in `middleware.ts` reading the auth cookie (or a small client-side check after hydration if the cookie is httpOnly).
- The "Sign Up" / "Login" buttons in the nav switch to **"Dashboard"** + avatar dropdown (Profile · Logout) when authenticated.

### L5 — SEO & metadata
- Each public page uses Next.js `metadata` export (title, description, OG tags).
- Landing page title: `MediVerse — AI-powered healthcare, trusted doctors`.
- OG image: a generated emerald-gradient social card.
- Sitemap + `robots.txt` generated by Next.js (`app/sitemap.ts`, `app/robots.ts`).

---

## "Admin" in v1 (no real admin role)

We don't introduce an `ADMIN` role — RBAC stays as `PATIENT` / `DOCTOR`. Instead:

- A config property `mediverse.admin.emails` lists allowlisted email addresses.
- A custom Spring annotation `@AdminEmailOnly` checks the authenticated user's email against the list.
- Used **only** for the doctor verification page. Nothing else.
- Path: `GET /admin/verifications`, `POST /admin/verifications/{doctorId}/approve`, `POST /admin/verifications/{doctorId}/reject`.

---

## Patient Journeys

### P1 — Patient Sign-up (email/password)

```
User                Frontend                      Backend                         DB / S3 / Mail
 │  visit /            │                            │                                 │
 │  Sign up as Patient │                            │                                 │
 │ ──────────────────► │                            │                                 │
 │                     │  POST /api/auth/register/patient                             │
 │                     │  {fullName,email,password,phone,dob,gender}                  │
 │                     │ ─────────────────────────► │                                 │
 │                     │                            │  validate (email unique, age)   │
 │                     │                            │ ──────────────────────────────► │
 │                     │                            │  bcrypt password                │
 │                     │                            │  insert User(role=PATIENT)      │
 │                     │                            │  insert Patient row             │
 │                     │                            │  generate email-verify token    │
 │                     │                            │  send "Verify your email" mail  │
 │                     │                            │ ──────────────────────────────► │
 │                     │                            │  issue access + refresh JWTs    │
 │                     │ ◄───────── 200 OK ─────────│                                 │
 │  redirect /dashboard│                            │                                 │
 │ ◄───── set state ── │                            │                                 │
```

**Email-verified state matters?** Until verified:
- The user can use the dashboard freely.
- A **persistent banner** at the top says "Verify your email — resend".
- Booking an appointment **is allowed** (we don't gate booking on email verification — keeps friction low).

### P2 — Patient Sign-up via Google
- Click **Continue with Google** → Google consent → redirect back to `/oauth/callback?code=…`
- Backend exchanges code → fetches profile (`email`, `name`, `picture`)
- If user exists with same email but `provider=LOCAL` → **link** the Google account (set `provider_id`).
- If new user → create `User(provider=GOOGLE, role=PATIENT, email_verified=true)` + minimal `Patient` row → redirect to `/onboarding/patient` to collect `dob`/`gender` (one-time form).

### P3 — Login / Logout
- Email + password → `/dashboard`. Wrong creds → form-level error.
- **Logout**: client clears Zustand state + calls `POST /api/auth/logout` → backend revokes the refresh token. Refresh-cookie cleared.
- **Session expiry**: access token 15 min. Axios response interceptor on `401` → calls `/api/auth/refresh` once; if refresh also fails → clear state + redirect to `/login?from=…`.

### P4 — Forgot Password
1. `/login` → "Forgot password?" → `/forgot-password` (enter email)
2. Backend generates a single-use, 30-min reset token, stores its hash in `password_reset_tokens` (id, user_id, token_hash, expires_at, used_at).
3. Sends email with `https://app/reset-password?token=…`
4. User opens link → form (new password + confirm) → `POST /api/auth/reset-password {token,newPassword}`
5. Backend validates token, updates password, marks token used, revokes all existing refresh tokens for that user.

### P5 — Edit Profile (Patient)
1. Sidebar avatar → **Profile** → `/profile`
2. Editable: full name, phone, DOB, gender, blood group, allergies, emergency contact
3. Avatar upload (multipart → `POST /api/users/me/avatar`) → stored on S3 → `users.profile_pic_url` updated.
4. Email cannot be changed from UI in v1 (deferred — requires re-verify flow).

### P6 — Patient Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⚠ Verify your email banner (only if not verified)         [Resend]   ✕    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ⏰ Next appointment: Dr. X · Tomorrow 10:30 AM             [View →]        │ ← banner
├─────────────────────────────────────────────────────────────────────────────┤
│  ✅ Onboarding checklist (3 of 5)                          [Hide]           │ ← only until done
│     [✓] Verify your email                                                    │
│     [✓] Add a profile photo                                                  │
│     [ ] Try the AI Assistant                                                 │
│     [ ] Scan your first report                                               │
│     [ ] Find a doctor                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────┐  ┌────────────────────┐                              │
│  │ 💬 AI Assistant    │  │ 🔍 Find a Doctor   │                              │
│  │ "Ask anything..."  │  │ Search by spec…    │                              │
│  │ [type to start →]  │  │ [Browse doctors →] │                              │
│  └────────────────────┘  └────────────────────┘                              │
│  ┌────────────────────┐  ┌────────────────────────────────────────────────┐  │
│  │ 📄 Scan a Report   │  │ 📋 Recent AI Reports                           │  │
│  │ Drag a PDF/image…  │  │ • CBC Report — May 4 — 2 flags                 │  │
│  │ [Upload →]         │  │ • Lipid Profile — Apr 28 — Normal              │  │
│  └────────────────────┘  └────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │ 💡 Daily Health Tip (Gemini-generated, cached for the day)              │ │
│  │ "Drinking 2L of water daily improves..."                                │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### P7 — Find & Book a Doctor (core flow)

```
Patient                                Frontend                        Backend
  │ Click "Find a Doctor"                 │                              │
  │ ────────────────────────────────────► │ GET /api/doctors?q=&spec=    │
  │                                       │ ───────────────────────────► │ list verified doctors
  │ Filter "Cardiology"                    │ ◄───────────── DoctorList ── │
  │ Click a card                          │ GET /api/doctors/{id}        │
  │                                       │ GET /api/doctors/{id}/slots?date=YYYY-MM-DD
  │                                       │ ───────────────────────────► │
  │ Pick May 5 · 10:30                     │ ◄────── slots[]              │
  │ Enter "reason for visit"              │                              │
  │ Click Confirm                          │ POST /api/appointments       │
  │                                       │   {slotId, reason}           │
  │                                       │ ───────────────────────────► │
  │                                       │                              │ - lock slot row
  │                                       │                              │ - check still free
  │                                       │                              │ - status = CONFIRMED if !requires_approval
  │                                       │                              │ - status = PENDING  if  requires_approval
  │                                       │                              │ - mark slot.is_booked = true
  │                                       │                              │ - send email to patient + doctor
  │                                       │ ◄────── Appointment dto ──── │
  │ Show success state                     │                              │
```

**Edge cases:**
- Slot was just booked by someone else → backend returns `409 SLOT_TAKEN` → FE refreshes slot list + shows toast.
- Patient already has an unfinished (`PENDING`/`CONFIRMED`) appointment with the same doctor on the same day → backend returns `409 DUPLICATE` → FE shows the existing appointment.
- Booking horizon enforcement: backend rejects any slot whose date > today + 7 days.

### P8 — Manage Appointments
- `/appointments` — tabs: **Upcoming** / **Past** / **Pending**
- Each card shows status badge, doctor info, date/time, reason.
- **Cancel** action:
  - Allowed when `now < scheduled_at - 2h`.
  - Otherwise the button is **disabled with tooltip** "Cancellation closed (must cancel ≥2h before)."
- After cancel: status `CANCELLED`, slot freed (`is_booked=false`), email to doctor.

### P9 — AI Health Assistant
1. Sidebar → **AI Assistant** → `/ai-assistant`
2. Layout: list of past sessions (left), active conversation (right), input box (bottom).
3. New session created on first message → backend titles it from the first user message (or default "New chat").
4. Each user message → `POST /api/ai/chat/sessions/{id}/messages` → backend builds Gemini request with:
   - System prompt (medical assistant persona + guardrails)
   - Last N messages of history (e.g. last 10) for context
   - User's new message
5. Gemini returns a reply → persisted as `role=ASSISTANT` → returned to FE.
6. **Guardrails embedded in the system prompt:**
   - "You are MediVerse Health Assistant…"
   - "You MUST NOT diagnose, prescribe medication, or replace a doctor's advice."
   - "Always end with: '⚠ Please consult a doctor for an accurate diagnosis.'"
   - Decline to roleplay around the guardrail.
7. Streaming is **not** in scope for v1 — return the full reply as one HTTP response. (Streaming/SSE deferred.)

### P10 — AI Report Scanning
1. `/ai-reports` history page → **+ New Scan**
2. Uploader: drag-drop or click-to-pick. Accepted: PDF, JPG, PNG. Max 25MB.
3. Click **Analyze**:
   - FE → `POST /api/ai/reports/scan` (multipart: `file`)
   - BE uploads bytes to S3 (`reports/{patientId}/{uuid}.{ext}`)
   - BE calls Gemini Vision with strict-JSON prompt (see ARCHITECTURE §10)
   - BE parses JSON into structured DTO; on parse failure → returns `502 AI_PARSE_FAILED` with raw response (FE shows fallback view: "Couldn't structure the data — here's the raw analysis").
   - BE persists `AiReport`
4. Result page renders:
   - **Summary** card (markdown supported)
   - **Findings table** — each row colored by `flag` (`NORMAL` green, `BORDERLINE` amber, `OUT_OF_RANGE` red)
   - **Recommendations** card with disclaimer footer
   - Actions: **Share with doctor**, **Download original**, **Delete**
5. Share flow:
   - Click **Share** → modal lists doctors patient has appointments with (or all verified doctors if none) → search → select → confirm
   - `POST /api/ai/reports/{id}/share {doctorId}`
   - Backend writes `shared_with_doctor_id`. Doctor can now read this report; patient can revoke by un-sharing.

---

## Doctor Journeys

### D1 — Doctor Sign-up
1. `/register/doctor` form — multi-step:
   - **Step 1**: name, email, password, phone
   - **Step 2**: specialization, qualifications, license number, years experience, fee, bio
   - **Step 3**: upload license document (PDF or image, mandatory) → S3 (`doctor-docs/{userId}/{uuid}`)
2. Backend creates `User(role=DOCTOR, email_verified=false)` + `Doctor(is_verified=false, license_doc_url=…)`.
3. Sends:
   - "Verify your email" mail to doctor
   - "New doctor pending verification" mail to admin emails (from `mediverse.admin.emails`)
4. Show **"Account pending verification"** screen → doctor can log in but the dashboard says **"Pending review — patients can't book yet"**.
5. Doctor can edit profile but cannot publish availability until `is_verified=true`.

### D2 — Admin verification (env-var-gated)
- Admin email user logs in → gets a **"Verifications (N)"** link in nav (visible only when their email is in `mediverse.admin.emails`).
- `/admin/verifications` lists `Doctor` rows where `is_verified=false`, with name, email, license number, license document (pre-signed S3 link).
- Actions per row: **Approve** / **Reject (with reason)**.
- On approve: `Doctor.is_verified=true`; email to doctor "You're verified — set up your availability".
- On reject: row stays `is_verified=false`; email to doctor with reason. Doctor can re-upload document via profile edit.

### D3 — Doctor Login & First-time setup
- Login same as patient.
- After login, dashboard shows the **onboarding checklist** until completed:
  - [ ] Add profile photo
  - [ ] Complete bio
  - [ ] Set up availability
  - [ ] (Once verified) Publish first available slots

### D4 — Set / Edit Availability
1. `/availability` page UI:
   - Weekly schedule editor (Mon–Sun rows × time-of-day columns)
   - "Add availability rule" modal: day(s), start time, end time, slot duration (default 30 min), `requires_approval` toggle
2. On save → `POST /api/doctors/me/availability`
3. Backend persists `DoctorAvailability` row + **regenerates `time_slots` for the next 7 days** from the rules. Existing booked slots are preserved (never overwritten).
4. Doctor can:
   - Edit a rule (regenerates future *unbooked* slots)
   - Delete a rule (deletes future unbooked slots from that rule; booked slots remain valid)
   - Add a **single-date override**: "block May 5" or "extra slots on May 6 from 6–8 PM"

### D5 — Manage Appointment Requests

```
Doctor                       Frontend                      Backend                     Mail
  │  Login                       │                            │                          │
  │  Dashboard                   │                            │                          │
  │  Sees "Pending (3)"          │                            │                          │
  │  Click pending tab           │                            │                          │
  │                              │ GET /api/appointments/me?status=PENDING               │
  │                              │ ─────────────────────────► │                          │
  │                              │ ◄───── pending list ────── │                          │
  │  Click "Approve"             │ PATCH /api/appointments/{id}/approve                  │
  │                              │ ─────────────────────────► │  status -> CONFIRMED     │
  │                              │                            │  email patient ────────► │
  │                              │ ◄────── 200 ────────────── │                          │
  │  OR Click "Reject"            │ PATCH /api/appointments/{id}/reject {reason}         │
  │                              │ ─────────────────────────► │  status -> REJECTED      │
  │                              │                            │  free the slot           │
  │                              │                            │  email patient ────────► │
```

### D6 — Daily Consultation Workflow
1. Dashboard → **Today's appointments** timeline (vertical, sorted by time).
2. Each item: time, patient name + age, reason for visit, **"Open"** button.
3. Open consultation view:
   - Patient details (name, age, gender, blood group, allergies)
   - Reason for visit (patient-supplied)
   - **Shared AI reports** for this patient (collapsible cards showing summary + findings)
   - Past appointments with this patient (history)
4. After consultation: **Mark complete** → modal: `doctor_note` (free text) → `PATCH /api/appointments/{id}/complete {note}`
5. Cannot mark complete before `scheduled_at` (BE enforces) — protects against accidental clicks.

### D7 — Doctor Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚠ Pending verification banner (only if !is_verified)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ ✅ Onboarding checklist (only until done)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐                 │
│ │ Today: 6   │ │ Pending: 2 │ │ Week: 27   │ │ Patients: 89│                │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⏰ Next patient at 11:30 — Riya Sharma (32F) [2 shared reports] [Open →]    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Today's appointments timeline                                                │
│ ─ 09:00 ─ Anil Kumar (45M)            [Done]   [View]                       │
│ ─ 10:00 ─ Priya Mehta (28F)           [In 5m]  [Open]                       │
│ ─ 10:30 ─ Riya Sharma (32F) ◄ next                                          │
│ ─ 11:00 ─ Mohit Verma (41M)                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ Availability status: ✅ 14 slots open in next 7 days   [Manage →]            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Cross-cutting flows

### X1 — Email verification
- After signup, email contains link `https://app/verify-email?token=…` (token: random 32 bytes, hashed in DB, 24h TTL).
- Click → `POST /api/auth/verify-email {token}` → `users.email_verified=true`.
- Redirect to `/login?verified=1` showing "Email verified — please log in" toast.

### X2 — Forgot password (detailed)
- `/forgot-password` (enter email) → backend always returns 200 (do not leak if email exists).
- If email exists: generates token, persists hash + `expires_at = now+30min`, emails reset link.
- `/reset-password?token=…` → form (new password + confirm) → submits → backend validates token, sets new password, marks token used, revokes all refresh tokens for that user.

### X3 — Session lifecycle (frontend)
- On login → access token in memory (Zustand), refresh in `httpOnly secure SameSite=Lax` cookie.
- Axios req interceptor adds `Authorization: Bearer <access>`.
- Axios resp interceptor on `401`:
  - Call `POST /api/auth/refresh` (cookie auto-sent).
  - On success: store new access token, retry original request.
  - On failure: clear store, redirect to `/login`.
- Single-flight refresh: if multiple requests fail 401 simultaneously, only one refresh call is made (others wait).

### X4 — Logout
- `POST /api/auth/logout` (cookie sent) → backend revokes the refresh token → returns 204
- FE clears Zustand state, deletes the cookie, redirects to `/`.

### X5 — Onboarding checklist (both roles)
- Stored as a JSON object `onboarding_state` on `User` (or computed on demand from profile completeness).
- v1 implementation: **computed** — frontend asks `GET /api/users/me/onboarding` which returns:
  ```json
  { "items": [
      {"id":"verifyEmail","label":"Verify your email","done":true},
      {"id":"avatar","label":"Add a profile photo","done":false},
      {"id":"firstChat","label":"Try the AI Assistant","done":false},
      ...
    ],
    "completed": false
  }
  ```
- Once `completed=true`, FE hides the checklist (state persisted in `localStorage` so a re-show doesn't happen post-completion).

---

## API additions implied by these workflows

Beyond what's listed in `ARCHITECTURE.md §7`, these workflows require:

| Method | Path                                          | Role        | New? |
|--------|-----------------------------------------------|-------------|------|
| POST   | `/api/auth/forgot-password`                   | —           | ✚    |
| POST   | `/api/auth/reset-password`                    | —           | ✚    |
| POST   | `/api/auth/verify-email`                      | —           | ✚    |
| POST   | `/api/auth/resend-verification`               | auth        | ✚    |
| GET    | `/api/users/me/onboarding`                    | auth        | ✚    |
| GET    | `/api/ai/health-tip`                          | PATIENT     | ✚    |
| GET    | `/admin/verifications`                        | admin email | ✚    |
| POST   | `/admin/verifications/{doctorId}/approve`     | admin email | ✚    |
| POST   | `/admin/verifications/{doctorId}/reject`      | admin email | ✚    |

Database additions:

- `users.email_verified`, `users.email_verified_at`
- `email_verification_tokens` (id, user_id, token_hash, expires_at, used_at)
- `password_reset_tokens` (id, user_id, token_hash, expires_at, used_at)
- `doctors.license_doc_url`, `doctors.verification_status` (`PENDING`,`APPROVED`,`REJECTED`), `doctors.verification_note`

---

## Build phase impact

| Phase | Already-planned work | Added by workflows |
|-------|----------------------|---------------------|
| 2 (Auth) | Register/Login/Refresh, JWT, OAuth | + email verification + forgot/reset password + email templates |
| 3 (FE auth) | Login/Register pages | + forgot-password page + reset-password page + verify-email page |
| 4 (Doctor) | Profile, availability | + license doc upload + verification status banner |
| 5 (Appts) | Booking flow | + 2-hour cancel rule + 7-day horizon + duplicate-check + slot-conflict 409 |
| 6 (AI chat) | Chat session API | + daily health tip endpoint |
| 7 (Reports) | Report scan API | + share-with-doctor flow |
| 8 (Polish) | Validation/UX | + onboarding checklist + admin verifications page |

These are scope additions but small ones — no architectural redesign needed.
