# Active Context

Update at phase boundaries or when pausing mid-phase. Answers: what happened,
what's in progress, what's next.

> Last updated: **2026-04-29** — Phase 6 AI stack live; Phase 8 **operational notes** captured (exit 137, Gemini 503). Next: **Phase 7** report scanning, then Phase 8 polish checklist in [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md).

## Current focus

**Phase 7+** — AI report scanning and polish per [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md).

## What's next

- **Phase 7** — AI report scanning (S3 + Gemini Vision, persistence, share flow) per architecture doc.
- **Phase 8** — Polish items + optional retries/backoff for Gemini 503 (see `progress.md` reminders).

## Locked decisions (unchanged)

See `progress.md`, `productContext.md`, and `systemPatterns.md`.

## Phase 6 shipped (summary)

- **Data:** Flyway `V6__ai_chat.sql` — `ai_chat_sessions`, `ai_chat_messages` (roles USER/ASSISTANT).
- **Backend:** `com.mediverse.ai` — `GeminiChatRemoteClient`, `AiChatService`, **`AiHealthTipService`** (one tip per UTC day, in-memory cache), **`AiController`** under `/api/ai` (`/chat/sessions`, messages, **`/health-tip`**).
- **Security:** All AI endpoints **PATIENT** via **`@PreAuthorize("hasRole('PATIENT')")`** (+ authenticated default for `/api/**`).
- **Frontend:** `src/types/ai.ts`, `src/lib/api/ai.ts`, **`/patient/ai-assistant`** — sessions sidebar, transcript, daily tip panel; **`RoleAppNav`** + patient home links.

## How it runs locally

| Piece | Command / URL |
|-------|----------------|
| MySQL `mediverse` | Host-installed (see `.env.example` / `memory-bank/techContext.md`) |
| Backend | `cd backend && mvn spring-boot:run` → **http://localhost:8080** |
| Frontend | `cd frontend && npm run dev` → **http://localhost:3000** |
| Gemini | Set **`GEMINI_API_KEY`** (+ **`GEMINI_CHAT_MODEL`**) in repo-root `.env` (loaded via `DotenvBootstrap`). If Google returns **503 UNAVAILABLE**, retry later or switch model—see **Phase 8** in **`docs/ARCHITECTURE.md`** / **`progress.md`**. |

`GET /api/health` exposes `googleOAuthAvailable` when both Google client vars are wired.

## Quick verify

```bash
cd backend && mvn test
cd frontend && npm run build && npm run lint
curl -s http://localhost:8080/api/health
```
