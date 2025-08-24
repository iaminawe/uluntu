-- =====================================================
-- CONNECT NEWS ARTICLES TO USER ACCOUNTS
-- =====================================================

BEGIN;

-- First, let's check and create members for users who don't have them yet
INSERT INTO members (id, user_id, name, status, created_at)
SELECT 
  gen_random_uuid(),
  u.id as user_id,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email) as name,
  'published',
  NOW()
FROM auth.users u
LEFT JOIN members m ON m.user_id = u.id
WHERE m.id IS NULL
  AND u.email_confirmed_at IS NOT NULL;

-- Update news articles to connect to members with user accounts
UPDATE news n
SET author_id = m.id
FROM (
  SELECT n2.id as news_id, m2.id as member_id,
    ROW_NUMBER() OVER (PARTITION BY n2.id ORDER BY m2.created_at) as rn
  FROM news n2
  CROSS JOIN members m2
  WHERE m2.user_id IS NOT NULL
    AND m2.status = 'published'
) AS member_mapping
JOIN members m ON m.id = member_mapping.member_id
WHERE n.id = member_mapping.news_id
  AND member_mapping.rn = 1
  AND n.author_id IS NULL;

-- For any remaining news articles without authors, assign to active members
UPDATE news n
SET author_id = m.id
FROM (
  SELECT n2.id as news_id, m2.id as member_id,
    ROW_NUMBER() OVER (PARTITION BY n2.id ORDER BY RANDOM()) as rn
  FROM news n2
  CROSS JOIN members m2
  WHERE m2.status = 'published'
    AND n2.author_id IS NULL
) AS member_mapping
JOIN members m ON m.id = member_mapping.member_id
WHERE n.id = member_mapping.news_id
  AND member_mapping.rn = 1
  AND n.author_id IS NULL;

-- Add author information view for better querying
CREATE OR REPLACE VIEW news_with_authors AS
SELECT 
  n.*,
  m.name as author_name,
  m.image as author_avatar,
  m.bio as author_bio,
  m.title as author_title,
  m.user_id as author_user_id
FROM news n
LEFT JOIN members m ON n.author_id = m.id;

-- Grant permissions on the view
GRANT SELECT ON news_with_authors TO authenticated;
GRANT SELECT ON news_with_authors TO anon;

COMMIT;