-- Add slug column to companies table and generate slugs for existing companies

-- Add slug column if it doesn't exist
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for better performance on slug lookups
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- Function to generate a slug from company name
CREATE OR REPLACE FUNCTION generate_company_slug(company_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase and replace non-alphanumeric characters with hyphens
    base_slug := lower(company_name);
    base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    -- Ensure slug is not empty
    IF base_slug = '' THEN
        base_slug := 'company';
    END IF;
    
    final_slug := base_slug;
    
    -- Check for uniqueness and append number if needed
    WHILE EXISTS (SELECT 1 FROM companies WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Generate slugs for existing companies
DO $$
DECLARE
    company_record RECORD;
    new_slug TEXT;
BEGIN
    FOR company_record IN SELECT id, name FROM companies WHERE slug IS NULL
    LOOP
        new_slug := generate_company_slug(company_record.name);
        UPDATE companies SET slug = new_slug WHERE id = company_record.id;
    END LOOP;
END $$;

-- Make slug column NOT NULL after populating
ALTER TABLE companies 
ALTER COLUMN slug SET NOT NULL;

-- Create trigger to automatically generate slug for new companies
CREATE OR REPLACE FUNCTION trigger_generate_company_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_company_slug(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS generate_company_slug_trigger ON companies;
CREATE TRIGGER generate_company_slug_trigger
BEFORE INSERT OR UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION trigger_generate_company_slug();

-- Add RLS policy for slug column (inherits existing policies)
-- No additional RLS needed as existing policies cover all columns