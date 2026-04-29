# Progress

Phase-by-phase status, working endpoints, and test counts.

> Last updated: **2026-04-29** — Phase 8 complete; **`README.md`** + memory bank synced. **`mvn test`** → **23** tests.

## Phase status

| Phase | Goal | Status |
|-------|------|--------|
| 0 | Workspace bootstrap | Done |
| 1 | Backend foundation | Done |
| 2 | Auth & Users | Done |
| 3 | Frontend foundation + landing + auth UI | Done |
| 4 | Doctor module | Done |
| 5 | Appointments | Done |
| **6** | **AI Health Assistant** | **Done** (Gemini chat + sessions + `/health-tip`) |
| **7** | **AI Report Scanning** | **Done** (upload + Vision + `ai_reports` + share + patient/doctor pages) |
| **8** | **Polish** | **Done** (V8 profiles/theme + admin verification UI + onboarding + banners) |

## Phase 8 — shipped

- **Earlier batch:** **`V8__doctor_practice_fields.sql`** (`practice_city`, `languages`); patient profile / doctor search UX; themed **`AppPageShell`**; **`DoctorSummaryDto.availabilitySummary`** from weekly availability.
- **Admin doctor verification:** `GET /api/admin/doctors/pending`, approve/reject; **`/admin/verifications`**; **`ADMIN_EMAILS`** (`UserDto.admin`).
- **`DoctorPublicDto`:** **`verificationStatus`** (`PENDING` | `APPROVED` | `REJECTED`) for doctor-banner UX.
- **Onboarding:** **`GET /api/users/me/onboarding`** — checklist on patient & doctor home when incomplete.
- **Banners:** unverified-email strip + resend; doctor pending/rejected license banner below nav.

## Phase 8 — reminders (ops / optional)

- **`mvn spring-boot:run` + exit 137:** Usually **SIGKILL** (killed process: `fuser`/port free, `kill -9`, **OOM**, or agent/CI timeout)—**not** an application compile failure if logs already show **Tomcat started on 8080**. **Fix:** start the backend again; if OOM, ease memory pressure or set `MAVEN_OPTS=-Xmx512m` (tune as needed).
- **Gemini unavailable (HTTP 503):** Google’s Generative Language API sometimes returns **503 / `UNAVAILABLE`** (“high demand”). Backend surfaces **`ApiException.upstreamUnavailable`** with the error body. **Mitigation:** retry after a few minutes; change **`GEMINI_CHAT_MODEL`** / **`GEMINI_VISION_MODEL`** if one model is overloaded; optional future work: client retries with backoff.

## Test count

Backend: **`mvn test`** → **23** tests (includes **`AiControllerTest`**, **`AiReportControllerTest`**, **`AppointmentControllerTest`**).

## Phase 7 — AI Report Scanning — shipped

### Backend

- Migration **`V7__ai_reports.sql`** (`ai_reports` + FK to patients/doctors).
- **`GeminiReportVisionClient`** (`inline_data`, strict JSON extraction).
- **`AiReportService`**, **`AiReportController`** `/api/ai/reports` (multipart scan, CRUD-lite, share/unshare/delete).
- Storage keys **`reports/{patientId}/{uuid}.{ext}`** (`StorageService.REPORTS_PREFIX`).

### Live backend endpoints (`/api/ai`)

| Method | Path | Role |
|--------|------|------|
| POST | `/api/ai/reports/scan` | PATIENT (multipart `file`) |
| GET | `/api/ai/reports` | PATIENT |
| GET | `/api/ai/reports/{id}` | PATIENT (owner) or DOCTOR (if shared) |
| POST | `/api/ai/reports/{id}/share` | PATIENT `{ "doctorId" }` |
| POST | `/api/ai/reports/{id}/unshare` | PATIENT |
| DELETE | `/api/ai/reports/{id}` | PATIENT |

(Plus Phase 6 chat + `/health-tip` — see **`docs/ARCHITECTURE.md`**.)

### Frontend

- **`src/lib/api/reports.ts`**, types in **`src/types/ai.ts`**
- **`/patient/ai-reports`**, **`/patient/ai-reports/scan`**, **`/patient/ai-reports/[id]`**
- **`/doctor/reports/[id]`** (shared report read-only deep link)
- **RoleAppNav** + patient home link to AI reports.

---

## Phase 6 — AI Health Assistant — (reference)

- Migration **`V6__ai_chat.sql`**, **`AiController`** chat paths, **`GeminiChatRemoteClient`**, **`AiHealthTipService`**.
- Patient UI **`/patient/ai-assistant`**.

---

## Phase 5 — Appointments (reference)

Booking, lifecycle emails, dashboard stats — see **`docs/ARCHITECTURE.md`** for full appointment table.

---

## Source control

- Remote: `git@github.com:RishabhAggarwal613/MediVerse.git` (SSH).
- **Recent tip:** Phase 8 polish — **`59566bc`** on **`main`** (see `git log` for latest).
- **Phase 5 release (historical):** **`6279143`** on **`main`**.
