# FitsiteGonga Production Deployment Guide

## Overview

FitsiteGonga is deployed on **Railway** (backend + Postgres + Object Storage) with **AWS Route 53** handling DNS for the custom domain `gongafit.com`.

## Architecture

```
Route 53 (gongafit.com)
├── gongafit.com / www.gongafit.com  →  Frontend host (Vercel / Railway static / etc.)
└── api.gongafit.com                 →  Railway backend service

Railway
├── FitsiteGonga backend (Node.js + Express)
├── PostgreSQL database
└── Object Storage (S3-compatible via Tigris)
```

## Backend Deployment (Railway)

### Required Railway Variables

Set these in the Railway dashboard for the backend service:

```env
NODE_ENV=production
PORT=4000

DATABASE_URL=<auto-injected by Railway PostgreSQL>

JWT_SECRET=<openssl rand -hex 32>
JWT_REFRESH_SECRET=<openssl rand -hex 32>

FRONTEND_URL=https://gongafit.com
CORS_ORIGIN=https://gongafit.com

RAILWAY_OBJECT_STORAGE_ENDPOINT=<auto-injected by Railway Object Storage>
RAILWAY_OBJECT_STORAGE_ACCESS_KEY_ID=<auto-injected>
RAILWAY_OBJECT_STORAGE_SECRET_ACCESS_KEY=<auto-injected>
RAILWAY_OBJECT_STORAGE_BUCKET_NAME=<auto-injected>
```

### Build & Start Commands

`backend/railway.json` is committed and tells Railway to:

- Build from the `backend/` directory.
- Run `npm run build` (Prisma generate + TypeScript compile).
- Start with `npm run start` (`prisma migrate deploy && node dist/server.js`).
- Healthcheck on `/health`.

### Object Storage Notes

- Objects are uploaded as **private** (no ACL).
- Clients fetch media through the signed proxy: `https://api.gongafit.com/api/media/{key}`.
- This keeps bucket permissions simple and avoids public-read ACL issues.

## Frontend Deployment

### Build-time Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.gongafit.com
NEXT_PUBLIC_SOCKET_URL=https://api.gongafit.com
NEXT_PUBLIC_WS_URL=https://api.gongafit.com
```

### Image Domains

`next.config.js` allows the production backend media proxy and common S3-compatible hostnames. Update it if your Object Storage endpoint uses a different domain.

## AWS Route 53 DNS Records

Create a hosted zone for `gongafit.com` and add:

| Name | Type | Value |
|---|---|---|
| `gongafit.com` | A / CNAME | Frontend host IP / CNAME |
| `www.gongafit.com` | CNAME | `gongafit.com` |
| `api.gongafit.com` | CNAME | Railway backend domain |

For Railway custom domains:

1. In Railway, add custom domain `api.gongafit.com`.
2. Copy the Railway-provided CNAME target.
3. Create the CNAME record in Route 53.
4. Wait for Railway to validate and issue the SSL certificate.

## SSL / HTTPS

- Railway automatically provisions SSL certificates for custom domains.
- Frontend host (Vercel, etc.) handles SSL for `gongafit.com`.
- Backend cookies are sent with `secure: true` when `NODE_ENV=production`.

## Local Development

See `README.md` for local setup. Use the same env var names; local defaults point at Docker Compose Postgres and `localhost:4000`.
