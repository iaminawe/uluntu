-- =====================================================
-- ADD PHOTO GALLERIES FEATURE TOGGLE
-- =====================================================

-- Insert photo_galleries feature toggle if it doesn't exist
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
  true, -- Enable by default
  'Enable photo gallery system for users and entities',
  jsonb_build_object(
    'max_photos_per_gallery', 100,
    'max_galleries_per_user', 50,
    'allowed_file_types', ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    'max_file_size_mb', 10,
    'enable_moderation', true,
    'enable_comments', true,
    'enable_likes', true,
    'enable_sharing', true,
    'enable_downloads', false,
    'storage_provider', 'supabase',
    'cdn_enabled', true
  ),
  now(),
  now()
)
ON CONFLICT (feature_key) 
DO UPDATE SET
  updated_at = now(),
  description = EXCLUDED.description
WHERE feature_toggles.feature_key = 'photo_galleries';

-- Add comment for documentation
COMMENT ON COLUMN feature_toggles.feature_key IS 'Unique identifier for the feature toggle. photo_galleries controls the entire gallery system.';