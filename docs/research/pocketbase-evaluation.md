# PocketBase as a Supabase Substitute for Uluntu: Evaluation

**Date:** 2026-11-08 · **Scope:** read-only research · **Verdict:** Not recommended as a migration target. PocketBase only makes sense as a ground-up rewrite of the backend, and its current maintenance status adds risk on top of that.

---

## 1. Supabase usage inventory

Counts come from `grep` over the repo at commit `1c20981`. The migration history contains many `*_fixed` / `fix_*` re-runs, so the statement counts below overstate how many objects are live. Read the "distinct" numbers as an upper bound. The June 2025 production dump is a stale lower bound.

### 1.1 Database

| Item | Count | Source |
|---|---|---|
| Migration files | **105** | `supabase/migrations/` |
| Legacy migrations / total SQL files | 9 / 130 at `1c20981` (`database/migrations/` is being removed by an in-progress cleanup) | `database/**` |
| Distinct tables created | **~98** | `CREATE TABLE` in `supabase/migrations/*.sql` |
| Tables with RLS enabled | **100** distinct `ENABLE ROW LEVEL SECURITY` statements | same |
| `CREATE POLICY` statements / distinct (name, table) | 562 / **454** | same |
| Policies on `storage.objects` | 19 | same |
| `auth.uid()` references in SQL | 561 | same |
| Distinct functions | **169** (115 `SECURITY DEFINER` occurrences) | same |
| Distinct triggers | **113** | same |
| Distinct views | **18** | same |
| Stale prod snapshot (Jun 2025) | 38 tables, 116 policies, 12 functions, 16 triggers | `database/production_export/20250621_180002/production_complete.sql` |

**Extensions:** `uuid-ossp` and `pgcrypto`, plus the Supabase platform defaults `pg_graphql`, `pg_stat_statements` and `supabase_vault`. `pg_net` is declared but no migration calls `net.http_*`. `pg_cron` appears only in a comment (`20250819000001_add_admin_activity_logs.sql:57`). There is no pgvector and no pg_trgm. Full-text search runs in one place, `textSearch('search_vector', …)` in `src/features/gallery/api/photoApi.ts:321`. No migration defines that column, so it was probably created by hand. Everything else uses `ilike` (76 uses).

### 1.2 Client data access

- **68 distinct RPCs**, called from 78 non-test call sites. Most are gallery or admin aggregations (`get_*_galleries`, `get_gallery_analytics`, `get_admin_dashboard_stats`), messaging operations (`create_direct_conversation`, `mark_conversation_as_read`, `get_unread_message_count`), and role management (`manage_user_roles`, `bulk_manage_user_roles`, `change_member_role`).
- **~840 `.from('…')` call sites**, which includes the storage `.from`.
- **~494 `select()` strings that embed related rows** (PostgREST joins), at least one of them `!inner` (`members!inner(...)`).
- **64 `count: 'exact'` queries**, 36 `.range()` pagination calls and 24 `.contains()` calls.
- `src/pages/AdminSetupPage.tsx:102` calls `rpc('exec_sql')`. No migration defines that function, so the call is dead code. It is still worth deleting now that the repo is public.

### 1.3 Swappability (how much code touches Supabase directly)

| Location | Non-test files importing `@/lib/supabase` |
|---|---|
| `src/features/*/api/` (the intended layer) | **28** |
| `src/features/*` hooks/components (e.g. `features/auth/hooks/useAuth.ts`, `features/messaging/hooks/useRealtimeChat.ts`, `features/pages/components/*`) | 14 |
| Outside features: `pages` 33, `components` 15, `lib` 7, `hooks` 7, `shared` 6, `src/api` 5, `utils` 4, `services` 4, `providers` 1 | **82** |
| **Total** | **125** |

Only about 22% of Supabase access goes through the feature `api/` layer. The data layer is not abstracted, so any backend swap means touching about 125 files. The 4,673-line generated `src/types/supabase.ts` is imported throughout as well.

### 1.4 Auth

Calls in `src`: `getUser` ×108, `getSession` ×40, `signInWithPassword` ×12, `signOut` ×10, `onAuthStateChange` ×9, `signUp` ×7, `resetPasswordForEmail` ×7, `updateUser` ×3. Email and password is the only provider in use. OAuth, magic links, SMS and MFA are all off or commented out in `supabase/config.toml` (`[auth.external.apple] enabled = false`, `enable_anonymous_sign_ins = false`). The two `signInAnonymously` calls are in debug/test utilities (`src/utils/supabaseDebugger.ts`, `src/components/SupabaseTest.tsx`). Roles live in app tables such as `user_roles` and are enforced through RLS and RPCs, not JWT claims. The Vercel routes verify Supabase JWTs with the service key (`api/_lib/auth.ts:11`).

### 1.5 Storage

Buckets referenced in migrations and code: `gallery-photos`, `gallery-temp`, `gallery-thumbnails`, `group-images`, `content-images`, `message-attachments`, `theme-assets`, `profile-images`, `company_logos`, `company-cover-image`. There are 22 `.upload()` call sites and 1 `createSignedUrl`. Supabase image transformations are **not used**: `[storage.image_transformation]` is commented out in `config.toml`, and thumbnails go to their own bucket through `src/services/imageProcessingService.ts`.

### 1.6 Realtime

All three Supabase Realtime modes are in use:
- **postgres_changes**: 6 subscriptions (messages, `typing_status` table, marketplace, admin contact panels).
- **broadcast**: `new_message`, `edit_message`, `delete_message`, `typing` in `src/features/messaging/hooks/useRealtimeChat.ts:143-216`.
- **presence**: `channel.presenceState()` keyed by user id (`useRealtimeChat.ts:111, 233`).

There are two typing implementations. One uses broadcast (`useRealtimeChat.ts`). The other uses a `typing_status` table subscribed through postgres_changes (`useRealtimeMessaging.ts:118-125`).

### 1.7 Server-side code

- One edge function: `supabase/functions/send-transactional-email/index.ts` (314 lines, Deno, Resend), invoked from `src/api/newsletter/transactional.ts:30`.
- Vercel routes: `api/email.ts`, `api/ai.ts`, `api/ai/provider.ts`, `api/_lib/auth.ts` (~400 lines).
- **Already in the repo:** `docker-compose.yml` defines a self-hosted Supabase stack. The images date from 2024: gotrue v2.151.0, realtime v2.28.32, storage-api v0.43.11, postgrest v12.0.1. There is no edge-runtime container.

---

## 2. PocketBase status (as of Nov 2026)

**Version and maintenance.** pocketbase.io shows **v0.41.1**. The GitHub releases page last shows v0.40.6 (23 Oct), because the GitHub repo was **archived on Oct 26, 2026** with a notice that it "has moved to https://ganigeorgiev.com/pocketbase/pocketbase". That URL returned 404 when fetched on 2026-11-08. I found no public announcement explaining the move. PocketBase **has not reached v1.0**. The README still says "full backward compatibility is not guaranteed before reaching v1.0.0". The FAQ says "there are no promises for maintenance and support beyond what is already available" and notes that donations are no longer accepted. The JS SDK is `pocketbase@0.28.2` on npm, last modified 2026-11-01. A v0.22.x LTS-style backport line also exists (v0.22.57).

| Area | PocketBase capability | Relevance to Uluntu |
|---|---|---|
| **Database** | Embedded SQLite in WAL mode, one `pb_data` directory. No other databases are supported or planned (FAQ). | No Postgres features: no `SECURITY DEFINER`, PL/pgSQL, triggers in SQL, or `tsvector`. |
| **Write concurrency** | SQLite allows one writer at a time, even in WAL mode. Readers don't block the writer (sqlite.org/wal). PocketBase's docs don't describe write handling directly. Their custom-driver examples set `busy_timeout=10000`. | Fine for a regional community site with chat. Batch photo uploads plus chat writes will queue, but should not fail at this scale. |
| **Scaling** | Vertical only: "Only on a single server" (FAQ). The FAQ claims 10k+ realtime connections on a small VPS. | Acceptable for this audience. Rules out high availability. |
| **Access control** | One rule per operation (list/view/create/update/delete, plus `manageRule` on auth collections). Rules are filter expressions using `@request.auth`, `@collection.*` cross-lookups, back-relations, and the `:each`/`:length`/`:changed` modifiers. No arbitrary SQL. | Postgres permissive policies OR together. PocketBase allows **one expression per operation**, so the ~454 policies would have to be hand-merged into about 5 rules × ~98 collections. Rules that call SQL helpers (`is_group_admin()` etc.) must be rewritten as `@collection` lookups or moved into hooks. |
| **Realtime** | SSE. Clients subscribe to `collection/*` or `collection/recordId`, checked against list/view rules. Custom topics can be pushed **from the server** through `$app.subscriptionsBroker()`. Clients cannot publish to each other, and there is no presence API. | Message inserts and `typing_status` rows map well. Broadcast typing needs a custom route plus a broker push. **Presence has no equivalent.** It would have to be built from connection tracking in hooks or a heartbeat collection. |
| **Auth** | Password, OAuth2 (Google, GitHub, Microsoft and others), email OTP, MFA (any two methods), superuser impersonation. Stateless JWTs. JS SDK `authStore`. No anonymous auth. | Covers current needs (email and password). Users can be imported, but password hashes must be compatible (PocketBase uses bcrypt, as GoTrue does), which needs testing. |
| **Files** | Local `pb_data/storage` or S3. Thumbnails on demand via `?thumb=WxH` for jpg/png/gif and partially webp (webp thumbnails come back as png). Protected files use short-lived (~2 min) tokens. Default limit is ~5 MB per file, configurable. | Could replace the separate `gallery-thumbnails` bucket and part of `imageProcessingService.ts`. This is a real gain. |
| **Server logic** | JS hooks in `pb_hooks/*.pb.js`. The runtime is goja: ES5 with partial ES6, no Node APIs, CommonJS only, no `setTimeout`. A Go framework mode is also available. | All 68 RPCs, ~113 triggers and ~169 functions must be ported to goja JS or Go. Resend calls can move into hooks, which removes the Deno edge function and possibly the Vercel routes. |
| **Migrations** | JS/Go migration files (`pb_migrations`), auto-generated from Admin UI changes. | A workable model, but nothing in the 105 SQL migrations carries over. |
| **Backups** | Built-in backups to local disk or S3. For data over ~5 GB, the docs advise `sqlite3 .backup` plus rsync. Litestream is suggested for replication. | Simpler than Postgres backups. This is a real gain for self-hosters. |
| **Full-text search** | None built in. The `~` operator is a LIKE match. FTS5 is only available through community plugins (`pocketbuilds/fts`) or custom routes. | The current `ilike` searches port fine. The single `textSearch` use would need a plugin or a custom route. |
| **Relations / aggregation** | `expand` follows relations up to 6 levels and back-relations (`comments_via_post`), with a cap of **1000 back-related records per expand**. Aggregation is done through read-only **view collections** (SQL SELECT), which emit no realtime events. | Most of the 494 embedded selects map to `expand`. `!inner` filtering and `count: 'exact'` patterns need rework. Admin and gallery analytics RPCs become view collections or custom routes. |
| **TypeScript** | The SDK ships `.d.ts` files and supports `pb.collection<T>()` generics. Types are generated with the community `pocketbase-typegen` (v1.6.0). | Comparable to `supabase gen types`. |
| **Hosting** | One Go binary or Docker image. Coolify has a one-click PocketBase service. | Much simpler than running Supabase's 8+ containers. |

---

## 3. Recommendation for Uluntu

### 3.1 Fit by feature area

| Feature | Fit | Notes |
|---|---|---|
| Member directory, companies, profiles | Good | Plain CRUD plus `expand`. Slug generation triggers move to hooks. |
| Events with RSVP | Good | Rules like `@request.auth.id = user` are a natural fit. |
| Marketplace, opportunities, resources, news/blog, pages | Good | Mostly CRUD with list/view rules. |
| Topics, likes/comments | Fair | Counter triggers (`increment`/`decrement` RPCs) become hooks or `+`/`-` number modifiers. |
| Groups with roles | Fair to poor | RLS uses membership-role helper functions. These need `@collection.group_members` lookups in every rule, and the recursion fixes (`20250820230000_fix_groups_recursion_final.sql`) show how intricate the logic already is. |
| Three-level role/permission system, admin dashboard | Poor | Depends on SECURITY DEFINER RPCs (`manage_user_roles`, `get_admin_dashboard_stats`, `get_admin_activity_summary`), all of which need rewriting. |
| Photo galleries with batch upload | Fair | Built-in thumbnails help. About 20 gallery RPCs (facets, aggregations, attachable-galleries per entity) must become views or routes. The single-writer limit applies to large batches. |
| Real-time messaging | Fair to poor | Message delivery maps well. Broadcast typing needs server routes. Presence must be built from scratch. Conversation RPCs (`create_direct_conversation`, `get_conversation_secure`, etc.) must be rewritten. |
| Newsletters (Resend), transactional email | Good | Hooks can call Resend over `$http.send`, which removes the Deno function. |
| Theme/settings, dynamic menus | Fair | Settings RPCs (`get_public_settings`, `is_feature_enabled`) and the menu security system need porting. |
| Auth | Good | Email and password are supported. A user import is needed. |

### 3.2 Effort estimate (rough)

This is a backend rewrite plus a refactor of the client data layer, not a driver swap. The main drivers:

1. **Schema and rules:** ~98 tables become collections. ~454 policies are consolidated into about 5 rule expressions per collection, which takes careful security review because a merge mistake can leak data. UUID primary keys must fit PocketBase's text `id` field (custom IDs are allowed, but this needs testing during data import).
2. **Server logic:** ~68 RPCs, ~113 triggers and ~169 functions (with overlap) are ported to goja JS hooks or Go.
3. **Client:** 125 files and ~840 query sites are rewritten from the PostgREST builder (`.from().select().eq()`) to the PocketBase SDK (`getList(page, perPage, {filter, expand})`). That includes 494 embedded selects and 64 exact counts. Only 28 of those files sit in an `api/` layer.
4. **Realtime:** the messaging hooks are rebuilt, and presence is built from scratch.
5. **Data migration:** Postgres to SQLite export, files from 10 buckets, and user and password import.
6. **Tests and the Vercel auth bridge** (`api/_lib/auth.ts`).

**Estimate: roughly 8–14 weeks for one experienced developer**, with the most risk in access-control parity. A useful first step, whatever the backend: move the 97 non-`api/` importers behind `src/features/*/api`. That cuts the effort of any future swap roughly in half and is worth doing anyway, because CLAUDE.md requires it.

### 3.3 Gains vs losses

**Gained:** one binary and one data directory, a trivial Coolify deploy (one-click service), built-in backups, on-demand thumbnails, Resend logic living next to the data (fewer moving parts across Deno, Vercel and Postgres), and a lower RAM footprint. For people who self-host forks of the public repo, this is the strongest argument.

**Lost:** Postgres (SQL functions, triggers, `tsvector`, mature tooling, `pg_dump`), RLS as a database-level guarantee, broadcast and presence, PostgREST's expressive joins and counts, high-availability options, and a backend with a large maintainer base. You also take on **pre-1.0 breaking-change risk** and **uncertain stewardship**: the GitHub repo was archived on 2026-10-26, its new home returned 404 when checked, and there is an explicit no-support statement. That last point weighs most for a project you want others to depend on.

### 3.4 Alternatives if the goal is easier self-hosting

1. **Self-hosted Supabase on Coolify (recommended path).** Coolify lists Supabase as a one-click service. Uluntu already ships a compose file for this (`docker-compose.yml`), but its 2024-era images should be updated to match the official `supabase/docker` compose, and an edge-runtime container added (or `send-transactional-email` moved into `api/email.ts`). This keeps all 105 migrations, the RLS and RPCs, and the client code. The cost is ~8 containers and ~2–4 GB RAM. Write a "self-host in 15 minutes" guide in `docs/`.
2. **Reduce Supabase-specific surface first.** Consolidate the 105 migrations into a single baseline schema, finish the `api/` layering, and pick one typing implementation. Each of these makes self-hosting easier and keeps a future backend swap possible.
3. **Plain Postgres plus PostgREST plus a separate auth service** (e.g. Better Auth) is possible but reproduces most of Supabase by hand. Only consider it if Supabase's stack proves too heavy.

### 3.5 Bottom line

PocketBase technically fits the CRUD-heavy majority of Uluntu. It does not fit the parts that make up most of the existing engineering: layered RLS, about 300 server-side SQL objects, broadcast and presence messaging, and analytics RPCs. Combined with the pre-1.0 status and the October 2026 repo archival, it is a poor migration target for a public, self-hostable project. Self-hosted Supabase on Coolify gets the "easy self-host" outcome without a rewrite.

---

## Sources

- PocketBase GitHub repo (archive notice, v1.0 warning): https://github.com/pocketbase/pocketbase
- Releases (v0.40.6 / v0.22.57, 23 Oct): https://github.com/pocketbase/pocketbase/releases
- Homepage (v0.41.1): https://pocketbase.io/
- FAQ (vertical scaling, SQLite only, no support promises): https://pocketbase.io/faq/
- Going to production (backups, rate limiter, ulimit): https://pocketbase.io/docs/going-to-production/
- Realtime API (SSE, topics): https://pocketbase.io/docs/api-realtime/
- Custom realtime messages from JS hooks: https://pocketbase.io/docs/js-realtime/
- Authentication (OAuth2, OTP, MFA, impersonation): https://pocketbase.io/docs/authentication/
- API rules and filters: https://pocketbase.io/docs/api-rules-and-filters/
- Files and thumbnails: https://pocketbase.io/docs/files-handling/
- Collections (base/auth/view): https://pocketbase.io/docs/collections/
- Relations and expand (6 levels, 1000 back-relation cap): https://pocketbase.io/docs/working-with-relations/
- JS hooks runtime (goja caveats): https://pocketbase.io/docs/js-overview/
- Go overview (busy_timeout driver config): https://pocketbase.io/docs/go-overview/
- SQLite WAL (single writer): https://www.sqlite.org/wal.html
- FTS discussion #3807: https://github.com/pocketbase/pocketbase/discussions/3807 · plugin: https://pkg.go.dev/github.com/pocketbuilds/fts
- JS SDK: `npm view pocketbase` → 0.28.2 (modified 2026-11-01); `pocketbase-typegen` 1.6.0
- Coolify services list (Supabase and PocketBase one-click): https://coolify.io/docs/services/all · Supabase notes: https://coolify.io/docs/services/supabase
