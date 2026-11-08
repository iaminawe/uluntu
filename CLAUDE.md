# Uluntu

Open-source community platform: member directory, companies, events, groups, marketplace, opportunities, resources, news, galleries, newsletters, real-time messaging and an admin dashboard. The live example community is uluntu.io.

Stack: React 18 + Vite 5 + TypeScript, Tailwind, React Query (server state) + Redux Toolkit (UI state only), Supabase (Postgres, Auth, Storage, Realtime), Vercel serverless functions in `api/`.

## Commands

```bash
npm run dev        # http://localhost:5555
npm run typecheck
npm run lint       # --max-warnings 0
npm run test       # Jest
npx playwright test
npm run build
```

## Where things go

- Feature code: `src/features/<feature>/{api,hooks,components,types}`. Components and hooks reach Supabase through the feature's `api/` layer, not by importing `src/lib/supabase` directly. Much older code still bypasses it; don't add more.
- Schema changes: new timestamped file in `supabase/migrations/`, with RLS policies in the same migration. Never edit an applied migration.
- Docs: `docs/` (published with MkDocs; update the `nav` in `mkdocs.yml` when adding a page). Don't add status reports or implementation summaries. Put durable docs in `docs/` and everything else in the PR description.
- Tests: next to the code in `__tests__/`, or under `tests/`.

## Things that will bite you

- **Never read `import.meta.env` dynamically** (`import.meta.env[key]`, spreading it, `Object.keys`). Vite then inlines every `VITE_*` var into the public bundle. This leaked the service-role key once. Read vars statically. Secrets never get a `VITE_` prefix; they live only in `api/` (server) code.
- **The database has no single baseline migration.** Core tables exist only in `database/comprehensive_schema_and_data.sql` (a mid-2025 dump), and `supabase/migrations/` builds on top of it. Don't assume `supabase db reset` produces a working schema.
- **Admin role names are inconsistent:** `useAuth` checks `super_admin`, while `usePermissions` and `useConditionalUI` check `superadmin`. Check both before changing role logic.
- Production runs on Vercel (`vercel.json` holds the SPA rewrite and headers). The `api/` routes only exist there (`vercel dev` locally); the Docker/nginx self-hosting option doesn't include them.

## Repo hygiene

The repo is public. Never commit `.env*` files (except `.env.example`), database dumps containing real users, scraped personal data, or build/test artefacts (`dist/`, `playwright-report/`, `test-results/`).
