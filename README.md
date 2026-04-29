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
- **AI** — Google Gemini (`gemini-1.5-flash` chat, `gemini-1.5-pro` vision)
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

### 2. Run the backend

```bash
cd backend
mvn spring-boot:run
```

Backend starts at http://localhost:8080.
Swagger UI (once we add controllers in Phase 1) → http://localhost:8080/swagger-ui.html.

### 3. Run the frontend

```bash
cd frontend
npm install   # already done by create-next-app, but safe to re-run
npm run dev
```

Frontend → http://localhost:3000.

---

## Build Phases

| Phase | Goal |
|-------|------|
| **0** ✅ | Workspace bootstrap — backend skeleton, frontend skeleton, MySQL via Docker, env scaffolding. |
| 1 | Backend foundation — config, security skeleton, CORS, OpenAPI, `ApiResponse`, `/api/health`. |
| 2 | Auth & Users — registration, JWT login, Google OAuth, profile pic upload. |
| 3 | Frontend foundation — providers, axios client, Zustand auth store, login/register UI. |
| 4 | Doctor module — profile, search, availability + slot generation. |
| 5 | Appointments — hybrid booking flow + email notifications + dashboards. |
| 6 | AI Health Assistant — chat sessions/messages backed by Gemini. |
| 7 | AI Report Scanning — Gemini Vision + S3 + share-with-doctor. |
| 8 | Polish — validation, empty/loading/error states, README finalization. |

See `docs/ARCHITECTURE.md` for the full design (DB schema, API surface, package layout, security model).

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

---

## License

Private project. License TBD.
