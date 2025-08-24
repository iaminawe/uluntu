-- =============================================
-- Fix group save errors - marketplace, likes, and storage
-- =============================================

-- 1. Fix marketplace_listings table - add missing image column
-- Check if the column exists first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings' 
    AND column_name = 'image'
  ) THEN
    ALTER TABLE public.marketplace_listings 
    ADD COLUMN image TEXT;
    
    COMMENT ON COLUMN public.marketplace_listings.image IS 'Main image URL for the listing';
  END IF;
END $$;

-- Also add images array column if missing (for multiple images)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'marketplace_listings' 
    AND column_name = 'images'
  ) THEN
    ALTER TABLE public.marketplace_listings 
    ADD COLUMN images TEXT[] DEFAULT '{}';
    
    COMMENT ON COLUMN public.marketplace_listings.images IS 'Array of image URLs for the listing';
  END IF;
END $$;

-- 2. Fix likes table - ensure proper structure and RLS
-- First check if likes table exists
DO $$
BEGIN
  -- Create likes table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'likes'
  ) THEN
    CREATE TABLE public.likes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      entity_type TEXT NOT NULL CHECK (entity_type IN ('event', 'resource', 'opportunity', 'news', 'group', 'member', 'marketplace_listing')),
      entity_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, entity_type, entity_id)
    );

    -- Create indexes
    CREATE INDEX idx_likes_user_id ON public.likes(user_id);
    CREATE INDEX idx_likes_entity ON public.likes(entity_type, entity_id);
    CREATE INDEX idx_likes_created_at ON public.likes(created_at DESC);
  END IF;
END $$;

-- Enable RLS on likes table
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;

-- Create RLS policies for likes
CREATE POLICY "Anyone can view likes"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Create storage bucket for group images
-- Note: Storage buckets need to be created via Supabase Dashboard or CLI
-- This SQL creates the policies for the bucket

-- Insert bucket configuration (this ensures the bucket exists in the database)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'group-images',
  'group-images',
  true, -- Public bucket for group images
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage policies for group-images bucket
-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view group images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload group images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own group images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own group images" ON storage.objects;

-- Allow anyone to view group images
CREATE POLICY "Anyone can view group images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'group-images');

-- Allow authenticated users to upload group images
CREATE POLICY "Authenticated users can upload group images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'group-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own group images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'group-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'group-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own group images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'group-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. Create other potentially missing storage buckets
-- Profile images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Gallery images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gallery-images',
  'gallery-images',
  true,
  10485760, -- 10MB for gallery images
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Resource files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resource-files',
  'resource-files',
  true,
  52428800, -- 50MB for resource files
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'application/zip']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 5. Ensure proper indexes exist for performance
-- Add index for marketplace_listings if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'marketplace_listings' 
    AND indexname = 'idx_marketplace_listings_member_id'
  ) THEN
    CREATE INDEX idx_marketplace_listings_member_id ON public.marketplace_listings(member_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'marketplace_listings' 
    AND indexname = 'idx_marketplace_listings_status'
  ) THEN
    CREATE INDEX idx_marketplace_listings_status ON public.marketplace_listings(status);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'marketplace_listings' 
    AND indexname = 'idx_marketplace_listings_created_at'
  ) THEN
    CREATE INDEX idx_marketplace_listings_created_at ON public.marketplace_listings(created_at DESC);
  END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON public.likes TO authenticated;
GRANT SELECT ON public.likes TO anon;
GRANT ALL ON public.marketplace_listings TO authenticated;
GRANT SELECT ON public.marketplace_listings TO anon;

-- Add comment to track migration
COMMENT ON TABLE public.likes IS 'Stores user likes for various entities';
COMMENT ON TABLE public.marketplace_listings IS 'Marketplace listings with image support';