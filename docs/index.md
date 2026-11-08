# Uluntu documentation

Uluntu is an open-source platform for running a local or professional community online: a member directory, companies, events, groups, a marketplace, opportunities, resources, news, photo galleries, newsletters and real-time messaging, all managed from one admin dashboard.

The live example community is [uluntu.io](https://uluntu.io). The source is on [GitHub](https://github.com/iaminawe/uluntu).

## Start here

- **[Getting started](guides/getting-started.md)**: run Uluntu locally and connect it to a Supabase project.
- **[Project structure](architecture/project-structure.md)**: where things live in `src/`.
- **[Building a feature](guides/feature-development.md)**: the feature-module pattern used across the codebase.
- **[Contributing](https://github.com/iaminawe/uluntu/blob/main/CONTRIBUTING.md)**: how to propose changes.

## Architecture

- [State management](architecture/state-management.md): React Query owns server state; Redux holds UI state only.
- [Storage](architecture/storage.md): Supabase Storage buckets and how uploads are organised.
- [Hybrid data hooks](guides/hybrid-hooks.md), [forms](guides/forms.md) and [error handling](guides/error-handling.md).

## Features

See the [features overview](features/README.md) for events, groups, messaging, galleries, menus, the dashboard, admin tools, editors and theming.

## Deploying

See [deployment](deployment/README.md) for building the app, choosing a host and wiring up the server-side API routes.

## Research

- [Should Uluntu move from Supabase to PocketBase?](research/pocketbase-evaluation.md)
