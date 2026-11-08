# Security policy

## Reporting a vulnerability

**Please do not report security problems in public issues, discussions or pull requests.**

Report them privately through GitHub: go to the repository's **Security** tab and choose **Report a vulnerability**, or use [this link](https://github.com/iaminawe/uluntu/security/advisories/new).

Please include:

- what the issue is and what an attacker could do with it
- the affected files, routes or database objects
- steps to reproduce, or a proof of concept
- any configuration needed to reproduce it

Uluntu is maintained by volunteers, so we can't promise fixed response times. We aim to acknowledge reports within a week, keep you updated as we investigate, and credit you when a fix is released unless you'd rather stay anonymous.

## Supported versions

Only the latest code on `main` receives security fixes.

## Scope

In scope: the code in this repository, including the React app, the `api/` serverless functions, the Supabase migrations (row-level security policies, functions, grants) and the Edge Functions.

Out of scope: the Supabase, Vercel, Resend or AI provider platforms themselves; reports that need a compromised admin account or physical access; missing best-practice headers with no demonstrated impact; and denial-of-service through volume.

For [uluntu.io](https://uluntu.io), the live example community, report issues the same way. Please don't run automated scanners against it or access other people's data.

## For people running their own Uluntu

- Only the Supabase **publishable (anon)** key belongs in the browser. The secret/service-role key, Resend key and AI keys must only be set as server-side environment variables, never with a `VITE_` prefix.
- After every build, check that no secret reached the bundle: `grep -rl "service_role\|sb_secret_" dist/` should print nothing.
- Keep row-level security enabled on every table.
- If a key is ever exposed, rotate it immediately. Removing it from git history is not enough.
