-- =============================================
-- Quick fix for group save errors
-- Run this directly in Supabase SQL Editor
-- =============================================

-- 1. Fix marketplace_listings table - add missing image column
ALTER TABLE public.marketplace_listings 
ADD COLUMN IF NOT EXISTS image TEXT;

ALTER TABLE public.marketplace_listings 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- 2. Fix likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('event', 'resource', 'opportunity', 'news', 'group', 'member', 'marketplace_listing')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, entity_type, entity_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_entity ON public.likes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_likes_created_at ON public.likes(created_at DESC);

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;
DROP POLICY IF EXISTS "Users can create their own likes" ON public.likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;

CREATE POLICY "Anyone can view likes"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Create storage buckets (run these in Supabase Dashboard SQL Editor)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'group-images',
  'group-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']::text[];

-- Create storage policies
DROP POLICY IF EXISTS "Anyone can view group images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload group images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own group images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own group images" ON storage.objects;

CREATE POLICY "Anyone can view group images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'group-images');

CREATE POLICY "Authenticated users can upload group images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'group-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own group images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'group-images' 
    AND auth.role() = 'authenticated'
  )
  WITH CHECK (
    bucket_id = 'group-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own group images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'group-images' 
    AND auth.role() = 'authenticated'
  );

-- Grant permissions
GRANT ALL ON public.likes TO authenticated;
GRANT SELECT ON public.likes TO anon;
GRANT ALL ON public.marketplace_listings TO authenticated;
GRANT SELECT ON public.marketplace_listings TO anon;