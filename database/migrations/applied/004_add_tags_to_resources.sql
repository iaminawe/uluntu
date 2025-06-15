-- Add missing columns to resources and marketplace_listings tables
-- This adds columns needed for the seed data

-- Add tags column to resources table
ALTER TABLE resources ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add contact_info column to marketplace_listings table  
ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS contact_info JSONB;

-- Update RLS policies to allow reading these new columns
-- (The existing policies should already cover this, but let's ensure they work with the new columns)

-- Verify the columns were added
SELECT 
    'resources' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'resources' 
AND table_schema = 'public'
AND column_name = 'tags'

UNION ALL

SELECT 
    'marketplace_listings' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'marketplace_listings' 
AND table_schema = 'public'
AND column_name = 'contact_info'

ORDER BY table_name, column_name;