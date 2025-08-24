# Gallery Migration Fix - Correct Order

## The Issue
The error `column ug.owner_type does not exist` occurs because the migrations are being run out of order. The `owner_type` and `owner_id` columns are added in migration `20250622000004_add_group_company_galleries.sql` but the later migrations reference these columns.

## Solution: Run Migrations in Correct Order

### Step 1: Check What's Already Applied
First, check which migrations have already been applied:

```sql
-- In Supabase SQL Editor
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
```

### Step 2: Run Missing Prerequisites
If `20250622000004_add_group_company_galleries.sql` hasn't been applied, run it first:

```sql
-- This adds owner_type and owner_id columns to user_galleries
-- Copy and run the contents of:
-- /supabase/migrations/20250622000004_add_group_company_galleries.sql
```

### Step 3: Run Gallery Migrations in Order
After ensuring the prerequisite is applied, run these in order:

1. **20250622000004_add_group_company_galleries.sql** (if not already applied)
   - Adds `owner_type` and `owner_id` columns to `user_galleries`
   - Updates RLS policies for multi-owner support

2. **20250824000001_create_entity_gallery_relationships.sql**
   - Creates relationship tables for events, news, resources, pages, profiles, marketplace

3. **20250824000002_add_gallery_columns_to_entities.sql**
   - Adds gallery count columns to entity tables

4. **20250824000003_create_gallery_rls_policies.sql**
   - Creates security policies for new tables

5. **20250824000004_create_gallery_count_triggers.sql**
   - Adds automatic count maintenance

6. **20250824000005_create_gallery_utility_functions.sql**
   - Creates helper functions

7. **20250824000006_gallery_system_enhancements.sql**
   - Creates unified views (this one failed because owner_type was missing)

### Quick Fix SQL
If you want to quickly add the missing columns without running the full migration:

```sql
-- Quick fix: Add missing columns to user_galleries
ALTER TABLE user_galleries 
ADD COLUMN IF NOT EXISTS owner_type TEXT DEFAULT 'user' CHECK (owner_type IN ('user', 'group', 'company', 'page')),
ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Set owner_id to user_id for existing records
UPDATE user_galleries 
SET owner_id = user_id 
WHERE owner_id IS NULL;

-- Make owner_id NOT NULL
ALTER TABLE user_galleries 
ALTER COLUMN owner_id SET NOT NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_galleries_owner_type ON user_galleries(owner_type);
CREATE INDEX IF NOT EXISTS idx_user_galleries_owner_id ON user_galleries(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_galleries_owner_composite ON user_galleries(owner_type, owner_id);
```

### Step 4: Grant Admin Access
After migrations are complete, grant yourself admin access:

```sql
-- Create admin role if it doesn't exist
INSERT INTO roles (name, description) 
VALUES ('admin', 'Administrator role')
ON CONFLICT (name) DO NOTHING;

-- Find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Grant admin role
INSERT INTO user_roles (user_id, role_id)
SELECT 'YOUR-USER-ID-HERE', id
FROM roles 
WHERE name = 'admin'
ON CONFLICT DO NOTHING;
```

### Step 5: Verify Installation
After running all migrations:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_galleries' 
AND column_name IN ('owner_type', 'owner_id');

-- Check if relationship tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%_galleries'
ORDER BY table_name;

-- Test the unified view
SELECT * FROM entity_galleries_unified LIMIT 5;
```

## Alternative: Complete Reset
If you're having trouble with migration order, you can run them all at once in the correct sequence:

1. Go to Supabase SQL Editor
2. Run each migration file in this exact order:
   - `20250622000004_add_group_company_galleries.sql`
   - `20250824000001_create_entity_gallery_relationships.sql`
   - `20250824000002_add_gallery_columns_to_entities.sql`
   - `20250824000003_create_gallery_rls_policies.sql`
   - `20250824000004_create_gallery_count_triggers.sql`
   - `20250824000005_create_gallery_utility_functions.sql`
   - `20250824000006_gallery_system_enhancements.sql`
   - `20250824100000_ensure_admin_roles.sql`

## After Successful Migration
1. Clear browser cache
2. Sign out and sign back in
3. Navigate to `/admin/debug-roles` to verify your roles
4. Access `/admin/media` for the gallery management interface

The gallery admin interface should now be fully functional!