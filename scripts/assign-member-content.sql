-- =====================================================
-- ASSIGN EXISTING MEMBERS TO CONTENT
-- This script assigns existing members as authors and participants
-- =====================================================

BEGIN;

-- Get existing member IDs to use in assignments
-- Sarah Mitchell: a1b2c3d4-e5f6-7890-abcd-ef1234567890
-- Jennifer Walsh: b62e36e4-11a4-4567-979e-3f3ebbc9232d
-- Marcus Chen: d0519096-9dd8-4397-b0bd-3dbb8cebdb39
-- Lisa Park: 1918195d-3aab-4a48-9999-f17e2a4f2ef9

-- =====================================================
-- ASSIGN GROUP MEMBERSHIPS
-- =====================================================

-- Add members to groups with various roles
INSERT INTO group_members (group_id, member_id, role, joined_date, status) VALUES
-- Web Developers Guild (11111111-1111-1111-1111-111111111111)
('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin', '2024-01-15', 'active'),
('11111111-1111-1111-1111-111111111111', 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39', 'member', '2024-02-01', 'active'),
('11111111-1111-1111-1111-111111111111', '7131f030-4431-4dbf-816b-9cb4ebd2d54d', 'member', '2024-02-15', 'active'),

-- AI & Machine Learning Enthusiasts (22222222-2222-2222-2222-222222222222)
('22222222-2222-2222-2222-222222222222', 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', 'admin', '2024-01-10', 'active'),
('22222222-2222-2222-2222-222222222222', 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', 'member', '2024-01-20', 'active'),
('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'member', '2024-02-05', 'active'),

-- Startup Founders Network (33333333-3333-3333-3333-333333333333)
('33333333-3333-3333-3333-333333333333', '1918195d-3aab-4a48-9999-f17e2a4f2ef9', 'admin', '2024-01-05', 'active'),
('33333333-3333-3333-3333-333333333333', '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', 'member', '2024-01-25', 'active'),

-- Cybersecurity Professionals (44444444-4444-4444-4444-444444444444)
('44444444-4444-4444-4444-444444444444', '857a4b0b-961f-4c36-96db-5ced07c11232', 'admin', '2024-01-12', 'active'),
('44444444-4444-4444-4444-444444444444', 'f06db137-c993-4ab9-8d36-d94fe284bca9', 'member', '2024-02-10', 'active')

ON CONFLICT (group_id, member_id) DO UPDATE SET
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  joined_date = EXCLUDED.joined_date;

-- =====================================================
-- UPDATE EVENT ORGANIZERS
-- =====================================================

-- Update events to have real organizers (if events table has organizer_id column)
UPDATE events SET 
  organizer_id = CASE 
    WHEN title ILIKE '%AI%' OR title ILIKE '%machine learning%' THEN 'b62e36e4-11a4-4567-979e-3f3ebbc9232d'::uuid -- Jennifer Walsh
    WHEN title ILIKE '%web%' OR title ILIKE '%react%' OR title ILIKE '%javascript%' THEN 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid -- Sarah Mitchell
    WHEN title ILIKE '%startup%' OR title ILIKE '%business%' THEN '1918195d-3aab-4a48-9999-f17e2a4f2ef9'::uuid -- Lisa Park
    WHEN title ILIKE '%security%' OR title ILIKE '%cyber%' THEN '857a4b0b-961f-4c36-96db-5ced07c11232'::uuid -- Michael Roberts
    ELSE 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39'::uuid -- Marcus Chen as default
  END
WHERE organizer_id IS NULL AND status = 'published';

-- =====================================================
-- UPDATE RESOURCE CONTRIBUTORS
-- =====================================================

-- Update resources to have real contributors
UPDATE resources SET 
  contributor_id = CASE 
    WHEN title ILIKE '%AI%' OR title ILIKE '%machine learning%' OR description ILIKE '%AI%' THEN 'b62e36e4-11a4-4567-979e-3f3ebbc9232d'::uuid -- Jennifer Walsh
    WHEN title ILIKE '%web%' OR title ILIKE '%react%' OR title ILIKE '%javascript%' THEN 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid -- Sarah Mitchell  
    WHEN title ILIKE '%design%' OR title ILIKE '%UX%' OR title ILIKE '%UI%' THEN '7131f030-4431-4dbf-816b-9cb4ebd2d54d'::uuid -- Alex Thompson
    WHEN title ILIKE '%security%' OR title ILIKE '%cyber%' THEN '857a4b0b-961f-4c36-96db-5ced07c11232'::uuid -- Michael Roberts
    ELSE 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39'::uuid -- Marcus Chen as default
  END
WHERE status = 'published';

-- =====================================================
-- UPDATE GROUP POSTS AUTHORS
-- =====================================================

-- Update group posts to have real authors (if group_posts table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_posts') THEN
    UPDATE group_posts SET 
      author_id = CASE 
        WHEN title ILIKE '%AI%' OR title ILIKE '%machine learning%' OR content ILIKE '%AI%' THEN 'b62e36e4-11a4-4567-979e-3f3ebbc9232d'::uuid -- Jennifer Walsh
        WHEN title ILIKE '%web%' OR title ILIKE '%react%' OR title ILIKE '%javascript%' THEN 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid -- Sarah Mitchell
        WHEN title ILIKE '%startup%' OR title ILIKE '%business%' OR title ILIKE '%entrepreneur%' THEN '1918195d-3aab-4a48-9999-f17e2a4f2ef9'::uuid -- Lisa Park
        WHEN title ILIKE '%design%' OR title ILIKE '%UX%' OR title ILIKE '%UI%' THEN '7131f030-4431-4dbf-816b-9cb4ebd2d54d'::uuid -- Alex Thompson
        WHEN title ILIKE '%security%' OR title ILIKE '%cyber%' THEN '857a4b0b-961f-4c36-96db-5ced07c11232'::uuid -- Michael Roberts
        ELSE 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39'::uuid -- Marcus Chen as default
      END
    WHERE status = 'published';
  END IF;
END $$;

-- =====================================================
-- UPDATE OPPORTUNITIES POSTERS
-- =====================================================

-- Update opportunities to have real posters (if opportunities table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'opportunities') THEN
    UPDATE opportunities SET 
      posted_by = CASE 
        WHEN title ILIKE '%frontend%' OR title ILIKE '%react%' OR title ILIKE '%web%' THEN 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid -- Sarah Mitchell
        WHEN title ILIKE '%data%' OR title ILIKE '%AI%' OR title ILIKE '%machine learning%' THEN 'b62e36e4-11a4-4567-979e-3f3ebbc9232d'::uuid -- Jennifer Walsh
        WHEN title ILIKE '%business%' OR title ILIKE '%product%' OR title ILIKE '%startup%' THEN '1918195d-3aab-4a48-9999-f17e2a4f2ef9'::uuid -- Lisa Park
        WHEN title ILIKE '%design%' OR title ILIKE '%UX%' OR title ILIKE '%UI%' THEN '7131f030-4431-4dbf-816b-9cb4ebd2d54d'::uuid -- Alex Thompson
        WHEN title ILIKE '%security%' OR title ILIKE '%cyber%' THEN '857a4b0b-961f-4c36-96db-5ced07c11232'::uuid -- Michael Roberts
        ELSE 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39'::uuid -- Marcus Chen as default
      END
    WHERE status = 'open';
  END IF;
END $$;

-- =====================================================
-- UPDATE MARKETPLACE LISTINGS SELLERS
-- =====================================================

-- Update marketplace listings to have real sellers (if marketplace_listings table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_listings') THEN
    UPDATE marketplace_listings SET 
      seller_id = CASE 
        WHEN title ILIKE '%web%' OR title ILIKE '%development%' OR title ILIKE '%programming%' THEN 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid -- Sarah Mitchell
        WHEN title ILIKE '%AI%' OR title ILIKE '%machine learning%' OR title ILIKE '%data%' THEN 'b62e36e4-11a4-4567-979e-3f3ebbc9232d'::uuid -- Jennifer Walsh
        WHEN title ILIKE '%design%' OR title ILIKE '%UX%' OR title ILIKE '%UI%' THEN '7131f030-4431-4dbf-816b-9cb4ebd2d54d'::uuid -- Alex Thompson
        WHEN title ILIKE '%laptop%' OR title ILIKE '%computer%' OR title ILIKE '%equipment%' THEN 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39'::uuid -- Marcus Chen
        ELSE '1918195d-3aab-4a48-9999-f17e2a4f2ef9'::uuid -- Lisa Park as default
      END
    WHERE status = 'active';
  END IF;
END $$;

-- =====================================================
-- UPDATE PAGES AUTHORS
-- =====================================================

-- Update pages to have real authors (if pages table has author_id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pages' AND column_name = 'author_id') THEN
    UPDATE pages SET 
      author_id = CASE 
        WHEN slug = 'home' OR slug = 'about' THEN 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid -- Sarah Mitchell for main pages
        WHEN title ILIKE '%AI%' OR title ILIKE '%machine learning%' THEN 'b62e36e4-11a4-4567-979e-3f3ebbc9232d'::uuid -- Jennifer Walsh
        WHEN title ILIKE '%business%' OR title ILIKE '%community%' THEN '1918195d-3aab-4a48-9999-f17e2a4f2ef9'::uuid -- Lisa Park
        ELSE 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39'::uuid -- Marcus Chen as default
      END
    WHERE status = 'published';
  END IF;
END $$;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check group memberships
SELECT 
  g.name as group_name,
  m.name as member_name,
  gm.role,
  gm.joined_date
FROM group_members gm
JOIN groups g ON g.id = gm.group_id
JOIN members m ON m.id = gm.member_id
ORDER BY g.name, gm.role DESC, gm.joined_date;

-- Check event organizers
SELECT 
  e.title as event_title,
  m.name as organizer_name,
  e.date
FROM events e
JOIN members m ON m.id = e.organizer_id
WHERE e.status = 'published'
ORDER BY e.date DESC;

-- Check resource contributors
SELECT 
  r.title as resource_title,
  m.name as contributor_name,
  r.type,
  r.created_at
FROM resources r
JOIN members m ON m.id = r.contributor_id
WHERE r.status = 'published'
ORDER BY r.created_at DESC;