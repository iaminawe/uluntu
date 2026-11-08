# Project structure

## Top level

```
api/                 Vercel serverless functions (AI and email proxies; hold server-side keys)
database/            Base schema snapshot and demo seed data (see database/README.md)
docs/                This documentation site (MkDocs; nav in mkdocs.yml)
public/              Static assets copied as-is into the build
scripts/             Maintenance scripts (storage buckets, menus, bundle analysis)
src/                 The React application
supabase/            Migrations, local Supabase config
tests/               Integration and end-to-end tests
.github/             CI, Claude PR review, issue/PR templates, CODEOWNERS
vercel.json          SPA rewrites and security headers for Vercel
vite.config.ts       Build config (dev server on port 5555)
```

## `src/`

```
src/
  main.tsx           Entry point; mounts providers and the router
  routes/            Route table (lazy-loaded pages)
  pages/             Route-level page components
  features/          Feature modules — the main place new code goes
    <feature>/
      api/           Data access (Supabase queries) for the feature
      hooks/         React Query hooks wrapping the api layer
      components/    Feature UI
      types/         Feature types
  components/        Shared UI components
  shared/            Shared layout, contexts and UI primitives
  hooks/             Cross-feature hooks
  lib/               Clients and helpers (Supabase client, AI client)
  services/          Email and other integrations that call `api/`
  store/             Redux store (UI state only)
  types/             Shared TypeScript types
```

Feature modules include `admin`, `auth`, `companies`, `contact`, `dashboard`, `directory`, `events`, `gallery`, `groups`, `marketplace`, `menu`, `messaging`, `news`, `newsletter`, `onboarding`, `opportunities`, `pages`, `profile`, `resources` and `topics`.

Some older code still lives outside `src/features/` (for example duplicate components in `src/components/` and query hooks in `src/hooks/`). Much of it is unused, and removing it is ongoing work. When in doubt, follow what the routes in `src/routes/index.tsx` actually import.

See [building a feature](../guides/feature-development.md) for how to add a new module.
