-- =====================================================
-- ADD GROUP AND COMPANY GALLERY SUPPORT
-- =====================================================

BEGIN;

-- Add owner_type and owner_id columns to user_galleries table
ALTER TABLE user_galleries 
ADD COLUMN owner_type TEXT DEFAULT 'user' CHECK (owner_type IN ('user', 'group', 'company')),
ADD COLUMN owner_id UUID;

-- Create indexes for the new columns
CREATE INDEX idx_user_galleries_owner_type ON user_galleries(owner_type);
CREATE INDEX idx_user_galleries_owner_id ON user_galleries(owner_id);
CREATE INDEX idx_user_galleries_owner_composite ON user_galleries(owner_type, owner_id);

-- Migrate existing data (set owner_id to user_id for existing galleries)
UPDATE user_galleries SET owner_id = user_id WHERE owner_id IS NULL;

-- Make owner_id NOT NULL after migration
ALTER TABLE user_galleries ALTER COLUMN owner_id SET NOT NULL;

-- Update RLS policies to support group and company galleries

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view public galleries" ON user_galleries;
DROP POLICY IF EXISTS "Users can view their own galleries" ON user_galleries;
DROP POLICY IF EXISTS "Users can create galleries" ON user_galleries;
DROP POLICY IF EXISTS "Users can update their own galleries" ON user_galleries;
DROP POLICY IF EXISTS "Users can delete their own galleries" ON user_galleries;

-- Create new policies that support multiple owner types

-- View policies
CREATE POLICY "Anyone can view public galleries"
ON user_galleries FOR SELECT
USING (
  privacy_level = 'public' 
  AND visibility = 'visible'
);

CREATE POLICY "Members can view members-only galleries"
ON user_galleries FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND privacy_level = 'members_only'
  AND visibility = 'visible'
);

CREATE POLICY "Users can view their own galleries"
ON user_galleries FOR SELECT
USING (
  owner_type = 'user' 
  AND owner_id = auth.uid()
);

CREATE POLICY "Group members can view group galleries"
ON user_galleries FOR SELECT
USING (
  owner_type = 'group'
  AND EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = user_galleries.owner_id
    AND group_members.member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
    AND group_members.status = 'active'
  )
);

CREATE POLICY "Company members can view company galleries"
ON user_galleries FOR SELECT
USING (
  owner_type = 'company'
  AND EXISTS (
    SELECT 1 FROM company_members
    WHERE company_members.company_id = user_galleries.owner_id
    AND company_members.member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
    AND company_members.is_verified = true
  )
);

-- Create policies
CREATE POLICY "Users can create personal galleries"
ON user_galleries FOR INSERT
WITH CHECK (
  owner_type = 'user' 
  AND owner_id = auth.uid()
);

CREATE POLICY "Group admins can create group galleries"
ON user_galleries FOR INSERT
WITH CHECK (
  owner_type = 'group'
  AND EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = owner_id
    AND group_members.member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
    AND group_members.role = 'admin'
    AND group_members.status = 'active'
  )
);

CREATE POLICY "Company admins can create company galleries"
ON user_galleries FOR INSERT
WITH CHECK (
  owner_type = 'company'
  AND EXISTS (
    SELECT 1 FROM company_members
    WHERE company_members.company_id = owner_id
    AND company_members.member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
    AND company_members.role = 'admin'
    AND company_members.is_verified = true
  )
);

-- Update policies
CREATE POLICY "Users can update their own galleries"
ON user_galleries FOR UPDATE
USING (
  owner_type = 'user' 
  AND owner_id = auth.uid()
)
WITH CHECK (
  owner_type = 'user' 
  AND owner_id = auth.uid()
);

CREATE POLICY "Group admins can update group galleries"
ON user_galleries FOR UPDATE
USING (
  owner_type = 'group'
  AND EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = owner_id
    AND group_members.member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
    AND group_members.role = 'admin'
    AND group_members.status = 'active'
  )
);

CREATE POLICY "Company admins can update company galleries"
ON user_galleries FOR UPDATE
USING (
  owner_type = 'company'
  AND EXISTS (
    SELECT 1 FROM company_members
    WHERE company_members.company_id = owner_id
    AND company_members.member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
    AND company_members.role = 'admin'
    AND company_members.is_verified = true
  )
);

-- Delete policies
CREATE POLICY "Users can delete their own galleries"
ON user_galleries FOR DELETE
USING (
  owner_type = 'user' 
  AND owner_id = auth.uid()
);

CREATE POLICY "Group admins can delete group galleries"
ON user_galleries FOR DELETE
USING (
  owner_type = 'group'
  AND EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = owner_id
    AND group_members.member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
    AND group_members.role = 'admin'
    AND group_members.status = 'active'
  )
);

CREATE POLICY "Company admins can delete company galleries"
ON user_galleries FOR DELETE
USING (
  owner_type = 'company'
  AND EXISTS (
    SELECT 1 FROM company_members
    WHERE company_members.company_id = owner_id
    AND company_members.member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
    AND company_members.role = 'admin'
    AND company_members.is_verified = true
  )
);

-- Create views for easier querying

-- Group galleries view
CREATE OR REPLACE VIEW group_galleries AS
SELECT 
  g.*,
  grp.name as group_name,
  grp.slug as group_slug,
  grp.hero_image as group_image
FROM user_galleries g
JOIN groups grp ON g.owner_id = grp.id
WHERE g.owner_type = 'group';

-- Company galleries view
CREATE OR REPLACE VIEW company_galleries AS
SELECT 
  g.*,
  c.name as company_name,
  c.slug as company_slug,
  c.logo as company_logo
FROM user_galleries g
JOIN companies c ON g.owner_id = c.id
WHERE g.owner_type = 'company';

-- Update gallery stats functions to handle different owner types
CREATE OR REPLACE FUNCTION get_gallery_stats(p_owner_type TEXT, p_owner_id UUID)
RETURNS TABLE (
  total_galleries INTEGER,
  total_photos INTEGER,
  total_views BIGINT,
  total_likes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT g.id)::INTEGER as total_galleries,
    COALESCE(SUM(g.photo_count), 0)::INTEGER as total_photos,
    COALESCE(SUM(g.view_count), 0)::BIGINT as total_views,
    COALESCE(SUM(
      (SELECT COUNT(*) FROM photo_likes pl 
       JOIN gallery_photos gp ON pl.photo_id = gp.id 
       WHERE gp.gallery_id = g.id)
    ), 0)::BIGINT as total_likes
  FROM user_galleries g
  WHERE g.owner_type = p_owner_type 
    AND g.owner_id = p_owner_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can manage gallery (for any owner type)
CREATE OR REPLACE FUNCTION can_manage_gallery(p_gallery_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_owner_type TEXT;
  v_owner_id UUID;
  v_member_id UUID;
BEGIN
  -- Get gallery owner info
  SELECT owner_type, owner_id INTO v_owner_type, v_owner_id
  FROM user_galleries
  WHERE id = p_gallery_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check based on owner type
  IF v_owner_type = 'user' THEN
    RETURN v_owner_id = p_user_id;
    
  ELSIF v_owner_type = 'group' THEN
    -- Get member_id for user
    SELECT id INTO v_member_id FROM members WHERE user_id = p_user_id;
    
    -- Check if user is group admin
    RETURN EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = v_owner_id
      AND member_id = v_member_id
      AND role = 'admin'
      AND status = 'active'
    );
    
  ELSIF v_owner_type = 'company' THEN
    -- Get member_id for user
    SELECT id INTO v_member_id FROM members WHERE user_id = p_user_id;
    
    -- Check if user is company admin
    RETURN EXISTS (
      SELECT 1 FROM company_members
      WHERE company_id = v_owner_id
      AND member_id = v_member_id
      AND role = 'admin'
      AND is_verified = true
    );
    
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Update photo upload to inherit owner info from gallery
CREATE OR REPLACE FUNCTION set_photo_owner_from_gallery()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_type TEXT;
  v_owner_id UUID;
  v_user_id UUID;
BEGIN
  -- Get owner info from gallery
  SELECT owner_type, owner_id, user_id 
  INTO v_owner_type, v_owner_id, v_user_id
  FROM user_galleries
  WHERE id = NEW.gallery_id;
  
  -- Set user_id to the gallery creator's user_id
  -- This ensures photos are associated with the uploader
  NEW.user_id = COALESCE(NEW.user_id, v_user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for photo uploads
DROP TRIGGER IF EXISTS set_photo_owner_trigger ON gallery_photos;
CREATE TRIGGER set_photo_owner_trigger
BEFORE INSERT ON gallery_photos
FOR EACH ROW
EXECUTE FUNCTION set_photo_owner_from_gallery();

-- Add comments for documentation
COMMENT ON COLUMN user_galleries.owner_type IS 'Type of entity that owns this gallery: user, group, or company';
COMMENT ON COLUMN user_galleries.owner_id IS 'UUID of the owner (user_id, group_id, or company_id)';

COMMIT;

-- =====================================================
-- MIGRATION SUMMARY
-- =====================================================
-- This migration adds support for group and company galleries:
-- 1. Added owner_type and owner_id columns to track any owner type
-- 2. Updated all RLS policies to support different owner types
-- 3. Created views for easy querying of group/company galleries
-- 4. Added helper functions for gallery management
-- 5. Maintained backward compatibility with existing user galleries
-- =====================================================