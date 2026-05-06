# Progress

Phase-by-phase status, working endpoints, and test counts.

> Last updated: **2026-05-06** — Calendar event links (`V15`), Meet email delivery, appointments UI classification.

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

## Post–Phase 8 — practice location & navigation (shipped)

- **Flyway `V9__doctor_practice_address.sql`** — nullable formatted address + latitude + longitude + `practice_place_id` on **`doctors`** (extends **`V8`** city + languages).
- **Doctor profile API** — `PUT /api/doctors/me/profile` with `replacePracticeLocation` replaces the Maps-managed block cleanly.
- **Frontend doctor profile** — `PracticeAddressPicker`: Google Places + embedded map (click/drag) + **`Use current location`** (`@googlemaps/js-api-loader` v2 modular APIs); **`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`** in **`frontend/.env.local`**.
- **`AppointmentDto`** — includes **`practiceAddressFormatted`**, **`practiceLatitude`**, **`practiceLongitude`** from the doctor for **Navigate** (`lib/maps-links.ts` → `google.com/maps/dir`).
- **Patient UX** — **`/patient/appointments`** + home “next appointment” **Navigate** when location data exists.
- **Booking stability** — patient slot listing no longer destroys/recreates rows in a way that invalidates **`slotId`** before POST book (`SlotGenerationService` / listing path).

## Post–Phase 8 — cross-modality slot moment (shipped)

- **Flyway `V13__reset_availability_and_unify_slot_booking.sql`** — sync **`is_booked`** across rows sharing `(doctor_id, slot_date, start_time)`; delete unbooked **`time_slots`** only when **no** row in **`appointments`** references them; **`DELETE FROM doctor_availability`** (dev reset — doctors must re-create availability rules).
- **Runtime:** **`TimeSlotRepository.lockMomentPeersForSlot`** (ordered pessimistic lock); book sets **`booked=true`** on all peer rows; cancel/reject clears all peers for that moment; duplicate guard **`existsByPatient_IdAndDoctor_IdAndScheduledAtAndStatusIn`**. **`deleteUnbookedBetween`** uses **`NOT EXISTS`** appointment reference (same FK rule as **`V13`**).

## Post–Phase 8 — Google Calendar API + Meet (optional)

- **Flyway `V14__google_calendar_event_columns.sql`** — **`google_calendar_event_id`**, **`google_calendar_calendar_id`** on **`appointments`**.
- **Flyway `V15__google_calendar_html_link.sql`** — **`google_calendar_html_link`** on **`appointments`** (opens existing event in Calendar web).
- **Backend** — **`GoogleCalendarSyncService`**, **`GoogleCalendarProperties`** (`mediverse.google-calendar.*`). Enables **Google Calendar API** with **`calendar.events`** scope; **VIDEO** visits get **`conferenceData`** (Meet). **Booking/approve flows** persist event + Meet before returning JSON so clients see links immediately; emails show Meet when **`meetJoinUrl`** is set; additionally sends a dedicated **“Video meeting link”** email to both patient + doctor.

## Post–Phase 8 — appointment calendar UX (shipped)

- **Patient** — **`/patient/appointments`**, home next-appointment card: **Google Calendar** button (prefilled title, time, location / video link, details with meet URL).
- **Doctor** — **`/doctor/appointments`**: same **Google Calendar** control, **Join video** when applicable, **Meeting link:** line with full URL on video visits.
- **Code:** **`frontend/src/lib/calendar-links.ts`**, **`frontend/src/components/appointments/google-calendar-appointment-button.tsx`**.

## Post–Phase 8 — appointments dashboard classification (shipped)

- **Patient** — `Pending / Upcoming / Past / Cancelled` tabs + day-grouped lists on **`/patient/appointments`**.
- **Doctor** — `Pending / Today / Upcoming / Past / Cancelled` tabs + day-grouped lists on **`/doctor/appointments`**.

## Phase 8 — shipped (original scope)

- **Earlier batch:** **`V8__doctor_practice_fields.sql`** (`practice_city`, `languages`); patient profile / doctor search UX; themed **`AppPageShell`**; **`DoctorSummaryDto.availabilitySummary`** from weekly availability.
- **Admin doctor verification:** `GET /api/admin/doctors/pending`, approve/reject; **`/admin/verifications`**; **`ADMIN_EMAILS`** (`UserDto.admin`).
- **`DoctorPublicDto`:** **`verificationStatus`** (`PENDING` \| `APPROVED` \| `REJECTED`) for doctor-banner UX.
- **Onboarding:** **`GET /api/users/me/onboarding`** — checklist on patient & doctor home when incomplete.
- **Banners:** unverified-email strip + resend; doctor pending/rejected license banner below nav.

## Phase 8 — reminders (ops / optional)

- **`mvn spring-boot:run` + exit 137:** Usually **SIGKILL** (killed process: `fuser`/port free, `kill -9`, **OOM**, or agent/CI timeout)—**not** an application compile failure if logs already show **Tomcat started on 8080**. **Fix:** start the backend again; if OOM, ease memory pressure or set `MAVEN_OPTS=-Xmx512m` (tune as needed).
- **Gemini unavailable (HTTP 503):** Google’s Generative Language API sometimes returns **503 / `UNAVAILABLE`** (“high demand”). Backend surfaces **`ApiException.upstreamUnavailable`** with the error body. **Mitigation:** retry after a few minutes; change **`GEMINI_CHAT_MODEL`** / **`GEMINI_VISION_MODEL`** if one model is overloaded; optional future work: client retries with backoff.

## Test count

Backend: **`mvn test`** — JUnit suites under `backend/src/test` (includes **`AppointmentControllerTest`**, **`AiControllerTest`**, **`AiReportControllerTest`**, etc.). Re-run after schema/DTO changes; slice tests avoid live MySQL (H2 / mocks).

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

- Remote: **`git@github.com:RishabhAggarwal613/MediVerse.git`** (SSH).
- After **`git pull`**, run Flyway-backed backend once so **`V9`**/**`V13`** (and later) apply on dev MySQL when applicable. **`V13`** clears availability and unbooked slots — reconfigure doctor availability after migrate.
