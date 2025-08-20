-- Fix for slug uniqueness handling
-- This migration handles duplicate slugs more safely

-- Function to safely make slugs unique for a given table
CREATE OR REPLACE FUNCTION make_slugs_unique(table_name TEXT)
RETURNS VOID AS $$
DECLARE
  dup_slug TEXT;
  record_id UUID;
  counter INTEGER;
  new_slug TEXT;
BEGIN
  -- Find all duplicate slugs
  FOR dup_slug IN
    EXECUTE format('SELECT slug FROM public.%I WHERE slug IS NOT NULL GROUP BY slug HAVING COUNT(*) > 1', table_name)
  LOOP
    counter := 1;
    -- For each duplicate, update all but the first one
    FOR record_id IN
      EXECUTE format('SELECT id FROM public.%I WHERE slug = $1 ORDER BY created_at OFFSET 1', table_name) USING dup_slug
    LOOP
      new_slug := dup_slug || '-' || counter;
      EXECUTE format('UPDATE public.%I SET slug = $1 WHERE id = $2', table_name) USING new_slug, record_id;
      counter := counter + 1;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Apply uniqueness fixes for each table
DO $$
BEGIN
  -- Check and fix events table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'slug' AND table_schema = 'public'
  ) THEN
    PERFORM make_slugs_unique('events');
  END IF;

  -- Check and fix opportunities table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'opportunities' AND column_name = 'slug' AND table_schema = 'public'
  ) THEN
    PERFORM make_slugs_unique('opportunities');
  END IF;

  -- Check and fix groups table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'groups' AND column_name = 'slug' AND table_schema = 'public'
  ) THEN
    PERFORM make_slugs_unique('groups');
  END IF;

  -- Check and fix members table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' AND column_name = 'slug' AND table_schema = 'public'
  ) THEN
    PERFORM make_slugs_unique('members');
  END IF;
END $$;

-- Drop the temporary function
DROP FUNCTION IF EXISTS make_slugs_unique(TEXT);