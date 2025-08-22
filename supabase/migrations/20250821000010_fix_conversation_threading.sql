-- =============================================
-- FIX CONVERSATION THREADING - ALLOW NEW CONVERSATIONS
-- =============================================

-- Create a new function that can force new conversation creation
CREATE OR REPLACE FUNCTION create_direct_conversation_v2(
  other_user_id UUID,
  initial_message TEXT DEFAULT NULL,
  force_new BOOLEAN DEFAULT FALSE
) RETURNS conversations AS $$
DECLARE
  conversation_id UUID;
  current_member_id UUID;
  other_member_name TEXT;
  conversation_title TEXT;
  conversation_record conversations;
  existing_conversation_id UUID;
BEGIN
  -- Get current user's member ID
  SELECT id INTO current_member_id 
  FROM members 
  WHERE user_id = auth.uid();
  
  IF current_member_id IS NULL THEN
    RAISE EXCEPTION 'User does not have a member profile';
  END IF;

  -- Only check for existing conversation if not forcing new
  IF NOT force_new THEN
    -- Check if conversation already exists between these users
    SELECT c.id INTO existing_conversation_id
    FROM conversations c
    JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
    JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
    WHERE c.type = 'direct'
      AND cp1.user_id = current_member_id AND cp1.left_at IS NULL
      AND cp2.user_id = other_user_id AND cp2.left_at IS NULL;

    -- If conversation exists, return it
    IF existing_conversation_id IS NOT NULL THEN
      SELECT * INTO conversation_record 
      FROM conversations 
      WHERE id = existing_conversation_id;
      
      -- Send initial message if provided
      IF initial_message IS NOT NULL AND initial_message != '' THEN
        INSERT INTO messages (conversation_id, sender_id, content, message_type)
        VALUES (existing_conversation_id, current_member_id, initial_message, 'text');
      END IF;
      
      RETURN conversation_record;
    END IF;
  END IF;

  -- Get other user's name for conversation title
  SELECT name INTO other_member_name
  FROM members
  WHERE id = other_user_id;
  
  -- Set conversation title to other user's name
  conversation_title := COALESCE(other_member_name, 'Conversation');

  -- Create new conversation with title
  INSERT INTO conversations (type, title, created_by)
  VALUES ('direct', conversation_title, current_member_id)
  RETURNING id INTO conversation_id;

  -- Add participants
  INSERT INTO conversation_participants (conversation_id, user_id, role)
  VALUES 
    (conversation_id, current_member_id, 'admin'),
    (conversation_id, other_user_id, 'member');

  -- Send initial message if provided
  IF initial_message IS NOT NULL AND initial_message != '' THEN
    INSERT INTO messages (conversation_id, sender_id, content, message_type)
    VALUES (conversation_id, current_member_id, initial_message, 'text');
  END IF;

  -- Return the conversation record
  SELECT * INTO conversation_record 
  FROM conversations 
  WHERE id = conversation_id;
  
  RETURN conversation_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_direct_conversation_v2(UUID, TEXT, BOOLEAN) TO authenticated;

-- Create a simple wrapper for backward compatibility
CREATE OR REPLACE FUNCTION create_new_conversation(
  other_user_id UUID,
  initial_message TEXT DEFAULT NULL
) RETURNS conversations AS $$
BEGIN
  RETURN create_direct_conversation_v2(other_user_id, initial_message, TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_new_conversation(UUID, TEXT) TO authenticated;