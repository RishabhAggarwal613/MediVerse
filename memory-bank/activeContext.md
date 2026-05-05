# Active Context

Update at phase boundaries or when pausing mid-phase. Answers: what happened,
what's in progress, what's next.

> Last updated: **2026-05-05** — Docs + memory bank synced with **practice location (V9)**,
> **patient Navigate**, **doctor profile Maps/geolocation**, **slot-list stability** fixes; pushed to GitHub.

## Current focus

**Phase 8** remains the last numbered phase. **Incremental UX** shipped: doctor practice
street + coordinates (`V9`), `AppointmentDto` practice fields, Google Maps picker on
**`/doctor/profile`**, **Navigate** on patient appointments + dashboard next-visit card.

**Optional next:** Gemini 503 retries/backoff, Dockerfile stack (see **`docs/ARCHITECTURE.md`** Phase 8 reminders).

## Recent changes (2026-05)

- **DB:** **`V9__doctor_practice_address.sql`** — `practice_address_formatted`, `practice_latitude`,
  `practice_longitude`, `practice_place_id` on **`doctors`**.
- **Backend:** `Doctor`, `UpdateDoctorProfileRequest`, `DoctorPublicDto`; **`AppointmentDto`** + **`AppointmentService.toDtoWithDetails`**
  expose practice location for patient navigation; **`SlotGenerationService`** / free-slot flow avoids invalidating `slotId`
  between listing and book; **`TimeSlotRepository`** support for repair/queries as needed.
- **Frontend:** **`PracticeAddressPicker`** (Places + map + reverse geocode + **Use current location**);
  **`lib/maps-links.ts`**; patient **Navigate**; doctor profile + doctor detail maps links; optional
  **`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`** in **`frontend/.env.local`**.
- **Cleanup:** removed ephemeral Cursor **`AgentDebugLog`** instrumentation from auth/email services before push.

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
