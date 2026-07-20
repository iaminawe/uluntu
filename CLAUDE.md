# Claude Code Configuration

## Project Overview

Uluntu — a community platform for tech professionals in the Nelson/Kootenay region, BC, Canada. Networking, events, marketplace listings, resources, galleries, and real-time messaging for members.

**Stack:**
- Frontend: React + Vite + TypeScript
- State: Redux Toolkit + React Query (hybrid hooks)
- Backend: Supabase (Postgres, Auth, Storage)
- Hosting: Coolify on apps.iaminawe.net; serverless API routes on Vercel

## Build Commands

- `npm run build` - Build project
- `npm run test` - Run tests
- `npm run lint` - Linting
- `npm run typecheck` - Type checking

## File Organization

**Never save working files, tests, or markdown notes to the root folder.** Use:
- `/src` - Source code (feature modules live in `/src/features`)
- `/tests` - Test files
- `/docs` - Documentation and markdown files
- `/config` - Configuration files
- `/scripts` - Utility scripts

## Code Style & Best Practices

- **Modular Design**: Files under 500 lines
- **Environment Safety**: Never hardcode secrets; keep API keys server-side
- **Test-First**: Write tests before implementation
- **Clean Architecture**: Separate concerns; feature code goes through the feature's `api/` layer rather than importing the Supabase client directly
- **Documentation**: Keep updated
