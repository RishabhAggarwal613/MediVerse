# Active Context

Update at phase boundaries or when pausing mid-phase. Answers: what happened,
what's in progress, what's next.

> Last updated: **2026-05-06** — Google Calendar event links + Meet emails; appointments dashboards reclassified.

## Current focus

**Phase 8** remains the last numbered phase. **Appointments:** shared-moment slot booking (**`lockMomentPeersForSlot`**), **`meet_join_url`** + **`google_calendar_html_link`** when Calendar API creates an event (**`V15`**). **`book` / `approve`** commit to DB first, then sync Calendar + Meet, then emails and JSON so clients see links immediately. Dashboards now classify appointments via tabs (patient: Pending/Upcoming/Past/Cancelled; doctor: Pending/Today/Upcoming/Past/Cancelled).

**Optional next:** Gemini 503 retries/backoff, Dockerfile stack (see **`docs/ARCHITECTURE.md`** Phase 8 reminders).

## Recent changes (2026-05)

- **Backend Google Calendar:** optional OAuth refresh token **or** service account (+ Workspace **`delegated-user`**); creates event + Meet for **VIDEO** when the booking is **CONFIRMED** (auto at book) or when the doctor **approves** a **PENDING** request; persists **`google_calendar_html_link`** so UI opens the **existing** event; deletes remote event on patient cancel / doctor reject. Flyway **`V14`** + **`V15`**.
- **Email:** booking/approval emails include Meet when present; additionally sends a dedicated **“Video meeting link”** email to both patient + doctor when Meet is generated.
- **Frontend appointments UI:** tabbed classification + date-grouped sections on both patient and doctor appointments pages.
- **Shared-moment slots + `V13` FK-safe cleanup;** frontend **manual** Google Calendar URLs + meeting link on cards (**`calendar-links.ts`**).
- **Earlier in May:** **`V9`** practice address + lat/lon; patient **Navigate**; **`PracticeAddressPicker`**.

## What's next

- Optional: **Gemini 503 retries/backoff**, **Dockerfile** for backend + frontend (`ARCHITECTURE.md` §14).

## Locked decisions (unchanged)

See **`progress.md`**, **`productContext.md`**, **`systemPatterns.md`**.

## How it runs locally

| Piece | Command / URL |
|-------|----------------|
| MySQL `mediverse` | Host-installed (see `.env.example` / **`techContext.md`**) |
| Backend | `cd backend && mvn spring-boot:run` → **http://localhost:8080** |
| Frontend | `cd frontend && npm run dev` → **http://localhost:3000** |
| Next public env | Prefer **`frontend/.env.local`** for `NEXT_PUBLIC_*` (see **`README.md`**) |
| Gemini | **`GEMINI_*`** in repo-root `.env`; 503 → see **`progress.md`** reminders |

`GET /api/health` exposes `googleOAuthAvailable` when both Google client vars are wired.

## Quick verify

```bash
cd backend && mvn test
cd frontend && npm run build && npm run lint
curl -s http://localhost:8080/api/health
```
