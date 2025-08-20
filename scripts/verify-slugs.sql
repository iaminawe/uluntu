-- Verification script for slug implementation
-- Run this after applying migrations to verify everything worked

-- Check if slug columns exist
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND column_name = 'slug'
    AND table_name IN ('members', 'events', 'opportunities', 'groups', 'news', 'companies')
ORDER BY table_name;

-- Count records with and without slugs for each table
SELECT 'members' as table_name, 
       COUNT(*) as total_records,
       COUNT(slug) as records_with_slug,
       COUNT(*) - COUNT(slug) as records_without_slug
FROM public.members
UNION ALL
SELECT 'events', COUNT(*), COUNT(slug), COUNT(*) - COUNT(slug)
FROM public.events
UNION ALL
SELECT 'opportunities', COUNT(*), COUNT(slug), COUNT(*) - COUNT(slug)
FROM public.opportunities
UNION ALL
SELECT 'groups', COUNT(*), COUNT(slug), COUNT(*) - COUNT(slug)
FROM public.groups
UNION ALL
SELECT 'news', COUNT(*), COUNT(slug), COUNT(*) - COUNT(slug)
FROM public.news
UNION ALL
SELECT 'companies', COUNT(*), COUNT(slug), COUNT(*) - COUNT(slug)
FROM public.companies
ORDER BY table_name;

-- Check for duplicate slugs (should return 0 rows)
SELECT 'members' as table_name, slug, COUNT(*) as count
FROM public.members
WHERE slug IS NOT NULL
GROUP BY slug
HAVING COUNT(*) > 1
UNION ALL
SELECT 'events', slug, COUNT(*)
FROM public.events
WHERE slug IS NOT NULL
GROUP BY slug
HAVING COUNT(*) > 1
UNION ALL
SELECT 'opportunities', slug, COUNT(*)
FROM public.opportunities
WHERE slug IS NOT NULL
GROUP BY slug
HAVING COUNT(*) > 1
UNION ALL
SELECT 'groups', slug, COUNT(*)
FROM public.groups
WHERE slug IS NOT NULL
GROUP BY slug
HAVING COUNT(*) > 1;

-- Sample some generated slugs
SELECT 'Sample Member Slugs:' as info;
SELECT id, name, slug FROM public.members LIMIT 5;

SELECT 'Sample Event Slugs:' as info;
SELECT id, title, slug FROM public.events LIMIT 5;

SELECT 'Sample Opportunity Slugs:' as info;
SELECT id, title, slug FROM public.opportunities LIMIT 5;

SELECT 'Sample Group Slugs:' as info;
SELECT id, name, slug FROM public.groups LIMIT 5;

-- Check if triggers exist
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%slug%'
ORDER BY event_object_table, trigger_name;