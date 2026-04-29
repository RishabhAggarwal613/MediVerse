# Tech Context

Exact versions, local setup, ports, env vars, and gotchas. Update this when
tooling or dependencies change.

## Versions

### Backend

| Thing | Version |
|---|---|
| Java | **21** (Ubuntu OpenJDK `21.0.10`) |
| Maven | system `mvn` (3.8.7) — **no `./mvnw` wrapper in this repo** |
| Spring Boot | **3.5.5** |
| Spring Security | 6.5 (transitively from Boot) |
| Spring Framework | 6.2.10 (transitively) |
| Hibernate ORM | 6.6.26.Final |
| MySQL connector | 9.4.0 |
| Flyway | 11.7.2 (`flyway-core` + `flyway-mysql`) |
| jjwt | 0.12.6 (`api`, `impl`, `jackson`) |
| AWS SDK v2 | 2.28.16 (`s3`) |
| springdoc-openapi | **2.8.17** (⚠ see "Gotchas" below — 2.6.0 is incompatible with Boot 3.5) |
| Thymeleaf | 3.1.3 |
| H2 (test only) | latest (Boot-managed) |

### Frontend

| Thing | Version |
|---|---|
| Node | 20+ |
| Next.js | **14.2.x** (App Router) |
| TypeScript | 5 |
| Tailwind CSS | 3.4.x |
| shadcn/ui | Radix + CVA (see `components/ui`) |
| TanStack Query | **5** |
| Axios | **1.15.x** |
| Zustand | **5** |
| React Hook Form | **7** |
| Zod | **4** |
| `next-themes` | 0.4.x |
| `tailwindcss-animate` | 1.x |

### Database

- **MySQL 8.0.45** — host-installed, NOT containerized.
- Database: `mediverse`, charset `utf8mb4`, collation `utf8mb4_unicode_ci`.
- User: `mediverse@localhost`, password `mediversepass` (dev only).

## Local setup

### One-time

```sql
CREATE DATABASE mediverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mediverse'@'localhost' IDENTIFIED BY 'mediversepass';
GRANT ALL PRIVILEGES ON mediverse.* TO 'mediverse'@'localhost';
FLUSH PRIVILEGES;
```

```bash
cp .env.example .env
docker compose up -d            # starts MailHog (SMTP catcher)
```

### Run

```bash
# backend
cd backend
mvn spring-boot:run             # → http://localhost:8080
mvn test                        # runs against H2 (test profile)

# frontend
cd frontend
npm install
npm run dev                     # → http://localhost:3000
```

## Ports

| Service | Port | URL |
|---|---|---|
| Frontend (Next.js dev) | 3000 | http://localhost:3000 |
| Backend (Spring Boot) | 8080 | http://localhost:8080 |
| Swagger UI | 8080 | http://localhost:8080/swagger-ui/index.html |
| OpenAPI JSON | 8080 | http://localhost:8080/v3/api-docs |
| MySQL | 3306 | `localhost:3306` (host-installed) |
| MailHog SMTP | 1025 | `localhost:1025` |
| MailHog UI | 8025 | http://localhost:8025 |
| LiveReload (devtools) | 35729 | (auto) |

## Env vars (loaded from `.env`)

Authoritative list: see `.env.example` at repo root. The backend reads them
via `${VAR:default}` placeholders in `application.yml`, so the app boots
locally even with most values empty — only DB credentials are required.

Highlights:

- `DB_URL` / `DB_USER` / `DB_PASSWORD` — MySQL connection.
- `JWT_SECRET` / `JWT_ACCESS_TTL_MINUTES` / `JWT_REFRESH_TTL_DAYS` — auth.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth2 (Phase 2+).
- `AWS_REGION` / `AWS_S3_BUCKET` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` — S3.
- `GEMINI_API_KEY` / `GEMINI_CHAT_MODEL` / `GEMINI_VISION_MODEL` — AI.
- `MAIL_HOST` / `MAIL_PORT` / `MAIL_FROM` — Spring Mail.
- `CORS_ALLOWED_ORIGINS` — comma-separated, binds to `List<String>`.
- `ADMIN_EMAILS` — comma-separated allowlist for `/admin/verifications`.
- `APPT_BOOKING_HORIZON_DAYS=7`, `APPT_CANCEL_WINDOW_HOURS=2`.

Frontend uses `NEXT_PUBLIC_API_BASE_URL` (`http://localhost:8080/api`) and
`NEXT_PUBLIC_GOOGLE_OAUTH_URL`.

## Test infrastructure

- `src/test/resources/application-test.yml` configures an in-memory **H2**
  database (`MODE=MySQL;NON_KEYWORDS=USER`) so the full Spring context boots
  without requiring local MySQL.
- Flyway is **disabled** in the test profile (`spring.flyway.enabled: false`)
  to avoid running MySQL-specific migrations against H2.
- Slice tests (`@WebMvcTest`) use `@AutoConfigureMockMvc(addFilters = false)`
  to bypass security where it's not under test.
- Smoke test: `MediverseApplicationTests` (`@SpringBootTest` + H2).

## Backend package layout

```
com.mediverse
├── MediverseApplication                   (@SpringBootApplication, @ConfigurationPropertiesScan, @EnableAsync)
├── auth/
│   ├── controller/AuthController
│   ├── service/AuthService
│   ├── dto/
│   ├── domain/ (RefreshToken, EmailVerificationToken, PasswordResetToken)
│   ├── repository/
│   └── security/
│       ├── JwtService, JwtAuthenticationFilter, TokenHasher
│       ├── CustomUserDetailsService, MediverseUserPrincipal
├── user/
│   ├── controller/UserController
│   ├── service/UserService
│   ├── dto/
│   ├── domain/ (User, Patient, Doctor + enums)
│   └── repository/
├── email/ EmailService (+ Thymeleaf impl)
├── storage/ StorageService (+ LocalFs / S3 adapters, LocalStorageWebConfig)
├── common/ (api envelope, config incl. StorageProperties + AwsProperties,
│            exception handler, security JSON handlers)
└── health/HealthController
```

## Test infrastructure (additions)

- `HealthControllerTest`: `@WebMvcTest(HealthController)` + `@MockBean JwtAuthenticationFilter`
  (avoids pulling `JwtService` into the slice), `@EnableConfigurationProperties(StorageProperties.class)`
  (slice does not run full `@ConfigurationPropertiesScan`), `@ActiveProfiles("test")`.
- `application-test.yml` now includes `mediverse.frontend` and `mediverse.storage` so
  `AppProperties` / `StorageService` bind cleanly in `@SpringBootTest`.
- `JwtServiceTest`: pure unit test (no Spring context) for sign/parse round-trip.

## Frontend route layout (current)

```
src/app/
├── (marketing)/
│   ├── layout.tsx                         shared nav + footer
│   ├── page.tsx                           landing (10 sections)
│   ├── login/page.tsx                     placeholder
│   └── signup/
│       ├── page.tsx                       role picker
│       ├── patient/page.tsx               placeholder
│       └── doctor/page.tsx                placeholder
├── layout.tsx                             root + ThemeProvider + metadata
├── sitemap.ts
└── robots.ts
```

Phase 3 will add `(patient)/`, `(doctor)/`, `(admin)/`, plus the shared
`lib/api`, `lib/auth`, `components/forms`, etc.

## Useful commands

```bash
# Backend
mvn -DskipTests package        # compile only
mvn test                       # H2 tests
mvn spring-boot:run            # start dev server (port 8080)

# Frontend
npm run dev                    # dev server (port 3000)
npm run build                  # prod build (verifies all routes compile)
npm run lint                   # eslint

# Health checks
curl -s http://localhost:8080/api/health
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/v3/api-docs
```

## Gotchas

### 1. Springdoc must be 2.7+ on Spring Boot 3.5

Spring Framework 6.2 changed the constructor signature of
`ControllerAdviceBean`. Springdoc 2.6.0 calls the old signature and throws
`NoSuchMethodError` at runtime when hitting `/v3/api-docs`. **Pinned to 2.8.17.**

### 2. No `./mvnw` wrapper

This repo uses the system `mvn` (3.8.7). If you need a wrapper, run
`mvn -N io.takari:maven:wrapper` once and commit `mvnw` + `.mvn/`.

### 3. CORS with credentials forbids wildcard origins

`mediverse.cors.allowed-origins` must be specific (`http://localhost:3000`),
not `*`, because we set `Access-Control-Allow-Credentials: true`.

### 4. Default Spring error JSON is silenced

`server.error.include-{message,stacktrace,binding-errors,exception}` are all
off, plus `spring.mvc.throw-exception-if-no-handler-found: true` and
`spring.web.resources.add-mappings: false`. This routes 404s through
`GlobalExceptionHandler` instead of `BasicErrorController`.

### 5. Devtools is on `runtime` scope

Live reload + restart on classpath change works automatically when running
`mvn spring-boot:run`. It's excluded from the packaged `.jar`.

### 6. MySQL driver version is "undefined" in Hibernate logs

Cosmetic — Hibernate doesn't recognize MySQL connector 9.4.0's metadata. App
runs fine.
