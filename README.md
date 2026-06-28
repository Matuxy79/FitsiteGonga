# FitsiteGonga

Discord-inspired fitness command center built with **Next.js 14 (App Router)** + **Tailwind**, backed by an **Express + Prisma + PostgreSQL** API (with **Socket.io** realtime + optional **S3-compatible** uploads).

## Features

- Auth flow: sign up / sign in / forgot password / reset password
- Tri-sector dashboard:
  - **Nexus**: global chat + squads
  - **Forge**: lift tracking + week planner
  - **Identity**: profile/settings (in progress)
- Admin console (`/admin`) for user + activity management

## Tech stack

- **Frontend**: Next.js, React, TypeScript, Tailwind, Zustand, React Hook Form, Zod, Framer Motion
- **Backend**: Node.js, Express, Prisma, PostgreSQL, JWT, Socket.io, S3-compatible object storage (Railway Object Storage / Tigris)
- **Tooling**: ESLint, Prettier, Vitest, Playwright, Storybook

## Quick start (full stack locally)

```bash
# 1. Install dependencies and copy env templates
npm run setup

# 2. Start a local PostgreSQL database (Docker)
docker compose up -d

# 3. Configure backend env
code backend/.env   # or notepad backend/.env
#    - DATABASE_URL defaults to local docker compose Postgres
#    - set JWT_SECRET and JWT_REFRESH_SECRET (openssl rand -hex 32)

# 4. Run migrations
npm run db:migrate

# 5. Start frontend + backend together
npm run dev:all
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000`
- Backend health check: `http://localhost:4000/health`

> Object storage (avatars/progress photos) is optional for local dev. If `RAILWAY_OBJECT_STORAGE_*` vars are not set, storage endpoints return a 503-style error instead of crashing.

### Manual start (two terminals)

```bash
# Terminal 1 — frontend
npm run dev

# Terminal 2 — backend
cd backend
npm run dev
```

## Environment variables

### Frontend (`cp .env.local.example .env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
# Optional overrides:
# NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
# NEXT_PUBLIC_WS_URL=http://localhost:4000
```

### Backend (`cp backend/.env.example backend/.env`)

See `backend/.env.example` for the full list. The local defaults use Docker Compose Postgres on `localhost:5432`.

## Scripts

```bash
npm run dev           # start Next.js dev server
npm run dev:backend   # start backend dev server only
npm run dev:all       # start frontend + backend together
npm run setup         # install deps and copy env templates
npm run db:migrate    # run Prisma migrations
npm run db:studio     # open Prisma Studio
npm run build         # production build (frontend)
npm run lint          # eslint
npm run type-check    # tsc (loads .env.local)
npm run format        # prettier
npm test              # vitest
npm run test:e2e      # playwright
npm run storybook     # storybook dev server
```

### Seed local admin

The app uses pseudo-email login credentials stored in the app database. These are not connected to Gmail unless a future mail provider is added.

```bash
cd backend
$env:ADMIN_EMAIL="matuxynhoj@gmail.com"
$env:ADMIN_PASSWORD="<set locally, do not commit>"
npm run seed:admin
```

`ADMIN_PASSWORD` is intentionally read from the shell or `backend/.env` and should never be committed as plaintext.

## Next Up

- Add account tiers to the database: `USER`, `PAID`, and `ADMIN`.
- Keep pseudo-email auth local to the app: email strings identify accounts, but no full Gmail integration is required.
- Seed/maintain the primary admin account with `matuxynhoj@gmail.com` using the hashed admin seed script.
- Add avatar upload/update flows for every tier, backed by the existing S3-compatible upload service.
- Gate paid-only features in the API and UI after the tier column exists.
- Restyle `http://localhost:3001/dashboard` to match the bright GongaFit frontpage: white/sky surfaces, coral/lime CTAs, rounded panels, real trainer media, and lighter navigation.

## Repo map

- `src/app` - routes (`/`, `/dashboard`, `/admin`, `/reset-password`)
- `src/components` - UI + feature components
- `src/hooks`, `src/repositories`, `src/controllers` - data + state layer
- `src/lib` - `apiClient`, `socketClient`, `metric-engine`, exercise DB
- `backend` - Express API (separate Node project)
- `docs` - architecture + conventions
- `e2e` - Playwright tests

## Further reading

- `docs/architecture.md`
- `TECHNICAL_AUDIT.md`
- `backend/README.md`

## License

See `LICENSE`.
