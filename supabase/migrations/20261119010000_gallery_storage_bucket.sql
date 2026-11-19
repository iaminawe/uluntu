-- Storage for gallery photo uploads.
--
-- The app uploads to a gallery-photos bucket that didn't exist on production
-- (20250622000009 created it, but that migration never ran there), so every
-- upload failed. This creates the bucket and its storage policies.
--
-- Layout: users/<auth user id>/galleries/<gallery id>/<originals|medium|thumbs>/<file>.
-- All sizes go in this one bucket; the app no longer uses gallery-thumbnails.
-- The folder is keyed on the auth user id (not the member id) because that's
-- what storage policies can check directly.
--
-- Members can upload only into their own folder and only for a gallery they
-- own, and can list, replace and delete only their own files. Site admins can
-- manage every file. The bucket is public, as the app builds public URLs for
-- every photo, so a file in a private gallery can be fetched by anyone who has
-- its URL; paths include the user id, gallery id and a timestamp, so they
-- can't be listed or guessed, but they aren't secret either. Keeping private
-- photos private needs a private bucket and signed URLs.
-- Checks are in supabase/tests/gallery_storage_bucket.sql.

BEGIN;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-photos',
  'gallery-photos',
  true,
  52428800, -- 50 MB, matching the app's default limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policy names from 20250622000009, in case it ran somewhere.
DROP POLICY IF EXISTS "Users can view public gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to their own gallery folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own gallery photos" ON storage.objects;

DROP POLICY IF EXISTS "Members can read their own gallery files" ON storage.objects;
CREATE POLICY "Members can read their own gallery files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'gallery-photos'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = (select auth.uid())::text
  );

DROP POLICY IF EXISTS "Members can upload to their own galleries" ON storage.objects;
CREATE POLICY "Members can upload to their own galleries" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'gallery-photos'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = (select auth.uid())::text
    AND (storage.foldername(name))[3] = 'galleries'
    AND (storage.foldername(name))[5] IN ('originals', 'medium', 'thumbs')
    AND array_length(storage.foldername(name), 1) = 5
    AND EXISTS (
      SELECT 1 FROM public.user_galleries g
      WHERE g.id::text = (storage.foldername(name))[4]
        AND g.user_id = (select public.get_current_member_id())
    )
  );

DROP POLICY IF EXISTS "Members can replace their own gallery files" ON storage.objects;
CREATE POLICY "Members can replace their own gallery files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'gallery-photos'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = (select auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'gallery-photos'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = (select auth.uid())::text
  );

DROP POLICY IF EXISTS "Members can delete their own gallery files" ON storage.objects;
CREATE POLICY "Members can delete their own gallery files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'gallery-photos'
    AND (storage.foldername(name))[1] = 'users'
    AND (storage.foldername(name))[2] = (select auth.uid())::text
  );

DROP POLICY IF EXISTS "Site admins can manage gallery files" ON storage.objects;
CREATE POLICY "Site admins can manage gallery files" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'gallery-photos' AND (select public.is_site_admin()))
  WITH CHECK (bucket_id = 'gallery-photos' AND (select public.is_site_admin()));

COMMIT;
