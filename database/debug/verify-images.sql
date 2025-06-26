-- Image URL Verification Script
-- Run this after applying the fix to ensure all broken images are resolved

-- =====================================================
-- COMPREHENSIVE IMAGE URL VERIFICATION
-- =====================================================

-- Create a summary report of all image URLs
WITH image_report AS (
    -- Members table
    SELECT 
        'members' as table_name,
        'image' as column_name,
        COUNT(*) FILTER (WHERE image IS NOT NULL) as total_images,
        COUNT(*) FILTER (WHERE image LIKE '%placeholder%' OR image LIKE '%lorempixel%' OR image LIKE '%picsum%' OR image LIKE '%dummyimage%' OR image LIKE 'http://%') as broken_images,
        COUNT(*) FILTER (WHERE image LIKE '%unsplash.com%') as unsplash_images,
        COUNT(*) FILTER (WHERE image IS NULL) as null_images
    FROM members
    
    UNION ALL
    
    -- Companies logo
    SELECT 
        'companies' as table_name,
        'logo' as column_name,
        COUNT(*) FILTER (WHERE logo IS NOT NULL) as total_images,
        COUNT(*) FILTER (WHERE logo LIKE '%placeholder%' OR logo LIKE '%lorempixel%' OR logo LIKE '%picsum%' OR logo LIKE '%dummyimage%' OR logo LIKE 'http://%') as broken_images,
        COUNT(*) FILTER (WHERE logo LIKE '%unsplash.com%') as unsplash_images,
        COUNT(*) FILTER (WHERE logo IS NULL) as null_images
    FROM companies
    
    UNION ALL
    
    -- Companies cover_image
    SELECT 
        'companies' as table_name,
        'cover_image' as column_name,
        COUNT(*) FILTER (WHERE cover_image IS NOT NULL) as total_images,
        COUNT(*) FILTER (WHERE cover_image LIKE '%placeholder%' OR cover_image LIKE '%lorempixel%' OR cover_image LIKE '%picsum%' OR cover_image LIKE '%dummyimage%' OR cover_image LIKE 'http://%') as broken_images,
        COUNT(*) FILTER (WHERE cover_image LIKE '%unsplash.com%') as unsplash_images,
        COUNT(*) FILTER (WHERE cover_image IS NULL) as null_images
    FROM companies
    
    UNION ALL
    
    -- Events
    SELECT 
        'events' as table_name,
        'image' as column_name,
        COUNT(*) FILTER (WHERE image IS NOT NULL) as total_images,
        COUNT(*) FILTER (WHERE image LIKE '%placeholder%' OR image LIKE '%lorempixel%' OR image LIKE '%picsum%' OR image LIKE '%dummyimage%' OR image LIKE 'http://%') as broken_images,
        COUNT(*) FILTER (WHERE image LIKE '%unsplash.com%') as unsplash_images,
        COUNT(*) FILTER (WHERE image IS NULL) as null_images
    FROM events
    
    UNION ALL
    
    -- News
    SELECT 
        'news' as table_name,
        'hero_image' as column_name,
        COUNT(*) FILTER (WHERE hero_image IS NOT NULL) as total_images,
        COUNT(*) FILTER (WHERE hero_image LIKE '%placeholder%' OR hero_image LIKE '%lorempixel%' OR hero_image LIKE '%picsum%' OR hero_image LIKE '%dummyimage%' OR hero_image LIKE 'http://%') as broken_images,
        COUNT(*) FILTER (WHERE hero_image LIKE '%unsplash.com%') as unsplash_images,
        COUNT(*) FILTER (WHERE hero_image IS NULL) as null_images
    FROM news
    
    UNION ALL
    
    -- Groups
    SELECT 
        'groups' as table_name,
        'cover_image' as column_name,
        COUNT(*) FILTER (WHERE cover_image IS NOT NULL) as total_images,
        COUNT(*) FILTER (WHERE cover_image LIKE '%placeholder%' OR cover_image LIKE '%lorempixel%' OR cover_image LIKE '%picsum%' OR cover_image LIKE '%dummyimage%' OR cover_image LIKE 'http://%') as broken_images,
        COUNT(*) FILTER (WHERE cover_image LIKE '%unsplash.com%') as unsplash_images,
        COUNT(*) FILTER (WHERE cover_image IS NULL) as null_images
    FROM groups
    
    UNION ALL
    
    -- Gallery photos
    SELECT 
        'gallery_photos' as table_name,
        'thumbnail_url' as column_name,
        COUNT(*) FILTER (WHERE thumbnail_url IS NOT NULL) as total_images,
        COUNT(*) FILTER (WHERE thumbnail_url LIKE '%placeholder%' OR thumbnail_url LIKE '%lorempixel%' OR thumbnail_url LIKE '%picsum%' OR thumbnail_url LIKE '%dummyimage%' OR thumbnail_url LIKE 'http://%') as broken_images,
        COUNT(*) FILTER (WHERE thumbnail_url LIKE '%unsplash.com%') as unsplash_images,
        COUNT(*) FILTER (WHERE thumbnail_url IS NULL) as null_images
    FROM gallery_photos
)
SELECT 
    table_name,
    column_name,
    total_images,
    broken_images,
    unsplash_images,
    null_images,
    CASE 
        WHEN total_images > 0 THEN ROUND((broken_images::numeric / total_images) * 100, 2)
        ELSE 0 
    END as broken_percentage,
    CASE 
        WHEN total_images > 0 THEN ROUND((unsplash_images::numeric / total_images) * 100, 2)
        ELSE 0 
    END as unsplash_percentage
FROM image_report
ORDER BY table_name, column_name;

-- =====================================================
-- DETAILED BROKEN IMAGE REPORT
-- =====================================================

-- Show sample of any remaining broken images
SELECT 'Remaining Broken Images:' as report_section;

-- Members with broken images
SELECT 'Members' as table_name, id, name, image 
FROM members 
WHERE image IS NOT NULL 
  AND (image LIKE '%placeholder%' 
       OR image LIKE '%lorempixel%' 
       OR image LIKE '%picsum%' 
       OR image LIKE '%dummyimage%'
       OR image LIKE 'http://%')
LIMIT 5;

-- Companies with broken logos
SELECT 'Companies (logo)' as table_name, id, name, logo 
FROM companies 
WHERE logo IS NOT NULL 
  AND (logo LIKE '%placeholder%' 
       OR logo LIKE '%lorempixel%' 
       OR logo LIKE '%picsum%' 
       OR logo LIKE '%dummyimage%'
       OR logo LIKE 'http://%')
LIMIT 5;

-- Events with broken images
SELECT 'Events' as table_name, id, title, image 
FROM events 
WHERE image IS NOT NULL 
  AND (image LIKE '%placeholder%' 
       OR image LIKE '%lorempixel%' 
       OR image LIKE '%picsum%' 
       OR image LIKE '%dummyimage%'
       OR image LIKE 'http://%')
LIMIT 5;

-- =====================================================
-- MARKETPLACE LISTINGS SPECIAL CHECK
-- =====================================================

-- Check marketplace listings with image arrays
WITH marketplace_check AS (
    SELECT 
        id,
        title,
        images,
        array_length(images, 1) as image_count,
        EXISTS (
            SELECT 1 FROM unnest(images) AS img 
            WHERE img LIKE '%placeholder%' 
               OR img LIKE '%lorempixel%' 
               OR img LIKE '%picsum%' 
               OR img LIKE '%dummyimage%'
               OR img LIKE 'http://%'
        ) as has_broken_images
    FROM marketplace_listings
    WHERE images IS NOT NULL AND array_length(images, 1) > 0
)
SELECT 
    'Marketplace Listings Summary:' as report,
    COUNT(*) as total_listings_with_images,
    COUNT(*) FILTER (WHERE has_broken_images) as listings_with_broken_images,
    SUM(image_count) as total_images,
    ROUND(AVG(image_count), 2) as avg_images_per_listing
FROM marketplace_check;

-- Show sample marketplace listings with broken images
SELECT 
    id,
    title,
    images[1] as first_image,
    array_length(images, 1) as total_images
FROM marketplace_listings
WHERE images IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM unnest(images) AS img 
    WHERE img LIKE '%placeholder%' 
       OR img LIKE '%lorempixel%' 
       OR img LIKE '%picsum%' 
       OR img LIKE '%dummyimage%'
       OR img LIKE 'http://%'
  )
LIMIT 5;

-- =====================================================
-- IMAGE URL PATTERN ANALYSIS
-- =====================================================

-- Analyze different image URL patterns in use
WITH all_urls AS (
    SELECT image as url FROM members WHERE image IS NOT NULL
    UNION ALL
    SELECT logo as url FROM companies WHERE logo IS NOT NULL
    UNION ALL
    SELECT cover_image as url FROM companies WHERE cover_image IS NOT NULL
    UNION ALL
    SELECT image as url FROM events WHERE image IS NOT NULL
    UNION ALL
    SELECT hero_image as url FROM news WHERE hero_image IS NOT NULL
    UNION ALL
    SELECT cover_image as url FROM groups WHERE cover_image IS NOT NULL
    UNION ALL
    SELECT thumbnail_url as url FROM gallery_photos WHERE thumbnail_url IS NOT NULL
)
SELECT 
    CASE 
        WHEN url LIKE '%unsplash.com%' THEN 'Unsplash'
        WHEN url LIKE '%placeholder%' THEN 'Placeholder Service'
        WHEN url LIKE '%lorempixel%' THEN 'Lorem Pixel'
        WHEN url LIKE '%picsum%' THEN 'Picsum'
        WHEN url LIKE '%dummyimage%' THEN 'Dummy Image'
        WHEN url LIKE '%robohash%' THEN 'Robohash'
        WHEN url LIKE '%supabase%' THEN 'Supabase Storage'
        WHEN url LIKE '%cloudinary%' THEN 'Cloudinary'
        WHEN url LIKE 'http://%' THEN 'Insecure HTTP'
        WHEN url LIKE 'https://%' THEN 'Other HTTPS'
        ELSE 'Unknown'
    END as url_type,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM all_urls) * 100, 2) as percentage
FROM all_urls
GROUP BY url_type
ORDER BY count DESC;

-- =====================================================
-- FINAL SUMMARY
-- =====================================================

SELECT 
    'Image Fix Summary' as report,
    (SELECT COUNT(*) FROM members WHERE image LIKE '%unsplash.com%') as members_fixed,
    (SELECT COUNT(*) FROM companies WHERE logo LIKE '%unsplash.com%' OR cover_image LIKE '%unsplash.com%') as companies_fixed,
    (SELECT COUNT(*) FROM events WHERE image LIKE '%unsplash.com%') as events_fixed,
    (SELECT COUNT(*) FROM news WHERE hero_image LIKE '%unsplash.com%') as news_fixed,
    (SELECT COUNT(*) FROM groups WHERE cover_image LIKE '%unsplash.com%') as groups_fixed,
    (SELECT COUNT(*) FROM gallery_photos WHERE thumbnail_url LIKE '%unsplash.com%') as gallery_fixed;