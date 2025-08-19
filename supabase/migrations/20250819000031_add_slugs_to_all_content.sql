-- Comprehensive slug implementation for all content types
-- This migration adds slug fields to events, opportunities, and groups tables

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'slug'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.events ADD COLUMN slug VARCHAR(255);
  END IF;
END $$;

-- Generate slugs for existing events
UPDATE public.events 
SET slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s\-]', '', 'g'),
    '\s+', '-', 'g'
  ),
  '-+', '-', 'g'
))
WHERE slug IS NULL OR slug = '';

-- Ensure uniqueness by adding numbers
DO $$
DECLARE
  rec RECORD;
  counter INTEGER;
  new_slug TEXT;
BEGIN
  FOR rec IN 
    SELECT slug, COUNT(*) as cnt 
    FROM public.events 
    WHERE slug IS NOT NULL 
    GROUP BY slug 
    HAVING COUNT(*) > 1
  LOOP
    counter := 1;
    FOR rec IN 
      SELECT id FROM public.events 
      WHERE slug = rec.slug 
      ORDER BY created_at
      OFFSET 1
    LOOP
      new_slug := rec.slug || '-' || counter;
      UPDATE public.events SET slug = new_slug WHERE id = rec.id;
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;

-- Add unique constraint for events
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'events_slug_unique'
  ) THEN
    ALTER TABLE public.events 
    ADD CONSTRAINT events_slug_unique UNIQUE (slug);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);

-- ============================================================================
-- OPPORTUNITIES TABLE
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'opportunities' 
    AND column_name = 'slug'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.opportunities ADD COLUMN slug VARCHAR(255);
  END IF;
END $$;

-- Generate slugs for existing opportunities
UPDATE public.opportunities 
SET slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s\-]', '', 'g'),
    '\s+', '-', 'g'
  ),
  '-+', '-', 'g'
))
WHERE slug IS NULL OR slug = '';

-- Ensure uniqueness for opportunities
DO $$
DECLARE
  rec RECORD;
  counter INTEGER;
  new_slug TEXT;
BEGIN
  FOR rec IN 
    SELECT slug, COUNT(*) as cnt 
    FROM public.opportunities 
    WHERE slug IS NOT NULL 
    GROUP BY slug 
    HAVING COUNT(*) > 1
  LOOP
    counter := 1;
    FOR rec IN 
      SELECT id FROM public.opportunities 
      WHERE slug = rec.slug 
      ORDER BY created_at
      OFFSET 1
    LOOP
      new_slug := rec.slug || '-' || counter;
      UPDATE public.opportunities SET slug = new_slug WHERE id = rec.id;
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;

-- Add unique constraint for opportunities
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'opportunities_slug_unique'
  ) THEN
    ALTER TABLE public.opportunities 
    ADD CONSTRAINT opportunities_slug_unique UNIQUE (slug);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_opportunities_slug ON public.opportunities(slug);

-- ============================================================================
-- GROUPS TABLE
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'groups' 
    AND column_name = 'slug'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.groups ADD COLUMN slug VARCHAR(255);
  END IF;
END $$;

-- Generate slugs for existing groups
UPDATE public.groups 
SET slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(name, '[^a-zA-Z0-9\s\-]', '', 'g'),
    '\s+', '-', 'g'
  ),
  '-+', '-', 'g'
))
WHERE slug IS NULL OR slug = '';

-- Ensure uniqueness for groups
DO $$
DECLARE
  rec RECORD;
  counter INTEGER;
  new_slug TEXT;
BEGIN
  FOR rec IN 
    SELECT slug, COUNT(*) as cnt 
    FROM public.groups 
    WHERE slug IS NOT NULL 
    GROUP BY slug 
    HAVING COUNT(*) > 1
  LOOP
    counter := 1;
    FOR rec IN 
      SELECT id FROM public.groups 
      WHERE slug = rec.slug 
      ORDER BY created_at
      OFFSET 1
    LOOP
      new_slug := rec.slug || '-' || counter;
      UPDATE public.groups SET slug = new_slug WHERE id = rec.id;
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;

-- Add unique constraint for groups
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'groups_slug_unique'
  ) THEN
    ALTER TABLE public.groups 
    ADD CONSTRAINT groups_slug_unique UNIQUE (slug);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_groups_slug ON public.groups(slug);

-- ============================================================================
-- UNIVERSAL SLUG GENERATION FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_unique_slug(
  input_text TEXT,
  table_name TEXT,
  exclude_id UUID DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
  query TEXT;
BEGIN
  -- Generate base slug
  base_slug := LOWER(REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(input_text, '[^a-zA-Z0-9\s\-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  ));
  
  -- Remove leading/trailing hyphens
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Default if empty
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := table_name || '-item';
  END IF;
  
  final_slug := base_slug;
  
  -- Check uniqueness dynamically
  IF exclude_id IS NOT NULL THEN
    query := format('SELECT 1 FROM public.%I WHERE slug = $1 AND id != $2', table_name);
    WHILE EXECUTE query USING final_slug, exclude_id LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
  ELSE
    query := format('SELECT 1 FROM public.%I WHERE slug = $1', table_name);
    WHILE EXECUTE query USING final_slug LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
  END IF;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AUTO-GENERATE TRIGGERS FOR ALL CONTENT TYPES
-- ============================================================================

-- Events trigger
CREATE OR REPLACE FUNCTION auto_generate_event_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_slug(NEW.title, 'events', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_event_slug ON public.events;
CREATE TRIGGER trigger_auto_generate_event_slug
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_event_slug();

-- Opportunities trigger
CREATE OR REPLACE FUNCTION auto_generate_opportunity_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_slug(NEW.title, 'opportunities', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_opportunity_slug ON public.opportunities;
CREATE TRIGGER trigger_auto_generate_opportunity_slug
  BEFORE INSERT OR UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_opportunity_slug();

-- Groups trigger
CREATE OR REPLACE FUNCTION auto_generate_group_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_slug(NEW.name, 'groups', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_group_slug ON public.groups;
CREATE TRIGGER trigger_auto_generate_group_slug
  BEFORE INSERT OR UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_group_slug();

-- Grant permissions
GRANT SELECT ON public.events TO authenticated;
GRANT UPDATE (slug) ON public.events TO authenticated;
GRANT SELECT ON public.opportunities TO authenticated;
GRANT UPDATE (slug) ON public.opportunities TO authenticated;
GRANT SELECT ON public.groups TO authenticated;
GRANT UPDATE (slug) ON public.groups TO authenticated;