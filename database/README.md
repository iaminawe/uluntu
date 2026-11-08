# database/

Reference SQL that sits outside the Supabase migration history.

| Path | What it is |
|------|------------|
| `comprehensive_schema_and_data.sql` | Snapshot (`pg_dump`, mid-2025) of the base schema. The core tables (`members`, `companies`, `events`, `groups`, and others) are only defined here. Load it before applying `supabase/migrations/`. |
| `comprehensive_seed_data.sql` | Demo content matching that snapshot. |
| `seeds/` | Per-feature demo data (groups, events, galleries, newsletters, settings). Some files are variants of each other; `seeds/README.md` describes them. |

Schema changes don't go here. Add a migration under `supabase/migrations/` instead.

Replacing the snapshot with a proper baseline migration is a known gap; see [getting started](../docs/guides/getting-started.md#3-set-up-the-database).
