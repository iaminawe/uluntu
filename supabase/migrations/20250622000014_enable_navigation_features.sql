-- Enable all main features to restore navigation
-- This migration enables the feature toggles that control navigation visibility

-- Update existing feature toggles to enabled
UPDATE feature_toggles SET enabled = true WHERE feature_key IN (
  'events_system',
  'members_directory', 
  'groups_communities',
  'news_blog',
  'photo_galleries',
  'companies_listing',
  'opportunities_board',
  'marketplace',
  'resources_library'
);

-- If any features are missing, insert them as enabled
INSERT INTO feature_toggles (feature_key, enabled, description, created_at, updated_at)
VALUES 
  ('events_system', true, 'Events and workshops system', NOW(), NOW()),
  ('members_directory', true, 'Member directory and profiles', NOW(), NOW()),
  ('groups_communities', true, 'Groups and communities feature', NOW(), NOW()),
  ('news_blog', true, 'News and blog articles', NOW(), NOW()),
  ('photo_galleries', true, 'Photo galleries feature', NOW(), NOW()),
  ('companies_listing', true, 'Company directory', NOW(), NOW()),
  ('opportunities_board', true, 'Jobs and opportunities board', NOW(), NOW()),
  ('marketplace', true, 'Buy/sell marketplace', NOW(), NOW()),
  ('resources_library', true, 'Educational resources library', NOW(), NOW())
ON CONFLICT (feature_key) DO UPDATE 
SET 
  enabled = EXCLUDED.enabled,
  updated_at = NOW();