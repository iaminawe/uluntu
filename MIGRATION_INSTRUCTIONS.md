# Database Migration Instructions

## Applying the Privacy-First Onboarding Migration

The privacy-first onboarding system requires a database migration to be applied. Here's how to do it:

### Option 1: Using Supabase CLI (Recommended)

1. **Login to Supabase CLI**
   ```bash
   npx supabase login
   ```
   This will open a browser window for authentication.

2. **Link your project**
   ```bash
   npx supabase link --project-ref opkqtpmmtvprhfyjmkhx
   ```

3. **Push the migrations**
   ```bash
   npx supabase db push
   ```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard: https://app.supabase.com/project/opkqtpmmtvprhfyjmkhx

2. Navigate to the **SQL Editor** section

3. Open and copy the migration file content:
   ```
   supabase/migrations/20250614_privacy_first_onboarding.sql
   ```

4. Paste the SQL into the editor and click **Run**

### Option 3: Using Direct Database Connection

If you have direct database access:

```bash
# Connect to your database
psql -h db.opkqtpmmtvprhfyjmkhx.supabase.co -p 5432 -d postgres -U postgres

# Run the migration
\i supabase/migrations/20250614_privacy_first_onboarding.sql
```

## What the Migration Does

This migration updates two critical functions:

1. **`handle_new_user_profile()`** - Changes default status from 'published' to 'draft'
2. **`create_member_profile()`** - Also defaults to 'draft' status

This ensures all new user profiles are private by default, requiring explicit opt-in for public visibility.

## Verification

After running the migration, verify it worked:

1. Check the functions were updated:
   ```sql
   SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user_profile';
   ```
   
   Should show `'draft'` instead of `'published'` in the INSERT statement.

2. Test by creating a new user - their profile should have `status = 'draft'`

## Rollback

If needed, you can rollback by changing the status back to 'published':

```sql
-- Rollback to public by default
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.members (user_id, name, status)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'New Member'), 'published')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;
```

## Important Notes

- This migration only affects **new users** created after the migration
- Existing users retain their current status
- The migration is safe and non-destructive
- No data is deleted or modified, only the default behavior changes

## Need Help?

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify your user has appropriate permissions
3. Ensure no other migrations are conflicting
4. Contact Supabase support if needed