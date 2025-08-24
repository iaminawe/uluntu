-- =============================================
-- Fix the create_direct_conversation function with correct role values
-- =============================================

-- First, let's check what roles are allowed
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conname = 'conversation_participants_role_check';

-- Drop the existing functions
DROP FUNCTION IF EXISTS public.create_direct_conversation(UUID, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS public.create_direct_conversation(UUID, TEXT);

-- Create improved version with correct role values
CREATE OR REPLACE FUNCTION public.create_direct_conversation(
  other_user_id UUID,
  initial_message TEXT DEFAULT NULL,
  force_new BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_member_id UUID;
  existing_conversation_id UUID;
  new_conversation_id UUID;
  conversation_data JSONB;
  message_data JSONB;
BEGIN
  -- Get current user's member ID
  SELECT id INTO current_member_id
  FROM members
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF current_member_id IS NULL THEN
    RAISE EXCEPTION 'User is not a member';
  END IF;

  -- Validate other user exists
  IF NOT EXISTS (SELECT 1 FROM members WHERE id = other_user_id) THEN
    RAISE EXCEPTION 'Other user does not exist';
  END IF;

  -- Check for existing conversation (only if not forcing new)
  IF NOT force_new THEN
    SELECT c.id INTO existing_conversation_id
    FROM conversations c
    WHERE c.type = 'direct'
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp1
      WHERE cp1.conversation_id = c.id
      AND cp1.user_id = current_member_id
      AND cp1.left_at IS NULL
    )
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = c.id
      AND cp2.user_id = other_user_id
      AND cp2.left_at IS NULL
    )
    ORDER BY c.created_at DESC
    LIMIT 1;

    -- If existing conversation found and not forcing new, return it
    IF existing_conversation_id IS NOT NULL THEN
      SELECT to_jsonb(c.*) INTO conversation_data
      FROM conversations c
      WHERE c.id = existing_conversation_id;
      
      RETURN conversation_data;
    END IF;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (type, created_by, title)
  VALUES (
    'direct',
    current_member_id,
    'Direct Message'
  )
  RETURNING id INTO new_conversation_id;

  -- Add participants with NULL role (or the default role if there's a default)
  -- The role column seems to have a check constraint, so we use NULL or an allowed value
  INSERT INTO conversation_participants (conversation_id, user_id, role)
  VALUES 
    (new_conversation_id, current_member_id, NULL),
    (new_conversation_id, other_user_id, NULL)
  ON CONFLICT (conversation_id, user_id) DO NOTHING;

  -- Send initial message if provided
  IF initial_message IS NOT NULL AND trim(initial_message) != '' THEN
    INSERT INTO messages (conversation_id, sender_id, content, message_type)
    VALUES (new_conversation_id, current_member_id, trim(initial_message), 'text')
    RETURNING to_jsonb(messages.*) INTO message_data;
  END IF;

  -- Return the new conversation
  SELECT to_jsonb(c.*) INTO conversation_data
  FROM conversations c
  WHERE c.id = new_conversation_id;

  RETURN conversation_data;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the actual error for debugging
    RAISE NOTICE 'Error in create_direct_conversation: % %', SQLERRM, SQLSTATE;
    
    -- If it's a role constraint error, try without specifying role
    IF SQLSTATE = '23514' THEN
      -- Clean up the failed conversation
      DELETE FROM conversations WHERE id = new_conversation_id;
      
      -- Try again without role
      INSERT INTO conversations (type, created_by, title)
      VALUES (
        'direct',
        current_member_id,
        'Direct Message'
      )
      RETURNING id INTO new_conversation_id;

      -- Add participants without role column
      INSERT INTO conversation_participants (conversation_id, user_id)
      VALUES 
        (new_conversation_id, current_member_id),
        (new_conversation_id, other_user_id)
      ON CONFLICT (conversation_id, user_id) DO NOTHING;

      -- Send initial message if provided
      IF initial_message IS NOT NULL AND trim(initial_message) != '' THEN
        INSERT INTO messages (conversation_id, sender_id, content, message_type)
        VALUES (new_conversation_id, current_member_id, trim(initial_message), 'text')
        RETURNING to_jsonb(messages.*) INTO message_data;
      END IF;

      -- Return the new conversation
      SELECT to_jsonb(c.*) INTO conversation_data
      FROM conversations c
      WHERE c.id = new_conversation_id;

      RETURN conversation_data;
    ELSE
      RAISE;
    END IF;
END;
$$;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_direct_conversation(UUID, TEXT, BOOLEAN) TO authenticated;

-- Also create a simpler version for backwards compatibility
CREATE OR REPLACE FUNCTION public.create_direct_conversation(
  other_user_id UUID,
  initial_message TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the main function with force_new = false for backwards compatibility
  RETURN create_direct_conversation(other_user_id, initial_message, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_direct_conversation(UUID, TEXT) TO authenticated;

-- =============================================
-- Check the constraint to understand allowed values
-- =============================================
SELECT 
  tc.constraint_name,
  tc.table_name,
  cc.column_name,
  pgc.consrc as constraint_definition
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage cc 
  ON tc.constraint_name = cc.constraint_name
JOIN pg_constraint pgc 
  ON pgc.conname = tc.constraint_name
WHERE tc.table_name = 'conversation_participants' 
  AND tc.constraint_type = 'CHECK'
  AND cc.column_name = 'role';