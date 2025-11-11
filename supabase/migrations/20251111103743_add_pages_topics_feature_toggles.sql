-- Add pages_system and topics_system feature toggles

-- Insert pages_system feature toggle
INSERT INTO feature_toggles (feature_key, enabled, description, created_at, updated_at)
VALUES (
  'pages_system',
  true,
  'Enable or disable the dynamic pages system for creating custom content pages',
  NOW(),
  NOW()
)
ON CONFLICT (feature_key) DO UPDATE
SET description = EXCLUDED.description,
    updated_at = NOW();

-- Insert topics_system feature toggle
INSERT INTO feature_toggles (feature_key, enabled, description, created_at, updated_at)
VALUES (
  'topics_system',
  true,
  'Enable or disable the topics/tags system for categorizing and organizing content',
  NOW(),
  NOW()
)
ON CONFLICT (feature_key) DO UPDATE
SET description = EXCLUDED.description,
    updated_at = NOW();
