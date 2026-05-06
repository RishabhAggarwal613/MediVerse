# Active Context

Update at phase boundaries or when pausing mid-phase. Answers: what happened,
what's in progress, what's next.

> Last updated: **2026-05-06** — OCR report scanner + dark pill styling.

## Current focus

**AI report scanning** now runs as **OCR → extracted text → Gemini text summarization** (PDFBox text-first, Tess4J OCR fallback). The HTTP API surface is unchanged (`POST /api/ai/reports/scan`), and the response DTO remains `{summary, findings[], recommendations}`. Gemini response parsing is hardened to extract the first balanced JSON object when the model adds preamble/trailing text.

**UI polish:** header “pills” above page headlines now use a near-black background in dark theme (while staying role color-coded).

**Optional next:** Gemini 503 retries/backoff; expose extracted OCR text for debugging (would require a migration); Dockerfile stack (see **`docs/ARCHITECTURE.md`** Phase 8 reminders).

## Recent changes (2026-05)

- **AI report scanning:** replaced Gemini Vision inline file analysis with local OCR extraction: PDFBox native text extraction with Tess4J OCR fallback (capped pages), then Gemini text-only JSON summarization via `GeminiReportTextClient`. New config: `mediverse.ocr.*`.
- **Gemini JSON hardening:** report clients now extract the first balanced `{...}` JSON object from model output (handles “here’s the JSON” wrappers) before parsing.
- **Frontend:** dark theme header pills above page titles now render with `dark:bg-black/40` for contrast.
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
