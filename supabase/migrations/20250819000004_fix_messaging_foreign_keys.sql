-- Fix messaging foreign key constraints to reference members table instead of auth.users
-- This addresses the foreign key constraint violation when creating conversations

-- First, drop the existing foreign key constraint
ALTER TABLE conversation_participants 
DROP CONSTRAINT IF EXISTS conversation_participants_user_id_fkey;

-- Add new foreign key constraint that references members table
ALTER TABLE conversation_participants 
ADD CONSTRAINT conversation_participants_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE;

-- Drop the existing function first to allow changing return type
DROP FUNCTION IF EXISTS create_direct_conversation(UUID, TEXT);

-- Update the create_direct_conversation function to work with member IDs
CREATE OR REPLACE FUNCTION create_direct_conversation(
  other_user_id UUID,
  initial_message TEXT DEFAULT NULL
) RETURNS conversations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_member_id UUID;
  existing_conversation_id UUID;
  new_conversation conversations;
  new_message messages;
BEGIN
  -- Get current user's member ID
  SELECT id INTO current_member_id 
  FROM members 
  WHERE user_id = auth.uid();
  
  IF current_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;

  -- Check if the other user exists as a member
  IF NOT EXISTS (SELECT 1 FROM members WHERE id = other_user_id) THEN
    RAISE EXCEPTION 'Target member does not exist';
  END IF;

  -- Check for existing direct conversation between these two members
  SELECT c.id INTO existing_conversation_id
  FROM conversations c
  JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
  JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
  WHERE c.type = 'direct'
    AND cp1.user_id = current_member_id
    AND cp2.user_id = other_user_id
    AND cp1.left_at IS NULL
    AND cp2.left_at IS NULL;

  -- If conversation exists, return it
  IF existing_conversation_id IS NOT NULL THEN
    SELECT * INTO new_conversation FROM conversations WHERE id = existing_conversation_id;
    
    -- Add initial message if provided
    IF initial_message IS NOT NULL AND trim(initial_message) != '' THEN
      INSERT INTO messages (conversation_id, sender_id, content, message_type)
      VALUES (existing_conversation_id, current_member_id, trim(initial_message), 'text')
      RETURNING * INTO new_message;
      
      -- Update conversation timestamp
      UPDATE conversations 
      SET updated_at = NOW() 
      WHERE id = existing_conversation_id;
    END IF;
    
    RETURN new_conversation;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (type, created_by)
  VALUES ('direct', current_member_id)
  RETURNING * INTO new_conversation;

  -- Add participants
  INSERT INTO conversation_participants (conversation_id, user_id, role)
  VALUES 
    (new_conversation.id, current_member_id, 'participant'),
    (new_conversation.id, other_user_id, 'participant');

  -- Add initial message if provided
  IF initial_message IS NOT NULL AND trim(initial_message) != '' THEN
    INSERT INTO messages (conversation_id, sender_id, content, message_type)
    VALUES (new_conversation.id, current_member_id, trim(initial_message), 'text')
    RETURNING * INTO new_message;
  END IF;

  RETURN new_conversation;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_direct_conversation(UUID, TEXT) TO authenticated;