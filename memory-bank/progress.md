# Progress

Phase-by-phase status, working endpoints, and test counts.

> Last updated: **Phase 5 complete** — committed to **`main`** and pushed to **`origin`** (see repo history for latest SHA).

## Phase status

| Phase | Goal | Status |
|-------|------|--------|
| 0 | Workspace bootstrap | Done |
| 1 | Backend foundation | Done |
| 2 | Auth & Users | Done |
| 3 | Frontend foundation + landing + auth UI | Done |
| **4** | **Doctor module** | **Done — pushed** |
| **5** | **Appointments** | **Done — pushed** |
| 6–8 | AI / Polish | Pending |

## Test count

Backend: **`mvn test`** → **17** tests (includes **`AppointmentControllerTest`** slice).

## Phase 5 — Appointments — features shipped

### Backend

- Migration **`V5__appointments.sql`**.
- Package **`com.mediverse.appointment`** — `AppointmentController` **`/api/appointments`**, `AppointmentService` (booking horizon, pessimistic slot lock, duplicate booking rule, cancel window from `AppProperties`, status transitions; release slot on reject/cancel where applicable).
- **`EmailService`** transactional templates incl. **`appointment-notify`** (booking, approval, rejection, completion, patient-cancel → doctor); sends after **`TransactionSynchronizationManager.afterCommit`** from service.
- **`SlotGenerationService`** availability query fix: **`findByDoctorIdAndActiveTrueOrderByDayOfWeekAscStartTimeAsc`**.
- **`DoctorService.dashboardStats`** wired to aggregates (no stubs).
- **Bootstrap:** **`DotenvBootstrap`** + **`dotenv-java`** loads first **`.env`** walking up from CWD (`backend/` finds monorepo root); does not override existing env or `-D` props.

### Live backend endpoints (appointments)

| Method | Path | Role |
|--------|------|------|
| POST | `/api/appointments` | PATIENT — `{ slotId, reason? }` |
| GET | `/api/appointments/me` | auth — role-aware list |
| GET | `/api/appointments/{id}` | auth — participant detail |
| PATCH | `/api/appointments/{id}/approve` | DOCTOR |
| PATCH | `/api/appointments/{id}/reject` | DOCTOR |
| PATCH | `/api/appointments/{id}/complete` | DOCTOR — `{ doctorNote? }` |
| PATCH | `/api/appointments/{id}/cancel` | PATIENT |

### Frontend

- **`src/types/appointments.ts`**, **`src/lib/api/appointments.ts`**
- **`/patient/doctors/[id]`** — pick date + optional reason → book slot; invalidates appointments/slots queries; clears mutation state when date changes
- **`/patient/appointments`** — list; cancel when allowed
- **`/doctor/appointments`** — approve/reject pending; complete (with optional note via prompt path)
- **`RoleAppNav`** — Appointments entries for patient and doctor shells

---

## Phase 4 — Doctor module (still current; stats enhanced in Phase 5)

Backend + discovery endpoints unchanged except **`GET /api/doctors/me/dashboard/stats`** returning real numbers. See **`docs/ARCHITECTURE.md`** for full tables.

---

## Phase 3 — Frontend foundation (reference)

HTTP client, TanStack Query, Zustand auth, marketing + `(app)` route groups.

---

## Source control

- Remote: `git@github.com:RishabhAggarwal613/MediVerse.git` (SSH).
- **Phase 4** milestone (historical): **`c6ee4bd`**.
- **Phase 5:** latest **`main`** (see **`git log -1`** on origin after pull).
