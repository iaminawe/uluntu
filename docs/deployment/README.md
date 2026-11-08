# Deployment

Uluntu is two pieces:

1. **A static single-page app** (Vite + React) built into `dist/`.
2. **A few server-side API routes** in `api/` (Vercel serverless functions) that hold secrets the browser must never see:
    - `/api/ai` and `/api/ai/provider` proxy AI requests (Anthropic or OpenAI) for the editor's writing assistant.
    - `/api/email` sends email through Resend.

Both talk to a Supabase project for the database, auth, storage and realtime.

## Option A: Vercel (simplest)

Deploying the repository to Vercel serves the SPA and the `api/` functions from the same origin, so the app's relative `/api/...` calls work with no extra setup.

Set these environment variables in the Vercel project:

| Variable | Where it's used | Secret? |
|----------|-----------------|---------|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Browser | No (public by design) |
| `VITE_APP_URL`, `VITE_FROM_EMAIL`, `VITE_FROM_NAME` | Browser | No |
| `SUPABASE_URL`, `SUPABASE_SECRET_KEY` (or `SUPABASE_SERVICE_ROLE_KEY`) | `api/` auth checks | **Yes** |
| `RESEND_API_KEY`, `EMAIL_FROM`, `SUPPORT_EMAIL` | `api/email` | **Yes** (key) |
| `AI_PROVIDER`, `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`, `AI_ANTHROPIC_MODEL` / `AI_OPENAI_MODEL` | `api/ai` | **Yes** (keys) |

See `.env.example` for the full list.

## Option B: Docker, nginx or Coolify (self-hosted)

The `Dockerfile` builds the SPA and serves it with nginx (`nginx.conf` handles SPA routing and security headers). This works on any container host, including [Coolify](coolify.md).

The `api/` routes are **not** included in the container. Without them, the AI assistant and outgoing email are unavailable. Everything else works. To keep them, either:

- deploy the repository to Vercel as well and proxy `/api/` to it from nginx, or
- port the handlers in `api/` to a small Node server alongside the container.

Only `VITE_*` variables are needed at **build time** for the static app, because Vite inlines them into the bundle.

## Supabase

- Hosted Supabase works out of the box.
- `docker-compose.yml` and `docker-compose.coolify.yml` contain a self-hosted Supabase stack. The image versions there are from 2024 and need updating before production use. Coolify's one-click Supabase service is a maintained alternative.

## After deploying

- Sign up, sign in and sign out.
- Upload an image (checks storage buckets and policies).
- Open a conversation in two browsers (checks realtime).
- Check the browser console and network tab for failing requests.
- Confirm no secret keys are in the bundle: `grep -rl "service_role\|sb_secret_" dist/` should print nothing.
