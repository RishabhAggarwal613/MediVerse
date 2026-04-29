# Active Context

Update at phase boundaries or when pausing mid-phase. Answers: what happened,
what's in progress, what's next.

> Last updated: **Phase 5 complete** — appointments + Google `.env` bootstrap on `main`.

## Current focus

**Phase 6+** — AI chat, report scanning, and polish per [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md).

## Locked decisions (unchanged)

See `progress.md`, `productContext.md`, and `systemPatterns.md`. Appointments API follows the published table in `docs/ARCHITECTURE.md`.

## Phase 5 shipped (summary)

- **Data:** Flyway `V5__appointments.sql` — appointments + status enum; one appointment per `time_slot_id`.
- **Domain/API:** `com.mediverse.appointment` — book, list (`/me`), detail, approve/reject/complete/cancel; pessimistic slot lock; same-doctor **same-calendar-day** duplicate guard; patient cancel inside configured window.
- **Email:** Sync `EmailService` methods + `templates/email/appointment-notify.html`; sends **after DB commit**.
- **Doctor dashboard:** `/api/doctors/me/dashboard/stats` uses `AppointmentService.dashboardCounts` (today, rolling week by horizon, distinct patients served).
- **Frontend:** Booking on `/patient/doctors/[id]`; `/patient/appointments` & `/doctor/appointments`; `RoleAppNav`; `unwrapApiErrorMessage` helper.
- **OAuth dev UX:** `DotenvBootstrap` loads repo-root `.env` into JVM properties before Spring starts (`MediverseApplication`), so **`GOOGLE_CLIENT_*`** resolves without manual `export` when using `.env`; tests still blank OAuth via `application-test.yml`.

## How it runs locally

| Piece | Command / URL |
|-------|----------------|
| MySQL `mediverse` | Host-installed (see `.env.example` / `memory-bank/techContext.md`) |
| Backend | `cd backend && mvn spring-boot:run` → **http://localhost:8080** |
| Frontend | `cd frontend && npm run dev` → **http://localhost:3000** |
| SMTP (optional) | `docker compose up -d` (MailHog **:1025** / UI **:8025**) |

`GET /api/health` exposes `googleOAuthAvailable` when both Google client vars are wired.

## Quick verify

```bash
cd backend && mvn test
cd frontend && npm run build && npm run lint
curl -s http://localhost:8080/api/health
```
