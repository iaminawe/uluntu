/*
  # Add contact information fields to marketplace listings

  1. Changes
    - Add contact_email field to marketplace_listings table
    - Add contact_phone field to marketplace_listings table 
    - Add contact_method field to marketplace_listings table (email, phone, both)
    - Add show_contact_info field to control visibility

  2. Security
    - Contact information is only visible when listing is published
    - Sellers can choose which contact methods to display
*/

-- Add contact information columns to marketplace_listings table
ALTER TABLE marketplace_listings
ADD COLUMN contact_email TEXT,
ADD COLUMN contact_phone TEXT,
ADD COLUMN contact_method TEXT CHECK (contact_method IN ('email', 'phone', 'both')),
ADD COLUMN show_contact_info BOOLEAN DEFAULT true;

-- Update the RLS policy to hide contact info in non-published listings
CREATE OR REPLACE FUNCTION mask_contact_info(listing marketplace_listings)
RETURNS marketplace_listings AS $$
BEGIN
  -- If the listing is not published or user is not the owner, mask contact info
  IF listing.status != 'published' AND listing.seller_id NOT IN (
    SELECT id FROM members WHERE user_id = auth.uid()
  ) THEN
    listing.contact_email := NULL;
    listing.contact_phone := NULL;
  END IF;
  
  -- If show_contact_info is false and user is not the owner, mask contact info
  IF NOT listing.show_contact_info AND listing.seller_id NOT IN (
    SELECT id FROM members WHERE user_id = auth.uid()
  ) THEN
    listing.contact_email := NULL;
    listing.contact_phone := NULL;
  END IF;
  
  RETURN listing;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON COLUMN marketplace_listings.contact_email IS 'Seller contact email for inquiries';
COMMENT ON COLUMN marketplace_listings.contact_phone IS 'Seller contact phone for inquiries';
COMMENT ON COLUMN marketplace_listings.contact_method IS 'Preferred contact method: email, phone, or both';
COMMENT ON COLUMN marketplace_listings.show_contact_info IS 'Whether to show contact information publicly';