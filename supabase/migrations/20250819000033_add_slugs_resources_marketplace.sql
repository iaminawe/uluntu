-- Add slug fields to resources and marketplace_listings tables
-- This completes the slug implementation for all content types

-- ============================================================================
-- RESOURCES TABLE
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'resources' 
    AND column_name = 'slug'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.resources ADD COLUMN slug VARCHAR(255);
    RAISE NOTICE 'Added slug column to resources table';
  END IF;
END $$;

-- Generate slugs for existing resources
UPDATE public.resources 
SET slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s\-]', '', 'g'),
    '\s+', '-', 'g'
  ),
  '-+', '-', 'g'
))
WHERE slug IS NULL OR slug = '';

-- Ensure uniqueness for resources
DO $$
DECLARE
  dup_rec RECORD;
  resource_rec RECORD;
  counter INTEGER;
  new_slug TEXT;
  base_slug TEXT;
BEGIN
  FOR dup_rec IN 
    SELECT slug, COUNT(*) as cnt 
    FROM public.resources 
    WHERE slug IS NOT NULL 
    GROUP BY slug 
    HAVING COUNT(*) > 1
  LOOP
    counter := 1;
    base_slug := dup_rec.slug;
    FOR resource_rec IN 
      SELECT id FROM public.resources 
      WHERE slug = base_slug 
      ORDER BY created_at
      OFFSET 1
    LOOP
      new_slug := base_slug || '-' || counter;
      UPDATE public.resources SET slug = new_slug WHERE id = resource_rec.id;
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;

-- Add unique constraint for resources
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'resources_slug_unique'
  ) THEN
    ALTER TABLE public.resources 
    ADD CONSTRAINT resources_slug_unique UNIQUE (slug);
    RAISE NOTICE 'Added unique constraint to resources.slug';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_resources_slug ON public.resources(slug);

-- ============================================================================
-- MARKETPLACE_LISTINGS TABLE
-- ============================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_listings' 
    AND column_name = 'slug'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.marketplace_listings ADD COLUMN slug VARCHAR(255);
    RAISE NOTICE 'Added slug column to marketplace_listings table';
  END IF;
END $$;

-- Generate slugs for existing marketplace listings
UPDATE public.marketplace_listings 
SET slug = LOWER(REGEXP_REPLACE(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9\s\-]', '', 'g'),
    '\s+', '-', 'g'
  ),
  '-+', '-', 'g'
))
WHERE slug IS NULL OR slug = '';

-- Ensure uniqueness for marketplace listings
DO $$
DECLARE
  dup_rec RECORD;
  listing_rec RECORD;
  counter INTEGER;
  new_slug TEXT;
  base_slug TEXT;
BEGIN
  FOR dup_rec IN 
    SELECT slug, COUNT(*) as cnt 
    FROM public.marketplace_listings 
    WHERE slug IS NOT NULL 
    GROUP BY slug 
    HAVING COUNT(*) > 1
  LOOP
    counter := 1;
    base_slug := dup_rec.slug;
    FOR listing_rec IN 
      SELECT id FROM public.marketplace_listings 
      WHERE slug = base_slug 
      ORDER BY created_at
      OFFSET 1
    LOOP
      new_slug := base_slug || '-' || counter;
      UPDATE public.marketplace_listings SET slug = new_slug WHERE id = listing_rec.id;
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;

-- Add unique constraint for marketplace_listings
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'marketplace_listings_slug_unique'
  ) THEN
    ALTER TABLE public.marketplace_listings 
    ADD CONSTRAINT marketplace_listings_slug_unique UNIQUE (slug);
    RAISE NOTICE 'Added unique constraint to marketplace_listings.slug';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_marketplace_listings_slug ON public.marketplace_listings(slug);

-- ============================================================================
-- AUTO-GENERATE TRIGGERS
-- ============================================================================

-- Resources trigger
CREATE OR REPLACE FUNCTION auto_generate_resource_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9\s\-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    ));
    
    -- Ensure uniqueness
    DECLARE
      counter INTEGER := 1;
      temp_slug TEXT;
    BEGIN
      temp_slug := NEW.slug;
      WHILE EXISTS (SELECT 1 FROM public.resources WHERE slug = temp_slug AND id != NEW.id) LOOP
        temp_slug := NEW.slug || '-' || counter;
        counter := counter + 1;
      END LOOP;
      NEW.slug := temp_slug;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_resource_slug ON public.resources;
CREATE TRIGGER trigger_auto_generate_resource_slug
  BEFORE INSERT OR UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_resource_slug();

-- Marketplace listings trigger
CREATE OR REPLACE FUNCTION auto_generate_marketplace_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(
      REGEXP_REPLACE(
        REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9\s\-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    ));
    
    -- Ensure uniqueness
    DECLARE
      counter INTEGER := 1;
      temp_slug TEXT;
    BEGIN
      temp_slug := NEW.slug;
      WHILE EXISTS (SELECT 1 FROM public.marketplace_listings WHERE slug = temp_slug AND id != NEW.id) LOOP
        temp_slug := NEW.slug || '-' || counter;
        counter := counter + 1;
      END LOOP;
      NEW.slug := temp_slug;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_marketplace_slug ON public.marketplace_listings;
CREATE TRIGGER trigger_auto_generate_marketplace_slug
  BEFORE INSERT OR UPDATE ON public.marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_marketplace_slug();

-- Grant permissions
GRANT SELECT ON public.resources TO authenticated;
GRANT UPDATE (slug) ON public.resources TO authenticated;
GRANT SELECT ON public.marketplace_listings TO authenticated;
GRANT UPDATE (slug) ON public.marketplace_listings TO authenticated;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
DO $$
DECLARE
  resources_count INTEGER;
  marketplace_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO resources_count FROM resources WHERE slug IS NOT NULL;
  SELECT COUNT(*) INTO marketplace_count FROM marketplace_listings WHERE slug IS NOT NULL;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Slug Generation Complete for Resources & Marketplace';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Resources with slugs: %', resources_count;
  RAISE NOTICE 'Marketplace listings with slugs: %', marketplace_count;
  RAISE NOTICE '========================================';
END $$;