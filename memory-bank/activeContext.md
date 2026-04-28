# Active Context

The most volatile file. Update it at the **end of every phase** (or when you
make a major decision). It answers: "What just happened, what's happening
now, what's next?"

> Last updated: end of Phase 1.

## Current focus

**Phase 1 (backend foundation) just shipped. Next up: Phase 2 — Auth & Users.**

## What's working right now

- Backend boots on `http://localhost:8080` against host MySQL, with Flyway
  validating `V1__placeholder.sql`.
- `GET /api/health` returns the standard `ApiResponse<HealthDto>` envelope.
- `GET /v3/api-docs` and `GET /swagger-ui/index.html` return 200 with the
  MediVerse OpenAPI 3.1 spec and a `bearerAuth` scheme wired.
- Protected paths (e.g. `/api/users/me`) return JSON 401 envelopes — no Spring
  HTML pages.
- CORS preflight from `http://localhost:3000` returns all expected headers.
- Test suite is green (2 tests: `@SpringBootTest` smoke against H2 +
  `@WebMvcTest` slice for `HealthController`).
- Frontend landing site (Phase 3 partial) lives at `/` with all 10 sections,
  dark mode, scroll reveal animations, and inline SVG illustrations.

## Recent changes (Phase 1, today)

- Added `@ConfigurationPropertiesScan` to `MediverseApplication`.
- Created typed property records: `AppProperties`, `JwtProperties`.
- Created the API envelope: `ApiResponse`, `ApiError`, `ErrorCode`,
  `ApiException`.
- Implemented `GlobalExceptionHandler` covering validation, parsing, auth,
  data-integrity, upload-too-large, no-handler, fallback.
- Built `CorsConfig` (typed origins, credentials-aware).
- Built `SecurityConfig` (stateless, public allowlist, JSON 401/403 via
  `RestAuthenticationEntryPoint` + `RestAccessDeniedHandler`, `BCrypt` and
  `AuthenticationManager` beans, `@EnableMethodSecurity`).
- Built `OpenApiConfig` with global `bearerAuth` scheme.
- Built `HealthController` at `GET /api/health`.
- Tightened `application.yml` (no-handler exceptions on, default error
  attrs off, Thymeleaf check off until templates exist).
- Bumped springdoc `2.6.0 → 2.8.17` (Boot 3.5.5 compat fix).
- Added H2 as test-scope dependency + `application-test.yml` for portable
  `@SpringBootTest`.

Files added (15) — see `progress.md` for the inventory.

## Known issues / open threads

- **None blocking.** Phase 1 acceptance criteria are met.
- The `V1__placeholder.sql` migration is still a placeholder; it will be
  superseded by Phase 2's user/auth schema migrations.

## Decisions made this phase

- Named the public allowlist explicitly (no wildcards beyond what's needed).
- Chose to write 401/403 from the security filter chain (not rely on the
  global advice) — cleaner separation, no surprises.
- Chose H2 + a dedicated test profile over Testcontainers for v1 tests.
  Testcontainers can come back in Phase 8 polish if we want full MySQL
  fidelity in CI.

## What's next — Phase 2 plan (auth & users)

Per [`docs/ARCHITECTURE.md` §14](../docs/ARCHITECTURE.md):

1. **Entities & migrations**
   - `users` table (id, email, password_hash, role, name, profile_pic_key,
     email_verified_at, created_at, updated_at).
   - `patients` (1-1 with users) — phone, dob, address, etc.
   - `doctors` (1-1 with users) — specialization, qualifications, fee,
     license_doc_key, verification_status.
   - `email_verification_tokens`, `password_reset_tokens`, `refresh_tokens`.
2. **Auth controller** — `POST /api/auth/register/patient`,
   `POST /api/auth/register/doctor` (multipart for license upload),
   `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`,
   `POST /api/auth/verify-email`, `POST /api/auth/forgot-password`,
   `POST /api/auth/reset-password`.
3. **JWT filter + `CustomUserDetailsService`** — sits before
   `UsernamePasswordAuthenticationFilter`.
4. **Google OAuth2** — `oauth2Login` + a custom success handler that issues
   our JWT and redirects to `/oauth/callback?token=...&refresh=...`.
5. **Email templates** — Thymeleaf templates for welcome / verify / reset.
6. **`/api/users/me`** + profile pic upload (S3) + onboarding endpoint.
7. **Tests for `AuthController`** (JWT round-trip, validation errors).

## Things to ask the user before starting Phase 2

- Confirm: keep `mediverse@localhost / mediversepass` for dev, or rotate?
- Confirm: ok to scaffold S3 service with a **local-filesystem** fallback for
  Phase 2 dev (so we don't need real AWS creds yet)?
- Confirm: doctor verification — should we email the allowlisted reviewer when
  a new doctor signs up, or just rely on them checking the page?
