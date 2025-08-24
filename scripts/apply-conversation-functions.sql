-- Direct SQL script to add missing conversation functions
-- Run this directly in Supabase SQL Editor

-- Drop existing functions if they exist (to avoid conflicts)
DROP FUNCTION IF EXISTS public.update_conversation_title(UUID, TEXT);
DROP FUNCTION IF EXISTS public.check_conversation_participant(UUID, UUID);
DROP FUNCTION IF EXISTS public.check_conversation_participant(UUID);

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
  is_participant BOOLEAN;
  is_creator BOOLEAN;
  conversation_record conversations%ROWTYPE;
BEGIN
  -- Get current user's member ID
  SELECT id INTO current_member_id
  FROM members
  WHERE user_id = auth.uid();

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

  -- Update the conversation title
  UPDATE conversations
  SET 
    title = new_title,
    updated_at = NOW()
  WHERE id = update_conversation_title.conversation_id
  RETURNING * INTO conversation_record;

  IF conversation_record.id IS NULL THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  -- Return the updated conversation as JSONB
  RETURN to_jsonb(conversation_record);
END;
$$;

-- =============================================
-- Function to check conversation participant status
-- =============================================
CREATE OR REPLACE FUNCTION public.check_conversation_participant(
  conversation_id UUID,
  member_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  check_member_id UUID;
  result JSONB;
  participant_role TEXT;
  is_participant BOOLEAN;
  is_creator BOOLEAN;
  can_update BOOLEAN;
BEGIN
  -- Use provided member_id or get current user's member ID
  IF member_id IS NOT NULL THEN
    check_member_id := member_id;
  ELSE
    SELECT id INTO check_member_id
    FROM members
    WHERE user_id = auth.uid();
  END IF;

  IF check_member_id IS NULL THEN
    RETURN jsonb_build_object(
      'is_participant', false,
      'is_creator', false,
      'role', null,
      'can_update', false,
      'error', 'User is not a member'
    );
  END IF;

  -- Get participant information
  SELECT 
    CASE 
      WHEN cp.user_id IS NOT NULL AND cp.left_at IS NULL THEN true
      ELSE false
    END AS is_participant,
    CASE 
      WHEN c.created_by = check_member_id THEN true
      ELSE false
    END AS is_creator,
    cp.role AS participant_role
  INTO is_participant, is_creator, participant_role
  FROM conversations c
  LEFT JOIN conversation_participants cp ON (
    c.id = cp.conversation_id
    AND cp.user_id = check_member_id
    AND cp.left_at IS NULL
  )
  WHERE c.id = check_conversation_participant.conversation_id;

  -- If no conversation found
  IF is_participant IS NULL AND is_creator IS NULL THEN
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
-- Grant permissions
-- =============================================
GRANT EXECUTE ON FUNCTION public.update_conversation_title(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_conversation_participant(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_conversation_participant(UUID) TO authenticated;

-- =============================================
-- Add comments for documentation
-- =============================================
COMMENT ON FUNCTION public.update_conversation_title(UUID, TEXT) IS 
'Securely update a conversation title. User must be a participant or creator of the conversation.';

COMMENT ON FUNCTION public.check_conversation_participant(UUID, UUID) IS 
'Check if a member is a participant in a conversation and their role/permissions.';

-- Verify functions were created
SELECT 
  p.proname AS function_name,
  pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN ('update_conversation_title', 'check_conversation_participant');