-- =====================================================
-- ADD GROUP AND COMPANY GALLERY SUPPORT (FIXED)
-- =====================================================

BEGIN;

-- Add owner_type and owner_id columns to user_galleries table if they don't exist
ALTER TABLE user_galleries 
ADD COLUMN IF NOT EXISTS owner_type TEXT DEFAULT 'user' CHECK (owner_type IN ('user', 'group', 'company', 'page')),
ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_user_galleries_owner_type ON user_galleries(owner_type);
CREATE INDEX IF NOT EXISTS idx_user_galleries_owner_id ON user_galleries(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_galleries_owner_composite ON user_galleries(owner_type, owner_id);

-- Migrate existing data (set owner_id to user_id for existing galleries)
UPDATE user_galleries SET owner_id = user_id WHERE owner_id IS NULL;

-- Make owner_id NOT NULL after migration (only if column was just added)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_galleries' 
    AND column_name = 'owner_id' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE user_galleries ALTER COLUMN owner_id SET NOT NULL;
  END IF;
END $$;

-- Update RLS policies to support group and company galleries

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view public galleries" ON user_galleries;
DROP POLICY IF EXISTS "Users can view their own galleries" ON user_galleries;
DROP POLICY IF EXISTS "Users can create galleries" ON user_galleries;
DROP POLICY IF EXISTS "Users can update their own galleries" ON user_galleries;
DROP POLICY IF EXISTS "Users can delete their own galleries" ON user_galleries;
DROP POLICY IF EXISTS "Anyone can view public galleries" ON user_galleries;
DROP POLICY IF EXISTS "Members can view members-only galleries" ON user_galleries;
DROP POLICY IF EXISTS "Group members can view group galleries" ON user_galleries;
DROP POLICY IF EXISTS "Company members can view company galleries" ON user_galleries;
DROP POLICY IF EXISTS "Users can create personal galleries" ON user_galleries;
DROP POLICY IF EXISTS "Group admins can create group galleries" ON user_galleries;
DROP POLICY IF EXISTS "Company admins can create company galleries" ON user_galleries;
DROP POLICY IF EXISTS "Users can update personal galleries" ON user_galleries;
DROP POLICY IF EXISTS "Group admins can update group galleries" ON user_galleries;
DROP POLICY IF EXISTS "Company admins can update company galleries" ON user_galleries;
DROP POLICY IF EXISTS "Users can delete personal galleries" ON user_galleries;
DROP POLICY IF EXISTS "Group admins can delete group galleries" ON user_galleries;
DROP POLICY IF EXISTS "Company admins can delete company galleries" ON user_galleries;

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
    -- Fixed: Use 'verified' instead of 'is_verified'
    AND company_members.verified = true
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
    AND group_members.role IN ('admin', 'moderator', 'owner')
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
    AND company_members.role IN ('admin', 'owner')
    -- Fixed: Use 'verified' instead of 'is_verified'
    AND company_members.verified = true
  )
);

-- Update policies
CREATE POLICY "Users can update personal galleries"
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
    AND group_members.role IN ('admin', 'moderator', 'owner')
    AND group_members.status = 'active'
  )
)
WITH CHECK (
  owner_type = 'group'
  AND EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = owner_id
    AND group_members.member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
    AND group_members.role IN ('admin', 'moderator', 'owner')
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
    AND company_members.role IN ('admin', 'owner')
    -- Fixed: Use 'verified' instead of 'is_verified'
    AND company_members.verified = true
  )
)
WITH CHECK (
  owner_type = 'company'
  AND EXISTS (
    SELECT 1 FROM company_members
    WHERE company_members.company_id = owner_id
    AND company_members.member_id IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
    AND company_members.role IN ('admin', 'owner')
    -- Fixed: Use 'verified' instead of 'is_verified'
    AND company_members.verified = true
  )
);

-- Delete policies
CREATE POLICY "Users can delete personal galleries"
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
    AND group_members.role IN ('admin', 'owner')
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
    AND company_members.role IN ('admin', 'owner')
    -- Fixed: Use 'verified' instead of 'is_verified'
    AND company_members.verified = true
  )
);

-- Create helper function to check gallery ownership
CREATE OR REPLACE FUNCTION can_manage_gallery(gallery_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  gallery_owner_type TEXT;
  gallery_owner_id UUID;
BEGIN
  -- Get gallery owner info
  SELECT owner_type, owner_id INTO gallery_owner_type, gallery_owner_id
  FROM user_galleries
  WHERE id = gallery_id;

  -- Check based on owner type
  IF gallery_owner_type = 'user' THEN
    RETURN gallery_owner_id = user_id;
  ELSIF gallery_owner_type = 'group' THEN
    RETURN EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = gallery_owner_id
      AND member_id IN (SELECT id FROM members WHERE members.user_id = can_manage_gallery.user_id)
      AND role IN ('admin', 'moderator', 'owner')
      AND status = 'active'
    );
  ELSIF gallery_owner_type = 'company' THEN
    RETURN EXISTS (
      SELECT 1 FROM company_members
      WHERE company_id = gallery_owner_id
      AND member_id IN (SELECT id FROM members WHERE members.user_id = can_manage_gallery.user_id)
      AND role IN ('admin', 'owner')
      -- Fixed: Use 'verified' instead of 'is_verified'
      AND verified = true
    );
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;