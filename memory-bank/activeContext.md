# Active Context

Update at phase boundaries or when pausing mid-phase. Answers: what happened,
what's in progress, what's next.

> Last updated: **2026-05-06** — Memory bank refresh: **`V13`** FK-safe pruning, Calendar UX on appointment cards.

## Current focus

**Phase 8** remains the last numbered phase. **Appointments:** cross-modality **one moment** booking (peer
`time_slots` locked/marked booked together; cancel/reject clears the moment), duplicate guard on **exact
`scheduledAt`**, **`deleteUnbookedBetween`** skips rows still referenced by **`appointments`**. **`V13`** syncs
`is_booked` across sibling rows, deletes only unbooked slots **not** FK-referenced by any appointment, clears
**`doctor_availability`** (dev reset — re-seed rules). **Frontend:** **Google Calendar** add-to-calendar on patient
and doctor appointment cards (**`lib/calendar-links.ts`**, **`GoogleCalendarAppointmentButton`**), visible **video
meeting link** text on cards where applicable.

**Optional next:** Gemini 503 retries/backoff, Dockerfile stack (see **`docs/ARCHITECTURE.md`** Phase 8 reminders).

## Recent changes (2026-05)

- **Appointments / slots:** shared-moment booking + release; **`V13`** + runtime **`deleteUnbookedBetween`** avoid
  deleting **`time_slots`** still referenced by **`appointments`** (FK 1451 fix).
- **Frontend appointments:** **Google Calendar** template links + **meeting URL** on patient/doctor cards and patient
  home “next appointment”.
- **Earlier in May:** **`V9`** practice address + lat/lon; **`AppointmentDto`** practice fields; patient **Navigate**;
  **`PracticeAddressPicker`**; slot-list stability around book.

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
