# System Patterns

Architecture style and the cross-cutting patterns that every module follows.
Authoritative detail is in [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md).

## Architecture style

- **Modular monolith** in Spring Boot. Each domain is a top-level package with
  its own controller / service / repository / entity / dto. Shared code lives
  under `com.mediverse.common`.
- **Stateless REST API** — no server-side sessions, no CSRF needed. Auth is
  carried in the `Authorization: Bearer <jwt>` header on every request.
- **Frontend route groups** isolate concerns:
  - `(marketing)` — public pages (landing, login, signup variants).
  - `(patient)` — patient-only app shell.
  - `(doctor)` — doctor-only app shell.
  - `(admin)` — email-allowlisted verification page.

## Cross-cutting backend patterns

### 1. Uniform response envelope

Every successful and every failed response is wrapped in `ApiResponse<T>`:

```json
{ "success": true,  "data": { ... } }
{ "success": false, "error": { "code": "...", "message": "...", "details": [...], "path": "...", "timestamp": "..." } }
```

Implementation:
- `com.mediverse.common.api.ApiResponse<T>` (record, `@JsonInclude(NON_NULL)`).
- `com.mediverse.common.api.ApiError` with `FieldViolation` records for
  per-field validation errors.
- `com.mediverse.common.api.ErrorCode` enum carries the preferred `HttpStatus`
  per code so handlers stay consistent.

### 2. Stable error codes

Codes are stable strings the frontend can branch on. Add new ones, never
rename existing ones. Current set:
`VALIDATION_ERROR`, `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`,
`METHOD_NOT_ALLOWED`, `CONFLICT`, `PAYLOAD_TOO_LARGE`,
`UNSUPPORTED_MEDIA_TYPE`, `RATE_LIMITED`, `UPSTREAM_UNAVAILABLE`,
`INTERNAL_ERROR`.

### 3. Throw `ApiException`, never raw `ResponseStatusException`

Domain code throws `ApiException(ErrorCode, message[, details])`.
`GlobalExceptionHandler` translates it. Convenience factories:
`ApiException.notFound`, `.badRequest`, `.conflict`, `.forbidden`,
`.unauthorized`.

### 4. Single `GlobalExceptionHandler`

`@RestControllerAdvice` handlers cover: `ApiException`,
`MethodArgumentNotValidException`, `ConstraintViolationException`,
`HttpMessageNotReadableException`, `MissingServletRequestParameterException`,
`MethodArgumentTypeMismatchException`, `NoHandlerFoundException`,
`HttpRequestMethodNotSupportedException`, `MaxUploadSizeExceededException`,
`DataIntegrityViolationException`, `BadCredentialsException`,
`AuthenticationException`, `AccessDeniedException`, fallback `Exception`.

### 5. JSON 401 / 403 from the security filter chain

`RestAuthenticationEntryPoint` and `RestAccessDeniedHandler` write the same
`ApiResponse` envelope from inside the filter chain (the chain runs **before**
`@RestControllerAdvice`, so we can't rely on the global handler for these).

### 6. Configuration via typed records

`@ConfigurationPropertiesScan` picks up:
- `AppProperties` (`mediverse.cors`, `.admin`, `.appointment`, `.mail`).
- `JwtProperties` (`jwt.secret`, `.access-ttl-minutes`, `.refresh-ttl-days`,
  `.issuer`).

No `@Value` sprinkled across services.

### 7. Stateless, allowlist-first security

`SecurityConfig` keeps a tight public allowlist. Everything else is
`authenticated()` and protected with `@PreAuthorize` at the service/controller
boundary once roles exist (Phase 2+). Beans wired ready: `BCryptPasswordEncoder`,
`AuthenticationManager`, `@EnableMethodSecurity`.

Public allowlist:

```
/api/health, /api/auth/**, /oauth2/**, /login/oauth2/**,
/v3/api-docs, /v3/api-docs/**, /swagger-ui, /swagger-ui/**, /swagger-ui.html,
/error
```

### 8. JWT auth (planned for Phase 2)

- Access token (~15 min) sent in `Authorization` header.
- Refresh token (~7 days) — rotation, persisted server-side.
- One JWT filter pre-`UsernamePasswordAuthenticationFilter`.
- `CustomUserDetailsService` maps `User` → `UserDetails` with the role authority.

### 9. CORS from typed properties

`CorsConfig` reads `mediverse.cors.allowed-origins`. Credentials are enabled,
so wildcard origins are intentionally not supported.

### 10. OpenAPI bearer scheme

`OpenApiConfig` declares a global `bearerAuth` scheme so the Swagger UI
"Authorize" button is wired. Use `@SecurityRequirements` on a controller
method to **strip** the bearer requirement on public endpoints.

### 11. File storage via S3 + presigned URLs (Phases 2 & 7)

`S3StorageService` exposes `upload`, `delete`, `presignGet(key, ttl)`. Bucket
is private; clients fetch via short-lived presigned URLs (5–15 min). Layout:
`profile-pics/{userId}/{uuid}.{ext}`, `reports/{patientId}/{uuid}.{ext}`.

### 12. AI calls always go through one client (Phases 6 & 7)

A single `GeminiClient` centralizes API key, timeouts, retries, and logging.
Chat → `gemini-1.5-flash`. Vision → `gemini-1.5-pro`. Strict JSON parsing for
report findings.

### 13. Email via Spring Mail + Thymeleaf (Phases 2, 5, 8)

`EmailService` renders Thymeleaf templates from
`src/main/resources/templates/email/`. Triggered on register, appointment
book/approve/reject/cancel, and a day-before reminder (`@Scheduled`).

## Cross-cutting frontend patterns

- **Server state via TanStack Query**, **client state via Zustand**.
  No mixing — anything that comes from the server goes through Query.
- **Forms via React Hook Form + Zod**. Server validation errors map back to
  field-level errors via the `details[]` array on `ApiError`.
- **Axios client with single-flight refresh.** On 401, queue concurrent
  requests, fire one refresh, then replay. One central interceptor.
- **Reveal animation** is a tiny in-house `IntersectionObserver` wrapper
  (no external dep).
- **`next-themes` for dark mode**, with `suppressHydrationWarning` on `<html>`
  and a hydration-safe `ThemeToggle`.

## Conventions

- File paths use full package names (`com.mediverse.common.api.ApiResponse`).
- New backend modules go under `com.mediverse.<domain>/` with a flat
  `controller`, `service`, `repository`, `dto`, `domain` layout.
- New frontend marketing components go under
  `src/components/marketing/`; shared UI primitives under `src/components/ui/`;
  page-specific code stays in the route group.
- Migrations are `Vn__snake_case_description.sql`, never edited after merge.
- Every entity gets `created_at` / `updated_at` (utc).

## Things to **avoid**

- Returning raw `ResponseEntity<Map>` or strings — must wrap in `ApiResponse`.
- Throwing `RuntimeException` for product errors — use `ApiException`.
- Reading config with `@Value("${...}")` — define a typed property record.
- Importing entities into controllers — go through DTOs.
- Adding new top-level packages without a clear domain reason.
