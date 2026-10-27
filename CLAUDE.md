# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Admin web app for Achievers: enrolling volunteers, managing mentors and students (mentees), assigning mentors to students, rosters/calendars, sessions and reports, attendances. Two main user areas: `admin/*` (staff) and `mentor/*` (volunteer mentors), plus `chapters/:chapterId/attendances/*`.

## Commands

```bash
npm run dev          # Express + Vite dev server (server.mjs) at http://localhost:3000
npm run build        # react-router build → build/
npm start            # run production build
npm run typecheck    # react-router typegen && tsc (regenerates .react-router/types)
npm run lint         # eslint
npm run format       # prettier --write .
npm run setup        # prisma generate + migrate deploy + seed

npm test                              # vitest (unit/component tests, jsdom)
npx vitest run app/services/utils.test.ts   # single unit test file
npx vitest run -t "test name"               # single test by name

npm run test:e2e                      # builds (pretest:e2e), then Playwright chromium against `npm start`
npx playwright test integration-tests/tests/admin-chapters.spec.ts --project=chromium
npm run test:e2e:ui
```

- Pre-commit hook (husky) runs `typecheck`, `lint`, `format`.
- Commits must follow Conventional Commits (commitlint). Releases are done by semantic-release in CI (`chore(release): x.y.z [skip ci]` commits).
- Migrations: edit `prisma/schema.prisma`, then `npx prisma migrate dev --name <name> --create-only`.
- Prisma client is generated into `prisma/client` (gitignored) — run `npx prisma generate` after schema changes or a fresh clone.

## Local setup

MySQL 8.4 in Docker (`--lower_case_table_names=1`; uninstall any local MySQL, it conflicts). Copy `.env.example` → `.env`. Prisma CLI uses `DATABASE_URL` (`prisma.config.ts`) but the runtime client in `app/db.server.ts` uses the MariaDB adapter with `DATABASE_HOST`/`DATABASE_NAME`/`DATABASE_USER`/`DATABASE_PASSWORD` — keep both in sync. Blob storage uses Azure Storage (Azurite emulator locally/CI).

## Architecture

- **React Router v8 framework mode, SSR**, served by a custom Express server. `server.mjs` is the entry: in dev it mounts Vite middleware and SSR-loads `server/app.ts`; in prod it serves `build/client` and imports `build/server/index.js`. `server-utils/` holds App Insights logging init and `mockTime()` (freezes `new Date()` to 2024-11-24 when `CI` or `LOCAL_TEST` is set — relevant for date-dependent tests).
- **Routes are configured explicitly in `app/routes.ts`** (not file-based auto-discovery). Adding a route folder requires registering it there. Route folders follow flat dot-naming (`admin.chapters.$chapterId.mentors.$mentorId/`) and typically contain `route.tsx` (loader/action/component, typed via `./+types/route`), a `services.server.ts` with the Prisma queries for that route, and optionally a local `components/` folder. Layouts: `routes/admin/layout.tsx`, `routes/mentor/layout.tsx`, etc. enforce area access in their loaders.
- **Server-only code** lives in `*.server.ts` files and `app/services/.server/` (session/auth, permissions, blob storage, xlsx export, App Insights, config). Import via `~/services/.server`. Shared client/server utilities are in `~/services`; shared UI in `~/components` (barrel `index.ts`).
- **Auth**: Azure AD (Microsoft Entra). In production, the token comes from Azure App Service Easy Auth (`/.auth/login/aad`); in dev/CI, `session-dev.server.ts` uses `remix-auth` OAuth2 with a file session store. `getLoggedUserInfoAsync(request)` returns the user with `roles`, `isAdmin`, `isMentor`, `isAttendances`. Role app IDs differ between dev/CI and prod (`permissions.server.ts`).
- **Authorization**: CASL (`@casl/ability` + `@casl/prisma`). `getPermissionsAbility(roles)` builds an ability over "area" subjects (`UserArea`, `StudentArea`, `ChapterArea`, …) and `Chapter` records, so admins can be restricted to specific chapters. Use `accessibleBy(ability).Chapter` (from `~/casl-prisma`) in Prisma `where` clauses to scope queries.
- **DB**: Prisma 7 + MySQL via `@prisma/adapter-mariadb`. Import the client from `~/db.server` (singleton on `global.__db__` in dev); types/enums from `~/prisma/client`. Note domain naming: mentors are `Volunteer` rows; assignments are `volunteerToStudentAssignement` (sic). Code is migrating from "user" to "volunteer" naming.
- Styling: Tailwind v4 + daisyUI. Icons: `iconoir-react`. Rich text: Lexical (`components/editor`).

## Testing

- **Unit/component tests** (Vitest, jsdom, globals) sit next to the code as `*.test.ts(x)`. `app/__mocks__/db.server.ts` provides a deep Prisma mock (`vi.mock("~/db.server")`). `integration-tests/` is excluded from Vitest.
- **E2E** (Playwright, `integration-tests/tests/*.spec.ts`) run against a real DB and the built app started with `npm start` (`npm run test:e2e` builds first; `test:e2e:ui` and direct `npx playwright` calls don't). `auth.setup.ts` logs in via real Microsoft login using `TEST_USERNAME`/`TEST_PASSWORD` and saves `storageState.json`. Specs reseed the database with `seedDataAsync()` from `integration-tests/test-data`; workers=1. Helpers (`fillFields`, `goToSidebarPage`, `selectSearchOption`, …) are in `integration-tests/helpers.ts`.
- CI (`.github/workflows/pr_achievers-webapp.yml`) runs unit tests, `npm run setup` on a MySQL service, then `npm run test:e2e` (which builds) with Azurite.

## Repo skill

`.agents/skills/react-router/SKILL.md` contains React Router guidance (this app is Framework Mode — see `references/framework-mode.md`).
