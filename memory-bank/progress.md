# Progress

Phase-by-phase status, working endpoints, and test counts.

> Last updated: **Phase 3 complete** — merged to **`origin/main`** (frontend auth stack + memory bank).

## Phase status

| Phase | Goal | Status |
|-------|------|--------|
| 0 | Workspace bootstrap | Done |
| 1 | Backend foundation | Done |
| 2 | Auth & Users | Done — backend |
| 3 | Frontend foundation + landing + auth UI | **Done** — pushed (see Phase 3 section below) |
| 4–8 | Doctor / Appointments / AI / Polish | Pending |

## Phase 2 — Auth & Users (backend)

Stable reference: **`docs/ARCHITECTURE.md`**, backend test count **15** (`mvn test`), **Live backend endpoints:** same as Phase 2 table in prior commits ( `/api/auth/*`, `/api/users/me`, OAuth when `GOOGLE_CLIENT_*` set).

## Phase 3 — Frontend foundation

Delivered:

- **HTTP:** Axios `api` with Bearer + 401 → single-queue `/auth/refresh` (`src/lib/api/client.ts`).
- **State:** Zustand persist `mediverse-auth` (`src/stores/auth-store.ts`).
- **Data:** `@tanstack/react-query` root provider (`src/components/providers/query-provider.tsx`).
- **Pages:** `/login`, `/signup/patient`, `/signup/doctor` (multipart), `/forgot-password`, `/reset-password?token`, `/verify-email?token`, `/oauth/callback`.
- **App shells:** `/patient`, `/doctor` with role gates (`RequireRole`, `useEnsureUser`).
- **Tooling:** `npm run build`, `npm run lint` pass.

### Frontend routes (`localhost:3000`)

| Path | Notes |
|------|--------|
| `/login`, `/signup`, `/signup/patient`, `/signup/doctor` | Wired to `/api/auth/*` |
| `/forgot-password`, `/reset-password`, `/verify-email` | Wired |
| `/oauth/callback` | Parses `token`, `refresh`, `expires_at` or `error` |
| `/patient`, `/doctor` | Post-login dashboards (placeholder) |

## Source control

- Remote: `git@github.com:RishabhAggarwal613/MediVerse.git` (SSH).
- **Phase 3:** committed and pushed to **`main`** (Phase 3 completion commit).
