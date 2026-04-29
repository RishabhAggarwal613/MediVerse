# Active Context

Update at phase boundaries or when pausing mid-phase. Answers: what happened,
what's in progress, what's next.

> Last updated: **Phase 4 pushed** — **`c6ee4bd`** on **`main`**.

## Current focus

**Phase 5 — Appointments** — booking from free slots, doctor request handling, per
`docs/ARCHITECTURE.md`.

## Locked decisions (unchanged)

See `progress.md` and `systemPatterns.md`.

## Phase 4 snapshot (complete)

- **DB:** `V4__doctor_availability_and_slots.sql` — `doctor_availability`, `time_slots`.
- **Backend:** `DoctorService`, `SlotGenerationService`, `DoctorController` — search, public
  profile, `/me` profile + availability CRUD, regenerate slots, dashboard stats stub;
  `GET /api/doctors/specializations`, `GET /api/doctors`, `/{id}`, `/{id}/availability`,
  `/{id}/slots?date=`.
- **Frontend:** `src/lib/api/doctors.ts`; patient `/patient/doctors` (+ detail); doctor
  `/doctor/profile`, `/doctor/availability`; `RoleAppNav` for patient/doctor shells.
- **Tests:** `@WebMvcTest(DoctorControllerTest)` — `specializations` slice (needs
  `@EnableConfigurationProperties(StorageProperties.class)` like other MVC tests).

## Decisions made this phase

- Slot regeneration: 14-day horizon from active weekly rules; unbooked slots replaced on
  regenerate.
- Public doctor search: verified + approval `APPROVED` only (`DoctorRepository.searchVisible`).
- Booking from UI deferred to Phase 5 (slots preview only on patient detail).

## What's next

1. **Phase 5** — appointment entities, book/cancel APIs, doctor inbox, confirmation emails.
2. Optional: wire `/doctor` home to real dashboard stats when Phase 5 data exists.

## Recent fix (Phase 4 closure)

- **`SecurityConfig`:** Unauthenticated `GET` access for doctor discovery (`/api/doctors`,
  specializations, `{id}`, `{id}/availability`, `{id}/slots`). `/api/doctors/me/**` stays
  authenticated (listed first so `me` is not a public `{id}`).

## Quick verify

```bash
cd backend && mvn test
cd frontend && npm run build && npm run lint
curl -s http://localhost:8080/api/health
```
