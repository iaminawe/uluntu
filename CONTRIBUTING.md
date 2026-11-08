# Contributing to Uluntu

Thanks for your interest in Uluntu. Bug reports, fixes, features, docs and design help are all welcome, whether you run a community yourself or just want to help.

By taking part you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to help

- **Report a bug or suggest a feature** with an [issue](https://github.com/iaminawe/uluntu/issues/new/choose).
- **Pick up an issue** labelled [`good first issue`](https://github.com/iaminawe/uluntu/labels/good%20first%20issue) or [`help wanted`](https://github.com/iaminawe/uluntu/labels/help%20wanted). Comment first so nobody duplicates work.
- **Improve the docs** in [`docs/`](docs/). Several features still have no documentation (see the [features overview](docs/features/README.md)).
- **Help with the database baseline.** Squashing the schema snapshot and migrations into one reproducible baseline is the most valuable contributor-experience task right now (see [getting started](docs/guides/getting-started.md#3-set-up-the-database)).

For anything large, such as a new feature, a schema change or a new dependency, please open an issue to discuss it before writing code.

## Development setup

Follow [docs/guides/getting-started.md](docs/guides/getting-started.md). The short version:

```bash
git clone https://github.com/<you>/uluntu.git
cd uluntu
npm install
cp .env.example .env.local   # add your Supabase URL and publishable key
npm run dev                  # http://localhost:5555
```

## Making a change

1. Fork the repo and create a branch from `main`: `feat/short-description` or `fix/short-description`.
2. Make your change. Add or update tests where it makes sense.
3. Run the checks CI runs:
   ```bash
   npm run typecheck
   npm run lint
   npm run test
   ```
4. Open a pull request and fill in the template. Keep each PR focused on one change.

Pull requests get an automated Claude code review. For PRs from forks, a maintainer triggers it by commenting `@claude review this PR`. Treat it as a second pair of eyes, not a gate. A maintainer approves and merges every PR.

### Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(events): add iCal export
fix(messaging): stop typing indicator sticking after send
docs: document the marketplace module
```

## Code guidelines

- **TypeScript everywhere.** Avoid `any`; prefer types from `src/types` or the feature's `types/` folder.
- **Feature modules.** New code goes in `src/features/<feature>/` with `api/`, `hooks/`, `components/` and `types/`. See [building a feature](docs/guides/feature-development.md).
- **Data access goes through the feature's `api/` layer.** Components and hooks should not import the Supabase client directly.
- **Server state belongs to React Query; Redux is for UI state only.** See [state management](docs/architecture/state-management.md).
- **Keep files under about 500 lines.** Split large components.
- **Styling** uses Tailwind CSS. Support dark mode and keyboard navigation.
- **User-generated HTML** must be sanitised with DOMPurify before rendering.

## Security rules for contributors

- **Never put a secret in a `VITE_*` variable.** Vite ships those to every browser. Server-side keys (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, AI keys) belong only in `api/` functions or scripts.
- **Never read `import.meta.env` as a whole object** (`import.meta.env[key]`, spreading it, `Object.keys(...)`). Doing so makes Vite inline every `VITE_*` variable. Read each variable statically, e.g. `import.meta.env.VITE_SUPABASE_URL`.
- **Every new table needs row-level security** in its migration, with policies that check `auth.uid()`.
- **Never commit `.env` files, database dumps containing real users, or scraped personal data.**

Found a vulnerability? Please don't open a public issue. See [SECURITY.md](SECURITY.md).

## Database changes

- Add a new timestamped file in `supabase/migrations/` (`supabase migration new <name>`). Never edit a migration that has already been applied.
- Make migrations idempotent where you can (`if not exists`, `create or replace`).
- Include RLS policies and any grants in the same migration.

## Licence

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
