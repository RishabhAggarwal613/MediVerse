# AGENTS.md — Pointers for AI Agents

This is a single-screen pointer file for AI coding agents working on
MediVerse. The detailed canon is elsewhere; this file just tells you where.

## Read these first

1. **`memory-bank/`** — project state across sessions. Start with
   `activeContext.md` and `progress.md` to know where we left off.
2. **`docs/ARCHITECTURE.md`** — system design (DB schema, API surface,
   package layout, security model).
3. **`docs/WORKFLOWS.md`** — every user journey, with locked product
   decisions captured in the "Decisions snapshot" table at the top.
4. **`README.md`** — quick-start commands.

## Project shape

- Monorepo: `backend/` (Spring Boot 3.5 / Java 21) + `frontend/` (Next.js 14).
- MySQL 8 host-installed (not containerized). Database `mediverse`, user
  `mediverse@localhost`, password `mediversepass` (dev only).
- MailHog runs in Docker (`docker compose up -d`) for local SMTP.

## Conventions to follow

- **Uniform response envelope.** Every controller method returns
  `ApiResponse<T>` (or `Void`). Never raw maps, strings, or `ResponseEntity`
  without the wrapper.
- **Throw `ApiException`** from services for product errors (`notFound`,
  `badRequest`, `conflict`, `forbidden`, `unauthorized`).
- **Typed config via `@ConfigurationProperties` records** — no `@Value`.
- **Modular monolith** — new domains go under `com.mediverse.<domain>/` with
  flat `controller`, `service`, `repository`, `dto`, `domain`.
- **System `mvn`** (no `./mvnw` wrapper). Java 21.
- **Migrations** — Flyway, `Vn__snake_case_description.sql`, never edit after
  merge.

## Build phase

The project follows a 9-phase plan (0–8) defined in
`docs/ARCHITECTURE.md` §14. Current state is in `memory-bank/progress.md`.

## Update the memory bank when you finish

After completing a phase or making a major decision, update
`memory-bank/activeContext.md` and `memory-bank/progress.md` before the chat
ends. The `.cursor/rules/memory-bank.mdc` rule explains the full protocol.
