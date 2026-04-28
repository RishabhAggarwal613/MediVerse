# Project Brief — MediVerse

> **MediVerse** is a medical platform that connects **Patients** and **Doctors**,
> with AI-powered health assistance and automated medical-report analysis.

## What it is

A full-stack web application:

- **Frontend** — Next.js 14 marketing site + authenticated patient/doctor apps.
- **Backend** — Spring Boot 3.5 modular monolith exposing a JSON REST API.
- **Database** — MySQL 8 (host-installed locally; container in production).
- **Storage** — AWS S3 for profile pics and uploaded medical reports.
- **AI** — Google Gemini (`gemini-1.5-flash` for chat, `gemini-1.5-pro` for vision).

Detailed design lives in [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md).
Detailed user journeys live in [`docs/WORKFLOWS.md`](../docs/WORKFLOWS.md).

## Roles (RBAC, exactly two)

- **PATIENT** — books appointments, chats with the AI assistant, scans/analyzes
  lab reports.
- **DOCTOR** — manages profile, availability, and incoming appointment requests.

There is **no `ADMIN` role** in v1. Doctor verification is handled via a
lightweight `/admin/verifications` page gated by an env-var email allowlist
(`mediverse.admin.emails`).

## Core features (v1 scope)

### Patient
1. AI Health Assistant (Gemini chat with guardrails — no diagnosis, no prescriptions).
2. AI Report Scanning (upload PDF/image → Gemini Vision → summary, findings, recs).
3. Doctor Appointment Booking (search → profile → slot picker → book).

### Doctor
1. Profile management (specialization, qualifications, fee, photo, bio).
2. Availability management (weekly hours + per-date overrides → generated slots).
3. Appointment management (view / approve / reject / complete).
4. Dashboard stats (today's appointments, total patients, weekly trend).

### Cross-cutting
- Email + password auth with email verification, plus Google OAuth2.
- Forgot-password / reset-password flow.
- Email notifications for appointment lifecycle events.
- Onboarding checklist computed from profile completeness.

## Success criteria for v1

- Both roles can complete their happy path end-to-end on `localhost`.
- All AI calls go through one centralized client with timeouts and guardrails.
- API surface is documented via Swagger UI.
- Every controller response is wrapped in the standard `ApiResponse<T>` envelope.
- All failures return JSON (never Spring's HTML error page).

## Non-goals for v1

- No real `ADMIN` role (see above).
- No payments.
- No telemedicine / video / patient–doctor chat.
- No prescription writing.
- No reviews or ratings.
- No streaming AI responses (full-response only).
- No multi-language / i18n.
- No mobile apps.
- No deployment to cloud — local-dev target only for v1.

## Build phases (reference)

| Phase | Goal | Status |
|-------|------|--------|
| 0 | Workspace bootstrap | ✅ Done |
| 1 | Backend foundation | ✅ Done |
| 2 | Auth & Users | ⏳ Next |
| 3 | Frontend foundation + landing site + auth UI | Partial (landing + role-picker shipped early) |
| 4 | Doctor module | Pending |
| 5 | Appointments | Pending |
| 6 | AI Health Assistant | Pending |
| 7 | AI Report Scanning | Pending |
| 8 | Polish | Pending |

See [`progress.md`](./progress.md) for the up-to-date breakdown.
