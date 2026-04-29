# Active Context

Update at phase boundaries or when pausing mid-phase. Answers: what happened,
what's in progress, what's next.

> Last updated: Phase 2 backend **complete** — `AuthController` tests added; Phase 2 committed and pushed.

## Current focus

**Phase 3 — Frontend** — wire Next.js to backend (Axios, refresh, `/oauth/callback`,
Zustand, auth forms).

**Phase 2 (backend)**

- **Closed.** `docs/ARCHITECTURE.md` Phase 2 items delivered, including **`AuthController` tests**
  (`AuthControllerTest` slice + `AuthControllerResendVerificationIntegrationTest` for
  `@AuthenticationPrincipal`).

## Phase 2 build chunks (status)

| # | Chunk | Status |
|---|-------|--------|
| 1 | Migrations V2/V3 + entities + repositories + enums | ✅ |
| 2 | JWT pipeline (`JwtService`, `JwtAuthenticationFilter`, `CustomUserDetailsService`, `SecurityConfig`) | ✅ |
| 3 | Storage (`StorageService`, `LocalFsStorageService`, `S3StorageService`, `LocalStorageWebConfig`) | ✅ |
| 4 | Email (`EmailService` + Thymeleaf templates under `templates/email/`) | ✅ |
| 5 | Auth register/login/refresh/logout (`AuthController` + `AuthService`) | ✅ |
| 6 | Verify-email, resend, forgot/reset password | ✅ |
| 7 | Users: `/api/users/me` GET/PUT, avatar, onboarding | ✅ |
| 8 | Google OAuth2 (JWT redirect to FE) | ✅ Credentials present → JWT + `{base}/oauth/callback` |
| 9 | Tests (JWT, Health, AuthController slice, OAuth service, resend-verification integration) | ✅ |
| 10 | Memory bank + commit Phase 2 | ✅ |

## What's working (backend)

- **DB:** Flyway `V2`/`V3` — `users`, `patients`, `doctors`,
  `refresh_tokens`, `email_verification_tokens`, `password_reset_tokens`.
- **`UserDto.profilePictureUrl`** — resolved via `StorageService.urlFor` (browser URL,
  not opaque key).
- **Security** — Stateless JWT Bearer filter (`@Order(1)`); optional Google OAuth chain
  (`@Order(0)`, short-lived session) when env credentials set. Explicit `permitAll` list (not
  blanket `/api/auth/**`; **`POST /api/auth/resend-verification`** requires auth).
- **MailHog** — transactional mail for welcome / verify / reset / doctor-pending.
- **OAuth (credentials set)** — redirects to `{frontend}/oauth/callback` with `token`, `refresh`, `expires_at` or `error=<code>`.

## Locked decisions (unchanged)

See `progress.md` §Phase 2 and `systemPatterns.md`. Highlights: refresh tokens
SHA-256 hashed; rotation on refresh; optional local-fs storage;
`mediverse.admin.emails` for reviewer notifications.

## Recent implementation notes

- **`HealthControllerTest`:** `@MockBean JwtAuthenticationFilter` +
  `@EnableConfigurationProperties(StorageProperties)` +
  `@ActiveProfiles("test")` — MVC slice neither loads full
  `@ConfigurationPropertiesScan` nor real JWT beans.
- **`application-test.yml`:** binds `mediverse.frontend`, `mediverse.storage`, etc.
- **`AuthControllerTest`:** `@WebMvcTest(AuthController.class)` mocks `AuthService` +
  **`JwtAuthenticationFilter`** (matches `HealthControllerTest` slice style).
- **`AuthControllerResendVerificationIntegrationTest`:** `@SpringBootTest` +
  **`@AutoConfigureMockMvc(addFilters = true)`** — `@AuthenticationPrincipal` needs the full
  security filter chain plus `authentication()` request post-processor.

## What's next

1. **Phase 3** — SPA `/oauth/callback`, Axios + refresh, login/register UX.

## Quick verify

```bash
cd backend && mvn test
curl -s http://localhost:8080/api/health
```
