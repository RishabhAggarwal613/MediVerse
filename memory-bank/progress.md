# Progress

Phase-by-phase status, working endpoints, and test counts.

> Last updated: Phase 2 backend complete — AuthController tests + pushed to `origin/main`.

## Phase status

| Phase | Goal | Status |
|-------|------|--------|
| 0 | Workspace bootstrap | ✅ Done |
| 1 | Backend foundation | ✅ Done |
| 2 | Auth & Users | ✅ Backend — Google OAuth JWT redirect wired (env-gated) |
| 3 | Frontend foundation + landing + auth UI | 🟡 Partial — landing shipped; auth UI unwired |
| 4–8 | Doctor / Appointments / AI / Polish | ⏸ Pending |

## Phase 2 — Auth & Users ✅

### Build chunks

| # | Chunk | Status |
|---|-------|--------|
| 1 | Migrations + entities + repositories | ✅ |
| 2 | JWT pipeline | ✅ |
| 3 | Storage (Local + S3) | ✅ |
| 4 | Email + Thymeleaf | ✅ |
| 5 | Auth controller (register / login / refresh / logout) | ✅ |
| 6 | Verify + forgot/reset password | ✅ |
| 7 | Users controller (`/me`, avatar, onboarding) | ✅ |
| 8 | Google OAuth2 JWT + FE redirect | ✅ |
| 9 | Tests incl. AuthController (`@WebMvcTest` + resend-verification `@SpringBootTest`) | ✅ |
| 10 | Memory bank + commit Phase 2 | ✅ |

### Live backend endpoints (`localhost:8080`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/health` | — | Envelope |
| POST | `/api/auth/register/patient` | — | JSON body |
| POST | `/api/auth/register/doctor` | — | multipart `data` + `license` |
| POST | `/api/auth/login` | — | |
| POST | `/api/auth/refresh` | — | body `refreshToken` |
| POST | `/api/auth/logout` | — | body `refreshToken` |
| POST | `/api/auth/verify-email` | — | body `token` |
| POST | `/api/auth/resend-verification` | Bearer | |
| POST | `/api/auth/forgot-password` | — | always 200 |
| POST | `/api/auth/reset-password` | — | |
| GET | `/api/users/me` | Bearer | |
| PUT | `/api/users/me` | Bearer | JSON `fullName`, `phone` |
| POST | `/api/users/me/avatar` | Bearer | multipart `file` |
| GET | `/api/users/me/onboarding` | Bearer | checklist JSON |
| GET | `/v3/api-docs`, `/swagger-ui.html` | — | |
| GET | `/uploads/**` | — | **dev only** (local storage adapter) |
| GET | `/oauth2/authorization/google` | — | Google login start — **requires** env `GOOGLE_CLIENT_*` |
| GET | `/login/oauth2/code/google` | — | Spring callback |

### Test count

| Suite | Tests | Notes |
|-------|-------|-------|
| `HealthControllerTest` | 1 | `@WebMvcTest` slice |
| `MediverseApplicationTests` | 1 | `@SpringBootTest` + H2 |
| `JwtServiceTest` | 1 | Pure unit |
| `AuthServiceGoogleOAuthTest` | 4 | Mockito |
| `AuthControllerTest` | 7 | Slice — register/login/forgot/logout/doctor multipart/verify/reset |
| `AuthControllerResendVerificationIntegrationTest` | 1 | Full context — authenticated resend |
| **Total** | **15** | `mvn test` green |

## Phase 3 (partial) — Frontend

Landing + role-picker exist; **not yet wired**: Axios client, refresh interceptor,
Zustand, real forms → backend.

## Source control

- Remote: `git@github.com:RishabhAggarwal613/MediVerse.git` (SSH).
- Phase 2 backend: **merged to `origin/main`** (this session).
