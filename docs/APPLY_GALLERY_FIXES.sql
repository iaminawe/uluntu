-- =====================================================
-- GALLERY SYSTEM FIXES AND SETUP
-- =====================================================
-- Run these commands in your Supabase SQL Editor
-- Execute each section one at a time

-- =====================================================
-- SECTION 1: Fix Gallery Topics Table Reference
-- =====================================================
BEGIN;

-- Drop the incorrectly defined gallery_topics table if it exists
DROP TABLE IF EXISTS gallery_topics CASCADE;

-- Recreate gallery_topics with correct reference to user_galleries
CREATE TABLE IF NOT EXISTS gallery_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create unique constraint to prevent duplicate topic assignments
ALTER TABLE gallery_topics ADD CONSTRAINT gallery_topics_unique UNIQUE (gallery_id, topic_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gallery_topics_gallery ON gallery_topics(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_topics_topic ON gallery_topics(topic_id);
CREATE INDEX IF NOT EXISTS idx_gallery_topics_created ON gallery_topics(created_at DESC);

-- Enable Row Level Security
ALTER TABLE gallery_topics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public gallery topics
CREATE POLICY "View public gallery topics" ON gallery_topics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_galleries
            WHERE user_galleries.id = gallery_topics.gallery_id
            AND user_galleries.privacy_level = 'public'
            AND user_galleries.visibility = 'visible'
        )
    );

-- Authenticated users can view member-only gallery topics
CREATE POLICY "View member gallery topics" ON gallery_topics
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND
        EXISTS (
            SELECT 1 FROM user_galleries
            WHERE user_galleries.id = gallery_topics.gallery_id
            AND user_galleries.privacy_level = 'members_only'
            AND user_galleries.visibility = 'visible'
        )
    );

-- Gallery owners can view their own gallery topics
CREATE POLICY "Gallery owners view topics" ON gallery_topics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_galleries
            WHERE user_galleries.id = gallery_topics.gallery_id
            AND (
                (user_galleries.owner_type = 'user' AND user_galleries.owner_id = auth.uid())
                OR
                (user_galleries.user_id = auth.uid())
            )
        )
    );

-- Gallery owners can manage their own gallery topics
CREATE POLICY "Gallery owners manage topics" ON gallery_topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_galleries
            WHERE user_galleries.id = gallery_topics.gallery_id
            AND (
                (user_galleries.owner_type = 'user' AND user_galleries.owner_id = auth.uid())
                OR
                (user_galleries.user_id = auth.uid())
            )
        )
    );

-- Admins can manage all gallery topics
CREATE POLICY "Admins manage gallery topics" ON gallery_topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'superadmin')
        )
    );

COMMIT;

-- =====================================================
-- SECTION 2: Enable Photo Galleries Feature Toggle
-- =====================================================
INSERT INTO feature_toggles (
  feature_key,
  enabled,
  description,
  config,
  created_at,
  updated_at
)
VALUES (
  'photo_galleries',
  true, -- Set to true to enable the feature
  'Enable photo gallery system for users and entities',
  '{
    "max_photos_per_gallery": 100,
    "max_galleries_per_user": 50,
    "max_file_size_mb": 10,
    "enable_moderation": true,
    "allowed_formats": ["jpg", "jpeg", "png", "gif", "webp"],
    "thumbnail_sizes": {
      "small": 150,
      "medium": 400,
      "large": 800
    }
  }'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (feature_key) 
DO UPDATE SET
  enabled = true,
  config = EXCLUDED.config,
  updated_at = NOW();

-- =====================================================
-- SECTION 3: Verify Installation
-- =====================================================
-- Run these queries to verify everything is set up correctly

-- Check if gallery_topics table exists with correct reference
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'gallery_topics'
    AND tc.constraint_type = 'FOREIGN KEY';

-- Check if photo galleries feature is enabled
SELECT 
  feature_key,
  enabled,
  description,
  config,
  updated_at
FROM feature_toggles
WHERE feature_key = 'photo_galleries';

-- Check gallery-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%gallery%'
ORDER BY table_name;

-- =====================================================
-- SECTION 4: Grant Admin Access (Optional)
-- =====================================================
-- Replace 'YOUR_USER_ID' with the actual user UUID
-- You can find your user ID in the auth.users table

/*
-- First, check current user roles
SELECT user_id, role FROM user_roles;

-- Grant admin role to a specific user
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_ID', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify user has admin role
SELECT 
    u.email,
    ur.role
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.id = 'YOUR_USER_ID';
*/

-- =====================================================
-- SECTION 5: Test Gallery System
-- =====================================================
-- Create a test gallery to verify everything works

/*
-- Create a test gallery (replace USER_ID with actual UUID)
INSERT INTO user_galleries (
    title,
    description,
    user_id,
    owner_type,
    owner_id,
    privacy_level,
    visibility
) VALUES (
    'Test Gallery',
    'Testing gallery system after fixes',
    'YOUR_USER_ID',
    'user',
    'YOUR_USER_ID',
    'public',
    'visible'
) RETURNING id;

-- Check if test gallery was created
SELECT * FROM user_galleries WHERE title = 'Test Gallery';
*/

-- =====================================================
-- END OF FIXES
-- =====================================================
-- The gallery system should now be fully operational
-- with the correct table references and feature toggle