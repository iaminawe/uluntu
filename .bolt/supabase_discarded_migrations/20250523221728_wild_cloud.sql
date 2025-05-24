/*
  # Create marketplace_listings table

  1. Tables
    - `marketplace_listings` - Items for sale or services offered
  
  2. Security
    - Enable RLS on all tables
    - Add policies for different access levels
*/

-- Create marketplace_listings table
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,
  price NUMERIC,
  condition TEXT,
  images TEXT[],
  seller_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'published',
  featured BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for marketplace_listings table

-- Anyone can read published listings (commented out to avoid duplicate policy error)
-- This policy is already created in a previous migration
-- CREATE POLICY "Anyone can read published marketplace listings"
--   ON marketplace_listings
--   FOR SELECT
--   USING (status = 'published');

-- Sellers can read, update, and delete their own listings (commented out to avoid duplicate policy error)
-- This policy is already created in a previous migration
-- CREATE POLICY "Sellers can read their own marketplace listings"
--   ON marketplace_listings
--   FOR SELECT
--   USING (
--     seller_id IN (
--       SELECT id FROM members WHERE user_id = auth.uid()
--     )
--   );

-- This policy is already created in a previous migration
-- CREATE POLICY "Sellers can update their own marketplace listings"
--   ON marketplace_listings
--   FOR UPDATE
--   USING (
--     seller_id IN (
--       SELECT id FROM members WHERE user_id = auth.uid()
--     )
--   );

-- This policy is already created in a previous migration
-- CREATE POLICY "Sellers can delete their own marketplace listings"
--   ON marketplace_listings
--   FOR DELETE
--   USING (
--     seller_id IN (
--       SELECT id FROM members WHERE user_id = auth.uid()
--     )
--   );

-- Authenticated users can create listings (commented out to avoid duplicate policy error)
-- This policy is already created in a previous migration
-- CREATE POLICY "Authenticated users can create marketplace listings"
--   ON marketplace_listings
--   FOR INSERT
--   WITH CHECK (
--     auth.uid() IS NOT NULL AND
--     seller_id IN (
--       SELECT id FROM members WHERE user_id = auth.uid()
--     )
--   );

-- Superadmins can do anything with marketplace listings (commented out to avoid duplicate policy error)
-- This policy is already created in a previous migration
-- CREATE POLICY "Superadmins can manage all marketplace listings"
--   ON marketplace_listings
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid() AND role = 'superadmin'
--     )
--   );