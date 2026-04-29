# Active Context

Update at phase boundaries or when pausing mid-phase. Answers: what happened,
what's in progress, what's next.

> Last updated: **2026-04-29** — **Phase 7 shipped:** AI lab report scans (Gemini Vision, `ai_reports`, S3/local storage, patient pages + doctor shared-report reader). **`GEMINI_API_KEY`** + **`GEMINI_VISION_MODEL`** required for scan. Next: **Phase 8 polish** per [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md).

## Current focus

**Phase 8 polish** — doctor dashboard onboarding, `/admin/verifications` polish, Dockerfile (optional), error/retry tweaks for Gemini 503 backlog.

## What's next

- **Phase 8** — items listed in **`docs/ARCHITECTURE.md`** Phase 8 (stats, onboarding checklist, validation copy, skeletons).
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
