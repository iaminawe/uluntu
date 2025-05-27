-- Migration: Add missing fields from mock data to database schema
-- Created: 2025-05-26

-- Add social fields to members table if they don't exist
ALTER TABLE IF EXISTS public.members
ADD COLUMN IF NOT EXISTS social JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Create social column type annotation
COMMENT ON COLUMN public.members.social IS 'JSON structure for social media links: {linkedin, twitter, github, website}';

-- Add featured field to marketplace_listings table if it doesn't exist
ALTER TABLE IF EXISTS public.marketplace_listings
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS condition VARCHAR(20) CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'poor', 'used')) DEFAULT NULL;

-- Add featured field to opportunities table if it doesn't exist
ALTER TABLE IF EXISTS public.opportunities
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;

-- Update or add createdAt/dateAdded compatibility
-- Some components expect createdAt while others expect dateAdded or created_at
-- We'll make sure views or triggers handle this compatibility

-- Add indices for the new boolean fields to improve filtering performance
CREATE INDEX IF NOT EXISTS idx_members_featured ON public.members (featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_featured ON public.marketplace_listings (featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_opportunities_featured ON public.opportunities (featured) WHERE featured = TRUE;
