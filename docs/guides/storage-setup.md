# Supabase Storage Setup Guide

## Quick Fix for Storage Bucket Errors

If you're getting "Bucket not found" errors when uploading images, follow these steps:

## Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket** and create these buckets:

### Required Buckets:

| Bucket Name | Public | File Size Limit | Allowed MIME Types |
|-------------|---------|-----------------|-------------------|
| `content-images` | ✅ Yes | 10MB | image/jpeg, image/png, image/gif, image/webp |
| `profile-images` | ✅ Yes | 5MB | image/jpeg, image/png, image/gif, image/webp |
| `group-images` | ✅ Yes | 10MB | image/jpeg, image/png, image/gif, image/webp |
| `background-images` | ✅ Yes | 10MB | image/jpeg, image/png, image/gif, image/webp |

## Method 2: Using Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run this SQL command:

```sql
-- Create content-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'content-images',
  'content-images', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create profile-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create group-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'group-images',
  'group-images', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Create background-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'background-images',
  'background-images', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for public read access
DO $$
BEGIN
  -- Content Images Policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id IN ('content-images', 'profile-images', 'group-images', 'background-images'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('content-images', 'profile-images', 'group-images', 'background-images') AND auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Authenticated users can update" ON storage.objects FOR UPDATE USING (bucket_id IN ('content-images', 'profile-images', 'group-images', 'background-images') AND auth.role() = 'authenticated');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "Authenticated users can delete" ON storage.objects FOR DELETE USING (bucket_id IN ('content-images', 'profile-images', 'group-images', 'background-images') AND auth.role() = 'authenticated');
  END IF;
END $$;
```

## Method 3: Using Migration (For Production)

The migration file has been created at:
`supabase/migrations/20250822000004_create_content_images_bucket.sql`

Run the migration using:
```bash
npx supabase db push
```

## Environment Variables

Make sure your `.env.local` file includes these variables:

```env
# Storage Buckets
VITE_PROFILE_IMAGES_BUCKET=profile-images
VITE_CONTENT_IMAGES_BUCKET=content-images
VITE_GROUP_IMAGES_BUCKET=group-images
VITE_BACKGROUND_IMAGES_BUCKET=background-images
```

## Testing

After creating the buckets, test the upload functionality:

1. Try creating a new event with an image
2. Check the browser console for any errors
3. Verify the image appears correctly

## Troubleshooting

If you still get errors:

1. **Check bucket exists**: Go to Supabase Dashboard > Storage and verify all buckets are created
2. **Check permissions**: Ensure buckets are set to "Public" 
3. **Check file size**: Make sure uploaded files are under the size limits
4. **Check MIME types**: Ensure you're uploading supported image formats
5. **Clear browser cache**: Sometimes cached configs can cause issues

## Support

If issues persist, check:
- Supabase service status: https://status.supabase.com
- Supabase Storage docs: https://supabase.com/docs/guides/storage