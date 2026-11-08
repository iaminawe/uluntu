# Deployment

The recommended way to run Uluntu is **[Vercel](https://vercel.com)** with **Supabase** for the database, auth, storage and realtime. This is how [uluntu.io](https://uluntu.io) runs. You can also [self-host with Docker](#self-hosting-with-docker).

A Vercel deployment serves two things from the same domain:

1. **The single-page app**, built by Vite into `dist/`.
2. **The serverless functions in `api/`**, which hold the secrets the browser must never see:
    - `/api/ai` and `/api/ai/provider` proxy AI requests (Anthropic or OpenAI) for the editor's writing assistant.
    - `/api/email` sends email through Resend.

`vercel.json` sends every non-`/api` route to `index.html`, so deep links work, and sets the security headers.

## Set up a Vercel project

1. Import the repository in Vercel. The Vite framework preset is detected automatically (build command `npm run build`, output directory `dist`).
2. Add the environment variables below for Production and Preview.
3. Deploy, then add your domain under **Settings → Domains**.

| Variable | Used by | Secret? |
|----------|---------|---------|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Browser | No (public by design) |
| `VITE_APP_URL`, `VITE_FROM_EMAIL`, `VITE_FROM_NAME` | Browser | No |
| `SUPABASE_URL`, `SUPABASE_SECRET_KEY` | `api/` (auth and role checks) | **Yes** |
| `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_FROM_NAME`, `SUPPORT_EMAIL` | `api/email` | **Yes** (key) |
| `AI_PROVIDER`, `ANTHROPIC_API_KEY` / `OPENAI_API_KEY`, `AI_ANTHROPIC_MODEL` / `AI_OPENAI_MODEL` | `api/ai` | **Yes** (keys) |

`VITE_*` variables are read at **build time** and inlined into the JavaScript bundle, so never give a secret a `VITE_` prefix. See `.env.example` for the full list.

Pull requests get preview deployments automatically. Only `main` deploys to production.

## Self-hosting with Docker

For running Uluntu on your own server instead of Vercel, `docker-compose.yml` builds the app with the `Dockerfile` and serves it with nginx (`nginx.conf` handles SPA routing and security headers). It also starts a self-hosted Supabase stack.

```bash
cp .env.example .env    # fill in the browser values and the docker-compose section
docker compose up -d --build
```

Things to know:

- The `api/` functions are **not** included, so the AI writing assistant and outgoing email don't work. To keep them, deploy the repository to Vercel as well and proxy `/api/` to it from nginx, or port the handlers in `api/` to a small Node server.
- `VITE_*` variables are build arguments: rebuild the image after changing them.
- The Supabase image versions in `docker-compose.yml` are from 2024. Update them (compare with Supabase's [self-hosting guide](https://supabase.com/docs/guides/self-hosting/docker)) before relying on the stack in production, or point the app at a hosted Supabase project and run only the `frontend` service.

## Supabase

Use a hosted Supabase project (the free tier is enough to start). Apply the schema and migrations as described in [getting started](../guides/getting-started.md#3-set-up-the-database), and use the project's new API keys (`sb_publishable_…` in the browser, `sb_secret_…` on the server).

## After deploying

- Visit a deep link such as `/events` directly and refresh it (checks the SPA rewrite).
- Sign up, sign in and sign out.
- Upload an image (checks storage buckets and policies).
- Open a conversation in two browsers (checks realtime).
- Send a test newsletter as an admin (checks `api/email` and `SUPABASE_SECRET_KEY`).
- Check the browser console and network tab for failing requests.
- Confirm no secrets are in the bundle: `grep -rlE --exclude='*.map' "service_role|sb_secret_" dist/` should print nothing.
