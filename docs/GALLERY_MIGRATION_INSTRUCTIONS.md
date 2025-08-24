# Gallery System Database Migration Instructions

## Overview
The photo gallery admin interface has been fully implemented. To activate it, you need to run the database migrations that create the necessary tables and relationships.

## Migration Files Created

The following migration files have been created in `/supabase/migrations/`:

1. **20250824000001_create_entity_gallery_relationships.sql** - Creates relationship tables for all entities
2. **20250824000002_add_gallery_columns_to_entities.sql** - Adds gallery count columns to entity tables
3. **20250824000003_create_gallery_rls_policies.sql** - Sets up Row Level Security policies
4. **20250824000004_create_gallery_count_triggers.sql** - Creates automatic count maintenance triggers
5. **20250824000005_create_gallery_utility_functions.sql** - Adds utility functions for gallery operations
6. **20250824000006_gallery_system_enhancements.sql** - Creates unified views and bulk operations

## Running Migrations

### Option 1: Production Database (Recommended)

Since you're using the production Supabase instance (opkqtpmmtvprhfyjmkhx.supabase.co), run the migrations directly:

```bash
# 1. First, ensure you have the Supabase CLI installed
npm install -g supabase

# 2. Link to your project (if not already linked)
npx supabase link --project-ref opkqtpmmtvprhfyjmkhx

# 3. Run the migrations
npx supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.opkqtpmmtvprhfyjmkhx.supabase.co:5432/postgres"
```

### Option 2: Manual Migration via Supabase Dashboard

1. Go to your Supabase Dashboard: https://app.supabase.com/project/opkqtpmmtvprhfyjmkhx
2. Navigate to the SQL Editor
3. Run each migration file in order:
   - Copy the contents of each migration file
   - Paste into the SQL editor
   - Click "Run"
   - Repeat for all 6 migration files

### Option 3: Using Migration Script

Create a simple migration runner:

```bash
# Create a migration script
cat > run-gallery-migrations.sh << 'EOF'
#!/bin/bash

# Your Supabase connection details
DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.opkqtpmmtvprhfyjmkhx.supabase.co:5432/postgres"

# Migration files
migrations=(
  "20250824000001_create_entity_gallery_relationships.sql"
  "20250824000002_add_gallery_columns_to_entities.sql"
  "20250824000003_create_gallery_rls_policies.sql"
  "20250824000004_create_gallery_count_triggers.sql"
  "20250824000005_create_gallery_utility_functions.sql"
  "20250824000006_gallery_system_enhancements.sql"
)

# Run each migration
for migration in "${migrations[@]}"; do
  echo "Running migration: $migration"
  psql "$DB_URL" -f "supabase/migrations/$migration"
  if [ $? -eq 0 ]; then
    echo "✅ $migration completed successfully"
  else
    echo "❌ $migration failed"
    exit 1
  fi
done

echo "✅ All gallery migrations completed successfully!"
EOF

# Make it executable and run
chmod +x run-gallery-migrations.sh
./run-gallery-migrations.sh
```

## What These Migrations Do

### 1. Entity Gallery Relationships
Creates junction tables to link galleries to:
- Events (`event_galleries`)
- News articles (`news_galleries`)
- Resources (`resource_galleries`)
- Pages (`page_galleries`)
- User profiles (`user_profile_galleries`)
- Marketplace listings (`marketplace_galleries`)

### 2. Gallery Columns
Adds to existing tables:
- `gallery_count` - Tracks number of attached galleries
- `featured_gallery_id` - Designates a featured gallery
- `default_gallery_id` - Sets default gallery for pages
- `profile_gallery_id` - User's profile gallery

### 3. Security Policies
Implements Row Level Security:
- Public galleries visible to all
- Member galleries require authentication
- Private galleries only for owners/admins
- Admins can manage all galleries

### 4. Automatic Triggers
Creates triggers that:
- Automatically update gallery counts
- Maintain data consistency
- Update timestamps on changes

### 5. Utility Functions
Provides functions for:
- Attaching/detaching galleries
- Setting featured galleries
- Bulk operations
- Gallery statistics

### 6. System Enhancements
Adds:
- Unified views for all gallery relationships
- Summary statistics views
- Bulk operation functions
- Performance optimizations

## Verification

After running migrations, verify the installation:

1. **Check Tables Exist:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%galleries%'
ORDER BY table_name;
```

2. **Verify Functions:**
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%gallery%'
ORDER BY routine_name;
```

3. **Test Gallery Creation:**
```sql
-- Create a test gallery
INSERT INTO user_galleries (title, description, owner_id, owner_type, privacy_level)
VALUES ('Test Gallery', 'Testing the system', auth.uid(), 'user', 'public')
RETURNING *;
```

## Accessing the Admin Interface

Once migrations are complete:

1. Navigate to `/admin` in your application
2. Look for "Media Gallery" in the Content Management section
3. Click to access the gallery management interface

The interface provides:
- **Galleries Tab**: Full CRUD operations
- **Moderation Tab**: Photo approval workflow
- **Analytics Tab**: Storage usage metrics
- **Assignments Tab**: Attach galleries to entities
- **Settings Tab**: Configuration options

## Features Now Available

✅ **Gallery Management**
- Create, edit, delete galleries
- Set privacy levels (public/members/private)
- Bulk operations
- Search and filtering

✅ **Entity Attachments**
- Attach galleries to any content type
- Set featured galleries
- Reorder gallery display
- Support for pages and user profiles

✅ **Photo Moderation**
- Review pending photos
- Approve/reject with reasons
- Batch moderation
- Content filtering

✅ **Storage Analytics**
- Monitor storage usage
- Track upload trends
- Identify optimization opportunities
- User storage breakdown

## Troubleshooting

### If migrations fail:

1. **Check connectivity:**
```bash
npx supabase status
```

2. **Verify credentials:**
- Ensure your database password is correct
- Check project reference ID

3. **Run migrations individually:**
- Try running one migration at a time
- Check for specific error messages

### Common Issues:

- **"relation already exists"**: Some tables may already exist - this is safe to ignore
- **Permission denied**: Ensure you're using the service_role key for admin operations
- **Connection refused**: Check if Supabase project is active and accessible

## Next Steps

After successful migration:

1. Test gallery creation in the admin interface
2. Attach galleries to a test entity
3. Upload some test photos
4. Verify moderation workflow
5. Check analytics dashboard

## Support

If you encounter issues:
1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Verify all migration files were applied
4. Ensure your user has admin/superadmin role

The gallery system is now ready for use!