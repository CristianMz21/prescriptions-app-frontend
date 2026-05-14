# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

Package manager is **pnpm** (workspace at `frontend/prescriptions-app/`). All commands run from this directory.

- `pnpm dev` — Next.js dev server (default port 3000; backend also defaults to 3000, so set `PORT=3001` if running both locally)
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` — ESLint (flat config, extends `eslint-config-next` core-web-vitals + typescript)
- `pnpm typecheck` — `tsc --noEmit`
- `pnpm test` — Vitest (one-shot run, node environment). Single file: `pnpm test src/lib/api/custom-instance.test.ts`. Watch mode: `pnpm exec vitest`
- `pnpm api:refresh` — regenerate the typed API client from `../../backend/openapi.json` (runs `api:clean` + `api:gen`). Run this whenever the backend OpenAPI spec changes.

Env: copy `.env.local.example` → `.env.local`. Only `NEXT_PUBLIC_API_URL` is consumed (defaults to `http://127.0.0.1:3000`).

## Architecture

### Repo context
This Next.js app lives inside a larger monorepo at `prescriptions-app/` (root) alongside a NestJS `backend/`. The API contract is owned by the backend; this app consumes it via an OpenAPI-generated client. See `../../ARCHITECTURE.md` for the full system design (data model, endpoints, role rules).

### API layer (Orval + TanStack Query + Axios)
The entire client SDK under `src/lib/api/generated/` is **generated** by Orval from `backend/openapi.json` — never edit those files; regenerate with `pnpm api:refresh` instead.

- `orval.config.mjs` configures generation: react-query hooks + axios fetchers + Zod-less schemas, all routed through the custom mutator at `src/lib/api/custom-instance.ts`.
- `custom-instance.ts` owns the single Axios instance (`apiClient`): `baseURL` from `NEXT_PUBLIC_API_URL`, `withCredentials: true` (cookie-based auth), and a response interceptor that re-throws backend errors as `ApiError(status, message, path)`.
- `src/lib/api/index.ts` re-exports both the generated hooks and the raw `apiClient` — client components should prefer the generated React Query hooks; server components / route handlers use `apiClient` directly.
- The TanStack Query `QueryClient` is created once per render tree in `src/app/providers.tsx` (defaults: `staleTime: 60s`, `retry: 1`).

### Auth (cookie session, two consumers)
The backend issues an HTTP-only session cookie; this app does not store or read tokens in JS. Auth is consumed two different ways depending on rendering context:

- **Server components / layouts** — `src/lib/auth/server.ts` exposes `getAuth()`, `requireAuth()`, `requireRole(roles)`. These call `/auth/profile` via `apiClient` and `redirect('/login')` on failure. Use these inside `app/<role>/layout.tsx` to gate role-scoped sections (see `app/doctor/layout.tsx`, `app/patient/layout.tsx`).
- **Client components** — `src/lib/hooks/useAuth.tsx` provides `<AuthProvider>` (mounted in `providers.tsx`) and the `useAuth()` hook with `login(email, password)` / `logout()`. After login it fetches the profile and routes to the role-specific dashboard via `getRedirectPath()`:
  - `ADMIN` → `/admin/metrics`
  - `DOCTOR` → `/doctor/prescriptions`
  - `PATIENT` → `/patient/prescriptions`

Note the role enum is **uppercase** (`ADMIN`/`DOCTOR`/`PATIENT`) — this comes from the generated schemas; don't hand-roll the lowercase form shown in `ARCHITECTURE.md`.

### Routing layout
App Router, organized by role: `app/(auth)/login/`, `app/admin/`, `app/doctor/`, `app/patient/`. Role guards live in each role's `layout.tsx` (server-side `requireRole`). The `(auth)` group keeps login outside any role gate.

A few patient/doctor routes (e.g. `app/patient/prescriptions/[id]/consume/route.ts`) use Next.js Route Handlers as thin server-side proxies — keep these when you need to call the backend with the user's cookie from a form action without going through a client hook.

## Conventions specific to this codebase

- **Path alias**: `@/*` → `./src/*` (configured in `tsconfig.json`).
- **Test files** live next to source as `*.test.ts` / `*.test.tsx`. Vitest runs in the `node` environment by default — if you add component tests that need a DOM, switch the file (or vitest config) to `jsdom`.
- **Never edit `src/lib/api/generated/`**. If a backend endpoint changes, the workflow is: rebuild backend OpenAPI → `pnpm api:refresh` → fix call sites.
- The Next.js 16 / React 19 warning in `AGENTS.md` is load-bearing: APIs (cookies, headers, params) are async in this version. When in doubt, consult `node_modules/next/dist/docs/` rather than relying on prior Next.js knowledge.
