# Active Context

Update at phase boundaries or when pausing mid-phase. Answers: what happened,
what's in progress, what's next.

> Last updated: **Phase 3 complete** — frontend auth foundation merged and **pushed to `origin/main`**.

## Current focus

**Phase 4 — Doctor module** — next milestone per `docs/ARCHITECTURE.md` (doctor profile, search/list,
availability, frontend surfaces). Phase 3 is closed.

## Phase 3 snapshot (complete)

- **HTTP:** Axios `api` + Bearer, single-flight `/auth/refresh`; `fromAxios` / unwrap maps API envelopes.
- **State:** Zustand persist (`mediverse-auth`); OAuth uses `setOAuthTokens` then `GET /users/me`.
- **UI:** TanStack Query root provider; RHF + Zod forms; multipart doctor signup (`data` + `license`).
- **Routes:** `/login`, `/signup/*`, `/forgot-password`, `/reset-password`, `/verify-email`, `/oauth/callback`,
  `/patient`, `/doctor`; **`RedirectIfAuthenticated`** on `(marketing)` — logged-in users hitting login/signup/forgot redirect to role dashboard (`oauth/callback` excluded).

## Locked decisions (unchanged)

See `progress.md` and `systemPatterns.md`.

## Recent implementation notes

- **Public auth guard:** `(marketing)` layout mounts `RedirectIfAuthenticated` — satisfies ARCHITECTURE “redirect already-authenticated users” for auth marketing paths.
- **Doctor signup:** Single-form + license upload (not multi-step wizard); acceptable for v1; split UI later if desired.

## What's next

1. **Phase 4** — doctor profile CRUD, specialization list, search/list + paging, availability + slots, FE list/profile/editor.
2. Optional polish: toasts for `ApiRequestError`, React Query hooks for `users/me`.

## Quick verify

```bash
cd frontend && npm run build && npm run lint
curl -s http://localhost:8080/api/health
```
