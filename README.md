# MediVerse

**MediVerse** is a full-stack healthcare web app that connects **patients** and **verified doctors**. Patients can browse doctors, book visits, chat with an **AI Health Assistant** (guardrailed Gemini), upload **lab reports** for AI-assisted analysis (vision), and open **directions** to a doctor’s clinic when location is set. Doctors manage profile, weekly **availability**, **practice address** (optional Google Places + map + device location), and the full **appointment** lifecycle—with email notifications throughout.

There is **no separate product “admin” role** in the database. Doctor license review is done through a small **`/admin/verifications`** area, gated by an **email allowlist** in configuration.

---

## Documentation map

| Doc | Contents |
|-----|----------|
| [**`docs/ARCHITECTURE.md`**](./docs/ARCHITECTURE.md) | Database schema (Flyway), REST API tables, packages, security, env reference |
| [**`docs/WORKFLOWS.md`**](./docs/WORKFLOWS.md) | Screen-by-screen journeys and locked UX/product decisions |
| [**`docs/PROJECT_OVERVIEW.md`**](./docs/PROJECT_OVERVIEW.md) | Single-file narrative of stack, topology, roles, and flows |
| [**`memory-bank/progress.md`**](./memory-bank/progress.md) | Phase checklist, incremental features (practice location V9, etc.) |
| [**`memory-bank/techContext.md`**](./memory-bank/techContext.md) | Versions, ports, test profile notes |

---

## What the app does

### Patients

| Area | What happens |
|------|----------------|
| **Find a doctor** | Search and filter verified doctors; open a profile with availability summary and fees. |
| **Book appointments** | Pick a free slot inside the server-defined horizon; bookings can be **instant** or **pending approval** per doctor rules. **Navigate** opens Google Maps directions when the doctor saved practice coordinates or address. |
| **Appointments** | List upcoming/past bookings; cancel within the **2-hour** pre-visit window (server-enforced). |
| **AI Health Assistant** | Session-based chat with Gemini; system prompt enforces “no diagnosis / no prescriptions” and similar guardrails. |
| **AI report scan** | Upload PDF or image; backend stores in **S3**, calls **Gemini Vision**, saves structured summary/findings; optional **share with one doctor** for read-only access on the doctor side. |
| **Profile & onboarding** | Profile fields, avatar upload, onboarding checklist until key steps are complete. |

### Doctors

| Area | What happens |
|------|----------------|
| **Profile** | Specialization, bio, fees, languages, practice city; **street / clinic location** via text, **Places** suggestions, **map** pin (click/drag), or **Use current location** when a Maps browser key is configured. |
| **Availability** | Weekly rules and slot duration; hybrid **requires approval** flag; generated **time slots** for the booking window. |
| **Appointments** | See patient bookings; **approve** / **reject** pending requests; **complete** visits with optional note; dashboard **stats**. |
| **Shared reports** | Read AI reports only when the patient explicitly shared them with you. |

### Operators (verification)

Emails listed in **`ADMIN_EMAILS`** can open **`/admin/verifications`**, review pending doctors (license upload), and **approve** or **reject** (with optional reason email). This is operational access only—not a persisted `ADMIN` role.

---

## Architecture at a glance

- **Monorepo:** `backend/` (Spring Boot **3.5**, **Java 21**) + `frontend/` (**Next.js 14** App Router, **TypeScript**, **Tailwind**, **shadcn/ui**).
- **API:** JSON REST; every response uses **`ApiResponse<T>`**; domain errors use stable **`ApiException`** codes (see **`docs/ARCHITECTURE.md`**).
- **Auth:** **JWT** access + opaque **refresh** (rotated); optional **Google OAuth2** code flow; Spring Security protects `/api/**` with role checks.
- **Data:** **MySQL 8** on the **host** in local dev (**not** started by Compose). **Flyway** migrations under `backend/src/main/resources/db/migration/`.
- **Files:** **AWS S3** (avatars, doctor license docs, AI report blobs). Local/dev can use filesystem storage depending on config.
- **Email:** **Spring Mail**; local dev typically uses **MailHog** (Docker).

---

## Repository layout

```
MediVerse/
├── backend/                 # Spring Boot API, Flyway, tests
├── frontend/                # Next.js app (marketing + patient + doctor + admin gate)
├── docker-compose.yml       # MailHog only (SMTP 1025, UI 8025)
├── docs/
│   ├── ARCHITECTURE.md
│   ├── WORKFLOWS.md
│   └── PROJECT_OVERVIEW.md
├── memory-bank/             # Session-oriented project state for contributors/agents
├── .env.example             # Template — copy to repo-root .env
├── AGENTS.md                # Short pointers for AI coding agents
└── README.md
```

---

## Tech stack (summary)

| Layer | Choices |
|-------|---------|
| **UI** | Next.js 14, React, Tailwind, shadcn/ui, TanStack Query, Zustand, RHF + Zod, Axios |
| **Maps (optional)** | `@googlemaps/js-api-loader` v2 — Places + map + geocoder on **doctor profile** when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set |
| **API** | Spring Boot 3.5, Spring Security 6, JPA/Hibernate, springdoc-openapi (Swagger UI) |
| **DB** | MySQL 8 + Flyway |
| **AI** | Google Generative Language API (Gemini) — chat + vision models via `.env` (defaults in `application.yml`, e.g. `gemini-2.5-flash` / `gemini-2.5-pro`) |
| **Storage** | AWS SDK v2 (S3) |
| **Mail** | Spring Mail + Thymeleaf HTML templates |

---

## Prerequisites

- **Java 21**, **Maven 3.8+** (this repo uses system `mvn`, no committed wrapper)
- **Node.js 20+**
- **Docker** + **Docker Compose** (for MailHog)
- **MySQL 8** installed on the host
- **AWS S3** credentials and bucket (for uploads in real use)
- **Google OAuth** client (optional but recommended for “Sign in with Google”)
- **Gemini API key** (for AI chat + report scanning)
- **Optional:** Google Cloud **Maps JavaScript API** key with **Places** (doctor address picker)

---

## Quick start (local)

### 1. Create the MySQL database and user

```sql
CREATE DATABASE mediverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mediverse'@'localhost' IDENTIFIED BY 'mediversepass';
GRANT ALL PRIVILEGES ON mediverse.* TO 'mediverse'@'localhost';
FLUSH PRIVILEGES;
```

One-line variant:

```bash
mysql -u root -p < <(echo "CREATE DATABASE IF NOT EXISTS mediverse; CREATE USER IF NOT EXISTS 'mediverse'@'localhost' IDENTIFIED BY 'mediversepass'; GRANT ALL ON mediverse.* TO 'mediverse'@'localhost'; FLUSH PRIVILEGES;")
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env: DB_*, JWT_SECRET, AWS_*, GEMINI_*, MAIL_*, optional GOOGLE_*, ADMIN_EMAILS, etc.
```

Duplicate any **`NEXT_PUBLIC_*`** keys you need into **`frontend/.env.local`**. Next.js loads public env from the **`frontend/`** working directory when you run `npm run dev` there—the repo-root `.env` alone does not inject those into the browser bundle.

#### Google Calendar (video visits — Google Meet links in emails)

1. In **Google Cloud Console** (same or separate project): enable **Google Calendar API**.
2. Set **`GOOGLE_CALENDAR_ENABLED=true`** in repo-root **`.env`**.
3. Provide **either** the **OAuth refresh-token path** (recommended for a real user calendar / Meet) **or** a **service account**:

   - **OAuth:** Create an **OAuth 2.0 Client ID** (Desktop or Web application). To use [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/), add **`https://developers.google.com/oauthplayground`** as an **authorized redirect URI** on that client. In Playground: gear icon → use your client id/secret → choose scope **`https://www.googleapis.com/auth/calendar.events`** → **Authorize APIs** → **Exchange authorization code for tokens** → copy the **refresh token** into **`GOOGLE_CALENDAR_OAUTH_REFRESH_TOKEN`**, and put the client id/secret in **`GOOGLE_CALENDAR_OAUTH_CLIENT_ID`** / **`GOOGLE_CALENDAR_OAUTH_CLIENT_SECRET`**.
   - **Service account:** Download JSON, set **`GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON=file:/absolute/path/to/key.json`**. Google Workspace setups may require **`GOOGLE_CALENDAR_DELEGATED_USER`** and domain-wide delegation; see **`.env.example`** comments.

4. Restart the API. Logs should show **`Google Calendar API client ready`** (otherwise check missing env or API enablement).

### 3. Start MailHog

```bash
docker compose up -d
```

- SMTP: `localhost:1025` — Web UI: http://localhost:8025

### 4. Run the backend

```bash
cd backend
mvn spring-boot:run
```

- API: http://localhost:8080  
- Health: http://localhost:8080/api/health (includes `googleOAuthAvailable` when OAuth env is set)  
- Swagger UI: http://localhost:8080/swagger-ui.html  

The JVM loads the **repo-root `.env`** via **`DotenvBootstrap`** when keys are missing from the environment (see **`docs/ARCHITECTURE.md`**).

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:3000  

---

## Environment variables (overview)

Authoritative key list and comments: **`.env.example`**.

**Backend (repo-root `.env` or OS env):** `DB_URL` / `DB_USER` / `DB_PASSWORD`, `JWT_SECRET`, `AWS_*`, `GEMINI_API_KEY` and model names, `MAIL_*`, `CORS_ALLOWED_ORIGINS`, `ADMIN_EMAILS`, `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, optional **`GOOGLE_CALENDAR_*`** (Calendar API + Meet for video bookings), optional `APPT_*` horizon/window overrides.

**Frontend (`frontend/.env.local` recommended):**

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | API base, default `http://localhost:8080/api` |
| `NEXT_PUBLIC_GOOGLE_OAUTH_URL` | Start URL for Google sign-in |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional — doctor profile address UI (Maps + Places + geocoding) |
| `NEXT_PUBLIC_BOOKING_HORIZON_DAYS` | Optional — keep in sync with backend booking horizon for date pickers |

**Google OAuth redirect (local):** add  
`http://localhost:8080/login/oauth2/code/google`  
as an authorized redirect URI in Google Cloud Console.

---

## Product rules (short)

Concrete numbers and UX decisions (cancellation window, booking horizon, dashboard layout) live in **`docs/WORKFLOWS.md`** (“Decisions snapshot”). Common ones:

- **Booking horizon:** default **7 days** ahead (server is source of truth).
- **Patient cancel:** allowed until **2 hours** before `scheduled_at`.
- **AI:** no streaming in v1; chat and vision return full responses; guardrails in prompts—not a substitute for clinical care.

---

## Verify (build & tests)

```bash
cd backend && mvn test
cd frontend && npm run build && npm run lint
```

---

## Not in scope for v1

No payments, telemedicine/video, prescriptions, peer reviews, streaming LLM tokens, i18n, or native mobile apps—see **`docs/ARCHITECTURE.md`** §15 and **`memory-bank/productContext.md`**.

---

## License

Private project. License TBD.
