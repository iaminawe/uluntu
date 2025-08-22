-- Add missing columns to pages table if they don't exist
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;

ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS is_editable BOOLEAN DEFAULT TRUE;

ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS meta_title TEXT;

ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Show table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pages' 
ORDER BY ordinal_position;