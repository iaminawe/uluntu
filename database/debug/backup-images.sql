-- Image URL Backup Script
-- Run this BEFORE applying the fix to create backup tables

-- =====================================================
-- CREATE BACKUP TABLES
-- =====================================================

-- Backup members images
CREATE TABLE IF NOT EXISTS members_image_backup AS 
SELECT 
    id, 
    image,
    CURRENT_TIMESTAMP as backed_up_at
FROM members 
WHERE image IS NOT NULL;

-- Backup companies images
CREATE TABLE IF NOT EXISTS companies_image_backup AS 
SELECT 
    id, 
    logo, 
    cover_image,
    CURRENT_TIMESTAMP as backed_up_at
FROM companies 
WHERE logo IS NOT NULL OR cover_image IS NOT NULL;

-- Backup events images
CREATE TABLE IF NOT EXISTS events_image_backup AS 
SELECT 
    id, 
    title,
    image,
    CURRENT_TIMESTAMP as backed_up_at
FROM events 
WHERE image IS NOT NULL;

-- Backup news images
CREATE TABLE IF NOT EXISTS news_image_backup AS 
SELECT 
    id, 
    title,
    hero_image,
    CURRENT_TIMESTAMP as backed_up_at
FROM news 
WHERE hero_image IS NOT NULL;

-- Backup groups images
CREATE TABLE IF NOT EXISTS groups_image_backup AS 
SELECT 
    id, 
    name,
    cover_image,
    CURRENT_TIMESTAMP as backed_up_at
FROM groups 
WHERE cover_image IS NOT NULL;

-- Backup marketplace listings images
CREATE TABLE IF NOT EXISTS marketplace_listings_image_backup AS 
SELECT 
    id, 
    title,
    images,
    CURRENT_TIMESTAMP as backed_up_at
FROM marketplace_listings 
WHERE images IS NOT NULL AND array_length(images, 1) > 0;

-- Backup gallery photos
CREATE TABLE IF NOT EXISTS gallery_photos_image_backup AS 
SELECT 
    id, 
    title,
    thumbnail_url,
    CURRENT_TIMESTAMP as backed_up_at
FROM gallery_photos 
WHERE thumbnail_url IS NOT NULL;

-- =====================================================
-- VERIFY BACKUPS
-- =====================================================

SELECT 'Backup Tables Created:' as status;

SELECT 
    'members_image_backup' as backup_table,
    COUNT(*) as rows_backed_up
FROM members_image_backup
UNION ALL
SELECT 
    'companies_image_backup' as backup_table,
    COUNT(*) as rows_backed_up
FROM companies_image_backup
UNION ALL
SELECT 
    'events_image_backup' as backup_table,
    COUNT(*) as rows_backed_up
FROM events_image_backup
UNION ALL
SELECT 
    'news_image_backup' as backup_table,
    COUNT(*) as rows_backed_up
FROM news_image_backup
UNION ALL
SELECT 
    'groups_image_backup' as backup_table,
    COUNT(*) as rows_backed_up
FROM groups_image_backup
UNION ALL
SELECT 
    'marketplace_listings_image_backup' as backup_table,
    COUNT(*) as rows_backed_up
FROM marketplace_listings_image_backup
UNION ALL
SELECT 
    'gallery_photos_image_backup' as backup_table,
    COUNT(*) as rows_backed_up
FROM gallery_photos_image_backup;

-- =====================================================
-- ROLLBACK SCRIPT (Use if needed)
-- =====================================================

-- To rollback changes, uncomment and run these queries:

-- -- Restore members images
-- UPDATE members m
-- SET image = b.image
-- FROM members_image_backup b
-- WHERE m.id = b.id;

-- -- Restore companies images
-- UPDATE companies c
-- SET 
--     logo = b.logo,
--     cover_image = b.cover_image
-- FROM companies_image_backup b
-- WHERE c.id = b.id;

-- -- Restore events images
-- UPDATE events e
-- SET image = b.image
-- FROM events_image_backup b
-- WHERE e.id = b.id;

-- -- Restore news images
-- UPDATE news n
-- SET hero_image = b.hero_image
-- FROM news_image_backup b
-- WHERE n.id = b.id;

-- -- Restore groups images
-- UPDATE groups g
-- SET cover_image = b.cover_image
-- FROM groups_image_backup b
-- WHERE g.id = b.id;

-- -- Restore marketplace listings images
-- UPDATE marketplace_listings m
-- SET images = b.images
-- FROM marketplace_listings_image_backup b
-- WHERE m.id = b.id;

-- -- Restore gallery photos
-- UPDATE gallery_photos g
-- SET thumbnail_url = b.thumbnail_url
-- FROM gallery_photos_image_backup b
-- WHERE g.id = b.id;

-- =====================================================
-- CLEANUP SCRIPT (After verifying fix is successful)
-- =====================================================

-- To remove backup tables after verifying the fix works:

-- DROP TABLE IF EXISTS members_image_backup;
-- DROP TABLE IF EXISTS companies_image_backup;
-- DROP TABLE IF EXISTS events_image_backup;
-- DROP TABLE IF EXISTS news_image_backup;
-- DROP TABLE IF EXISTS groups_image_backup;
-- DROP TABLE IF EXISTS marketplace_listings_image_backup;
-- DROP TABLE IF EXISTS gallery_photos_image_backup;