# Database Management

This directory contains all SQL scripts for managing the Nelson Tech Community Platform database.

## Directory Structure

```
database/
├── setup_database.sql       # Master setup script - run this for fresh setup
├── migrations/             # Schema changes and table modifications
│   ├── applied/           # Already applied migrations
│   └── pending/           # Migrations waiting to be applied
├── seeds/                 # Sample and initial data
│   ├── consolidated_seed_data.sql  # All seed data in one file
│   └── [individual seed files]
├── fixes/                 # RLS and permission fixes
│   ├── consolidated_rls_fixes.sql  # All RLS fixes in one file
│   └── [individual fix files]
├── admin/                 # Admin and role management scripts
├── diagnostics/           # Check and debug queries
└── archive/              # Old/obsolete files kept for reference
```

## Quick Start

### Setting Up a Fresh Database

1. Run the master setup script in your Supabase SQL Editor:
```sql
\i database/setup_database.sql
```

This will:
- Apply all schema migrations
- Set up RLS policies correctly
- Seed sample data
- Configure permissions
- Create performance indexes

### Individual Operations

#### Apply Only RLS Fixes
```sql
\i database/fixes/consolidated_rls_fixes.sql
```

#### Load Only Seed Data
```sql
\i database/seeds/consolidated_seed_data.sql
```

#### Assign Superadmin Role
```sql
-- Replace USER_ID with actual user ID
\i database/admin/assign_superadmin_to_user.sql
```

## Important Files

### setup_database.sql
The master script that runs everything in the correct order. Use this for:
- Fresh database setup
- Resetting development environment
- Setting up new environments

### consolidated_rls_fixes.sql
Contains all working RLS (Row Level Security) policies. This file:
- Drops problematic policies
- Creates clean, working policies
- Enables RLS on all necessary tables
- Sets up proper permissions

### consolidated_seed_data.sql
Contains comprehensive seed data including:
- Sample members with profiles
- Companies
- Events
- Groups and memberships
- News articles
- Job opportunities
- Resources
- Marketplace listings
- Tags system

## Migrations

Migrations are numbered and should be run in order:
- 001_add_member_profile_fields.sql
- 002_add_member_interests.sql
- 003_create_tags_system.sql
- 004_add_tags_to_resources.sql
- 005_apply_admin_migration.sql
- 006_apply_newsletter_migration.sql

## Diagnostics

Use diagnostic scripts to troubleshoot issues:
- `check_rls_policies.sql` - View all RLS policies
- `check_current_rls_status.sql` - Check RLS status on tables
- `diagnose_rls_issues.sql` - Detailed RLS troubleshooting

## Common Tasks

### Check if user has superadmin role
```sql
SELECT * FROM user_roles WHERE user_id = 'YOUR_USER_ID';
```

### View all RLS policies
```sql
\i database/diagnostics/check_rls_policies.sql
```

### Reset all data (keeping schema)
```sql
-- First truncate all data
TRUNCATE TABLE member_interests CASCADE;
TRUNCATE TABLE member_skills CASCADE;
-- ... (truncate other tables)

-- Then reload seed data
\i database/seeds/consolidated_seed_data.sql
```

## Notes

- Always backup your database before running scripts
- The `archive/` directory contains old versions of scripts for reference
- RLS policies are critical for security - don't disable them in production
- Test all changes in a development environment first