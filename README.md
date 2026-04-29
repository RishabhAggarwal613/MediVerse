# MediVerse

A medical platform that connects **Patients** and **Doctors**, with AI-powered health assistance and automated medical-report analysis.

> - System design → [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
> - User journeys & UX → [`docs/WORKFLOWS.md`](./docs/WORKFLOWS.md)

---

## Repository Layout

```
MediVerse/
├── backend/             # Spring Boot 3.5 (Java 21) — modular monolith
├── frontend/            # Next.js 14 (App Router) + TypeScript + Tailwind
├── docker-compose.yml   # MySQL 8 + MailHog (local dev)
├── docs/
│   └── ARCHITECTURE.md
├── .env.example         # copy to .env and fill in
├── .gitignore
└── README.md
```

---

## Tech Stack

- **Frontend** — Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, React Hook Form + Zod, Axios
- **Backend** — Spring Boot 3.5, Spring Security 6, Spring Data JPA, Flyway, springdoc-openapi
- **Auth** — JWT (access + refresh) + Google OAuth2
- **Database** — MySQL 8
- **Storage** — AWS S3 (SDK v2)
- **AI** — Google Gemini (chat + vision models configured in `.env`, e.g. `gemini-2.5-flash` / `gemini-2.5-pro`)
- **Email** — Spring Mail / SMTP (MailHog locally)

---

## Prerequisites

- Java 21
- Maven 3.8+
- Node.js 20+
- Docker + Docker Compose
- An AWS account + S3 bucket *(for file uploads — Phase 2 onwards)*
- Google OAuth2 Client *(for social login — Phase 2 onwards)*
- Gemini API key *(for AI features — Phases 6 & 7)*

---

## Quick Start (Phase 0 sanity check)

### 1. Database (host-installed MySQL)

This project uses your **host's MySQL** (not a container). One-time setup:

```sql
CREATE DATABASE mediverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mediverse'@'localhost' IDENTIFIED BY 'mediversepass';
GRANT ALL PRIVILEGES ON mediverse.* TO 'mediverse'@'localhost';
FLUSH PRIVILEGES;
```

Run it via:
```bash
mysql -u root -p < <(echo "CREATE DATABASE IF NOT EXISTS mediverse; CREATE USER IF NOT EXISTS 'mediverse'@'localhost' IDENTIFIED BY 'mediversepass'; GRANT ALL ON mediverse.* TO 'mediverse'@'localhost'; FLUSH PRIVILEGES;")
```

### 2. Bring up MailHog (email catcher for dev)

```bash
cp .env.example .env
docker compose up -d
```

- MailHog SMTP → `localhost:1025`, web UI → http://localhost:8025

### 3. Run the backend

```bash
cd backend
mvn spring-boot:run
```

Backend → http://localhost:8080  
OpenAPI / Swagger UI → http://localhost:8080/swagger-ui.html  
Health (includes whether Google OAuth env is wired) → http://localhost:8080/api/health

### 4. Run the frontend

```bash
cd frontend
npm install   # first clone / after dependency changes
npm run dev
```

Frontend → http://localhost:3000

---

## Doctor verification (admin)

v1 does **not** define a dedicated `ADMIN` user role. A **comma-separated allowlist** in repo-root `.env` — **`ADMIN_EMAILS`** (backend: `mediverse.admin.emails`) — marks accounts that may use the verification queue. After signing in as an allowlisted user, open **http://localhost:3000/admin/verifications** (also linked from the main nav when `user.admin` is true).

Backend routes (JWT required; 403 if not allowlisted):

| Method | Path |
|--------|------|
| GET | `/api/admin/doctors/pending` |
| POST | `/api/admin/doctors/{doctorId}/approve` |
| POST | `/api/admin/doctors/{doctorId}/reject` (JSON body: optional `reason`) |

Patient and doctor areas also show **onboarding** checklists and **email / license** banners where applicable.

---

## Build Phases

Phases **0–8** are implemented. Status detail lives in **`memory-bank/progress.md`**.

| Phase | Goal |
|-------|------|
| **0** ✅ | Workspace bootstrap |
| **1** ✅ | Backend foundation — config, security, CORS, OpenAPI, `ApiResponse`, `/api/health` |
| **2** ✅ | Auth & Users — registration, JWT, Google OAuth, profile |
| **3** ✅ | Frontend foundation — axios, auth store, login/register |
| **4** ✅ | Doctor module — profile, search, availability, slots |
| **5** ✅ | Appointments — booking, email, dashboards |
| **6** ✅ | AI Health Assistant — Gemini chat |
| **7** ✅ | AI Report Scanning — Vision, share with doctor |
| **8** ✅ | Polish — admin verifications, onboarding, banners, profiles/theme (see **`memory-bank/progress.md`**) |

See **`docs/ARCHITECTURE.md`** for the full design (DB schema, API surface, package layout, security model).

---

## Environment Variables

All env vars live in `.env` (which is **gitignored**). Use `.env.example` as a template.

Backend variables are read from `application.yml` via `${VAR:default}` placeholders. **The JVM does not read a `.env` file by itself** — this project calls `DotenvBootstrap` at startup to load the first `.env` found walking up from the working directory (so `mvn spring-boot:run` from `backend/` still picks up the **repo root** `.env`) into system properties for unset keys. OS environment variables and `-D` flags still win. Use `.env.example` as a template.

### Google sign-in (OAuth)

The **Sign in with Google** button only works when the backend loads the OAuth2 client — `GET /api/health` returns `data.googleOAuthAvailable: true` when both secrets are wired. Configure **either**:

1. **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`** in repo-root `.env` (recommended locally), **or**
2. **Export** them in the shell / IDE Run Configuration before starting the API **or**
3. **Pass `-DGOOGLE_CLIENT_ID=...`** on the command line.

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Web client ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | Client secret for the same OAuth 2.0 client |

In **Google Cloud Console**, add this **Authorized redirect URI** for local dev:

`http://localhost:8080/login/oauth2/code/google`

After setting variables, restart the backend. `GET /api/health` returns `data.googleOAuthAvailable: true` when Google OAuth is wired; the frontend uses that to show the Google button vs. a setup hint.

### Admin allowlist (`ADMIN_EMAILS`)

Set **`ADMIN_EMAILS`** in `.env` to a comma-separated list of emails that may access **`/admin/verifications`** and the admin API (see **Doctor verification (admin)** above). Matches **`mediverse.admin.emails`** in Spring.

---

## Verify (tests & build)

```bash
cd backend && mvn test
cd frontend && npm run build && npm run lint
```

---

## License

Private project. License TBD.
