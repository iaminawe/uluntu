-- Populate slugs for existing members that don't have them
-- This migration generates slugs from member names

-- Function to generate a slug from text
CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text AS $$
DECLARE
    slug text;
BEGIN
    -- Convert to lowercase and replace spaces/special chars with hyphens
    slug := lower(input_text);
    slug := regexp_replace(slug, '[^a-z0-9\s-]', '', 'g');
    slug := regexp_replace(slug, '\s+', '-', 'g');
    slug := regexp_replace(slug, '-+', '-', 'g');
    slug := regexp_replace(slug, '^-+|-+$', '', 'g');
    
    -- If slug is empty, use 'member'
    IF slug = '' OR slug IS NULL THEN
        slug := 'member';
    END IF;
    
    RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure slug uniqueness
CREATE OR REPLACE FUNCTION ensure_unique_slug(base_slug text, exclude_id uuid DEFAULT NULL)
RETURNS text AS $$
DECLARE
    final_slug text;
    counter integer := 1;
    exists_count integer;
BEGIN
    final_slug := base_slug;
    
    -- Check if slug already exists (excluding current record if ID provided)
    IF exclude_id IS NOT NULL THEN
        SELECT COUNT(*) INTO exists_count 
        FROM members 
        WHERE slug = final_slug AND id != exclude_id;
    ELSE
        SELECT COUNT(*) INTO exists_count 
        FROM members 
        WHERE slug = final_slug;
    END IF;
    
    -- If exists, add counter until unique
    WHILE exists_count > 0 LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
        
        IF exclude_id IS NOT NULL THEN
            SELECT COUNT(*) INTO exists_count 
            FROM members 
            WHERE slug = final_slug AND id != exclude_id;
        ELSE
            SELECT COUNT(*) INTO exists_count 
            FROM members 
            WHERE slug = final_slug;
        END IF;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update all members without slugs
DO $$
DECLARE
    member_record RECORD;
    base_slug text;
    final_slug text;
BEGIN
    -- Loop through all members without slugs
    FOR member_record IN 
        SELECT id, name 
        FROM members 
        WHERE slug IS NULL OR slug = ''
        ORDER BY created_at
    LOOP
        -- Generate base slug from name
        base_slug := generate_slug(member_record.name);
        
        -- Ensure uniqueness
        final_slug := ensure_unique_slug(base_slug, member_record.id);
        
        -- Update the member with the new slug
        UPDATE members 
        SET slug = final_slug 
        WHERE id = member_record.id;
        
        RAISE NOTICE 'Updated member % with slug %', member_record.name, final_slug;
    END LOOP;
END $$;

-- Add a trigger to automatically generate slugs for new members
CREATE OR REPLACE FUNCTION auto_generate_member_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug text;
BEGIN
    -- Only generate if slug is not provided
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        base_slug := generate_slug(NEW.name);
        NEW.slug := ensure_unique_slug(base_slug, NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS generate_member_slug_trigger ON members;
CREATE TRIGGER generate_member_slug_trigger
    BEFORE INSERT OR UPDATE OF name ON members
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_member_slug();

-- Verify all members now have slugs
DO $$
DECLARE
    count_without_slugs integer;
BEGIN
    SELECT COUNT(*) INTO count_without_slugs
    FROM members 
    WHERE slug IS NULL OR slug = '';
    
    IF count_without_slugs > 0 THEN
        RAISE EXCEPTION 'Found % members without slugs after migration', count_without_slugs;
    ELSE
        RAISE NOTICE 'All members now have slugs';
    END IF;
END $$;