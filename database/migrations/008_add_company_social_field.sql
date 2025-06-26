-- Add social field to companies table for storing social media links
BEGIN;

-- Add the social column as JSONB to store social media links
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS social JSONB DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN companies.social IS 'JSON object containing social media links (e.g., {"linkedin": "url", "twitter": "url", "github": "url"})';

-- Create an index on the social field for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_social ON companies USING GIN (social);

COMMIT;