# Getting started

This guide gets Uluntu running on your machine against a Supabase project.

## Prerequisites

- Node.js 20 or newer, and npm
- A Supabase project. A free hosted project at [supabase.com](https://supabase.com) is the easiest option. You can also run Supabase locally with the [Supabase CLI](https://supabase.com/docs/guides/cli) and Docker.
- Optional: the [Vercel CLI](https://vercel.com/docs/cli), if you want to run the server-side API routes (AI assistant and outgoing email) locally

## 1. Install

```bash
git clone https://github.com/iaminawe/uluntu.git
cd uluntu
npm install
cp .env.example .env.local
```

## 2. Configure the frontend

In `.env.local`, set the two values the browser needs. Both are found under **Project Settings → API** in the Supabase dashboard:

```bash
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your publishable (anon) key>
```

!!! danger "Never give a secret a `VITE_` prefix"
    Vite bundles every `VITE_*` variable it references into the JavaScript it ships to browsers. The Supabase secret/service-role key, Resend key and AI provider keys must only ever be set as plain server-side variables (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`).

## 3. Set up the database

!!! warning "Known gap: there is no single baseline migration yet"
    The core tables (`members`, `companies`, `events`, `groups` and others) were created before migrations were tracked. They exist only in the schema snapshot `database/comprehensive_schema_and_data.sql`. The files in `supabase/migrations/` change that schema step by step. Squashing everything into one clean baseline is the top contributor-experience task. Until it lands, expect some manual fixing.

Current best-effort path:

1. Load the base schema snapshot into your project, using the SQL editor or `psql`: `database/comprehensive_schema_and_data.sql`.
2. Apply the later migrations: `supabase link --project-ref <ref>`, then `supabase db push`. Some early migrations overlap with the snapshot. If one fails because an object already exists, check that the object matches and mark the migration as applied with `supabase migration repair --status applied <version>`.
3. Optional demo content: `database/comprehensive_seed_data.sql` and the files in `database/seeds/`.
4. Create the storage buckets: `SUPABASE_SERVICE_ROLE_KEY=... node scripts/create-storage-buckets.mjs`.

## 4. Run it

```bash
npm run dev
```

The app runs at <http://localhost:5555>.

## 5. Make yourself an admin

Sign up through the app, then in the Supabase SQL editor:

```sql
insert into public.user_roles (user_id, role)
select id, r from auth.users, unnest(array['admin', 'superadmin']) as r
where email = 'you@example.com'
on conflict do nothing;
```

The admin dashboard is at `/admin`.

## 6. Optional: server-side API routes

The AI writing assistant (`/api/ai`) and outgoing email (`/api/email`) are Vercel serverless functions in `api/`. To run them locally, add the server-side keys to `.env.local` and use `vercel dev` instead of `npm run dev`. Without them, the rest of the app works normally.

## Everyday commands

```bash
npm run dev        # dev server on port 5555
npm run build      # production build into dist/
npm run typecheck  # TypeScript
npm run lint       # ESLint
npm run test       # Jest unit/integration tests
npx playwright test  # end-to-end tests
```

Next: read the [project structure](../architecture/project-structure.md) and [building a feature](feature-development.md).
