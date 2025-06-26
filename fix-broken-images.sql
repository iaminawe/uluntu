-- SQL Script to Fix Broken Image URLs in Production Database
-- Replace placeholder and broken image URLs with working Unsplash URLs
-- Created by: Agent 3 - Image URL Fix Specialist
-- Date: 2025-06-25

-- IMPORTANT: This script uses Unsplash's reliable image service pattern
-- Pattern: https://images.unsplash.com/photo-{PHOTO_ID}?{PARAMS}
-- All images use appropriate aspect ratios and quality settings

-- =====================================================
-- 1. FIX MEMBERS TABLE - Profile Images
-- =====================================================
-- Update placeholder.com images in members table
UPDATE members 
SET image = CASE 
    -- Professional profile images for members
    WHEN image LIKE '%placeholder.com%' OR image LIKE '%via.placeholder%' THEN 
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    WHEN image LIKE '%lorempixel%' THEN 
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    WHEN image LIKE '%picsum%' AND image NOT LIKE '%picsum.photos%' THEN 
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    WHEN image LIKE '%dummyimage%' THEN 
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    WHEN image LIKE '%robohash%' THEN 
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    WHEN image LIKE 'http://%' AND image NOT LIKE 'https://%' THEN 
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    ELSE image
END
WHERE image IS NOT NULL 
  AND (image LIKE '%placeholder%' 
       OR image LIKE '%lorempixel%' 
       OR image LIKE '%picsum%' 
       OR image LIKE '%dummyimage%' 
       OR image LIKE '%robohash%'
       OR image LIKE 'http://%');

-- =====================================================
-- 2. FIX COMPANIES TABLE - Logos and Cover Images
-- =====================================================
-- Update company logos
UPDATE companies 
SET logo = CASE 
    -- Tech company logos
    WHEN logo LIKE '%placeholder.com%' OR logo LIKE '%via.placeholder%' THEN 
        'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    WHEN logo LIKE '%lorempixel%' THEN 
        'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    WHEN logo LIKE '%picsum%' AND logo NOT LIKE '%picsum.photos%' THEN 
        'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    WHEN logo LIKE '%dummyimage%' THEN 
        'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    WHEN logo LIKE 'http://%' AND logo NOT LIKE 'https://%' THEN 
        'https://images.unsplash.com/photo-1633409361618-c73427e4e206?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    ELSE logo
END
WHERE logo IS NOT NULL 
  AND (logo LIKE '%placeholder%' 
       OR logo LIKE '%lorempixel%' 
       OR logo LIKE '%picsum%' 
       OR logo LIKE '%dummyimage%'
       OR logo LIKE 'http://%');

-- Update company cover images
UPDATE companies 
SET cover_image = CASE 
    -- Office/workplace images for cover
    WHEN cover_image LIKE '%placeholder.com%' OR cover_image LIKE '%via.placeholder%' THEN 
        'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    WHEN cover_image LIKE '%lorempixel%' THEN 
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    WHEN cover_image LIKE '%picsum%' AND cover_image NOT LIKE '%picsum.photos%' THEN 
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    WHEN cover_image LIKE '%dummyimage%' THEN 
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    WHEN cover_image LIKE 'http://%' AND cover_image NOT LIKE 'https://%' THEN 
        'https://images.unsplash.com/photo-1497366858526-0766cadbe8fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ELSE cover_image
END
WHERE cover_image IS NOT NULL 
  AND (cover_image LIKE '%placeholder%' 
       OR cover_image LIKE '%lorempixel%' 
       OR cover_image LIKE '%picsum%' 
       OR cover_image LIKE '%dummyimage%'
       OR cover_image LIKE 'http://%');

-- =====================================================
-- 3. FIX EVENTS TABLE - Event Images
-- =====================================================
UPDATE events 
SET image = CASE 
    -- Event/conference images
    WHEN image LIKE '%placeholder.com%' OR image LIKE '%via.placeholder%' THEN 
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    WHEN image LIKE '%lorempixel%' THEN 
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    WHEN image LIKE '%picsum%' AND image NOT LIKE '%picsum.photos%' THEN 
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    WHEN image LIKE '%dummyimage%' THEN 
        'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    WHEN image LIKE 'http://%' AND image NOT LIKE 'https://%' THEN 
        'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
    ELSE image
END
WHERE image IS NOT NULL 
  AND (image LIKE '%placeholder%' 
       OR image LIKE '%lorempixel%' 
       OR image LIKE '%picsum%' 
       OR image LIKE '%dummyimage%'
       OR image LIKE 'http://%');

-- =====================================================
-- 4. FIX NEWS TABLE - Hero Images
-- =====================================================
UPDATE news 
SET hero_image = CASE 
    -- News/article hero images
    WHEN hero_image LIKE '%placeholder.com%' OR hero_image LIKE '%via.placeholder%' THEN 
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    WHEN hero_image LIKE '%lorempixel%' THEN 
        'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    WHEN hero_image LIKE '%picsum%' AND hero_image NOT LIKE '%picsum.photos%' THEN 
        'https://images.unsplash.com/photo-1585241645927-c7a8e5840c42?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    WHEN hero_image LIKE '%dummyimage%' THEN 
        'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    WHEN hero_image LIKE 'http://%' AND hero_image NOT LIKE 'https://%' THEN 
        'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ELSE hero_image
END
WHERE hero_image IS NOT NULL 
  AND (hero_image LIKE '%placeholder%' 
       OR hero_image LIKE '%lorempixel%' 
       OR hero_image LIKE '%picsum%' 
       OR hero_image LIKE '%dummyimage%'
       OR hero_image LIKE 'http://%');

-- =====================================================
-- 5. FIX GROUPS TABLE - Cover Images
-- =====================================================
UPDATE groups 
SET cover_image = CASE 
    -- Community/group images
    WHEN cover_image LIKE '%placeholder.com%' OR cover_image LIKE '%via.placeholder%' THEN 
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    WHEN cover_image LIKE '%lorempixel%' THEN 
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    WHEN cover_image LIKE '%picsum%' AND cover_image NOT LIKE '%picsum.photos%' THEN 
        'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    WHEN cover_image LIKE '%dummyimage%' THEN 
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    WHEN cover_image LIKE 'http://%' AND cover_image NOT LIKE 'https://%' THEN 
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80'
    ELSE cover_image
END
WHERE cover_image IS NOT NULL 
  AND (cover_image LIKE '%placeholder%' 
       OR cover_image LIKE '%lorempixel%' 
       OR cover_image LIKE '%picsum%' 
       OR cover_image LIKE '%dummyimage%'
       OR cover_image LIKE 'http://%');

-- =====================================================
-- 6. FIX MARKETPLACE_LISTINGS TABLE - Image Arrays
-- =====================================================
-- For marketplace listings with image arrays, we need a different approach
-- First, let's identify and fix single placeholder images
UPDATE marketplace_listings 
SET images = ARRAY[
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
]
WHERE images IS NOT NULL 
  AND array_length(images, 1) = 1
  AND (images[1] LIKE '%placeholder%' 
       OR images[1] LIKE '%lorempixel%' 
       OR images[1] LIKE '%picsum%' 
       OR images[1] LIKE '%dummyimage%'
       OR images[1] LIKE 'http://%');

-- For marketplace listings with multiple placeholder images
UPDATE marketplace_listings 
SET images = CASE 
    WHEN type = 'product' THEN ARRAY[
        'https://images.unsplash.com/photo-1491553895911-0055eca6402d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
    WHEN type = 'service' THEN ARRAY[
        'https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
    ELSE ARRAY[
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ]
END
WHERE images IS NOT NULL 
  AND array_length(images, 1) > 0
  AND EXISTS (
    SELECT 1 FROM unnest(images) AS img 
    WHERE img LIKE '%placeholder%' 
       OR img LIKE '%lorempixel%' 
       OR img LIKE '%picsum%' 
       OR img LIKE '%dummyimage%'
       OR img LIKE 'http://%'
  );

-- =====================================================
-- 7. FIX GALLERY_PHOTOS TABLE - Thumbnails
-- =====================================================
UPDATE gallery_photos 
SET thumbnail_url = CASE 
    -- Nature/landscape thumbnails for gallery
    WHEN thumbnail_url LIKE '%placeholder.com%' OR thumbnail_url LIKE '%via.placeholder%' THEN 
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    WHEN thumbnail_url LIKE '%lorempixel%' THEN 
        'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    WHEN thumbnail_url LIKE '%picsum%' AND thumbnail_url NOT LIKE '%picsum.photos%' THEN 
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    WHEN thumbnail_url LIKE '%dummyimage%' THEN 
        'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    WHEN thumbnail_url LIKE 'http://%' AND thumbnail_url NOT LIKE 'https://%' THEN 
        'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
    ELSE thumbnail_url
END
WHERE thumbnail_url IS NOT NULL 
  AND (thumbnail_url LIKE '%placeholder%' 
       OR thumbnail_url LIKE '%lorempixel%' 
       OR thumbnail_url LIKE '%picsum%' 
       OR thumbnail_url LIKE '%dummyimage%'
       OR thumbnail_url LIKE 'http://%');

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================
-- Run these queries to verify the fixes:

-- Check remaining broken images in members
SELECT COUNT(*) as broken_member_images 
FROM members 
WHERE image IS NOT NULL 
  AND (image LIKE '%placeholder%' 
       OR image LIKE '%lorempixel%' 
       OR image LIKE '%picsum%' 
       OR image LIKE '%dummyimage%'
       OR image LIKE 'http://%');

-- Check remaining broken images in companies
SELECT COUNT(*) as broken_company_logos 
FROM companies 
WHERE logo IS NOT NULL 
  AND (logo LIKE '%placeholder%' 
       OR logo LIKE '%lorempixel%' 
       OR logo LIKE '%picsum%' 
       OR logo LIKE '%dummyimage%'
       OR logo LIKE 'http://%');

-- Check remaining broken images in events
SELECT COUNT(*) as broken_event_images 
FROM events 
WHERE image IS NOT NULL 
  AND (image LIKE '%placeholder%' 
       OR image LIKE '%lorempixel%' 
       OR image LIKE '%picsum%' 
       OR image LIKE '%dummyimage%'
       OR image LIKE 'http://%');

-- =====================================================
-- ROLLBACK SCRIPT (IF NEEDED)
-- =====================================================
-- To create a rollback, first backup the current state:
-- CREATE TABLE members_image_backup AS 
-- SELECT id, image FROM members WHERE image IS NOT NULL;
-- 
-- CREATE TABLE companies_image_backup AS 
-- SELECT id, logo, cover_image FROM companies WHERE logo IS NOT NULL OR cover_image IS NOT NULL;
-- 
-- CREATE TABLE events_image_backup AS 
-- SELECT id, image FROM events WHERE image IS NOT NULL;
-- 
-- CREATE TABLE news_image_backup AS 
-- SELECT id, hero_image FROM news WHERE hero_image IS NOT NULL;
-- 
-- CREATE TABLE groups_image_backup AS 
-- SELECT id, cover_image FROM groups WHERE cover_image IS NOT NULL;
-- 
-- CREATE TABLE marketplace_listings_image_backup AS 
-- SELECT id, images FROM marketplace_listings WHERE images IS NOT NULL;
-- 
-- CREATE TABLE gallery_photos_image_backup AS 
-- SELECT id, thumbnail_url FROM gallery_photos WHERE thumbnail_url IS NOT NULL;

-- =====================================================
-- END OF SCRIPT
-- =====================================================