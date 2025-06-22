-- Add slugs to existing news articles and ensure uniqueness

-- First, update any NULL or empty slugs
UPDATE news 
SET slug = LOWER(
    REGEXP_REPLACE(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    title,
                    '[^a-zA-Z0-9\s-]', '', 'g'  -- Remove special characters
                ),
                '\s+', '-', 'g'  -- Replace spaces with hyphens
            ),
            '^-+', '', 'g'  -- Remove leading hyphens
        ),
        '-+$', '', 'g'  -- Remove trailing hyphens
    )
)
WHERE slug IS NULL OR slug = '';

-- Handle duplicate slugs by appending numbers
WITH RECURSIVE slug_updates AS (
    -- Find all duplicate slugs
    SELECT 
        id,
        slug,
        ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at) as rn
    FROM news
    WHERE slug IS NOT NULL
)
UPDATE news
SET slug = CASE 
    WHEN su.rn = 1 THEN su.slug
    ELSE su.slug || '-' || su.rn
END
FROM slug_updates su
WHERE news.id = su.id AND su.rn > 1;

-- Add a unique constraint on the slug column
-- First drop if exists (in case of re-running migration)
ALTER TABLE news DROP CONSTRAINT IF EXISTS news_slug_unique;

-- Add the unique constraint
ALTER TABLE news ADD CONSTRAINT news_slug_unique UNIQUE (slug);

-- Create an index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);

-- Make slug NOT NULL for future inserts (only if all existing slugs are populated)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM news WHERE slug IS NULL) THEN
        ALTER TABLE news ALTER COLUMN slug SET NOT NULL;
    END IF;
END $$;