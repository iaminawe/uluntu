-- =====================================================
-- GENERATE SLUGS FOR EXISTING COMPANIES
-- This script adds slugs to companies that don't have them
-- =====================================================

-- First, let's see which companies need slugs
SELECT 
    id,
    name,
    slug,
    CASE 
        WHEN slug IS NULL OR slug = '' THEN 'Needs slug'
        ELSE 'Has slug'
    END as slug_status
FROM companies
ORDER BY created_at DESC;

-- Function to generate a slug from a company name
CREATE OR REPLACE FUNCTION generate_company_slug(company_name TEXT) 
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase and replace non-alphanumeric characters with hyphens
    base_slug := lower(company_name);
    base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
    base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
    
    -- Start with the base slug
    final_slug := base_slug;
    
    -- Check for uniqueness and append number if necessary
    WHILE EXISTS (SELECT 1 FROM companies WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Update companies that don't have slugs
UPDATE companies 
SET slug = generate_company_slug(name)
WHERE slug IS NULL OR slug = '';

-- Show the results
SELECT 
    id,
    name,
    slug,
    CASE 
        WHEN slug IS NULL OR slug = '' THEN 'ERROR: Still no slug'
        ELSE 'Success'
    END as update_status
FROM companies
ORDER BY created_at DESC;

-- If you want to see companies with their new slugs
SELECT 
    name,
    slug,
    website,
    location
FROM companies
WHERE slug IS NOT NULL
ORDER BY name;

-- Count summary
SELECT 
    COUNT(*) as total_companies,
    COUNT(slug) as companies_with_slugs,
    COUNT(*) - COUNT(slug) as companies_without_slugs
FROM companies;

-- Optional: Drop the function if you don't need it anymore
-- DROP FUNCTION IF EXISTS generate_company_slug(TEXT);