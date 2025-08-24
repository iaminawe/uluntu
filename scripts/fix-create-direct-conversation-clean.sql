-- Drop ALL existing versions of the function
DROP FUNCTION IF EXISTS public.create_direct_conversation(UUID, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS public.create_direct_conversation(UUID, TEXT);
DROP FUNCTION IF EXISTS public.create_direct_conversation(UUID);

-- Create the main create_direct_conversation function with all parameters
CREATE OR REPLACE FUNCTION public.create_direct_conversation(
  other_user_id UUID,
  initial_message TEXT DEFAULT NULL,
  force_new BOOLEAN DEFAULT FALSE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_member_id UUID;
  existing_conversation_id UUID;
  new_conversation_id UUID;
  result JSON;
BEGIN
  -- Get current user's member ID
  SELECT id INTO current_member_id 
  FROM members 
  WHERE user_id = auth.uid();
  
  IF current_member_id IS NULL THEN
    RAISE EXCEPTION 'Current user member not found';
  END IF;

  -- If not forcing new, check for existing conversation
  IF NOT force_new THEN
    -- Look for existing direct conversation between these two users
    SELECT DISTINCT c.id INTO existing_conversation_id
    FROM conversations c
    INNER JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
    INNER JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
    WHERE c.type = 'direct'
      AND cp1.user_id = current_member_id
      AND cp2.user_id = other_user_id
      AND cp1.left_at IS NULL
      AND cp2.left_at IS NULL
    LIMIT 1;

    -- If conversation exists, return it
    IF existing_conversation_id IS NOT NULL THEN
      SELECT row_to_json(c.*) INTO result
      FROM conversations c
      WHERE c.id = existing_conversation_id;
      
      RETURN result;
    END IF;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (type, created_by)
  VALUES ('direct', current_member_id)
  RETURNING id INTO new_conversation_id;

  -- Add participants with 'participant' role (not 'member')
  INSERT INTO conversation_participants (conversation_id, user_id, role)
  VALUES 
    (new_conversation_id, current_member_id, 'participant'),
    (new_conversation_id, other_user_id, 'participant')
  ON CONFLICT (conversation_id, user_id) DO NOTHING;

  -- Send initial message if provided
  IF initial_message IS NOT NULL AND initial_message != '' THEN
    INSERT INTO messages (
      conversation_id,
      sender_id,
      content,
      message_type
    ) VALUES (
      new_conversation_id,
      current_member_id,
      initial_message,
      'text'
    );
  END IF;

  -- Return the created conversation
  SELECT row_to_json(c.*) INTO result
  FROM conversations c
  WHERE c.id = new_conversation_id;
  
  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_direct_conversation(UUID, TEXT, BOOLEAN) TO authenticated;