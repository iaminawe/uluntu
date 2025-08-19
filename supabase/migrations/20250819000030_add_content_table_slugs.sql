-- Add slug fields to all content tables and create utility functions
-- This migration is idempotent and safe to run multiple times

-- Create utility function for generating slugs from text
CREATE OR REPLACE FUNCTION generate_slug_from_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL OR TRIM(input_text) = '' THEN
        RETURN '';
    END IF;
    
    RETURN LOWER(
        TRIM(
            BOTH '-' FROM
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        input_text,
                        '[^a-zA-Z0-9\s-]', '', 'g'  -- Remove special characters
                    ),
                    '\s+', '-', 'g'  -- Replace spaces with hyphens
                ),
                '-+', '-', 'g'  -- Replace multiple hyphens with single hyphen
            )
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to ensure unique slugs within a table
CREATE OR REPLACE FUNCTION ensure_unique_slug(
    table_name TEXT,
    slug_column TEXT,
    proposed_slug TEXT,
    exclude_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
    exists_check BOOLEAN;
BEGIN
    base_slug := proposed_slug;
    final_slug := base_slug;
    
    -- Check if slug exists, excluding the current record if updating
    LOOP
        IF exclude_id IS NOT NULL THEN
            EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE %I = $1 AND id != $2)', 
                          table_name, slug_column) 
            INTO exists_check 
            USING final_slug, exclude_id;
        ELSE
            EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE %I = $1)', 
                          table_name, slug_column) 
            INTO exists_check 
            USING final_slug;
        END IF;
        
        EXIT WHEN NOT exists_check;
        
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 1. ADD SLUG FIELD TO MEMBERS TABLE
-- ===================================================================

DO $$
BEGIN
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'members' AND column_name = 'slug'
    ) THEN
        ALTER TABLE members ADD COLUMN slug TEXT;
        
        -- Create index for performance
        CREATE INDEX idx_members_slug ON members(slug);
        
        -- Add comment
        COMMENT ON COLUMN members.slug IS 'URL-friendly slug generated from member name';
        
        RAISE NOTICE 'Added slug column to members table';
    ELSE
        RAISE NOTICE 'Slug column already exists in members table';
    END IF;
END $$;

-- Populate member slugs from name field
UPDATE members 
SET slug = ensure_unique_slug(
    'members', 
    'slug', 
    generate_slug_from_text(name),
    id
)
WHERE slug IS NULL OR slug = '';

-- Add unique constraint after population
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'members' AND constraint_name = 'members_slug_unique'
    ) THEN
        ALTER TABLE members DROP CONSTRAINT members_slug_unique;
    END IF;
    
    -- Add unique constraint only if all slugs are populated
    IF NOT EXISTS (SELECT 1 FROM members WHERE slug IS NULL OR slug = '') THEN
        ALTER TABLE members ADD CONSTRAINT members_slug_unique UNIQUE (slug);
        ALTER TABLE members ALTER COLUMN slug SET NOT NULL;
        RAISE NOTICE 'Added unique constraint and NOT NULL to members.slug';
    ELSE
        RAISE NOTICE 'Skipping unique constraint on members.slug - some records still have NULL slugs';
    END IF;
END $$;

-- ===================================================================
-- 2. ADD SLUG FIELD TO EVENTS TABLE
-- ===================================================================

DO $$
BEGIN
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'slug'
    ) THEN
        ALTER TABLE events ADD COLUMN slug TEXT;
        
        -- Create index for performance
        CREATE INDEX idx_events_slug ON events(slug);
        
        -- Add comment
        COMMENT ON COLUMN events.slug IS 'URL-friendly slug generated from event title';
        
        RAISE NOTICE 'Added slug column to events table';
    ELSE
        RAISE NOTICE 'Slug column already exists in events table';
    END IF;
END $$;

-- Populate event slugs from title field
UPDATE events 
SET slug = ensure_unique_slug(
    'events', 
    'slug', 
    generate_slug_from_text(title),
    id
)
WHERE slug IS NULL OR slug = '';

-- Add unique constraint after population
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'events' AND constraint_name = 'events_slug_unique'
    ) THEN
        ALTER TABLE events DROP CONSTRAINT events_slug_unique;
    END IF;
    
    -- Add unique constraint only if all slugs are populated
    IF NOT EXISTS (SELECT 1 FROM events WHERE slug IS NULL OR slug = '') THEN
        ALTER TABLE events ADD CONSTRAINT events_slug_unique UNIQUE (slug);
        ALTER TABLE events ALTER COLUMN slug SET NOT NULL;
        RAISE NOTICE 'Added unique constraint and NOT NULL to events.slug';
    ELSE
        RAISE NOTICE 'Skipping unique constraint on events.slug - some records still have NULL slugs';
    END IF;
END $$;

-- ===================================================================
-- 3. ADD SLUG FIELD TO OPPORTUNITIES TABLE
-- ===================================================================

DO $$
BEGIN
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'opportunities' AND column_name = 'slug'
    ) THEN
        ALTER TABLE opportunities ADD COLUMN slug TEXT;
        
        -- Create index for performance
        CREATE INDEX idx_opportunities_slug ON opportunities(slug);
        
        -- Add comment
        COMMENT ON COLUMN opportunities.slug IS 'URL-friendly slug generated from opportunity title';
        
        RAISE NOTICE 'Added slug column to opportunities table';
    ELSE
        RAISE NOTICE 'Slug column already exists in opportunities table';
    END IF;
END $$;

-- Populate opportunity slugs from title field
UPDATE opportunities 
SET slug = ensure_unique_slug(
    'opportunities', 
    'slug', 
    generate_slug_from_text(title),
    id
)
WHERE slug IS NULL OR slug = '';

-- Add unique constraint after population
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'opportunities' AND constraint_name = 'opportunities_slug_unique'
    ) THEN
        ALTER TABLE opportunities DROP CONSTRAINT opportunities_slug_unique;
    END IF;
    
    -- Add unique constraint only if all slugs are populated
    IF NOT EXISTS (SELECT 1 FROM opportunities WHERE slug IS NULL OR slug = '') THEN
        ALTER TABLE opportunities ADD CONSTRAINT opportunities_slug_unique UNIQUE (slug);
        ALTER TABLE opportunities ALTER COLUMN slug SET NOT NULL;
        RAISE NOTICE 'Added unique constraint and NOT NULL to opportunities.slug';
    ELSE
        RAISE NOTICE 'Skipping unique constraint on opportunities.slug - some records still have NULL slugs';
    END IF;
END $$;

-- ===================================================================
-- 4. ADD SLUG FIELD TO GROUPS TABLE
-- ===================================================================

DO $$
BEGIN
    -- Add slug column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'groups' AND column_name = 'slug'
    ) THEN
        ALTER TABLE groups ADD COLUMN slug TEXT;
        
        -- Create index for performance
        CREATE INDEX idx_groups_slug ON groups(slug);
        
        -- Add comment
        COMMENT ON COLUMN groups.slug IS 'URL-friendly slug generated from group name';
        
        RAISE NOTICE 'Added slug column to groups table';
    ELSE
        RAISE NOTICE 'Slug column already exists in groups table';
    END IF;
END $$;

-- Populate group slugs from name field
UPDATE groups 
SET slug = ensure_unique_slug(
    'groups', 
    'slug', 
    generate_slug_from_text(name),
    id
)
WHERE slug IS NULL OR slug = '';

-- Add unique constraint after population
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'groups' AND constraint_name = 'groups_slug_unique'
    ) THEN
        ALTER TABLE groups DROP CONSTRAINT groups_slug_unique;
    END IF;
    
    -- Add unique constraint only if all slugs are populated
    IF NOT EXISTS (SELECT 1 FROM groups WHERE slug IS NULL OR slug = '') THEN
        ALTER TABLE groups ADD CONSTRAINT groups_slug_unique UNIQUE (slug);
        ALTER TABLE groups ALTER COLUMN slug SET NOT NULL;
        RAISE NOTICE 'Added unique constraint and NOT NULL to groups.slug';
    ELSE
        RAISE NOTICE 'Skipping unique constraint on groups.slug - some records still have NULL slugs';
    END IF;
END $$;

-- ===================================================================
-- 5. ENSURE NEWS TABLE HAS PROPER SLUG CONSTRAINTS (already has slug)
-- ===================================================================

-- Verify news table slug setup (should already be done from previous migration)
DO $$
BEGIN
    -- Populate any missing news slugs
    IF EXISTS (SELECT 1 FROM news WHERE slug IS NULL OR slug = '') THEN
        UPDATE news 
        SET slug = ensure_unique_slug(
            'news', 
            'slug', 
            generate_slug_from_text(title),
            id
        )
        WHERE slug IS NULL OR slug = '';
        
        RAISE NOTICE 'Updated missing slugs in news table';
    END IF;
    
    -- Ensure unique constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'news' AND constraint_name = 'news_slug_unique'
    ) THEN
        ALTER TABLE news ADD CONSTRAINT news_slug_unique UNIQUE (slug);
        RAISE NOTICE 'Added unique constraint to news.slug';
    END IF;
    
    -- Ensure NOT NULL constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'news' AND column_name = 'slug' AND is_nullable = 'NO'
    ) THEN
        IF NOT EXISTS (SELECT 1 FROM news WHERE slug IS NULL OR slug = '') THEN
            ALTER TABLE news ALTER COLUMN slug SET NOT NULL;
            RAISE NOTICE 'Added NOT NULL constraint to news.slug';
        END IF;
    END IF;
END $$;

-- ===================================================================
-- 6. CREATE TRIGGERS FOR AUTOMATIC SLUG GENERATION
-- ===================================================================

-- Function to automatically generate slugs on insert/update
CREATE OR REPLACE FUNCTION auto_generate_slug() RETURNS TRIGGER AS $$
DECLARE
    source_column TEXT;
    slug_value TEXT;
BEGIN
    -- Determine source column based on table
    CASE TG_TABLE_NAME
        WHEN 'members' THEN source_column := NEW.name;
        WHEN 'events' THEN source_column := NEW.title;
        WHEN 'opportunities' THEN source_column := NEW.title;
        WHEN 'groups' THEN source_column := NEW.name;
        WHEN 'news' THEN source_column := NEW.title;
        ELSE 
            RAISE EXCEPTION 'Unsupported table for auto slug generation: %', TG_TABLE_NAME;
    END CASE;
    
    -- Generate slug if not provided or empty
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        slug_value := generate_slug_from_text(source_column);
        NEW.slug := ensure_unique_slug(TG_TABLE_NAME, 'slug', slug_value, NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each table
DROP TRIGGER IF EXISTS auto_generate_members_slug ON members;
CREATE TRIGGER auto_generate_members_slug
    BEFORE INSERT OR UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS auto_generate_events_slug ON events;
CREATE TRIGGER auto_generate_events_slug
    BEFORE INSERT OR UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS auto_generate_opportunities_slug ON opportunities;
CREATE TRIGGER auto_generate_opportunities_slug
    BEFORE INSERT OR UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS auto_generate_groups_slug ON groups;
CREATE TRIGGER auto_generate_groups_slug
    BEFORE INSERT OR UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_slug();

DROP TRIGGER IF EXISTS auto_generate_news_slug ON news;
CREATE TRIGGER auto_generate_news_slug
    BEFORE INSERT OR UPDATE ON news
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_slug();

-- ===================================================================
-- 7. CREATE HELPER FUNCTIONS FOR SLUG MANAGEMENT
-- ===================================================================

-- Function to manually regenerate all slugs for a table
CREATE OR REPLACE FUNCTION regenerate_table_slugs(table_name TEXT)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    source_column TEXT;
    query TEXT;
BEGIN
    -- Determine source column based on table
    CASE table_name
        WHEN 'members' THEN source_column := 'name';
        WHEN 'events', 'opportunities', 'news' THEN source_column := 'title';
        WHEN 'groups' THEN source_column := 'name';
        ELSE 
            RAISE EXCEPTION 'Unsupported table for slug regeneration: %', table_name;
    END CASE;
    
    -- Build and execute update query
    query := format(
        'UPDATE %I SET slug = ensure_unique_slug(%L, ''slug'', generate_slug_from_text(%I), id)',
        table_name, table_name, source_column
    );
    
    EXECUTE query;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to check for duplicate slugs across all tables
CREATE OR REPLACE FUNCTION check_duplicate_slugs()
RETURNS TABLE(table_name TEXT, slug TEXT, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 'members'::TEXT, m.slug, COUNT(*)::BIGINT
    FROM members m
    WHERE m.slug IS NOT NULL
    GROUP BY m.slug
    HAVING COUNT(*) > 1
    
    UNION ALL
    
    SELECT 'events'::TEXT, e.slug, COUNT(*)::BIGINT
    FROM events e
    WHERE e.slug IS NOT NULL
    GROUP BY e.slug
    HAVING COUNT(*) > 1
    
    UNION ALL
    
    SELECT 'opportunities'::TEXT, o.slug, COUNT(*)::BIGINT
    FROM opportunities o
    WHERE o.slug IS NOT NULL
    GROUP BY o.slug
    HAVING COUNT(*) > 1
    
    UNION ALL
    
    SELECT 'groups'::TEXT, g.slug, COUNT(*)::BIGINT
    FROM groups g
    WHERE g.slug IS NOT NULL
    GROUP BY g.slug
    HAVING COUNT(*) > 1
    
    UNION ALL
    
    SELECT 'news'::TEXT, n.slug, COUNT(*)::BIGINT
    FROM news n
    WHERE n.slug IS NOT NULL
    GROUP BY n.slug
    HAVING COUNT(*) > 1;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- 8. FINAL VERIFICATION AND SUMMARY
-- ===================================================================

DO $$
DECLARE
    members_count INTEGER;
    events_count INTEGER;
    opportunities_count INTEGER;
    groups_count INTEGER;
    news_count INTEGER;
    total_slugs INTEGER;
BEGIN
    -- Count records with slugs
    SELECT COUNT(*) INTO members_count FROM members WHERE slug IS NOT NULL;
    SELECT COUNT(*) INTO events_count FROM events WHERE slug IS NOT NULL;
    SELECT COUNT(*) INTO opportunities_count FROM opportunities WHERE slug IS NOT NULL;
    SELECT COUNT(*) INTO groups_count FROM groups WHERE slug IS NOT NULL;
    SELECT COUNT(*) INTO news_count FROM news WHERE slug IS NOT NULL;
    
    total_slugs := members_count + events_count + opportunities_count + groups_count + news_count;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SLUG MIGRATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Members with slugs: %', members_count;
    RAISE NOTICE 'Events with slugs: %', events_count;
    RAISE NOTICE 'Opportunities with slugs: %', opportunities_count;
    RAISE NOTICE 'Groups with slugs: %', groups_count;
    RAISE NOTICE 'News with slugs: %', news_count;
    RAISE NOTICE 'Total records with slugs: %', total_slugs;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Available functions:';
    RAISE NOTICE '- generate_slug_from_text(text) - Generate slug from any text';
    RAISE NOTICE '- ensure_unique_slug(table, column, slug, exclude_id) - Ensure slug uniqueness';
    RAISE NOTICE '- regenerate_table_slugs(table_name) - Regenerate all slugs for a table';
    RAISE NOTICE '- check_duplicate_slugs() - Find duplicate slugs across all tables';
    RAISE NOTICE '========================================';
END $$;