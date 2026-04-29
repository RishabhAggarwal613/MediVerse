# MediVerse — Architecture Document

> A medical platform that connects **Patients** and **Doctors**, with AI-powered health assistance and automated medical-report analysis.
>
> See **[`WORKFLOWS.md`](./WORKFLOWS.md)** for detailed user journeys and UX decisions.

---

## 1. Product Scope

### Roles (RBAC)
- **PATIENT** — books appointments, chats with AI assistant, scans/analyzes lab reports.
- **DOCTOR** — manages profile, availability, and incoming appointment requests.

### Patient Features
1. **AI Health Assistant** — conversational chatbot for general health questions (Gemini-powered).
2. **AI Report Scanning** — upload a lab report (PDF/image) → Gemini Vision returns:
   - Plain-language summary
   - Extracted key findings (out-of-range values, flags)
   - General lifestyle / follow-up recommendations (with "consult a doctor" disclaimer)
   - Saved to patient's history
   - Optionally shared with a chosen doctor
3. **Doctor Appointment Booking** — search doctors, view profile/availability, book a slot.

### Doctor Features
1. **Profile management** — specialization, qualifications, fee, photo, bio.
2. **Availability management** — weekly working hours + per-date overrides → generated time slots.
3. **Appointment management** — view / accept / reject / complete appointment requests.
4. **Dashboard stats** — today's appointments, total patients, weekly trend.

### Appointment Flow — Hybrid
The doctor configures *per availability block* whether slots are:
- **Instant-book** (auto-confirmed), or
- **Approval-required** (status = `PENDING` until the doctor approves/rejects).

### Key product rules (locked in `WORKFLOWS.md`)
- **Slot booking horizon:** 7 days ahead.
- **Patient cancellation:** allowed only when `now < scheduled_at - 2h`.
- **Doctor verification:** doctor uploads license document on signup → reviewed in a small `/admin/verifications` page gated by env-var-allowlisted emails. There is no `ADMIN` role; the gate is a `@AdminEmailOnly` annotation.
- **AI report visibility for doctors:** only reports the patient *explicitly shared* with that doctor.

---

## 2. Tech Stack

| Layer            | Technology                                                                 |
|------------------|----------------------------------------------------------------------------|
| Frontend         | Next.js 14 (App Router) + TypeScript                                       |
| UI               | Tailwind CSS + shadcn/ui                                                   |
| Frontend state   | Zustand (auth) + TanStack Query (server state)                             |
| Forms            | React Hook Form + Zod                                                      |
| HTTP             | Axios (with auth + refresh interceptors)                                   |
| Backend          | Spring Boot 3.x (Java 21) — **Modular Monolith**                           |
| Security         | Spring Security 6 + JWT (access + refresh) + Google OAuth2                 |
| ORM              | Spring Data JPA / Hibernate                                                |
| Migrations       | Flyway                                                                     |
| Database         | MySQL 8                                                                    |
| File storage     | AWS S3 (SDK v2)                                                            |
| AI               | Google Gemini (defaults `gemini-2.5-flash` chat, `gemini-2.5-pro` vision; override via env)   |
| Email            | Spring Mail (SMTP — Gmail app password for dev)                            |
| API docs         | springdoc-openapi (Swagger UI)                                             |
| Build            | Maven (backend), pnpm or npm (frontend)                                    |
| Local infra      | Docker Compose (MySQL only)                                                |

---

## 3. High-Level Architecture

```
┌────────────────────┐        HTTPS/JSON       ┌───────────────────────┐
│   Next.js (App)    │ ─────────────────────► │  Spring Boot REST API │
│  - SSR/CSR pages   │ ◄───── JWT in Authz ───│   (modular monolith)  │
│  - TanStack Query  │                         └───────────┬───────────┘
│  - Zustand auth    │                                     │
└──────────┬─────────┘                                     │
           │                              ┌────────────────┼──────────────────┐
           │                              ▼                ▼                  ▼
           │                        ┌──────────┐    ┌────────────┐     ┌──────────────┐
           │                        │  MySQL 8 │    │   AWS S3   │     │ Gemini API   │
           │                        └──────────┘    └────────────┘     └──────────────┘
           │
           │   Google OAuth2
           └──────────────────────────────────────────────► Google
```

---

## 4. Repository Layout (monorepo)

```
MediVerse/
├── backend/                     # Spring Boot app
├── frontend/                    # Next.js app
├── docker-compose.yml           # MySQL container (and optionally pgAdmin/MailHog)
├── docs/
│   └── ARCHITECTURE.md          # this file
├── .gitignore
└── README.md
```

---

## 5. Backend — Modular Monolith Layout

Package root: `com.mediverse`

```
com.mediverse
├── MediverseApplication.java
│
├── config/
│   ├── SecurityConfig.java          # filter chain, password encoder, auth manager
│   ├── CorsConfig.java
│   ├── JwtProperties.java           # @ConfigurationProperties for jwt.*
│   ├── S3Config.java                # S3Client bean
│   ├── GeminiProperties.java        # api key, models
│   ├── MailConfig.java
│   └── OpenApiConfig.java
│
├── common/
│   ├── api/
│   │   ├── ApiResponse.java         # uniform response wrapper
│   │   └── PageResponse.java
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ResourceNotFoundException.java
│   │   ├── BadRequestException.java
│   │   ├── UnauthorizedException.java
│   │   └── ForbiddenException.java
│   └── util/
│       └── DateTimeUtil.java
│
├── security/
│   ├── jwt/
│   │   ├── JwtService.java          # generate/validate access + refresh
│   │   ├── JwtAuthenticationFilter.java
│   │   └── TokenType.java
│   ├── oauth/
│   │   ├── GoogleOAuth2UserService.java
│   │   ├── OAuth2SuccessHandler.java
│   │   └── OAuth2FailureHandler.java
│   ├── CustomUserDetails.java
│   ├── CustomUserDetailsService.java
│   └── annotations/
│       ├── PatientOnly.java         # @PreAuthorize("hasRole('PATIENT')")
│       └── DoctorOnly.java
│
├── auth/
│   ├── AuthController.java          # /api/auth/**
│   ├── AuthService.java
│   ├── dto/
│   │   ├── PatientRegisterRequest.java
│   │   ├── DoctorRegisterRequest.java
│   │   ├── LoginRequest.java
│   │   ├── AuthResponse.java
│   │   └── RefreshTokenRequest.java
│   ├── RefreshToken.java            # entity
│   └── RefreshTokenRepository.java
│
├── user/
│   ├── User.java                    # base entity (id, email, password, role, ...)
│   ├── Role.java                    # enum: PATIENT, DOCTOR
│   ├── AuthProvider.java            # enum: LOCAL, GOOGLE
│   ├── UserRepository.java
│   ├── UserService.java
│   ├── MeController.java            # /api/users/me
│   └── dto/UserDto.java
│
├── patient/
│   ├── Patient.java                 # @OneToOne with User
│   ├── PatientRepository.java
│   ├── PatientService.java
│   ├── PatientController.java
│   └── dto/PatientProfileDto.java
│
├── doctor/
│   ├── Doctor.java
│   ├── Specialization.java          # enum or lookup table
│   ├── DoctorRepository.java
│   ├── DoctorService.java
│   ├── DoctorController.java        # /api/doctors/**
│   ├── availability/
│   │   ├── DoctorAvailability.java  # weekly recurring rule
│   │   ├── TimeSlot.java            # generated concrete slot
│   │   ├── AvailabilityRepository.java
│   │   ├── TimeSlotRepository.java
│   │   ├── SlotGenerator.java       # rule → slots for next N days
│   │   ├── AvailabilityService.java
│   │   └── AvailabilityController.java
│   └── dto/...
│
├── appointment/
│   ├── Appointment.java
│   ├── AppointmentStatus.java       # PENDING, CONFIRMED, REJECTED, COMPLETED, CANCELLED
│   ├── AppointmentRepository.java
│   ├── AppointmentService.java
│   ├── AppointmentController.java
│   └── dto/...
│
├── ai/
│   ├── GeminiClient.java            # low-level HTTP client to Gemini REST API
│   ├── chat/
│   │   ├── ChatSession.java
│   │   ├── ChatMessage.java
│   │   ├── ChatRole.java            # USER, ASSISTANT
│   │   ├── ChatRepository.java
│   │   ├── ChatService.java
│   │   └── ChatController.java
│   └── reports/
│       ├── AiReport.java            # saved scan
│       ├── ReportFinding.java       # structured key finding (json)
│       ├── ReportRepository.java
│       ├── ReportAnalyzer.java      # builds prompt, calls Gemini Vision, parses JSON
│       ├── ReportService.java
│       └── ReportController.java
│
├── storage/
│   ├── StorageService.java          # interface
│   ├── S3StorageService.java        # implementation
│   └── StoredFile.java              # value object {url, key, size, contentType}
│
└── notification/
    ├── EmailService.java
    └── templates/                   # html templates (booking confirmation, etc.)
```

### Layer conventions
- **Controller** — HTTP only. No business logic. Returns `ApiResponse<T>`.
- **Service** — business logic, transactions (`@Transactional`).
- **Repository** — Spring Data JPA only.
- **DTO** — separate request/response classes; no entities exposed.
- **Entity** — package-private when possible; only the owning module touches its entities directly.
- Cross-module access goes through the other module's **service interface**, never repository or entity directly.

---

## 6. Database Schema (MySQL)

### Tables

#### `users`
| column            | type                | notes                                  |
|-------------------|---------------------|----------------------------------------|
| id                | BIGINT PK AI        |                                        |
| email             | VARCHAR(180) UNIQUE | NOT NULL                               |
| password          | VARCHAR(255)        | NULL for OAuth users                   |
| full_name         | VARCHAR(120)        | NOT NULL                               |
| phone             | VARCHAR(20)         |                                        |
| role              | ENUM                | `PATIENT`, `DOCTOR`                    |
| provider          | ENUM                | `LOCAL`, `GOOGLE`                      |
| provider_id       | VARCHAR(120)        | Google sub for OAuth                   |
| profile_pic_url   | VARCHAR(500)        |                                        |
| email_verified    | BOOLEAN             | default FALSE                          |
| email_verified_at | TIMESTAMP           | nullable                               |
| enabled           | BOOLEAN             | default TRUE                           |
| created_at        | TIMESTAMP           |                                        |
| updated_at        | TIMESTAMP           |                                        |

#### `patients` — extends users (1:1)
| column            | type            | notes |
|-------------------|-----------------|-------|
| id                | BIGINT PK AI    |       |
| user_id           | BIGINT FK UNIQUE| → users.id |
| date_of_birth     | DATE            |       |
| gender            | ENUM            | `MALE`,`FEMALE`,`OTHER` |
| blood_group       | VARCHAR(5)      |       |
| allergies         | TEXT            |       |
| emergency_contact | VARCHAR(20)     |       |

#### `doctors`
| column              | type            | notes |
|---------------------|-----------------|-------|
| id                  | BIGINT PK AI    |       |
| user_id             | BIGINT FK UNIQUE| → users.id |
| specialization      | VARCHAR(80)     | indexed for search |
| qualifications      | VARCHAR(255)    |       |
| license_number      | VARCHAR(80)     | UNIQUE |
| years_experience    | INT             |       |
| consultation_fee    | DECIMAL(10,2)   |       |
| bio                 | TEXT            |       |
| license_doc_url     | VARCHAR(500)    | S3 key/url to uploaded license |
| verification_status | ENUM            | `PENDING`,`APPROVED`,`REJECTED` (default `PENDING`) |
| verification_note   | VARCHAR(500)    | reason on reject |
| is_verified         | BOOLEAN         | denormalized = `verification_status = APPROVED` |
| rating_avg          | DECIMAL(2,1)    | denormalized cache (future) |

#### `doctor_availability` — weekly recurring rule
| column                | type           | notes |
|-----------------------|----------------|-------|
| id                    | BIGINT PK AI   |       |
| doctor_id             | BIGINT FK      | → doctors.id |
| day_of_week           | ENUM           | MON..SUN |
| start_time            | TIME           |       |
| end_time              | TIME           |       |
| slot_duration_minutes | INT            | default 30 |
| requires_approval     | BOOLEAN        | hybrid flow flag |
| is_active             | BOOLEAN        | default TRUE |

#### `time_slots` — generated concrete slots
| column            | type           | notes |
|-------------------|----------------|-------|
| id                | BIGINT PK AI   |       |
| doctor_id         | BIGINT FK      | → doctors.id |
| slot_date         | DATE           | indexed |
| start_time        | TIME           |       |
| end_time          | TIME           |       |
| is_booked         | BOOLEAN        | default FALSE |
| requires_approval | BOOLEAN        | inherited from rule |

UNIQUE(`doctor_id`,`slot_date`,`start_time`)

#### `appointments`
| column        | type              | notes |
|---------------|-------------------|-------|
| id            | BIGINT PK AI      |       |
| patient_id    | BIGINT FK         | → patients.id |
| doctor_id     | BIGINT FK         | → doctors.id |
| time_slot_id  | BIGINT FK UNIQUE  | → time_slots.id |
| status        | ENUM              | `PENDING`,`CONFIRMED`,`REJECTED`,`COMPLETED`,`CANCELLED` |
| reason        | VARCHAR(500)      | patient's note |
| doctor_note   | TEXT              | filled on completion |
| scheduled_at  | DATETIME          | denormalized from slot |
| created_at    | TIMESTAMP         |       |
| updated_at    | TIMESTAMP         |       |

#### `ai_chat_sessions`
| id, user_id FK→users, title, created_at, updated_at |

#### `ai_chat_messages`
| id, session_id FK, role ENUM(`USER`,`ASSISTANT`), content TEXT, created_at |

#### `ai_reports` — saved scan results
| column              | type           | notes |
|---------------------|----------------|-------|
| id                  | BIGINT PK AI   |       |
| patient_id          | BIGINT FK      | → patients.id |
| original_filename   | VARCHAR(255)   |       |
| file_url            | VARCHAR(500)   | S3 key/url |
| content_type        | VARCHAR(80)    |       |
| summary             | TEXT           |       |
| key_findings        | JSON           | array of `{label,value,unit,refRange,flag}` |
| recommendations     | TEXT           |       |
| raw_response        | JSON           | full Gemini response for traceability |
| shared_with_doctor_id | BIGINT FK NULL | → doctors.id |
| created_at          | TIMESTAMP      |       |

#### `refresh_tokens`
| id, user_id FK, token VARCHAR(512) UNIQUE, expires_at, revoked BOOLEAN, created_at |

#### `email_verification_tokens`
| id, user_id FK, token_hash VARCHAR(128) UNIQUE, expires_at, used_at, created_at |

#### `password_reset_tokens`
| id, user_id FK, token_hash VARCHAR(128) UNIQUE, expires_at, used_at, created_at |

### Migrations
Flyway under `backend/src/main/resources/db/migration/`:
```
V1__placeholder.sql            (Phase 0 — already applied)
V2__init_users.sql             (users + refresh_tokens + email_verification_tokens + password_reset_tokens)
V3__patients_doctors.sql       (patients + doctors with verification_status & license_doc_url)
V4__doctor_availability_and_slots.sql
V5__appointments.sql
V6__ai_chat.sql
V7__ai_reports.sql
```

---

## 7. REST API Surface

All responses wrap in:
```json
{ "success": true, "data": ..., "message": "...", "error": null, "timestamp": "..." }
```

### Auth — `/api/auth`
| Method | Path                       | Role  | Description |
|--------|----------------------------|-------|-------------|
| POST   | `/register/patient`        | —     | Register a patient |
| POST   | `/register/doctor`         | —     | Register a doctor (multipart: includes license document) |
| POST   | `/login`                   | —     | Email + password → access + refresh |
| POST   | `/refresh`                 | —     | Refresh access token |
| POST   | `/logout`                  | auth  | Revoke refresh token |
| POST   | `/verify-email`            | —     | `{token}` → mark email verified |
| POST   | `/resend-verification`     | auth  | Resend verification email |
| POST   | `/forgot-password`         | —     | `{email}` → email reset link (always 200) |
| POST   | `/reset-password`          | —     | `{token, newPassword}` → set new password, revoke sessions |
| GET    | `/oauth2/google`           | —     | Start Google OAuth (Spring handles) |
| GET    | `/oauth2/callback`         | —     | Callback → issues JWTs, redirects to FE |

### Users — `/api/users`
| GET    | `/me`             | auth  | Current user |
| PUT    | `/me`             | auth  | Update name/phone |
| POST   | `/me/avatar`      | auth  | Upload profile pic (multipart) |
| GET    | `/me/onboarding`  | auth  | Onboarding checklist state for the dashboard |

### Patients — `/api/patients`
| GET | `/me/profile` | PATIENT | Get patient profile |
| PUT | `/me/profile` | PATIENT | Update patient profile |

### Doctors — `/api/doctors`
| GET | `/`                  | auth    | Search (`q`, `specialization`, `page`, `size`) |
| GET | `/{id}`              | auth    | Public doctor profile |
| GET | `/me/profile`        | DOCTOR  | Own profile |
| PUT | `/me/profile`        | DOCTOR  | Update profile |
| GET | `/{id}/availability` | auth    | Weekly schedule |
| GET | `/{id}/slots?date=`  | auth    | Free slots for date |
| GET | `/me/availability`   | DOCTOR  | Own rules |
| POST| `/me/availability`   | DOCTOR  | Add weekly rule (regenerates slots) |
| PUT | `/me/availability/{id}` | DOCTOR | Edit |
| DELETE | `/me/availability/{id}` | DOCTOR | Remove |
| GET | `/me/dashboard/stats`| DOCTOR  | Counts (today, week, total) |

### Appointments — `/api/appointments`
| POST   | `/`                | PATIENT | Book a slot `{slotId, reason}` |
| GET    | `/me`              | auth    | My appointments (role-aware) |
| GET    | `/{id}`            | auth    | Detail (must be involved party) |
| PATCH  | `/{id}/approve`    | DOCTOR  | Approve `PENDING` |
| PATCH  | `/{id}/reject`     | DOCTOR  | Reject `PENDING` |
| PATCH  | `/{id}/complete`   | DOCTOR  | Mark complete + add note |
| PATCH  | `/{id}/cancel`     | PATIENT | Cancel own |

### AI — `/api/ai`
| POST | `/chat/sessions`                        | PATIENT | Start a session |
| GET  | `/chat/sessions`                        | PATIENT | List sessions |
| GET  | `/chat/sessions/{id}/messages`          | PATIENT | History |
| POST | `/chat/sessions/{id}/messages`          | PATIENT | Send message → assistant reply |
| GET  | `/health-tip`                           | PATIENT | Daily Gemini-generated tip (cached for the day) |
| POST | `/reports/scan` (multipart)             | PATIENT | Upload + analyze report |
| GET  | `/reports`                              | PATIENT | Patient's scan history |
| GET  | `/reports/{id}`                         | PATIENT/DOCTOR | Detail (doctor only if shared) |
| POST | `/reports/{id}/share` `{doctorId}`      | PATIENT | Share with a doctor |
| POST | `/reports/{id}/unshare`                 | PATIENT | Revoke sharing |
| DELETE | `/reports/{id}`                       | PATIENT | Delete |

### Admin (env-var-allowlisted emails) — `/admin`
| GET  | `/verifications`                              | admin email | List doctors with `verification_status=PENDING` |
| POST | `/verifications/{doctorId}/approve`           | admin email | Approve doctor → `is_verified=true`, email doctor |
| POST | `/verifications/{doctorId}/reject` `{reason}` | admin email | Reject with reason, email doctor |

---

## 8. Frontend — Next.js Layout

```
frontend/
├── src/
│   ├── app/
│   │   ├── (marketing)/                       # public landing + auth pages
│   │   │   ├── layout.tsx                     # MarketingLayout (transparent nav, footer)
│   │   │   ├── page.tsx                       # landing (Hero, Trust, Features, How,
│   │   │   │                                  #          ForDoctors, About, Testimonials,
│   │   │   │                                  #          FAQ, CTA, Footer)
│   │   │   ├── login/page.tsx                 # unified login
│   │   │   ├── signup/
│   │   │   │   ├── page.tsx                   # role picker (Patient / Doctor cards)
│   │   │   │   ├── patient/page.tsx           # patient registration
│   │   │   │   └── doctor/page.tsx            # doctor multi-step (incl. license upload)
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   ├── verify-email/page.tsx
│   │   │   └── oauth/callback/page.tsx
│   │   │
│   │   ├── (patient)/
│   │   │   ├── layout.tsx                     # PatientShell + role guard
│   │   │   ├── patient/dashboard/page.tsx
│   │   │   ├── patient/profile/page.tsx
│   │   │   ├── patient/doctors/page.tsx       # search/list
│   │   │   ├── patient/doctors/[id]/page.tsx  # profile + book
│   │   │   ├── patient/appointments/page.tsx
│   │   │   ├── patient/ai-assistant/page.tsx
│   │   │   └── patient/ai-reports/
│   │   │       ├── page.tsx                   # history
│   │   │       ├── scan/page.tsx              # upload + analyze
│   │   │       └── [id]/page.tsx              # detail
│   │   │
│   │   ├── (doctor)/
│   │   │   ├── layout.tsx                     # DoctorShell + role guard
│   │   │   ├── doctor/dashboard/page.tsx
│   │   │   ├── doctor/profile/page.tsx
│   │   │   ├── doctor/availability/page.tsx
│   │   │   └── doctor/appointments/page.tsx
│   │   │
│   │   ├── (admin)/                           # env-var-allowlisted email only
│   │   │   ├── layout.tsx                     # AdminGate
│   │   │   └── admin/verifications/page.tsx
│   │   │
│   │   ├── layout.tsx                         # root + Providers (TanStack, Theme)
│   │   ├── globals.css
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   │
│   ├── components/
│   │   ├── ui/                                # shadcn primitives
│   │   ├── marketing/                         # Hero, TrustStrip, FeatureCard,
│   │   │                                      # HowItWorks, ForDoctorsSection,
│   │   │                                      # AboutSection, Testimonials, FAQ,
│   │   │                                      # CtaBand, MarketingNav, MarketingFooter,
│   │   │                                      # GradientBlob, RoleCard
│   │   ├── auth/   { LoginForm, PatientSignupForm, DoctorSignupForm, RoleGate }
│   │   ├── doctor/ { DoctorCard, DoctorFilters, AvailabilityEditor }
│   │   ├── appointment/ { SlotPicker, AppointmentList, AppointmentCard, StatusBadge }
│   │   ├── ai/     { ChatBubble, ChatInput, ReportUploader, FindingsTable, ShareWithDoctorDialog }
│   │   ├── shell/  { PatientSidebar, DoctorSidebar, AppHeader, OnboardingChecklist }
│   │   └── common/ { Logo, EmptyState, LoadingSkeleton, ErrorBoundary }
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts                      # axios instance + interceptors (single-flight refresh)
│   │   │   ├── auth.api.ts
│   │   │   ├── users.api.ts
│   │   │   ├── doctors.api.ts
│   │   │   ├── appointments.api.ts
│   │   │   ├── ai.api.ts
│   │   │   └── admin.api.ts
│   │   ├── hooks/
│   │   ├── stores/auth.store.ts               # zustand
│   │   ├── schemas/                           # zod
│   │   └── utils/
│   │
│   ├── types/                                 # shared TS types matching API DTOs
│   └── middleware.ts                          # public-vs-private route guard, role redirect
│
├── public/                                    # static assets (logos, og-image, illustrations)
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

### Auth flow on the client
1. Login → backend returns `{ accessToken, refreshToken, user }`.
2. `accessToken` stored in memory (Zustand) + as `httpOnly` cookie via Next.js route handler if needed; `refreshToken` only in `httpOnly` secure cookie.
3. Axios request interceptor adds `Authorization: Bearer <accessToken>`.
4. Response interceptor on 401 → calls `/auth/refresh` once, retries original request.
5. Role-based routing: `(patient)` and `(doctor)` route groups enforce role via layout-level guards + middleware.

---

## 9. Security & RBAC

- Spring Security 6 stateless filter chain.
- `JwtAuthenticationFilter` parses `Authorization: Bearer …`, loads user, sets `SecurityContext`.
- `@PreAuthorize("hasRole('PATIENT')")` / `@PreAuthorize("hasRole('DOCTOR')")` on controllers.
- Custom meta-annotations `@PatientOnly`, `@DoctorOnly` for readability.
- Passwords hashed with BCrypt (strength 12).
- Refresh tokens persisted (`refresh_tokens`), supports revocation + rotation.
- CORS: only `http://localhost:3000` in dev; configurable.
- CSRF disabled (stateless API).
- Rate limit (later): bucket4j on `/auth/*` and `/ai/*`.

---

## 10. AI Integration (Gemini)

- HTTP via Spring's `RestClient` to `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key=…`.
- **Health Assistant** uses the configured chat model (default `gemini-2.5-flash`) with a system prompt enforcing:
  - "You are MediVerse Health Assistant…"
  - Always recommend consulting a doctor for diagnosis.
  - Refuse to prescribe medication.
  - Keep replies concise (markdown supported).
- **Report Scanning** uses the vision model (default `gemini-2.5-pro`) with multi-modal input (the uploaded file's bytes as `inline_data`).
  - Prompt asks for **strict JSON output**:
    ```
    { "summary": "...", "findings": [{label,value,unit,refRange,flag}], "recommendations": "..." }
    ```
  - Backend parses, persists `AiReport`, returns DTO to FE.
- API key from env var `GEMINI_API_KEY`, exposed via `GeminiProperties`.
- All AI calls go through one `GeminiClient` so timeouts/retries/logging are centralized.

---

## 11. File Storage (AWS S3)

- `software.amazon.awssdk:s3` (v2).
- `S3StorageService` exposes `upload(key, bytes, contentType)`, `delete(key)`, `presignGet(key, ttl)`.
- Bucket layout:
  ```
  mediverse-uploads/
    profile-pics/{userId}/{uuid}.{ext}
    reports/{patientId}/{uuid}.{ext}
  ```
- Files served via short-lived pre-signed URLs (5–15 min) — no public bucket.

---

## 12. Email Notifications

- `EmailService` via Spring Mail.
- Triggered on:
  - Patient registration (welcome).
  - Appointment booked (to patient + doctor).
  - Appointment approved / rejected / cancelled.
  - Day-before reminder (scheduled `@Scheduled` job — phase 6).
- HTML templates with Thymeleaf in `src/main/resources/templates/email/`.

---

## 13. Configuration & Environments

`backend/src/main/resources/application.yml` (uses env vars; never commit secrets):

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mediverse
    username: ${DB_USER}
    password: ${DB_PASSWORD}
  jpa:
    hibernate.ddl-auto: validate
  mail: ...

jwt:
  secret: ${JWT_SECRET}
  access-ttl-minutes: 15
  refresh-ttl-days: 7

mediverse:
  admin:
    emails: ${ADMIN_EMAILS:}            # comma-separated list of allowlisted admin emails
  appointment:
    booking-horizon-days: 7
    cancel-window-hours: 2

google:
  oauth:
    client-id: ${GOOGLE_CLIENT_ID}
    client-secret: ${GOOGLE_CLIENT_SECRET}

aws:
  s3:
    bucket: ${S3_BUCKET}
    region: ${AWS_REGION}
    access-key: ${AWS_ACCESS_KEY_ID}
    secret-key: ${AWS_SECRET_ACCESS_KEY}

gemini:
  api-key: ${GEMINI_API_KEY}
  chat-model: gemini-2.5-flash
  vision-model: gemini-2.5-pro
```

`frontend/.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT=http://localhost:8080/oauth2/authorization/google
```

---

## 14. Step-by-Step Build Plan (Phases)

Each phase ends in a working, testable slice.

### Phase 0 — Workspace bootstrap
- Create `backend/` (Spring Initializr equivalent) and `frontend/` (create-next-app).
- `docker-compose.yml` for MySQL.
- Root `README.md`, `.gitignore`.

### Phase 1 — Backend foundation
- Configure datasource, Flyway, security (skeleton), CORS, OpenAPI.
- Health endpoint `/api/health`.
- Global exception handler + `ApiResponse`.

### Phase 2 — Auth & Users
- `User`, `Patient`, `Doctor` entities + Flyway migrations.
- Register (patient + doctor with license-doc upload) / login / refresh / logout.
- JWT filter + `CustomUserDetailsService`.
- Google OAuth2 login.
- Email verification (token table + endpoint + template).
- Forgot/reset password (token table + endpoints + template).
- `/api/users/me` + profile pic upload (S3) + onboarding endpoint.
- Tests for AuthController.

### Phase 3 — Frontend foundation + Landing site + Auth UI
- Tailwind theme (emerald primary), shadcn init, providers (TanStack Query, Theme).
- Axios client + interceptors (with single-flight refresh) + Zustand auth store.
- Marketing layout (`(marketing)` group) with shared nav + footer.
- **Landing page** at `/` with all 10 sections (Hero, Trust, Features, How-it-works, For Doctors, About, Testimonials, FAQ, CTA, Footer) — vibrant gradient theme, glass cards, animated hero blob, smooth-scroll anchor nav.
- Auth pages: `/login` (unified), `/signup` (role picker), `/signup/patient`, `/signup/doctor` (multi-step + license upload), `/forgot-password`, `/reset-password`, `/verify-email`, `/oauth/callback`.
- Public-page guards: redirect already-authenticated users to their dashboard.
- Role-aware redirect after login + role guards on `(patient)` / `(doctor)` route groups.
- SEO metadata, sitemap, robots.txt.

### Phase 4 — Doctor module
- Doctor profile CRUD.
- Specialization list (enum or seed table).
- Search/list endpoint with paging + filters.
- Availability rules + slot generator (next 14 days).
- Frontend: doctor list/search, profile page, availability editor.

### Phase 5 — Appointments
- Booking endpoint (hybrid flow).
- 7-day horizon enforcement on the server.
- Doctor approve/reject/complete; patient cancel (≥2h before scheduled_at).
- Conflict checks (slot uniqueness, status transitions, duplicate-day prevention).
- Email notifications wired up (book / approve / reject / cancel / complete).
- Frontend: slot picker on doctor profile, appointment list (both roles), status actions, doctor dashboard stats.

### Phase 6 — AI Health Assistant
- `GeminiClient` + chat service with system prompt + guardrails.
- Sessions + messages persistence (last-N history sent for context).
- Daily health-tip endpoint (cached for the day).
- Frontend chat UI (message list, optimistic updates; streaming deferred).

### Phase 7 — AI Report Scanning
- Upload to S3 + send to Gemini Vision.
- Strict JSON parsing → `AiReport` persisted.
- History list + detail.
- Share with doctor flow (read-only access for the chosen doctor).
- Frontend: uploader, findings table, share dialog.

### Phase 8 — Polish
- Doctor dashboard stats.
- Onboarding checklist (computed from profile completeness on each role's dashboard).
- `/admin/verifications` page (env-var-allowlisted emails) + email-verification banner + pending-verification banner.
- Validation messages, empty states, loading skeletons, error boundaries.
- README with run instructions.
- (Optional) Dockerfile for backend + frontend.
- **Local dev ops (reminder):** If `mvn spring-boot:run` ends with **Maven BUILD FAILURE** and **exit code 137**, the JVM received **SIGKILL** (port teardown, `kill -9`, OOM killer, or tool timeout)—not a compile error if Tomcat had already started; restart the backend. Mitigate OOM with `MAVEN_OPTS` heap limits or less memory pressure.
- **Gemini upstream:** Google may return **HTTP 503 `UNAVAILABLE`** (e.g. high demand). The API maps this to `upstreamUnavailable`; users should retry later or try another **`GEMINI_CHAT_MODEL`** in `.env`. Optional later: retries with backoff.

---

## 15. Non-goals for v1

- **No real `ADMIN` role** — doctor verification uses a small `/admin/verifications` page accessible only to env-var-allowlisted emails (`mediverse.admin.emails`). It's intentionally lightweight.
- No payments.
- No telemedicine / video / patient–doctor chat.
- No prescription writing.
- No reviews / ratings.
- No streaming AI responses (full-response only in v1).
- No multi-language / i18n.
- No mobile apps.

These are explicitly deferred to keep v1 shippable.
