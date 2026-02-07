# FitsiteGonga

Discord-inspired fitness command center built with **Next.js 14 (App Router)** + **Tailwind**, backed by an **Express + Prisma + PostgreSQL** API (with **Socket.io** realtime + optional **AWS S3** uploads).

## Features

- Auth flow: sign up / sign in / forgot password / reset password
- Tri-sector dashboard:
  - **Nexus**: global chat + squads
  - **Forge**: lift tracking + week planner
  - **Identity**: profile/settings (in progress)
- Admin console (`/admin`) for user + activity management

## Tech stack

- **Frontend**: Next.js, React, TypeScript, Tailwind, Zustand, React Hook Form, Zod, Framer Motion
- **Backend**: Node.js, Express, Prisma, PostgreSQL, JWT, Socket.io, AWS S3 (presigned uploads)
- **Tooling**: ESLint, Prettier, Vitest, Playwright, Storybook

## Quick start (frontend)

```bash
# install deps
npm ci

# configure env
# (already present in this repo; change if you want local backend)
notepad .env.local

# run dev server
npm run dev
```

Open `http://localhost:3000`.

### Frontend environment variables

Create/modify `.env.local`:

```env
# Backend API URL (no trailing slash)
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Optional: override Socket.io origin (otherwise defaults to NEXT_PUBLIC_API_URL)
# NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"
# NEXT_PUBLIC_WS_URL="http://localhost:4000"
```

## Running the backend locally (optional)

See `backend/README.md` for full details.

```bash
cd backend
npm ci
copy .env.example .env

# configure backend env (DATABASE_URL, JWT secrets, etc.)
notepad .env

# generate prisma + run migrations
npm run prisma:migrate

# start API (default: http://localhost:4000)
npm run dev
```

Then point the frontend to your local API:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## Scripts

```bash
npm run dev           # start Next.js dev server
npm run build         # production build
npm run start         # serve production build
npm run lint          # eslint
npm run type-check    # tsc (loads .env.local)
npm run format        # prettier
npm test              # vitest
npm run test:e2e      # playwright
npm run storybook     # storybook dev server
```

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
