-- =============================================
-- CONVERSATION DELETION FUNCTIONS
-- =============================================
-- Description: Add RLS-compatible functions for conversation deletion and management
-- Dependencies: conversations, conversation_participants, messages tables
-- Version: 1.0
-- Date: 2025-08-22

-- =============================================
-- 1. SOFT DELETE CONVERSATION FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION archive_conversation(
  conversation_uuid UUID
) RETURNS VOID AS $$
DECLARE
  current_member_id UUID;
BEGIN
  -- Get current user's member ID
  SELECT id INTO current_member_id 
  FROM members 
  WHERE user_id = auth.uid();
  
  IF current_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;

  -- Verify user is a participant
  IF NOT EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conversation_uuid 
    AND user_id = current_member_id 
    AND left_at IS NULL
  ) THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;

  -- Archive the conversation
  UPDATE conversations 
  SET 
    archived_at = NOW(),
    updated_at = NOW()
  WHERE id = conversation_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 2. UNARCHIVE CONVERSATION FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION unarchive_conversation(
  conversation_uuid UUID
) RETURNS VOID AS $$
DECLARE
  current_member_id UUID;
BEGIN
  -- Get current user's member ID
  SELECT id INTO current_member_id 
  FROM members 
  WHERE user_id = auth.uid();
  
  IF current_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;

  -- Verify user is a participant
  IF NOT EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conversation_uuid 
    AND user_id = current_member_id 
    AND left_at IS NULL
  ) THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;

  -- Unarchive the conversation
  UPDATE conversations 
  SET 
    archived_at = NULL,
    updated_at = NOW()
  WHERE id = conversation_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. HARD DELETE CONVERSATION FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION delete_conversation(
  conversation_uuid UUID,
  delete_reason TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  current_member_id UUID;
  conversation_type TEXT;
  conversation_creator UUID;
  participant_role TEXT;
BEGIN
  -- Get current user's member ID
  SELECT id INTO current_member_id 
  FROM members 
  WHERE user_id = auth.uid();
  
  IF current_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;

  -- Get conversation details
  SELECT type, created_by INTO conversation_type, conversation_creator
  FROM conversations 
  WHERE id = conversation_uuid;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  -- Get user's role in conversation
  SELECT role INTO participant_role
  FROM conversation_participants 
  WHERE conversation_id = conversation_uuid 
  AND user_id = current_member_id 
  AND left_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;

  -- Check permissions
  IF conversation_creator != current_member_id 
     AND participant_role != 'admin' 
     AND conversation_type != 'direct' THEN
    RAISE EXCEPTION 'Insufficient permissions to delete this conversation';
  END IF;

  -- For direct conversations or if user is creator/admin, mark as deleted
  IF conversation_type = 'direct' OR conversation_creator = current_member_id OR participant_role = 'admin' THEN
    UPDATE conversations 
    SET 
      archived_at = NOW(),
      updated_at = NOW(),
      metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
        'deleted', true,
        'deleted_by', current_member_id,
        'deleted_at', NOW()::text,
        'reason', delete_reason
      )
    WHERE id = conversation_uuid;
  ELSE
    -- For group conversations, just remove the user
    UPDATE conversation_participants 
    SET left_at = NOW()
    WHERE conversation_id = conversation_uuid 
    AND user_id = current_member_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. LEAVE CONVERSATION FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION leave_conversation(
  conversation_uuid UUID
) RETURNS VOID AS $$
DECLARE
  current_member_id UUID;
BEGIN
  -- Get current user's member ID
  SELECT id INTO current_member_id 
  FROM members 
  WHERE user_id = auth.uid();
  
  IF current_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;

  -- Verify user is a participant
  IF NOT EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_id = conversation_uuid 
    AND user_id = current_member_id 
    AND left_at IS NULL
  ) THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;

  -- Mark user as having left
  UPDATE conversation_participants 
  SET left_at = NOW()
  WHERE conversation_id = conversation_uuid 
  AND user_id = current_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. UPDATE CONVERSATION TITLE FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION update_conversation_title(
  conversation_id UUID,
  new_title TEXT
) RETURNS conversations AS $$
DECLARE
  current_member_id UUID;
  conversation_record conversations;
BEGIN
  -- Get current user's member ID
  SELECT id INTO current_member_id 
  FROM members 
  WHERE user_id = auth.uid();
  
  IF current_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;

  -- Verify user is a participant
  IF NOT EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = update_conversation_title.conversation_id 
    AND cp.user_id = current_member_id 
    AND cp.left_at IS NULL
  ) THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;

  -- Update conversation title
  UPDATE conversations 
  SET 
    title = new_title,
    updated_at = NOW()
  WHERE id = update_conversation_title.conversation_id
  RETURNING * INTO conversation_record;
  
  RETURN conversation_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. GET USER BLOCKED STATUS FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION is_user_blocked(
  other_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  blocked_count INTEGER;
BEGIN
  -- Check if current user has blocked the other user
  SELECT COUNT(*) INTO blocked_count
  FROM messaging_blocks 
  WHERE blocker_id = auth.uid() 
  AND blocked_id = other_user_id;
  
  RETURN blocked_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. GRANT PERMISSIONS
-- =============================================

GRANT EXECUTE ON FUNCTION archive_conversation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION unarchive_conversation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_conversation(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION leave_conversation(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_conversation_title(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_blocked(UUID) TO authenticated;

-- =============================================
-- 8. UPDATE RLS POLICIES FOR DELETION SUPPORT
-- =============================================

-- Add policy to allow deleting own conversations via function
CREATE POLICY "conversations_delete_via_function" ON conversations
    FOR UPDATE USING (
        id IN (
            SELECT conversation_id 
            FROM user_conversation_access 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Add policy to allow leaving conversations
CREATE POLICY "participants_leave_conversation" ON conversation_participants
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- This migration adds:
-- - RLS-compatible conversation archiving/unarchiving
-- - Safe conversation deletion with permission checks
-- - Leave conversation functionality
-- - Update conversation title function
-- - User blocking status check
-- - Appropriate RLS policies for deletion operations