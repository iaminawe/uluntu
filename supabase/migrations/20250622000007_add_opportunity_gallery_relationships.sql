-- =====================================================
-- OPPORTUNITY GALLERY RELATIONSHIPS
-- Add ability to attach galleries to opportunities
-- =====================================================

BEGIN;

-- Create junction table for opportunity-gallery relationships
CREATE TABLE IF NOT EXISTS opportunity_galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  gallery_id UUID NOT NULL REFERENCES user_galleries(id) ON DELETE CASCADE,
  
  -- Relationship metadata
  display_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  caption TEXT,
  
  -- Who attached this gallery
  attached_by UUID REFERENCES members(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Prevent duplicate attachments
  CONSTRAINT opportunity_galleries_unique UNIQUE (opportunity_id, gallery_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunity_galleries_opportunity_id ON opportunity_galleries(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_galleries_gallery_id ON opportunity_galleries(gallery_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_galleries_display_order ON opportunity_galleries(opportunity_id, display_order);

-- Add RLS policies
ALTER TABLE opportunity_galleries ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view gallery attachments for published opportunities
CREATE POLICY "Anyone can view opportunity gallery attachments"
  ON opportunity_galleries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_galleries.opportunity_id
      AND opportunities.status = 'published'
    )
  );

-- Policy: Opportunity creators and gallery owners can attach galleries
CREATE POLICY "Opportunity creators can attach galleries"
  ON opportunity_galleries FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_galleries.opportunity_id
      AND opportunities.posted_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_galleries
      WHERE user_galleries.id = opportunity_galleries.gallery_id
      AND user_galleries.user_id = auth.uid()
    )
  );

-- Policy: Opportunity creators and gallery owners can update attachments
CREATE POLICY "Opportunity creators can update gallery attachments"
  ON opportunity_galleries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_galleries.opportunity_id
      AND opportunities.posted_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_galleries
      WHERE user_galleries.id = opportunity_galleries.gallery_id
      AND user_galleries.user_id = auth.uid()
    )
  );

-- Policy: Opportunity creators and gallery owners can remove attachments
CREATE POLICY "Opportunity creators can remove gallery attachments"
  ON opportunity_galleries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM opportunities
      WHERE opportunities.id = opportunity_galleries.opportunity_id
      AND opportunities.posted_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_galleries
      WHERE user_galleries.id = opportunity_galleries.gallery_id
      AND user_galleries.user_id = auth.uid()
    )
  );

-- Add trigger to update timestamps
CREATE OR REPLACE FUNCTION update_opportunity_galleries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_opportunity_galleries_updated_at
  BEFORE UPDATE ON opportunity_galleries
  FOR EACH ROW
  EXECUTE FUNCTION update_opportunity_galleries_updated_at();

-- Add function to get opportunity galleries with metadata
CREATE OR REPLACE FUNCTION get_opportunity_galleries(opportunity_uuid UUID)
RETURNS TABLE (
  id UUID,
  gallery_id UUID,
  gallery_title TEXT,
  gallery_description TEXT,
  gallery_slug TEXT,
  gallery_cover_photo_id UUID,
  gallery_photo_count INTEGER,
  gallery_privacy_level TEXT,
  gallery_owner_name TEXT,
  gallery_owner_image TEXT,
  display_order INTEGER,
  featured BOOLEAN,
  caption TEXT,
  attached_by UUID,
  attached_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE sql STABLE AS $$
  SELECT 
    og.id,
    og.gallery_id,
    ug.title as gallery_title,
    ug.description as gallery_description,
    ug.slug as gallery_slug,
    ug.cover_photo_id as gallery_cover_photo_id,
    ug.photo_count as gallery_photo_count,
    ug.privacy_level as gallery_privacy_level,
    m.name as gallery_owner_name,
    m.image as gallery_owner_image,
    og.display_order,
    og.featured,
    og.caption,
    og.attached_by,
    attacher.name as attached_by_name,
    og.created_at
  FROM opportunity_galleries og
  JOIN user_galleries ug ON ug.id = og.gallery_id
  JOIN members m ON m.id = ug.user_id
  LEFT JOIN members attacher ON attacher.id = og.attached_by
  WHERE og.opportunity_id = opportunity_uuid
  ORDER BY og.display_order ASC, og.created_at ASC;
$$;

-- Add function to get galleries that can be attached to an opportunity
CREATE OR REPLACE FUNCTION get_attachable_galleries(opportunity_uuid UUID, user_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  slug TEXT,
  cover_photo_id UUID,
  photo_count INTEGER,
  privacy_level TEXT,
  owner_name TEXT,
  owner_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  is_attached BOOLEAN
) LANGUAGE sql STABLE AS $$
  SELECT 
    ug.id,
    ug.title,
    ug.description,
    ug.slug,
    ug.cover_photo_id,
    ug.photo_count,
    ug.privacy_level,
    m.name as owner_name,
    m.image as owner_image,
    ug.created_at,
    CASE WHEN og.gallery_id IS NOT NULL THEN true ELSE false END as is_attached
  FROM user_galleries ug
  JOIN members m ON m.id = ug.user_id
  LEFT JOIN opportunity_galleries og ON og.gallery_id = ug.id AND og.opportunity_id = opportunity_uuid
  WHERE 
    ug.visibility = 'visible'
    AND (
      ug.privacy_level = 'public'
      OR (ug.privacy_level = 'members_only' AND user_uuid IS NOT NULL)
      OR ug.user_id = user_uuid
    )
  ORDER BY ug.created_at DESC;
$$;

COMMIT;

-- =====================================================
-- SUMMARY
-- =====================================================
-- Created opportunity_galleries junction table with:
-- - Unique opportunity-gallery relationships
-- - Display ordering and featured status
-- - Caption support for context
-- - Proper RLS policies for security
-- - Database functions for efficient queries
-- 
-- This enables:
-- - Companies to showcase their work through galleries
-- - Portfolio galleries for job opportunities
-- - Event galleries for community opportunities
-- - Project galleries for volunteer opportunities
-- =====================================================