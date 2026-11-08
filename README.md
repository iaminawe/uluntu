# Uluntu

**An open-source platform for running a community online.**

Uluntu gives a local or professional community one place to meet, organise and share: a member directory, events, groups, a marketplace, job and volunteer opportunities, resources, news, photo galleries, newsletters and real-time messaging, all run from a single admin dashboard.

It was built for a regional tech community in British Columbia, Canada, and is now open source so other communities can run their own copy, adapt it, and help improve it.

**See it running:** [uluntu.io](https://uluntu.io) · **Docs:** [iaminawe.github.io/uluntu](https://iaminawe.github.io/uluntu/) · **License:** [MIT](LICENSE)

---

## What's in it

**For members**
- **Directory and profiles**: member profiles with privacy controls and a guided onboarding flow
- **Companies**: organisation pages linked to their members
- **Events**: listings with RSVPs, sessions and photo galleries
- **Groups**: public, private or secret groups with posts, roles and invitations
- **Messaging**: real-time direct and group conversations with typing indicators
- **Marketplace, opportunities and resources**: buy/sell/trade listings, jobs and volunteer roles, and a shared resource library
- **News and newsletters**: articles from organisers and email campaigns to subscribers

**For organisers**
- **Admin dashboard**: user and role management, content moderation and analytics
- **Roles and permissions**: system roles, custom roles and per-entity permissions
- **Rich editing**: BlockNote editor with optional AI writing assistance (Anthropic or OpenAI, proxied server-side)
- **Site settings**: editable menus, feature toggles, theme presets with live preview, dark mode and fonts
- **Photo galleries**: batch upload with client-side compression

## Built with

React 18, Vite and TypeScript · Tailwind CSS · React Query for server state and Redux Toolkit for UI state · Supabase (Postgres with row-level security, Auth, Storage, Realtime) · Vercel serverless functions for the AI and email proxies · Resend for email · Jest and Playwright for tests.

## Quick start

You'll need Node.js 20+ and a [Supabase](https://supabase.com) project.

```bash
git clone https://github.com/iaminawe/uluntu.git
cd uluntu
npm install
cp .env.example .env.local   # set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev                  # http://localhost:5555
```

Setting up the database takes a few more steps. **[docs/guides/getting-started.md](docs/guides/getting-started.md)** walks through the schema, demo data, storage buckets and making yourself an admin.

> **Heads-up:** there isn't yet a single baseline migration that builds the full schema from scratch. The getting-started guide explains the current workaround. Fixing this is the top contributor task.

## Running your own community

The recommended setup is **Vercel** plus a **Supabase** project, which is how uluntu.io runs. Vercel serves the app and the `api/` functions (AI assistant and email) together. For running on your own server, `docker-compose.yml` builds the app with nginx and can start a self-hosted Supabase stack. See **[docs/deployment](docs/deployment/README.md)** for environment variables, the Docker option and a post-deploy checklist.

Community-specific details such as the site name, contact information, menus and theme are set from the admin dashboard, not in code.

## Project layout

```
src/
  features/      # one module per feature: api/, hooks/, components/, types/
  components/    # shared UI
  hooks/ lib/ services/ store/ types/
api/             # Vercel serverless functions (AI and email proxies; hold server-side keys)
supabase/        # migrations, Edge Functions, local config
database/        # base schema snapshot and demo seed data
docs/            # documentation site (MkDocs)
tests/           # integration and end-to-end tests
```

## Contributing

Contributions of all sizes are welcome: bug reports, fixes, docs, design and new features.

- Read **[CONTRIBUTING.md](CONTRIBUTING.md)** for setup, conventions and the PR process.
- Look for issues labelled [`good first issue`](https://github.com/iaminawe/uluntu/labels/good%20first%20issue) or [`help wanted`](https://github.com/iaminawe/uluntu/labels/help%20wanted).
- Open an issue to discuss anything large before you start.

Pull requests get an automated Claude code review (for fork PRs, a maintainer triggers it), followed by a maintainer review.

Please follow our **[Code of Conduct](CODE_OF_CONDUCT.md)**. To report a security problem, see **[SECURITY.md](SECURITY.md)**. Please don't open a public issue for it.

## Project status

Uluntu runs a live community today, but it's young as an open-source project. Expect rough edges in local setup and some areas of the codebase that need refactoring. These are tracked in the [issue tracker](https://github.com/iaminawe/uluntu/issues), and they make good starting points for contributors.

## License

[MIT](LICENSE) © Uluntu contributors
