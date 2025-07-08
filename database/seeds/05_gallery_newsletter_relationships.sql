-- =====================================================
-- GALLERY & NEWSLETTER RELATIONSHIP SEED DATA
-- Creates connections between photo galleries, newsletters, and other platform features
-- =====================================================

BEGIN;

-- Set timezone for consistent timestamps
SET TIME ZONE 'America/Vancouver';

-- =====================================================
-- PHOTO TAGS (connecting photos to existing tag system)
-- =====================================================

-- First, let's add some photography-specific tags that might not exist
INSERT INTO tags (name, slug, color, category, description, usage_count, created_by)
SELECT 
  'Workspace', 'workspace', '#3B82F6', 'Features', 'Home office and workspace setups', 1,
  (SELECT id FROM members WHERE name = 'Sarah Mitchell' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'workspace')
AND EXISTS (SELECT 1 FROM members WHERE name = 'Sarah Mitchell');

INSERT INTO tags (name, slug, color, category, description, usage_count, created_by)
SELECT 
  'Innovation', 'innovation', '#10B981', 'Features', 'Innovative technology and solutions', 2,
  (SELECT id FROM members WHERE name = 'Dr. Emily Rodriguez' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'innovation')
AND EXISTS (SELECT 1 FROM members WHERE name = 'Dr. Emily Rodriguez');

INSERT INTO tags (name, slug, color, category, description, usage_count, created_by)
SELECT 
  'Visualization', 'visualization', '#8B5CF6', 'Technology', 'Data visualization and infographics', 1,
  (SELECT id FROM members WHERE name = 'Jennifer Walsh' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = 'visualization')
AND EXISTS (SELECT 1 FROM members WHERE name = 'Jennifer Walsh');

-- Now connect photos to tags
INSERT INTO "public"."photo_tags" ("id", "photo_id", "tag_id", "tagged_by", "created_at") VALUES
	-- Sarah's workspace photo tags
	('b0000001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM tags WHERE slug = 'workspace' LIMIT 1), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-20 14:20:00+00'),
	('b0000002-0002-0002-0002-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM tags WHERE slug = 'technology' LIMIT 1), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-20 14:21:00+00'),
	
	-- Sarah's code editor tags
	('b0000003-0003-0003-0003-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (SELECT id FROM tags WHERE slug = 'programming' LIMIT 1), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-19 09:35:00+00'),
	('b0000004-0004-0004-0004-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (SELECT id FROM tags WHERE slug = 'web-development' LIMIT 1), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-19 09:36:00+00'),
	
	-- Emily's telemedicine tags
	('b0000005-0005-0005-0005-000000000005', 'cccccccc-cccc-cccc-cccc-cccccccccccc', (SELECT id FROM tags WHERE slug = 'innovation' LIMIT 1), 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', '2025-06-18 11:35:00+00'),
	('b0000006-0006-0006-0006-000000000006', 'cccccccc-cccc-cccc-cccc-cccccccccccc', (SELECT id FROM tags WHERE slug = 'healthcare' LIMIT 1), 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', '2025-06-18 11:36:00+00'),
	
	-- Jennifer's data visualization tags
	('b0000007-0007-0007-0007-000000000007', 'ffffffff-ffff-ffff-ffff-ffffffffffff', (SELECT id FROM tags WHERE slug = 'visualization' LIMIT 1), 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', '2025-06-22 09:35:00+00'),
	('b0000008-0008-0008-0008-000000000008', 'ffffffff-ffff-ffff-ffff-ffffffffffff', (SELECT id FROM tags WHERE slug = 'data-science' LIMIT 1), 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', '2025-06-22 09:36:00+00'),
	
	-- Amanda's brand photoshoot tags
	('b0000009-0009-0009-0009-000000000009', '00000003-0003-0003-0003-000000000003', (SELECT id FROM tags WHERE slug = 'marketing' LIMIT 1), '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', '2025-06-21 10:30:00+00'),
	('b0000010-0010-0010-0010-000000000010', '00000003-0003-0003-0003-000000000003', (SELECT id FROM tags WHERE slug = 'startup' LIMIT 1), '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', '2025-06-21 10:31:00+00');

-- =====================================================
-- GALLERY TAGS (connecting galleries to tag system)
-- =====================================================

INSERT INTO "public"."gallery_tags" ("id", "gallery_id", "tag_id", "tagged_by", "created_at") VALUES
	-- Sarah's development setup gallery
	('c0000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', (SELECT id FROM tags WHERE slug = 'workspace' LIMIT 1), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-20 14:25:00+00'),
	('c0000002-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111', (SELECT id FROM tags WHERE slug = 'programming' LIMIT 1), 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-20 14:26:00+00'),
	
	-- Emily's healthcare innovation gallery
	('c0000003-0003-0003-0003-000000000003', '22222222-2222-2222-2222-222222222222', (SELECT id FROM tags WHERE slug = 'innovation' LIMIT 1), 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', '2025-06-18 11:40:00+00'),
	('c0000004-0004-0004-0004-000000000004', '22222222-2222-2222-2222-222222222222', (SELECT id FROM tags WHERE slug = 'healthcare' LIMIT 1), 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', '2025-06-18 11:41:00+00'),
	
	-- Alex's design process gallery
	('c0000005-0005-0005-0005-000000000005', '33333333-3333-3333-3333-333333333333', (SELECT id FROM tags WHERE slug = 'design' LIMIT 1), '7131f030-4431-4dbf-816b-9cb4ebd2d54d', '2025-06-15 16:25:00+00'),
	('c0000006-0006-0006-0006-000000000006', '33333333-3333-3333-3333-333333333333', (SELECT id FROM tags WHERE slug = 'ui-ux' LIMIT 1), '7131f030-4431-4dbf-816b-9cb4ebd2d54d', '2025-06-15 16:26:00+00'),
	
	-- Jennifer's data visualization gallery
	('c0000007-0007-0007-0007-000000000007', '55555555-5555-5555-5555-555555555555', (SELECT id FROM tags WHERE slug = 'visualization' LIMIT 1), 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', '2025-06-22 09:40:00+00'),
	('c0000008-0008-0008-0008-000000000008', '55555555-5555-5555-5555-555555555555', (SELECT id FROM tags WHERE slug = 'data-science' LIMIT 1), 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', '2025-06-22 09:41:00+00'),
	
	-- Amanda's marketing gallery
	('c0000009-0009-0009-0009-000000000009', '88888888-8888-8888-8888-888888888888', (SELECT id FROM tags WHERE slug = 'marketing' LIMIT 1), '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', '2025-06-21 10:35:00+00'),
	('c0000010-0010-0010-0010-000000000010', '88888888-8888-8888-8888-888888888888', (SELECT id FROM tags WHERE slug = 'startup' LIMIT 1), '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', '2025-06-21 10:36:00+00');

-- =====================================================
-- NEWSLETTER CAMPAIGN PHOTO USAGE
-- =====================================================

-- Update newsletter campaigns to reference specific photos in their content
UPDATE newsletter_campaigns 
SET template_data = template_data || jsonb_build_object('featured_photo_id', 'ffffffff-ffff-ffff-ffff-ffffffffffff')
WHERE id = '70000001-0001-0001-0001-000000000001'; -- June 15 digest featuring Jennifer's data viz

UPDATE newsletter_campaigns 
SET template_data = template_data || jsonb_build_object('header_photo_id', 'cccccccc-cccc-cccc-cccc-cccccccccccc')
WHERE id = '70000002-0002-0002-0002-000000000002'; -- AI Summit featuring Emily's telemedicine setup

UPDATE newsletter_campaigns 
SET template_data = template_data || jsonb_build_object('hero_photo_id', '00000003-0003-0003-0003-000000000003')
WHERE id = '70000003-0003-0003-0003-000000000003'; -- June 22 digest featuring Amanda's brand shoot

-- =====================================================
-- PHOTO USAGE IN NEWS ARTICLES
-- =====================================================

-- Connect gallery photos to news articles
UPDATE news 
SET hero_image = '/climate-data-viz.jpg',
    hero_image_alt = 'Beautiful data visualization showing climate trends in the Kootenay region'
WHERE slug = 'datawise-environmental-innovation-award';

UPDATE news 
SET hero_image = '/brand-photoshoot.jpg',
    hero_image_alt = 'Professional brand photoshoot showcasing local tech startup culture'
WHERE slug = 'kootenay-tech-startup-growth-2024';

-- =====================================================
-- EVENT PHOTO ASSOCIATIONS
-- =====================================================

-- Create table for event photo associations if it doesn't exist
CREATE TABLE IF NOT EXISTS event_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
    photo_type VARCHAR(50) NOT NULL CHECK (photo_type IN ('hero', 'gallery', 'speaker', 'venue')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(event_id, photo_id, photo_type)
);

-- Associate photos with events
INSERT INTO "public"."event_photos" ("id", "event_id", "photo_id", "photo_type", "sort_order", "created_at") VALUES
	-- AI Summit using Jennifer's data visualization as inspiration
	('d0000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'hero', 0, '2025-06-15 12:00:00+00'),
	
	-- Full Stack Workshop using Sarah's development setup
	('d0000002-0002-0002-0002-000000000002', '22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'hero', 0, '2025-06-15 12:30:00+00'),
	('d0000003-0003-0003-0003-000000000003', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'gallery', 1, '2025-06-15 12:31:00+00');

-- =====================================================
-- MARKETPLACE PHOTO CONNECTIONS
-- =====================================================

-- Update marketplace listings to reference member gallery photos
UPDATE marketplace_listings 
SET images = ARRAY['galleries/sarah/dual-monitor-setup.jpg']
WHERE seller_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' 
AND type = 'service' 
AND title LIKE '%React%';

UPDATE marketplace_listings 
SET images = ARRAY['galleries/alex/whiteboard-session.jpg']
WHERE seller_id = '7131f030-4431-4dbf-816b-9cb4ebd2d54d' 
AND type = 'service';

UPDATE marketplace_listings 
SET images = ARRAY['galleries/marcus/aws-architecture-diagram.jpg']
WHERE seller_id = 'd0519096-9dd8-4397-b0bd-3dbb8cebdb39' 
AND type = 'service';

-- =====================================================
-- RESOURCE PHOTO ENHANCEMENTS
-- =====================================================

-- Create table for resource thumbnails if it doesn't exist
CREATE TABLE IF NOT EXISTS resource_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
    photo_type VARCHAR(50) NOT NULL CHECK (photo_type IN ('thumbnail', 'hero', 'preview')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(resource_id, photo_type)
);

-- Associate gallery photos with related resources
INSERT INTO "public"."resource_photos" ("id", "resource_id", "photo_id", "photo_type", "created_at") VALUES
	-- React course using Sarah's code editor screenshot
	('e0000001-0001-0001-0001-000000000001', '650e8400-e29b-41d4-a716-446655443001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'thumbnail', '2025-06-20 10:00:00+00'),
	
	-- DevOps guide using Marcus's architecture diagram
	('e0000002-0002-0002-0002-000000000002', '650e8400-e29b-41d4-a716-446655443002', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'thumbnail', '2025-06-20 10:15:00+00'),
	
	-- Data science course using Jennifer's visualization
	('e0000003-0003-0003-0003-000000000003', '650e8400-e29b-41d4-a716-446655443003', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'thumbnail', '2025-06-20 10:30:00+00'),
	
	-- UX research guide using Alex's whiteboard session
	('e0000004-0004-0004-0004-000000000004', '650e8400-e29b-41d4-a716-446655443004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'thumbnail', '2025-06-20 10:45:00+00');

-- =====================================================
-- COMPANY GALLERY ASSOCIATIONS
-- =====================================================

-- Create table for company gallery showcases
CREATE TABLE IF NOT EXISTS company_galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
    showcase_type VARCHAR(50) NOT NULL CHECK (showcase_type IN ('featured', 'portfolio', 'team', 'office')),
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES members(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(company_id, gallery_id)
);

-- Associate member galleries with their companies
INSERT INTO "public"."company_galleries" ("id", "company_id", "gallery_id", "showcase_type", "is_approved", "approved_by", "approved_at", "created_at") VALUES
	-- TechFlow Solutions featuring Sarah's workspace
	('a0000001-0001-0001-0001-000000000001', 'aa11bb22-cc33-dd44-ee55-ff6677889900', '11111111-1111-1111-1111-111111111111', 'portfolio', true, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2025-06-20 15:00:00+00', '2025-06-20 14:45:00+00'),
	
	-- HealthTech Innovations featuring Emily's telemedicine setup
	('a0000002-0002-0002-0002-000000000002', 'cc33dd44-ee55-ff66-7788-99001122aabb', '22222222-2222-2222-2222-222222222222', 'featured', true, 'a75a33d8-aa13-42a9-a246-3a5c8e5c838f', '2025-06-18 12:00:00+00', '2025-06-18 11:50:00+00'),
	
	-- Design Collective featuring Alex's process
	('a0000003-0003-0003-0003-000000000003', 'ff667788-9900-1122-aabb-ccddeeff0011', '33333333-3333-3333-3333-333333333333', 'portfolio', true, '7131f030-4431-4dbf-816b-9cb4ebd2d54d', '2025-06-15 17:00:00+00', '2025-06-15 16:45:00+00'),
	
	-- DataWise Analytics featuring Jennifer's visualization work
	('a0000004-0004-0004-0004-000000000004', 'ee55ff66-7788-9900-1122-aabbccddeeff', '55555555-5555-5555-5555-555555555555', 'featured', true, 'b62e36e4-11a4-4567-979e-3f3ebbc9232d', '2025-06-22 10:00:00+00', '2025-06-22 09:45:00+00'),
	
	-- Growth Marketing Co featuring Amanda's brand work
	('a0000005-0005-0005-0005-000000000005', '00112233-aabb-ccdd-eeff-001122aabbcc', '88888888-8888-8888-8888-888888888888', 'portfolio', true, '4c6aca02-ccd6-46b6-ae8f-3969e32cb873', '2025-06-21 11:00:00+00', '2025-06-21 10:45:00+00');

-- =====================================================
-- GROUP PHOTO SHOWCASES
-- =====================================================

-- Create table for group photo showcases
CREATE TABLE IF NOT EXISTS group_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
    photo_type VARCHAR(50) NOT NULL CHECK (photo_type IN ('cover', 'featured', 'member_showcase')),
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(group_id, photo_id)
);

-- Associate photos with relevant groups
INSERT INTO "public"."group_photos" ("id", "group_id", "photo_id", "photo_type", "created_at") VALUES
	-- Web Developers Guild featuring Sarah's setup
	('00000001-0001-0001-0001-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'member_showcase', '2025-06-20 15:30:00+00'),
	('00000002-0002-0002-0002-000000000002', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'featured', '2025-06-19 10:00:00+00'),
	
	-- AI & Machine Learning Enthusiasts featuring Jennifer's data viz
	('00000003-0003-0003-0003-000000000003', '22222222-2222-2222-2222-222222222222', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'cover', '2025-06-22 10:30:00+00'),
	
	-- Data Science & Analytics group featuring Jennifer's work
	('00000004-0004-0004-0004-000000000004', '55555555-5555-5555-5555-555555555555', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'featured', '2025-06-22 10:35:00+00');

-- =====================================================
-- NEWSLETTER PHOTO FEATURE TRACKING
-- =====================================================

-- Create table to track which photos have been featured in newsletters
CREATE TABLE IF NOT EXISTS newsletter_photo_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES newsletter_campaigns(id) ON DELETE CASCADE,
    photo_id UUID NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
    feature_type VARCHAR(50) NOT NULL CHECK (feature_type IN ('hero', 'featured', 'gallery', 'thumbnail')),
    click_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(campaign_id, photo_id, feature_type)
);

-- Track photo features in sent newsletters
INSERT INTO "public"."newsletter_photo_features" ("id", "campaign_id", "photo_id", "feature_type", "click_count", "created_at") VALUES
	-- June 15 digest featuring Jennifer's data visualization as hero
	('f0000001-0001-0001-0001-000000000001', '70000001-0001-0001-0001-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'hero', 12, '2025-06-15 09:10:00+00'),
	
	-- June 15 digest featuring Sarah's workspace in gallery section
	('f0000002-0002-0002-0002-000000000002', '70000001-0001-0001-0001-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'gallery', 5, '2025-06-15 09:10:00+00'),
	
	-- AI Summit campaign featuring Emily's telemedicine setup
	('f0000003-0003-0003-0003-000000000003', '70000002-0002-0002-0002-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'featured', 8, '2025-06-08 14:25:00+00'),
	
	-- Welcome campaign featuring Amanda's brand work as inspiration
	('f0000004-0004-0004-0004-000000000004', '70000004-0004-0004-0004-000000000004', '00000003-0003-0003-0003-000000000003', 'thumbnail', 2, '2025-06-20 13:20:00+00');

COMMIT;

-- =====================================================
-- SUMMARY OF GALLERY & NEWSLETTER RELATIONSHIPS
-- =====================================================
-- Created comprehensive relationship data connecting:
-- 
-- Photo-Tag Connections:
-- - 10 photo-tag relationships linking gallery photos to the existing tag system
-- - 10 gallery-tag relationships organizing galleries by topic
-- - Added workspace, innovation, and visualization tags for better categorization
-- 
-- Newsletter Integration:
-- - Updated campaign templates to reference specific gallery photos
-- - Created newsletter_photo_features table tracking photo usage in campaigns
-- - 4 newsletter photo features with engagement tracking
-- 
-- Cross-Platform Photo Usage:
-- - Connected gallery photos to news article hero images
-- - Associated event photos through new event_photos table
-- - Enhanced marketplace listings with member workspace photos
-- - Linked educational resources to relevant gallery photos via resource_photos table
-- 
-- Company & Group Showcases:
-- - 5 company-gallery associations for portfolio showcasing
-- - 4 group photo showcases highlighting member work
-- - Approval workflow for company photo usage
-- 
-- This creates a rich, interconnected ecosystem where:
-- - Member galleries enhance company profiles
-- - Photos serve as visual content for newsletters
-- - Gallery content supports educational resources
-- - Community showcases member expertise across platforms
-- - Analytics track photo engagement across different contexts
-- =====================================================