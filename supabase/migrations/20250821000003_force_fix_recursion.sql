-- FORCE FIX: Complete reset of conversation system RLS policies
-- This migration disables RLS temporarily, drops all policies, then recreates them

-- =============================================
-- STEP 1: DISABLE RLS TEMPORARILY
-- =============================================
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 2: FORCE DROP ALL POLICIES (with CASCADE if needed)
-- =============================================

-- Drop ALL policies on conversations
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversations')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.conversations CASCADE', r.policyname);
        RAISE NOTICE 'Dropped policy: % on conversations', r.policyname;
    END LOOP;
END $$;

-- Drop ALL policies on conversation_participants
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'conversation_participants')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.conversation_participants CASCADE', r.policyname);
        RAISE NOTICE 'Dropped policy: % on conversation_participants', r.policyname;
    END LOOP;
END $$;

-- Drop ALL policies on messages
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'messages')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.messages CASCADE', r.policyname);
        RAISE NOTICE 'Dropped policy: % on messages', r.policyname;
    END LOOP;
END $$;

-- =============================================
-- STEP 3: RE-ENABLE RLS
-- =============================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 4: CREATE SIMPLE, NON-RECURSIVE POLICIES
-- =============================================

-- Simple helper function to get member ID
CREATE OR REPLACE FUNCTION get_auth_member_id()
RETURNS UUID AS $$
    SELECT id FROM public.members WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- CONVERSATIONS: Simple policy using direct member lookup
CREATE POLICY "conversations_select_v3" ON public.conversations
    FOR SELECT 
    USING (
        id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = get_auth_member_id()
              AND left_at IS NULL
        )
    );

CREATE POLICY "conversations_insert_v3" ON public.conversations
    FOR INSERT 
    WITH CHECK (
        get_auth_member_id() IS NOT NULL
    );

CREATE POLICY "conversations_update_v3" ON public.conversations
    FOR UPDATE 
    USING (
        id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = get_auth_member_id()
              AND role IN ('admin', 'moderator')
              AND left_at IS NULL
        )
    );

-- PARTICIPANTS: Direct member ID comparison, no recursion
CREATE POLICY "participants_select_v3" ON public.conversation_participants
    FOR SELECT 
    USING (
        -- User can see participants if they are in the same conversation
        conversation_id IN (
            SELECT conversation_id 
            FROM public.conversation_participants cp_inner
            WHERE cp_inner.user_id = get_auth_member_id()
              AND cp_inner.left_at IS NULL
        )
    );

CREATE POLICY "participants_insert_v3" ON public.conversation_participants
    FOR INSERT 
    WITH CHECK (
        -- Can add participants if user is admin/moderator of the conversation
        conversation_id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = get_auth_member_id()
              AND role IN ('admin', 'moderator')
              AND left_at IS NULL
        )
    );

CREATE POLICY "participants_update_v3" ON public.conversation_participants
    FOR UPDATE 
    USING (
        -- Users can only update their own participant record
        user_id = get_auth_member_id()
    );

-- MESSAGES: Simple conversation membership check
CREATE POLICY "messages_select_v3" ON public.messages
    FOR SELECT 
    USING (
        conversation_id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = get_auth_member_id()
              AND left_at IS NULL
        )
    );

CREATE POLICY "messages_insert_v3" ON public.messages
    FOR INSERT 
    WITH CHECK (
        conversation_id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = get_auth_member_id()
              AND left_at IS NULL
        )
        AND sender_id = get_auth_member_id()
    );

CREATE POLICY "messages_update_v3" ON public.messages
    FOR UPDATE 
    USING (
        sender_id = get_auth_member_id()
    );

CREATE POLICY "messages_delete_v3" ON public.messages
    FOR DELETE 
    USING (
        sender_id = get_auth_member_id()
    );

-- =============================================
-- STEP 5: ENSURE COLUMN EXISTS
-- =============================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
          AND table_name = 'conversation_participants' 
          AND column_name = 'notification_settings'
    ) THEN
        ALTER TABLE public.conversation_participants 
        ADD COLUMN notification_settings JSONB DEFAULT '{"email": true, "push": true}'::jsonb;
    END IF;
END $$;

-- =============================================
-- STEP 6: GRANT PERMISSIONS
-- =============================================
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.conversation_participants TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT EXECUTE ON FUNCTION get_auth_member_id() TO authenticated;

-- =============================================
-- VERIFICATION: Check what policies exist
-- =============================================
DO $$
DECLARE
    policy_count INTEGER;
    r RECORD;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('conversations', 'conversation_participants', 'messages');
    
    RAISE NOTICE 'Total policies after migration: %', policy_count;
    
    -- List all policies
    FOR r IN (
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('conversations', 'conversation_participants', 'messages')
        ORDER BY tablename, policyname
    )
    LOOP
        RAISE NOTICE 'Policy: %.%', r.tablename, r.policyname;
    END LOOP;
END $$;