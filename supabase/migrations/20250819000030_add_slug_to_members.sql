-- Add slug field to members table if it doesn't exist
DO $$ 
BEGIN
  -- Check if slug column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'members' 
    AND column_name = 'slug'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.members ADD COLUMN slug VARCHAR(255);
  END IF;
END $$;

-- Create slug generation function if it doesn't exist
CREATE OR REPLACE FUNCTION generate_member_slug(member_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base slug from name
  base_slug := LOWER(REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(member_name, '[^a-zA-Z0-9\s\-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  ));
  
  -- Remove leading/trailing hyphens
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- If empty, use a default
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'member';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  WHILE EXISTS (SELECT 1 FROM public.members WHERE slug = final_slug) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Populate slug for existing members without slugs
UPDATE public.members 
SET slug = generate_member_slug(name)
WHERE slug IS NULL OR slug = '';

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'members_slug_unique'
  ) THEN
    ALTER TABLE public.members 
    ADD CONSTRAINT members_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_members_slug ON public.members(slug);

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION auto_generate_member_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate if slug is null or empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_member_slug(NEW.name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_auto_generate_member_slug ON public.members;
CREATE TRIGGER trigger_auto_generate_member_slug
  BEFORE INSERT OR UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_member_slug();

-- Grant necessary permissions
GRANT SELECT ON public.members TO authenticated;
GRANT UPDATE (slug) ON public.members TO authenticated;