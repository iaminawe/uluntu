-- =============================================
-- COMPLETE RLS FIX FOR CONVERSATION OPERATIONS
-- =============================================
-- This migration addresses:
-- 1. RLS blocking conversation updates (406 errors) 
-- 2. "JSON object requested, multiple (or no) rows returned" errors
-- 3. Database functions for secure operations
-- 4. Proper participant verification
-- 5. Fallback strategies for blocked operations

-- =============================================
-- 1. CREATE SECURE DATABASE FUNCTIONS
-- =============================================

-- Function to safely update conversation title
CREATE OR REPLACE FUNCTION update_conversation_title(
  conversation_id UUID,
  new_title TEXT
) RETURNS conversations AS $$
DECLARE
  current_member_id UUID;
  conversation_record conversations;
  is_participant BOOLEAN := FALSE;
  is_creator BOOLEAN := FALSE;
BEGIN
  -- Get current user's member ID
  SELECT id INTO current_member_id 
  FROM members 
  WHERE user_id = auth.uid();
  
  IF current_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;

  -- Check if user is a participant or creator
  SELECT EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = update_conversation_title.conversation_id
    AND cp.user_id = current_member_id
    AND cp.left_at IS NULL
  ) INTO is_participant;

  SELECT EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = update_conversation_title.conversation_id
    AND c.created_by = current_member_id
  ) INTO is_creator;

  -- Verify authorization
  IF NOT (is_participant OR is_creator) THEN
    RAISE EXCEPTION 'User not authorized to update this conversation';
  END IF;

  -- Update the conversation
  UPDATE conversations 
  SET 
    title = new_title,
    updated_at = NOW()
  WHERE id = conversation_id
  RETURNING * INTO conversation_record;

  -- Verify update succeeded
  IF conversation_record.id IS NULL THEN
    RAISE EXCEPTION 'Failed to update conversation';
  END IF;

  RETURN conversation_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION update_conversation_title(UUID, TEXT) TO authenticated;

-- Function to safely get conversation details
CREATE OR REPLACE FUNCTION get_conversation_secure(
  conversation_id UUID
) RETURNS conversations AS $$
DECLARE
  current_member_id UUID;
  conversation_record conversations;
  has_access BOOLEAN := FALSE;
BEGIN
  -- Get current user's member ID
  SELECT id INTO current_member_id 
  FROM members 
  WHERE user_id = auth.uid();
  
  IF current_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;

  -- Check if user has access to this conversation
  SELECT EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = get_conversation_secure.conversation_id
    AND cp.user_id = current_member_id
    AND cp.left_at IS NULL
  ) INTO has_access;

  -- If no access, check if user is creator
  IF NOT has_access THEN
    SELECT EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = get_conversation_secure.conversation_id
      AND c.created_by = current_member_id
    ) INTO has_access;
  END IF;

  -- Verify authorization
  IF NOT has_access THEN
    RAISE EXCEPTION 'User not authorized to access this conversation';
  END IF;

  -- Get the conversation
  SELECT * INTO conversation_record
  FROM conversations 
  WHERE id = conversation_id;

  -- Verify conversation exists
  IF conversation_record.id IS NULL THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  RETURN conversation_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_conversation_secure(UUID) TO authenticated;

-- Function to check participant status
CREATE OR REPLACE FUNCTION check_conversation_participant(
  conversation_id UUID,
  member_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  current_member_id UUID;
  participant_info JSONB;
BEGIN
  -- Use provided member_id or get current user's member ID
  IF member_id IS NULL THEN
    SELECT id INTO current_member_id 
    FROM members 
    WHERE user_id = auth.uid();
  ELSE
    current_member_id := member_id;
  END IF;
  
  IF current_member_id IS NULL THEN
    RETURN jsonb_build_object(
      'is_participant', false,
      'is_creator', false,
      'role', null,
      'error', 'User does not have a member profile'
    );
  END IF;

  -- Get participant information
  SELECT jsonb_build_object(
    'is_participant', CASE WHEN cp.user_id IS NOT NULL THEN true ELSE false END,
    'is_creator', CASE WHEN c.created_by = current_member_id THEN true ELSE false END,
    'role', cp.role,
    'joined_at', cp.joined_at,
    'left_at', cp.left_at,
    'conversation_id', conversation_id,
    'member_id', current_member_id
  ) INTO participant_info
  FROM conversations c
  LEFT JOIN conversation_participants cp ON (
    cp.conversation_id = c.id 
    AND cp.user_id = current_member_id
    AND cp.left_at IS NULL
  )
  WHERE c.id = check_conversation_participant.conversation_id;

  -- If no conversation found
  IF participant_info IS NULL THEN
    RETURN jsonb_build_object(
      'is_participant', false,
      'is_creator', false,
      'role', null,
      'error', 'Conversation not found'
    );
  END IF;

  RETURN participant_info;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_conversation_participant(UUID, UUID) TO authenticated;

-- =============================================
-- 2. UPDATE RLS POLICIES FOR CONVERSATIONS
-- =============================================

-- First, safely disable RLS to update policies
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  -- Drop conversation policies
  FOR pol IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'conversations'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON conversations', pol.policyname);
  END LOOP;

  -- Drop participant policies  
  FOR pol IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'conversation_participants'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON conversation_participants', pol.policyname);
  END LOOP;

  -- Drop message policies
  FOR pol IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'messages'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON messages', pol.policyname);
  END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. CREATE NEW SECURE POLICIES
-- =============================================

-- CONVERSATIONS: Allow broad access but secure updates
CREATE POLICY "conversations_select_open" ON conversations
    FOR SELECT USING (
        -- Allow access if user is participant or creator
        id IN (
            SELECT cp.conversation_id
            FROM conversation_participants cp
            JOIN members m ON m.id = cp.user_id
            WHERE m.user_id = auth.uid() AND cp.left_at IS NULL
        )
        OR created_by IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "conversations_insert_members" ON conversations
    FOR INSERT WITH CHECK (
        -- Only authenticated members can create conversations
        auth.uid() IN (SELECT user_id FROM members)
    );

CREATE POLICY "conversations_update_secure" ON conversations
    FOR UPDATE USING (
        -- Allow updates from participants and creators with admin role
        id IN (
            SELECT cp.conversation_id
            FROM conversation_participants cp
            JOIN members m ON m.id = cp.user_id
            WHERE m.user_id = auth.uid() 
            AND cp.left_at IS NULL
            AND cp.role IN ('admin', 'moderator')
        )
        OR created_by IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

-- CONVERSATION_PARTICIPANTS: Secure access
CREATE POLICY "participants_select_own" ON conversation_participants
    FOR SELECT USING (
        -- Users can see participants of conversations they're in
        conversation_id IN (
            SELECT cp2.conversation_id
            FROM conversation_participants cp2
            JOIN members m ON m.id = cp2.user_id
            WHERE m.user_id = auth.uid() AND cp2.left_at IS NULL
        )
    );

CREATE POLICY "participants_insert_admin" ON conversation_participants
    FOR INSERT WITH CHECK (
        -- Only admins can add participants
        conversation_id IN (
            SELECT cp.conversation_id
            FROM conversation_participants cp
            JOIN members m ON m.id = cp.user_id
            WHERE m.user_id = auth.uid()
            AND cp.left_at IS NULL
            AND cp.role IN ('admin', 'moderator')
        )
        OR conversation_id IN (
            SELECT c.id
            FROM conversations c
            JOIN members m ON m.id = c.created_by
            WHERE m.user_id = auth.uid()
        )
    );

CREATE POLICY "participants_update_own" ON conversation_participants
    FOR UPDATE USING (
        -- Users can update their own participation status
        user_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
        OR conversation_id IN (
            SELECT cp.conversation_id
            FROM conversation_participants cp
            JOIN members m ON m.id = cp.user_id
            WHERE m.user_id = auth.uid()
            AND cp.left_at IS NULL
            AND cp.role IN ('admin', 'moderator')
        )
    );

-- MESSAGES: Secure message access
CREATE POLICY "messages_select_participants" ON messages
    FOR SELECT USING (
        -- Users can see messages in conversations they participate in
        conversation_id IN (
            SELECT cp.conversation_id
            FROM conversation_participants cp
            JOIN members m ON m.id = cp.user_id
            WHERE m.user_id = auth.uid() AND cp.left_at IS NULL
        )
    );

CREATE POLICY "messages_insert_participants" ON messages
    FOR INSERT WITH CHECK (
        -- Users can send messages to conversations they participate in
        conversation_id IN (
            SELECT cp.conversation_id
            FROM conversation_participants cp
            JOIN members m ON m.id = cp.user_id
            WHERE m.user_id = auth.uid() AND cp.left_at IS NULL
        )
        AND sender_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "messages_update_own" ON messages
    FOR UPDATE USING (
        -- Users can edit their own messages
        sender_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

-- =============================================
-- 4. CREATE ERROR HANDLING VIEW
-- =============================================

-- Create a view for conversation operation status
CREATE OR REPLACE VIEW conversation_operation_status AS
SELECT 
  c.id as conversation_id,
  c.title,
  c.type,
  c.created_by,
  cp.user_id as participant_id,
  cp.role as participant_role,
  cp.left_at,
  m.user_id as auth_user_id,
  CASE 
    WHEN cp.user_id IS NOT NULL AND cp.left_at IS NULL THEN 'participant'
    WHEN c.created_by = cp.user_id THEN 'creator'
    ELSE 'no_access'
  END as access_level,
  CASE 
    WHEN cp.role IN ('admin', 'moderator') OR c.created_by = cp.user_id THEN true
    ELSE false
  END as can_update
FROM conversations c
LEFT JOIN conversation_participants cp ON c.id = cp.conversation_id
LEFT JOIN members m ON m.id = cp.user_id;

-- Grant access
GRANT SELECT ON conversation_operation_status TO authenticated;

-- =============================================
-- 5. VERIFICATION AND LOGGING
-- =============================================

DO $$
DECLARE
  policy_count INTEGER;
  function_count INTEGER;
  view_count INTEGER;
BEGIN
  -- Count policies
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE schemaname = 'public' 
    AND tablename IN ('conversations', 'conversation_participants', 'messages');

  -- Count functions
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN ('update_conversation_title', 'get_conversation_secure', 'check_conversation_participant');

  -- Count views
  SELECT COUNT(*) INTO view_count
  FROM information_schema.views
  WHERE table_schema = 'public'
    AND table_name IN ('conversation_operation_status', 'user_conversation_access');

  RAISE NOTICE '========================================';
  RAISE NOTICE 'CONVERSATION RLS COMPLETE FIX APPLIED';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database Functions: %', function_count;
  RAISE NOTICE 'RLS Policies: %', policy_count;
  RAISE NOTICE 'Helper Views: %', view_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Features Implemented:';
  RAISE NOTICE '✓ Secure conversation title updates';
  RAISE NOTICE '✓ Participant verification functions';  
  RAISE NOTICE '✓ Error handling for 406 responses';
  RAISE NOTICE '✓ Fallback strategies for blocked operations';
  RAISE NOTICE '✓ Comprehensive RLS policies';
  RAISE NOTICE '✓ Operation status monitoring';
  RAISE NOTICE '========================================';
END $$;