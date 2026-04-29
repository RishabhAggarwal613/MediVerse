# Progress

Phase-by-phase status, working endpoints, and test counts.

> Last updated: **2026-04-29** — Phase 6 features + **Phase 8 polish reminders** (docs + this file): `mvn spring-boot:run` **exit 137** (SIGKILL) vs real failures; **Gemini 503** mitigations. **`mvn test`** → **20** tests.

## Phase status

| Phase | Goal | Status |
|-------|------|--------|
| 0 | Workspace bootstrap | Done |
| 1 | Backend foundation | Done |
| 2 | Auth & Users | Done |
| 3 | Frontend foundation + landing + auth UI | Done |
| 4 | Doctor module | Done |
| 5 | Appointments | Done |
| **6** | **AI Health Assistant** | **Done** (Gemini chat + persisted sessions + `/health-tip`; no report scanning) |
| 7–8 | Report scanning / Polish | Pending |

## Phase 8 — Polish — reminders (planned; see `docs/ARCHITECTURE.md` Phase 8)

- **`mvn spring-boot:run` + exit 137:** Usually **SIGKILL** (killed process: `fuser`/port free, `kill -9`, **OOM**, or agent/CI timeout)—**not** an application compile failure if logs already show **Tomcat started on 8080**. **Fix:** start the backend again; if OOM, ease memory pressure or set `MAVEN_OPTS=-Xmx512m` (tune as needed).
- **Gemini unavailable (HTTP 503):** Google’s Generative Language API sometimes returns **503 / `UNAVAILABLE`** (“high demand”). Backend surfaces **`ApiException.upstreamUnavailable`** with the error body. **Mitigation:** retry after a few minutes; change **`GEMINI_CHAT_MODEL`** if one model is overloaded; optional future work: client retries with backoff.

## Test count

Backend: **`mvn test`** → **20** tests (includes **`AiControllerTest`**, **`AppointmentControllerTest`**).

## Phase 6 — AI Health Assistant — features shipped

### Backend

- Migration **`V6__ai_chat.sql`**.
- Package **`com.mediverse.ai`** — `GeminiChatRemoteClient` (Generative Language `generateContent`), `AiChatService`, `AiHealthTipService`, `AiController` **`/api/ai`**.
- **`GeminiProperties`** via `@ConfigurationPropertiesScan` on `MediverseApplication`.
- **`ApiException.upstreamUnavailable`** for Gemini/network failures.

### Live backend endpoints (AI — Phase 6)

| Method | Path | Role |
|--------|------|------|
| POST | `/api/ai/chat/sessions` | PATIENT |
| GET | `/api/ai/chat/sessions` | PATIENT |
| GET | `/api/ai/chat/sessions/{id}/messages` | PATIENT |
| POST | `/api/ai/chat/sessions/{id}/messages` | PATIENT |
| GET | `/api/ai/health-tip` | PATIENT |

_Report scanning routes under `/api/ai/reports*` are **Phase 7** — not implemented yet._

### Frontend

- **`src/types/ai.ts`**, **`src/lib/api/ai.ts`**
- **`/patient/ai-assistant`** — chat UI + daily tip
- **`RoleAppNav`** — “AI assistant”; patient dashboard links

---

## Phase 5 — Appointments (reference)

Booking, lifecycle emails, dashboard stats — see **`docs/ARCHITECTURE.md`** for full appointment table.

---

## Source control

- Remote: `git@github.com:RishabhAggarwal613/MediVerse.git` (SSH).
- **Phase 5 release (historical):** **`6279143`** on **`main`**.
