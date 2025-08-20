-- Add slug generation to member creation trigger
-- This ensures all new members get a slug when their profile is created

-- Drop existing trigger and function to ensure clean state
DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
DROP FUNCTION IF EXISTS public.on_auth_user_created_create_profile();

-- Create slug generation function if it doesn't exist
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_text TEXT, table_name TEXT DEFAULT 'members', column_name TEXT DEFAULT 'slug', exclude_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
  exists_check BOOLEAN;
BEGIN
  -- Create base slug from text
  base_slug := lower(regexp_replace(
    regexp_replace(
      regexp_replace(base_text, '[^a-zA-Z0-9\s-]', '', 'g'),  -- Remove special chars
      '\s+', '-', 'g'  -- Replace spaces with hyphens
    ),
    '-+', '-', 'g'  -- Replace multiple hyphens with single
  ));
  
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Default to 'member' if empty
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'member';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add number if needed
  LOOP
    IF exclude_id IS NOT NULL THEN
      EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE %I = $1 AND id != $2)', table_name, column_name)
      INTO exists_check
      USING final_slug, exclude_id;
    ELSE
      EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE %I = $1)', table_name, column_name)
      INTO exists_check
      USING final_slug;
    END IF;
    
    EXIT WHEN NOT exists_check;
    
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the updated trigger function that includes slug generation
CREATE OR REPLACE FUNCTION public.on_auth_user_created_create_profile()
RETURNS TRIGGER AS $$
DECLARE
  member_name TEXT;
  member_slug TEXT;
BEGIN
  -- Determine the name for the member
  member_name := COALESCE(
    NEW.raw_user_meta_data->>'name', 
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1) -- Use email prefix as fallback name
  );
  
  -- Generate a unique slug
  member_slug := public.generate_unique_slug(member_name);
  
  -- Create member profile with draft status and slug
  INSERT INTO public.members (
    user_id, 
    name,
    slug,
    status, 
    created_at
  )
  VALUES (
    NEW.id,
    member_name,
    member_slug,
    'draft', -- Privacy by default
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    -- Only update slug if it's null
    slug = COALESCE(EXCLUDED.slug, members.slug),
    -- Update name if current one is just email prefix
    name = CASE 
      WHEN members.name = split_part(NEW.email, '@', 1) THEN EXCLUDED.name
      ELSE members.name
    END;
  
  -- Ensure user has authenticated role
  INSERT INTO public.user_roles (user_id, role, created_at)
  VALUES (NEW.id, 'authenticated', NOW())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth signup
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.on_auth_user_created_create_profile();

-- Add helpful comment
COMMENT ON FUNCTION public.on_auth_user_created_create_profile() IS 
  'Creates member profile with unique slug after user signup. Ensures all members have a URL-friendly identifier.';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.on_auth_user_created_create_profile() TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_unique_slug(TEXT, TEXT, TEXT, UUID) TO service_role;

-- Backfill slugs for existing members without them
DO $$
DECLARE
  member_record RECORD;
  new_slug TEXT;
BEGIN
  FOR member_record IN 
    SELECT id, name 
    FROM public.members 
    WHERE slug IS NULL OR slug = ''
  LOOP
    new_slug := public.generate_unique_slug(
      COALESCE(member_record.name, 'member'), 
      'members', 
      'slug', 
      member_record.id
    );
    
    UPDATE public.members 
    SET slug = new_slug 
    WHERE id = member_record.id;
    
    RAISE NOTICE 'Generated slug % for member %', new_slug, member_record.id;
  END LOOP;
END;
$$;