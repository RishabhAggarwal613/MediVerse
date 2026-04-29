# Active Context

Update at phase boundaries or when pausing mid-phase. Answers: what happened,
what's in progress, what's next.

> Last updated: **2026-04-29** — **Phase 7** (AI reports) + **Phase 8 partial** (**`V8`**, profiles, find-doctors availability, theme shell). Next: remaining **Phase 8** items in **`docs/ARCHITECTURE.md`**.

## Current focus

**Phase 8 polish** — remainder per **`docs/ARCHITECTURE.md`** (onboarding checklist, admin UX, Dockerfile optional). **Shipped in this batch:** **`V8`** doctor practice fields; patient/doctor profile expansion; find-doctors real weekly availability on cards + dual-theme search; app shell + theme plumbing (see **`progress.md`** Phase 8 snapshot).

## What's next

- Finish **Phase 8** checklist in **`docs/ARCHITECTURE.md`** (remaining polish items).
- Optional: **automatic retries/backoff** for Gemini 503 (`progress.md` Phase 8 reminders).

## Locked decisions (unchanged)

See `progress.md`, `productContext.md`, and `systemPatterns.md`.

## Phase 7 shipped (summary)

- **Data:** **`V7__ai_reports.sql`** — `ai_reports` (summary, JSON findings, optional `shared_with_doctor_id`, raw Gemini envelope).
- **Backend:** **`GeminiReportVisionClient`**, **`AiReportService`**, **`AiReportController`** under `/api/ai/reports` (multipart scan, list, detail, share/unshare, delete). Doctors read detail only when `shared_with_doctor_id` matches.
- **Frontend:** **`/patient/ai-reports`**, **`/scan`**, **`/[id]`**; **`/doctor/reports/[id]`** for shared PDF/image read-only view; nav + patient home link.

## Phase 6 (reference)

- Flyway **`V6__ai_chat.sql`**, **`/api/ai`** chat + **`/health-tip`**, **`/patient/ai-assistant`**.

## How it runs locally

| Piece | Command / URL |
|-------|----------------|
| MySQL `mediverse` | Host-installed (see `.env.example` / `memory-bank/techContext.md`) |
| Backend | `cd backend && mvn spring-boot:run` → **http://localhost:8080** |
| Frontend | `cd frontend && npm run dev` → **http://localhost:3000** |
| Gemini | **`GEMINI_API_KEY`**, **`GEMINI_CHAT_MODEL`**, **`GEMINI_VISION_MODEL`** in repo-root `.env`. Report scan uses the **vision** model. If Google returns **503 UNAVAILABLE**, retry later or switch models—see **Phase 8** in **`docs/ARCHITECTURE.md`** / **`progress.md`**. |

`GET /api/health` exposes `googleOAuthAvailable` when both Google client vars are wired.

## Quick verify

```bash
cd backend && mvn test
cd frontend && npm run build && npm run lint
curl -s http://localhost:8080/api/health
```
