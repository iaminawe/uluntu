-- =============================================
-- Fix conversation management functions
-- =============================================

-- First, drop any existing versions to avoid conflicts
DROP FUNCTION IF EXISTS public.update_conversation_title(UUID, TEXT);
DROP FUNCTION IF EXISTS public.check_conversation_participant(UUID);
DROP FUNCTION IF EXISTS public.check_conversation_participant(UUID, UUID);

-- =============================================
-- Function to check conversation participant (single parameter version)
-- This is the version the app is calling
-- =============================================
CREATE OR REPLACE FUNCTION public.check_conversation_participant(
  conversation_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  check_member_id UUID;
  participant_role TEXT;
  is_participant BOOLEAN := false;
  is_creator BOOLEAN := false;
  can_update BOOLEAN := false;
BEGIN
  -- Get current user's member ID
  SELECT id INTO check_member_id
  FROM members
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF check_member_id IS NULL THEN
    RETURN jsonb_build_object(
      'is_participant', false,
      'is_creator', false,
      'role', null,
      'can_update', false,
      'error', 'User is not a member'
    );
  END IF;

  -- Check if conversation exists and get participant info
  SELECT 
    CASE 
      WHEN cp.user_id IS NOT NULL AND cp.left_at IS NULL THEN true
      ELSE false
    END,
    CASE 
      WHEN c.created_by = check_member_id THEN true
      ELSE false
    END,
    cp.role
  INTO is_participant, is_creator, participant_role
  FROM conversations c
  LEFT JOIN conversation_participants cp ON (
    c.id = cp.conversation_id
    AND cp.user_id = check_member_id
    AND cp.left_at IS NULL
  )
  WHERE c.id = check_conversation_participant.conversation_id;

  -- If no conversation found
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'is_participant', false,
      'is_creator', false,
      'role', null,
      'can_update', false,
      'error', 'Conversation not found'
    );
  END IF;

  -- Determine if user can update
  can_update := is_creator OR (is_participant AND participant_role IN ('admin', 'moderator'));

  -- Return the result
  RETURN jsonb_build_object(
    'is_participant', COALESCE(is_participant, false),
    'is_creator', COALESCE(is_creator, false),
    'role', participant_role,
    'can_update', COALESCE(can_update, false)
  );
END;
$$;

-- =============================================
-- Function to update conversation title
-- =============================================
CREATE OR REPLACE FUNCTION public.update_conversation_title(
  conversation_id UUID,
  new_title TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_member_id UUID;
  is_participant BOOLEAN := false;
  is_creator BOOLEAN := false;
  updated_conversation JSONB;
BEGIN
  -- Get current user's member ID
  SELECT id INTO current_member_id
  FROM members
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF current_member_id IS NULL THEN
    RAISE EXCEPTION 'User is not a member';
  END IF;

  -- Check if user is a participant
  SELECT EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = update_conversation_title.conversation_id
    AND cp.user_id = current_member_id
    AND cp.left_at IS NULL
  ) INTO is_participant;

  -- Check if user is the creator
  SELECT EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = update_conversation_title.conversation_id
    AND c.created_by = current_member_id
  ) INTO is_creator;

  -- User must be either a participant or the creator
  IF NOT is_participant AND NOT is_creator THEN
    RAISE EXCEPTION 'You do not have permission to update this conversation';
  END IF;

  -- Update the conversation title and return as JSONB
  UPDATE conversations
  SET 
    title = new_title,
    updated_at = NOW()
  WHERE id = update_conversation_title.conversation_id
  RETURNING to_jsonb(conversations.*) INTO updated_conversation;

  IF updated_conversation IS NULL THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  RETURN updated_conversation;
END;
$$;

-- =============================================
-- Grant permissions
-- =============================================
GRANT EXECUTE ON FUNCTION public.update_conversation_title(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_conversation_participant(UUID) TO authenticated;

-- =============================================
-- Add comments for documentation
-- =============================================
COMMENT ON FUNCTION public.update_conversation_title(UUID, TEXT) IS 
'Securely update a conversation title. User must be a participant or creator of the conversation.';

COMMENT ON FUNCTION public.check_conversation_participant(UUID) IS 
'Check if the current user is a participant in a conversation and their role/permissions.';

-- =============================================
-- Verify functions were created successfully
-- =============================================
SELECT 
  'Functions created successfully' AS status,
  COUNT(*) AS function_count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('update_conversation_title', 'check_conversation_participant');