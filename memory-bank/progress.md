# Progress

Phase-by-phase status, working endpoints, and test counts.
Update this at the end of each phase.

> Last updated: end of Phase 1.

## Phase status

| Phase | Goal | Status |
|-------|------|--------|
| 0 | Workspace bootstrap | ✅ Done |
| 1 | Backend foundation | ✅ Done |
| 2 | Auth & Users | ⏳ Up next |
| 3 | Frontend foundation + landing site + auth UI | 🟡 Partial — landing + role-picker shipped early |
| 4 | Doctor module | ⏸ Pending |
| 5 | Appointments | ⏸ Pending |
| 6 | AI Health Assistant | ⏸ Pending |
| 7 | AI Report Scanning | ⏸ Pending |
| 8 | Polish | ⏸ Pending |

## Phase 0 — Workspace bootstrap ✅

- Backend Spring Boot skeleton (`pom.xml` with all phase dependencies wired up
  but unused).
- Frontend `create-next-app` skeleton.
- Host-installed MySQL `mediverse` DB + user.
- `docker-compose.yml` with **MailHog** (MySQL is on host, not containerized).
- `.env.example` + `.env`, `.gitignore`, root `README.md`.
- `docs/ARCHITECTURE.md`, `docs/WORKFLOWS.md`.

## Phase 1 — Backend foundation ✅

### Sub-checklist

- [x] `@ConfigurationPropertiesScan` enabled
- [x] `AppProperties` (binds `mediverse.*`)
- [x] `JwtProperties` (binds `jwt.*`, ready for Phase 2)
- [x] `ApiResponse<T>`, `ApiError`, `ErrorCode`, `ApiException`
- [x] `GlobalExceptionHandler` covering 14 exception types
- [x] `CorsConfig` (credentials-aware, no wildcard origins)
- [x] `SecurityConfig` (stateless, public allowlist, BCrypt + AuthManager beans)
- [x] `RestAuthenticationEntryPoint` + `RestAccessDeniedHandler` (JSON 401/403)
- [x] `OpenApiConfig` with global `bearerAuth`
- [x] `HealthController` at `GET /api/health`
- [x] `application.yml` tightened: throw-on-no-handler, error attrs off
- [x] H2 test profile (`application-test.yml`) + `MediverseApplicationTests`
- [x] `HealthControllerTest` slice
- [x] springdoc bumped 2.6.0 → 2.8.17 (Boot 3.5 compatibility)
- [x] Live verified: 200 / 401 / CORS preflight / OpenAPI / Swagger UI

### Files added in Phase 1

```
backend/src/main/java/com/mediverse/
  common/api/ApiError.java
  common/api/ApiException.java
  common/api/ApiResponse.java
  common/api/ErrorCode.java
  common/config/CorsConfig.java
  common/config/OpenApiConfig.java
  common/config/SecurityConfig.java
  common/config/properties/AppProperties.java
  common/config/properties/JwtProperties.java
  common/exception/GlobalExceptionHandler.java
  common/security/RestAccessDeniedHandler.java
  common/security/RestAuthenticationEntryPoint.java
  health/HealthController.java
backend/src/test/java/com/mediverse/health/HealthControllerTest.java
backend/src/test/resources/application-test.yml
```

(`MediverseApplication.java`, `pom.xml`, `application.yml`, and the existing
smoke test were modified, not added.)

## Phase 3 (partial) — Landing site, dark mode, polish 🟡

Shipped early so the user could see the product:

- 10 marketing sections: Hero, Trust strip, Features, How-it-works, For Doctors,
  About, Testimonials, FAQ, CTA, Footer.
- Sticky scroll-aware nav with mobile hamburger; emerald + vibrant-gradient
  theme; glass-morphism cards.
- `/login`, `/signup` (role picker), `/signup/patient`, `/signup/doctor`
  placeholder pages.
- Dark mode via `next-themes` with hydration-safe toggle.
- Custom `Reveal` component (zero dep, `IntersectionObserver`-based) for scroll
  animations.
- Inline SVG illustrations: hero heartbeat line, doctor illustration, three
  step illustrations.
- SEO: `metadata` block on root layout + `sitemap.ts` + `robots.ts`.

Still missing for Phase 3 (deferred):

- Axios client + interceptors with single-flight refresh.
- Zustand auth store.
- TanStack Query + Theme providers wired in root layout.
- Real auth pages wired to backend (need Phase 2 done first).
- Public-page guards (redirect already-authed users to dashboard).
- `(patient)` / `(doctor)` / `(admin)` route groups.
- Role-aware redirect after login.

## Live endpoints (current)

| Method | Path | Status | Notes |
|---|---|---|---|
| GET | `/api/health` | 200 | Standard envelope |
| GET | `/v3/api-docs` | 200 | OpenAPI 3.1 JSON |
| GET | `/swagger-ui/index.html` | 200 | Swagger UI |
| any | (anything else under `/api/*`) | 401 | JSON envelope, no HTML |
| OPTIONS | (any) | 200 + CORS headers | from `http://localhost:3000` |

## Test count

| Suite | Tests | Status |
|---|---|---|
| `MediverseApplicationTests` (`@SpringBootTest` + H2) | 1 | ✅ |
| `HealthControllerTest` (`@WebMvcTest`) | 1 | ✅ |
| **Total** | **2** | **green** |

## Known limitations / debt

- `V1__placeholder.sql` is still a placeholder — to be replaced when Phase 2
  schema lands.
- No Testcontainers integration test against real MySQL yet (planned for
  Phase 8 polish).
- No CI pipeline configured yet (manual `mvn test` for now).
- Spring devtools is on; in any future deployment build, exclude or scope
  away.
