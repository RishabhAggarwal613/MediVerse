# Progress

Phase-by-phase status, working endpoints, and test counts.

> Last updated: **Phase 4 shipped** — commit **`c6ee4bd`** on **`main`**.

## Phase status

| Phase | Goal | Status |
|-------|------|--------|
| 0 | Workspace bootstrap | Done |
| 1 | Backend foundation | Done |
| 2 | Auth & Users | Done — backend |
| 3 | Frontend foundation + landing + auth UI | Done |
| **4** | **Doctor module** | **Done — pushed** |
| 5–8 | Appointments / AI / Polish | Pending |

## Test count

Backend: **`mvn test`** → **16** tests (`target/surefire-reports/`).

## Phase 4 — Doctor module

**Backend**

- Migration `V4__doctor_availability_and_slots.sql`.
- Package `com.mediverse.doctor` — entities, repos, DTOs, `SlotGenerationService`, `DoctorService`, `DoctorController`. Slot regeneration runs when availability rules are added, updated, or deleted (14-day horizon).

**Live backend endpoints (doctor domain)**

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/doctors/specializations` | Enum-backed list |
| GET | `/api/doctors` | Search + `specialization`, paging |
| GET | `/api/doctors/me/profile` | Doctor profile (JWT) |
| PUT | `/api/doctors/me/profile` | Update profile |
| GET | `/api/doctors/me/dashboard/stats` | Stub (zeros until Phase 5) |
| GET | `/api/doctors/me/availability` | Rules (JWT) |
| POST | `/api/doctors/me/availability` | Add rule |
| PUT | `/api/doctors/me/availability/{ruleId}` | Update rule |
| DELETE | `/api/doctors/me/availability/{ruleId}` | Delete rule |
| GET | `/api/doctors/{id}` | Public profile |
| GET | `/api/doctors/{id}/availability` | Public active rules |
| GET | `/api/doctors/{id}/slots?date=YYYY-MM-DD` | Free slots |

**Frontend**

- Patient: `/patient/doctors`, `/patient/doctors/[id]` (booking CTA → Phase 5).
- Doctor: `/doctor/profile`, `/doctor/availability`.
- Navigation: `RoleAppNav` in patient/doctor layouts.

## Phase 3 — Frontend foundation (reference)

- HTTP / auth store / Query / auth + signup routes as before.
- **Routes:** `/patient`, `/doctor`, `/oauth/callback`, etc.

## Source control

- Remote: `git@github.com:RishabhAggarwal613/MediVerse.git` (SSH).
- **Phase 4** feature commit: **`c6ee4bd`** (on `main` / `origin/main` after push).
