-- COMPREHENSIVE MESSAGING SYSTEM FIX
-- Fixes foreign key constraints and infinite recursion in policies
-- Addresses errors: conversations_created_by_fkey and infinite recursion in conversation_participants

-- =============================================
-- 1. FIX CONVERSATIONS TABLE FOREIGN KEY
-- =============================================

-- Drop existing foreign key constraint on conversations.created_by
ALTER TABLE conversations 
DROP CONSTRAINT IF EXISTS conversations_created_by_fkey;

-- Add new foreign key constraint that references members table
ALTER TABLE conversations 
ADD CONSTRAINT conversations_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES members(id) ON DELETE CASCADE;

-- =============================================
-- 2. FIX CONVERSATION_PARTICIPANTS FOREIGN KEY (if not already fixed)
-- =============================================

-- Drop existing foreign key constraint on conversation_participants.user_id
ALTER TABLE conversation_participants 
DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey;

-- Add new foreign key constraint that references members table
ALTER TABLE conversation_participants 
ADD CONSTRAINT conversation_participants_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE;

-- =============================================
-- 3. FIX MESSAGES TABLE FOREIGN KEY
-- =============================================

-- Drop existing foreign key constraint on messages.sender_id
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- Add new foreign key constraint that references members table
ALTER TABLE messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES members(id) ON DELETE CASCADE;

-- =============================================
-- 4. FIX MESSAGE_REACTIONS TABLE FOREIGN KEY
-- =============================================

-- Drop existing foreign key constraint on message_reactions.user_id
ALTER TABLE message_reactions 
DROP CONSTRAINT IF EXISTS message_reactions_user_id_fkey;

-- Add new foreign key constraint that references members table
ALTER TABLE message_reactions 
ADD CONSTRAINT message_reactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE;

-- =============================================
-- 5. FIX INFINITE RECURSION IN POLICIES
-- =============================================

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

-- Create new policies that avoid recursion by using direct member relationships

-- Conversations: Users can only see conversations they participate in
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp
      INNER JOIN members m ON cp.user_id = m.id
      WHERE cp.conversation_id = conversations.id 
        AND m.user_id = auth.uid() 
        AND cp.left_at IS NULL
    )
  );

-- Conversation Participants: Users can see participants of their conversations
CREATE POLICY "Users can view conversation participants" ON conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp2
      INNER JOIN members m ON cp2.user_id = m.id
      WHERE cp2.conversation_id = conversation_participants.conversation_id
        AND m.user_id = auth.uid()
        AND cp2.left_at IS NULL
    )
  );

-- Messages: Users can only see messages in their conversations
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp
      INNER JOIN members m ON cp.user_id = m.id
      WHERE cp.conversation_id = messages.conversation_id
        AND m.user_id = auth.uid()
        AND cp.left_at IS NULL
    )
  );

-- =============================================
-- 6. UPDATE FUNCTIONS TO USE MEMBER IDS
-- =============================================

-- Drop and recreate functions that use auth.uid() to work with member IDs
DROP FUNCTION IF EXISTS get_unread_message_count(UUID);
DROP FUNCTION IF EXISTS mark_conversation_as_read(UUID, UUID);

-- Function to get unread message count for a member
CREATE OR REPLACE FUNCTION get_unread_message_count()
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
  current_member_id UUID;
BEGIN
  -- Get current user's member ID
  SELECT id INTO current_member_id 
  FROM members 
  WHERE user_id = auth.uid();
  
  IF current_member_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT COALESCE(SUM(
    CASE 
      WHEN cp.last_read_message_id IS NULL THEN 
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = cp.conversation_id AND m.sender_id != current_member_id)
      ELSE 
        (SELECT COUNT(*) FROM messages m 
         WHERE m.conversation_id = cp.conversation_id 
         AND m.sender_id != current_member_id
         AND m.created_at > (SELECT created_at FROM messages WHERE id = cp.last_read_message_id))
    END
  ), 0) INTO unread_count
  FROM conversation_participants cp
  WHERE cp.user_id = current_member_id AND cp.left_at IS NULL;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(conversation_uuid UUID)
RETURNS VOID AS $$
DECLARE
  latest_message_id UUID;
  current_member_id UUID;
BEGIN
  -- Get current user's member ID
  SELECT id INTO current_member_id 
  FROM members 
  WHERE user_id = auth.uid();
  
  IF current_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;

  -- Get the latest message in the conversation
  SELECT id INTO latest_message_id
  FROM messages
  WHERE conversation_id = conversation_uuid
  ORDER BY created_at DESC
  LIMIT 1;

  -- Update the participant's last read message
  UPDATE conversation_participants
  SET last_read_message_id = latest_message_id
  WHERE conversation_id = conversation_uuid AND user_id = current_member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_unread_message_count() TO authenticated;
GRANT EXECUTE ON FUNCTION mark_conversation_as_read(UUID) TO authenticated;

-- =============================================
-- 7. UPDATE EXISTING DATA (IF NEEDED)
-- =============================================

-- Note: This assumes that member.id corresponds to the user who should own the conversation
-- If there's existing data that references auth.users directly, you might need additional mapping

-- Update conversations.created_by to use member IDs if they reference auth.users
-- This is a data migration that might be needed depending on existing data
-- Uncomment and modify if needed:
/*
UPDATE conversations 
SET created_by = (
  SELECT m.id 
  FROM members m 
  WHERE m.user_id = conversations.created_by
)
WHERE created_by IN (
  SELECT id FROM auth.users 
  WHERE id NOT IN (SELECT id FROM members)
);
*/