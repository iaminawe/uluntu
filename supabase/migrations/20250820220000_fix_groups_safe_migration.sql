-- ================================================================
-- SAFE GROUPS FUNCTIONALITY FIX (Handles Existing Objects)
-- ================================================================
-- This migration safely fixes groups functionality by checking for
-- existing objects before creating them
-- ================================================================

BEGIN;

-- ================================================================
-- PART 1: FIX GROUPS TABLE STRUCTURE
-- ================================================================

-- Add missing columns to groups table (IF NOT EXISTS prevents errors)
ALTER TABLE public.groups 
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.members(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS max_members INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS member_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_groups_updated_at ON public.groups;
CREATE TRIGGER update_groups_updated_at 
  BEFORE UPDATE ON public.groups 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- PART 2: FIX GROUP_MEMBERS TABLE STRUCTURE
-- ================================================================

-- Add missing columns to group_members table
ALTER TABLE public.group_members 
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'banned')),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES public.members(id),
  ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS left_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ban_reason TEXT,
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}';

-- Make id the primary key if it isn't already
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'group_members_pkey' 
    AND conrelid = 'public.group_members'::regclass
  ) THEN
    ALTER TABLE public.group_members ADD PRIMARY KEY (id);
  END IF;
END $$;

-- Add unique constraint for group_id and member_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'group_members_group_id_member_id_key' 
    AND conrelid = 'public.group_members'::regclass
  ) THEN
    ALTER TABLE public.group_members 
    ADD CONSTRAINT group_members_group_id_member_id_key UNIQUE (group_id, member_id);
  END IF;
END $$;

-- Add trigger for group_members updated_at
DROP TRIGGER IF EXISTS update_group_members_updated_at ON public.group_members;
CREATE TRIGGER update_group_members_updated_at 
  BEFORE UPDATE ON public.group_members 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- PART 3: CREATE GROUP_POSTS TABLE (IF NOT EXISTS)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.group_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.members(id),
  parent_id UUID REFERENCES public.group_posts(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  content_html TEXT,
  type TEXT DEFAULT 'post' CHECK (type IN ('post', 'announcement', 'discussion', 'poll', 'event')),
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  vote_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  edited_at TIMESTAMPTZ
);

-- Add indexes for group_posts
CREATE INDEX IF NOT EXISTS idx_group_posts_group_id ON public.group_posts(group_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_author_id ON public.group_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_group_posts_parent_id ON public.group_posts(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_group_posts_type_status ON public.group_posts(type, status);
CREATE INDEX IF NOT EXISTS idx_group_posts_created_at ON public.group_posts(created_at DESC);

-- Add trigger for group_posts updated_at
DROP TRIGGER IF EXISTS update_group_posts_updated_at ON public.group_posts;
CREATE TRIGGER update_group_posts_updated_at 
  BEFORE UPDATE ON public.group_posts 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- PART 4: CREATE GROUP_INVITATIONS TABLE (IF NOT EXISTS)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.group_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.members(id),
  invited_email TEXT,
  invited_member_id UUID REFERENCES public.members(id),
  token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'cancelled')),
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  message TEXT,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for group_invitations
CREATE INDEX IF NOT EXISTS idx_group_invitations_group_id ON public.group_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_token ON public.group_invitations(token) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_group_invitations_invited_email ON public.group_invitations(invited_email) WHERE invited_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_group_invitations_invited_member ON public.group_invitations(invited_member_id) WHERE invited_member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_group_invitations_status ON public.group_invitations(status);

-- Add trigger for group_invitations updated_at
DROP TRIGGER IF EXISTS update_group_invitations_updated_at ON public.group_invitations;
CREATE TRIGGER update_group_invitations_updated_at 
  BEFORE UPDATE ON public.group_invitations 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- PART 5: CREATE GROUP_ACTIVITIES TABLE (IF NOT EXISTS)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.group_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.members(id),
  action TEXT NOT NULL CHECK (action IN (
    'member_joined', 'member_left', 'member_invited', 'member_removed', 'member_banned',
    'role_changed', 'post_created', 'post_deleted', 'announcement_created',
    'event_created', 'event_updated', 'resource_added', 'settings_updated',
    'group_created', 'group_updated', 'group_archived'
  )),
  target_type TEXT,
  target_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for group_activities
CREATE INDEX IF NOT EXISTS idx_group_activities_group_id ON public.group_activities(group_id);
CREATE INDEX IF NOT EXISTS idx_group_activities_actor_id ON public.group_activities(actor_id);
CREATE INDEX IF NOT EXISTS idx_group_activities_action ON public.group_activities(action);
CREATE INDEX IF NOT EXISTS idx_group_activities_created_at ON public.group_activities(created_at DESC);

-- ================================================================
-- PART 6: ADD PERFORMANCE INDEXES
-- ================================================================

-- Groups table indexes
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON public.groups(created_by);
CREATE INDEX IF NOT EXISTS idx_groups_visibility_status ON public.groups(visibility, status);
CREATE INDEX IF NOT EXISTS idx_groups_slug ON public.groups(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_groups_is_featured ON public.groups(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON public.groups(created_at DESC);

-- Group members indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group_role ON public.group_members(group_id, role) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_group_members_member_status ON public.group_members(member_id, status);
CREATE INDEX IF NOT EXISTS idx_group_members_joined_at ON public.group_members(joined_at DESC) WHERE joined_at IS NOT NULL;

-- ================================================================
-- PART 7: SAFELY DROP AND RECREATE RLS POLICIES
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_activities ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh (safe to do)
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop policies for groups table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'groups' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.groups', pol.policyname);
    END LOOP;
    
    -- Drop policies for group_members table
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'group_members' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.group_members', pol.policyname);
    END LOOP;
    
    -- Drop policies for group_posts table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_posts' AND table_schema = 'public') THEN
        FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'group_posts' AND schemaname = 'public' LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.group_posts', pol.policyname);
        END LOOP;
    END IF;
    
    -- Drop policies for group_invitations table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_invitations' AND table_schema = 'public') THEN
        FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'group_invitations' AND schemaname = 'public' LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.group_invitations', pol.policyname);
        END LOOP;
    END IF;
    
    -- Drop policies for group_activities table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_activities' AND table_schema = 'public') THEN
        FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'group_activities' AND schemaname = 'public' LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.group_activities', pol.policyname);
        END LOOP;
    END IF;
END $$;

-- ================================================================
-- PART 8: CREATE NEW SIMPLIFIED RLS POLICIES
-- ================================================================

-- Groups table policies
CREATE POLICY "Anyone can view public groups"
  ON public.groups FOR SELECT
  USING (
    status = 'published' 
    AND visibility IN ('open', 'closed')
  );

CREATE POLICY "Members can view their secret groups"
  ON public.groups FOR SELECT
  TO authenticated
  USING (
    status = 'published' 
    AND visibility = 'secret'
    AND id IN (
      SELECT group_id FROM public.group_members 
      WHERE member_id IN (
        SELECT id FROM public.members 
        WHERE user_id = auth.uid()
      )
      AND status = 'active'
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON public.groups FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Group creators can update their groups"
  ON public.groups FOR UPDATE
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM public.members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Group creators can delete their groups"
  ON public.groups FOR DELETE
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM public.members 
      WHERE user_id = auth.uid()
    )
  );

-- Group members policies
CREATE POLICY "Anyone can view group members of public groups"
  ON public.group_members FOR SELECT
  USING (
    group_id IN (
      SELECT id FROM public.groups 
      WHERE status = 'published' 
      AND visibility IN ('open', 'closed')
    )
  );

CREATE POLICY "Members can view members of their secret groups"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT gm.group_id 
      FROM public.group_members gm
      JOIN public.members m ON m.id = gm.member_id
      WHERE m.user_id = auth.uid() 
      AND gm.status = 'active'
    )
  );

CREATE POLICY "Users can join open groups"
  ON public.group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT id FROM public.groups 
      WHERE status = 'published' 
      AND visibility = 'open'
    )
    AND member_id IN (
      SELECT id FROM public.members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can leave groups"
  ON public.group_members FOR DELETE
  TO authenticated
  USING (
    member_id IN (
      SELECT id FROM public.members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can manage members"
  ON public.group_members FOR ALL
  TO authenticated
  USING (
    group_id IN (
      SELECT gm.group_id 
      FROM public.group_members gm
      JOIN public.members m ON m.id = gm.member_id
      WHERE m.user_id = auth.uid() 
      AND gm.role = 'admin' 
      AND gm.status = 'active'
    )
  );

-- Group posts policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_posts' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "Anyone can view posts in public groups"
      ON public.group_posts FOR SELECT
      USING (
        status = ''published''
        AND group_id IN (
          SELECT id FROM public.groups 
          WHERE status = ''published'' 
          AND visibility IN (''open'', ''closed'')
        )
      )';
    
    EXECUTE 'CREATE POLICY "Members can view posts in their groups"
      ON public.group_posts FOR SELECT
      TO authenticated
      USING (
        group_id IN (
          SELECT gm.group_id 
          FROM public.group_members gm
          JOIN public.members m ON m.id = gm.member_id
          WHERE m.user_id = auth.uid() 
          AND gm.status = ''active''
        )
      )';
    
    EXECUTE 'CREATE POLICY "Members can create posts in their groups"
      ON public.group_posts FOR INSERT
      TO authenticated
      WITH CHECK (
        author_id IN (
          SELECT id FROM public.members 
          WHERE user_id = auth.uid()
        )
        AND group_id IN (
          SELECT gm.group_id 
          FROM public.group_members gm
          JOIN public.members m ON m.id = gm.member_id
          WHERE m.user_id = auth.uid() 
          AND gm.status = ''active''
        )
      )';
    
    EXECUTE 'CREATE POLICY "Authors can update their posts"
      ON public.group_posts FOR UPDATE
      TO authenticated
      USING (
        author_id IN (
          SELECT id FROM public.members 
          WHERE user_id = auth.uid()
        )
      )';
    
    EXECUTE 'CREATE POLICY "Authors and admins can delete posts"
      ON public.group_posts FOR DELETE
      TO authenticated
      USING (
        author_id IN (
          SELECT id FROM public.members 
          WHERE user_id = auth.uid()
        )
        OR group_id IN (
          SELECT gm.group_id 
          FROM public.group_members gm
          JOIN public.members m ON m.id = gm.member_id
          WHERE m.user_id = auth.uid() 
          AND gm.role = ''admin'' 
          AND gm.status = ''active''
        )
      )';
  END IF;
END $$;

-- Group invitations policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_invitations' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "Users can view their invitations"
      ON public.group_invitations FOR SELECT
      TO authenticated
      USING (
        invited_member_id IN (
          SELECT id FROM public.members 
          WHERE user_id = auth.uid()
        )
        OR invited_by IN (
          SELECT id FROM public.members 
          WHERE user_id = auth.uid()
        )
      )';
    
    EXECUTE 'CREATE POLICY "Group admins can create invitations"
      ON public.group_invitations FOR INSERT
      TO authenticated
      WITH CHECK (
        invited_by IN (
          SELECT id FROM public.members 
          WHERE user_id = auth.uid()
        )
        AND group_id IN (
          SELECT gm.group_id 
          FROM public.group_members gm
          JOIN public.members m ON m.id = gm.member_id
          WHERE m.user_id = auth.uid() 
          AND gm.role = ''admin'' 
          AND gm.status = ''active''
        )
      )';
    
    EXECUTE 'CREATE POLICY "Invitation creators can update their invitations"
      ON public.group_invitations FOR UPDATE
      TO authenticated
      USING (
        invited_by IN (
          SELECT id FROM public.members 
          WHERE user_id = auth.uid()
        )
      )';
  END IF;
END $$;

-- Group activities policies (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_activities' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "Members can view activities in their groups"
      ON public.group_activities FOR SELECT
      TO authenticated
      USING (
        group_id IN (
          SELECT gm.group_id 
          FROM public.group_members gm
          JOIN public.members m ON m.id = gm.member_id
          WHERE m.user_id = auth.uid() 
          AND gm.status = ''active''
        )
      )';
    
    EXECUTE 'CREATE POLICY "System can create activities"
      ON public.group_activities FOR INSERT
      TO authenticated
      WITH CHECK (true)';
  END IF;
END $$;

-- ================================================================
-- PART 9: CREATE UTILITY FUNCTIONS (IF NOT EXISTS)
-- ================================================================

-- Function to safely join a group
CREATE OR REPLACE FUNCTION public.join_group(
  p_group_id UUID,
  p_member_id UUID,
  p_role TEXT DEFAULT 'member'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_group_visibility TEXT;
  v_member_count INTEGER;
  v_max_members INTEGER;
BEGIN
  -- Check if group exists and is active
  SELECT visibility, member_count, max_members 
  INTO v_group_visibility, v_member_count, v_max_members
  FROM public.groups 
  WHERE id = p_group_id 
  AND status = 'published';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Group not found or not active';
  END IF;
  
  -- Check member limit
  IF v_member_count >= v_max_members THEN
    RAISE EXCEPTION 'Group has reached maximum member limit';
  END IF;
  
  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = p_group_id 
    AND member_id = p_member_id 
    AND status = 'active'
  ) THEN
    RETURN FALSE; -- Already a member
  END IF;
  
  -- Insert or update membership
  INSERT INTO public.group_members (
    group_id, member_id, role, status, joined_at
  ) VALUES (
    p_group_id, p_member_id, p_role, 'active', NOW()
  )
  ON CONFLICT (group_id, member_id) 
  DO UPDATE SET 
    status = 'active',
    joined_at = NOW(),
    left_at = NULL;
  
  -- Update member count
  UPDATE public.groups 
  SET member_count = member_count + 1 
  WHERE id = p_group_id;
  
  -- Log activity if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_activities' AND table_schema = 'public') THEN
    INSERT INTO public.group_activities (
      group_id, actor_id, action, metadata
    ) VALUES (
      p_group_id, p_member_id, 'member_joined', 
      jsonb_build_object('role', p_role)
    );
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely leave a group
CREATE OR REPLACE FUNCTION public.leave_group(
  p_group_id UUID,
  p_member_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if member exists
  IF NOT EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = p_group_id 
    AND member_id = p_member_id 
    AND status = 'active'
  ) THEN
    RETURN FALSE; -- Not a member
  END IF;
  
  -- Update membership status
  UPDATE public.group_members 
  SET 
    status = 'inactive',
    left_at = NOW()
  WHERE group_id = p_group_id 
  AND member_id = p_member_id;
  
  -- Update member count
  UPDATE public.groups 
  SET member_count = member_count - 1 
  WHERE id = p_group_id;
  
  -- Log activity if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_activities' AND table_schema = 'public') THEN
    INSERT INTO public.group_activities (
      group_id, actor_id, action
    ) VALUES (
      p_group_id, p_member_id, 'member_left'
    );
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to change member role
CREATE OR REPLACE FUNCTION public.change_member_role(
  p_group_id UUID,
  p_member_id UUID,
  p_new_role TEXT,
  p_changed_by UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_old_role TEXT;
BEGIN
  -- Check if changer is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.group_members 
    WHERE group_id = p_group_id 
    AND member_id = p_changed_by 
    AND role = 'admin' 
    AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Only admins can change member roles';
  END IF;
  
  -- Get old role
  SELECT role INTO v_old_role
  FROM public.group_members 
  WHERE group_id = p_group_id 
  AND member_id = p_member_id 
  AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN FALSE; -- Member not found
  END IF;
  
  -- Update role
  UPDATE public.group_members 
  SET role = p_new_role 
  WHERE group_id = p_group_id 
  AND member_id = p_member_id;
  
  -- Log activity if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_activities' AND table_schema = 'public') THEN
    INSERT INTO public.group_activities (
      group_id, actor_id, action, target_id, metadata
    ) VALUES (
      p_group_id, p_changed_by, 'role_changed', p_member_id,
      jsonb_build_object('old_role', v_old_role, 'new_role', p_new_role)
    );
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(
  p_token TEXT,
  p_member_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  -- Check if invitations table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_invitations' AND table_schema = 'public') THEN
    RAISE EXCEPTION 'Invitations feature not available';
  END IF;
  
  -- Get invitation details
  SELECT * INTO v_invitation
  FROM public.group_invitations 
  WHERE token = p_token 
  AND status = 'pending' 
  AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;
  
  -- Check if invitation is for this member
  IF v_invitation.invited_member_id IS NOT NULL 
  AND v_invitation.invited_member_id != p_member_id THEN
    RAISE EXCEPTION 'Invitation is for a different member';
  END IF;
  
  -- Join the group
  PERFORM public.join_group(
    v_invitation.group_id, 
    p_member_id, 
    v_invitation.role
  );
  
  -- Update invitation status
  UPDATE public.group_invitations 
  SET 
    status = 'accepted',
    accepted_at = NOW()
  WHERE id = v_invitation.id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- PART 10: MIGRATE EXISTING DATA
-- ================================================================

-- Update member_count for existing groups
UPDATE public.groups g
SET member_count = COALESCE((
  SELECT COUNT(*) 
  FROM public.group_members gm 
  WHERE gm.group_id = g.id 
  AND (gm.status = 'active' OR gm.status IS NULL)
), 0)
WHERE member_count IS NULL OR member_count = 0;

-- Set joined_at for existing active members
UPDATE public.group_members 
SET joined_at = COALESCE(created_at, NOW())
WHERE (status = 'active' OR status IS NULL)
AND joined_at IS NULL;

-- Set created_by for existing groups (if possible)
UPDATE public.groups g
SET created_by = (
  SELECT member_id 
  FROM public.group_members gm 
  WHERE gm.group_id = g.id 
  AND gm.role = 'admin' 
  ORDER BY COALESCE(gm.created_at, NOW())
  LIMIT 1
)
WHERE created_by IS NULL;

-- ================================================================
-- PART 11: GRANT PERMISSIONS
-- ================================================================

GRANT ALL ON public.groups TO authenticated;
GRANT ALL ON public.group_members TO authenticated;
GRANT SELECT ON public.groups TO anon;
GRANT SELECT ON public.group_members TO anon;

-- Grant permissions on new tables if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_posts' AND table_schema = 'public') THEN
    EXECUTE 'GRANT ALL ON public.group_posts TO authenticated';
    EXECUTE 'GRANT SELECT ON public.group_posts TO anon';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_invitations' AND table_schema = 'public') THEN
    EXECUTE 'GRANT ALL ON public.group_invitations TO authenticated';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_activities' AND table_schema = 'public') THEN
    EXECUTE 'GRANT ALL ON public.group_activities TO authenticated';
  END IF;
END $$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.join_group TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_group TO authenticated;
GRANT EXECUTE ON FUNCTION public.change_member_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invitation TO authenticated;

COMMIT;

-- ================================================================
-- VERIFICATION QUERIES (Run these after migration)
-- ================================================================

/*
-- Check that all columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'groups'
AND column_name IN ('created_by', 'updated_at', 'max_members', 'member_count');

-- Check new tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('group_posts', 'group_invitations', 'group_activities');

-- Check RLS policies
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('groups', 'group_members', 'group_posts', 'group_invitations', 'group_activities')
ORDER BY tablename, policyname;

-- Check functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('join_group', 'leave_group', 'change_member_role', 'accept_invitation');
*/