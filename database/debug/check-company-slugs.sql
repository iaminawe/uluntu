-- Check if slug column exists and if companies have slugs
-- Run this script to diagnose the issue with company detail pages

-- 1. Check if slug column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'companies' AND column_name = 'slug';

-- 2. Check how many companies have slugs vs how many don't
SELECT 
    COUNT(*) as total_companies,
    COUNT(slug) as companies_with_slugs,
    COUNT(*) - COUNT(slug) as companies_without_slugs
FROM companies;

-- 3. Show first 10 companies and their slugs (or lack thereof)
SELECT id, name, slug, status
FROM companies
ORDER BY created_at DESC
LIMIT 10;

-- 4. If you need to manually generate slugs for companies that don't have them:
-- This generates slugs similar to the migration function
/*
UPDATE companies 
SET slug = LOWER(
    TRIM(BOTH '-' FROM 
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
                    '\s+', '-', 'g'
                ),
                '-+', '-', 'g'
            ),
            '^-+|-+$', '', 'g'
        )
    )
)
WHERE slug IS NULL OR slug = '';
*/

-- 5. Show companies that would have duplicate slugs
WITH slug_counts AS (
    SELECT 
        LOWER(
            TRIM(BOTH '-' FROM 
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        REGEXP_REPLACE(
                            REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'),
                            '\s+', '-', 'g'
                        ),
                        '-+', '-', 'g'
                    ),
                    '^-+|-+$', '', 'g'
                )
            )
        ) as generated_slug,
        COUNT(*) as count
    FROM companies
    GROUP BY generated_slug
    HAVING COUNT(*) > 1
)
SELECT * FROM slug_counts;