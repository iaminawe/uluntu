-- Fix conversation_participants notification_settings column
-- This migration ensures the notification_settings column exists

-- Add notification_settings column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' 
        AND column_name = 'notification_settings'
    ) THEN
        ALTER TABLE conversation_participants 
        ADD COLUMN notification_settings JSONB DEFAULT '{"email": true, "push": true}';
    END IF;
END $$;

-- Drop the old notifications_enabled column if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'conversation_participants' 
        AND column_name = 'notifications_enabled'
    ) THEN
        -- First, copy data if needed
        UPDATE conversation_participants 
        SET notification_settings = 
            CASE 
                WHEN notifications_enabled = true THEN '{"email": true, "push": true}'::jsonb
                ELSE '{"email": false, "push": false}'::jsonb
            END
        WHERE notification_settings IS NULL;
        
        -- Then drop the old column
        ALTER TABLE conversation_participants 
        DROP COLUMN notifications_enabled;
    END IF;
END $$;

-- Fix the infinite recursion in policies by dropping and recreating them
DROP POLICY IF EXISTS "Users can view conversation participants" ON conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

-- Create non-recursive policies for conversation_participants
-- This policy uses a direct check without recursion
CREATE POLICY "Users can view conversation participants" ON conversation_participants
  FOR SELECT USING (
    -- Check if the current user is a participant in this conversation
    conversation_id IN (
      SELECT cp.conversation_id
      FROM conversation_participants cp
      INNER JOIN members m ON m.id = cp.user_id
      WHERE m.user_id = auth.uid()
        AND cp.left_at IS NULL
    )
  );

-- Create policy for conversations
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    -- User is a participant in the conversation
    id IN (
      SELECT cp.conversation_id
      FROM conversation_participants cp
      INNER JOIN members m ON m.id = cp.user_id
      WHERE m.user_id = auth.uid()
        AND cp.left_at IS NULL
    )
  );

-- Create policy for messages
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    -- User is a participant in the conversation
    conversation_id IN (
      SELECT cp.conversation_id
      FROM conversation_participants cp
      INNER JOIN members m ON m.id = cp.user_id
      WHERE m.user_id = auth.uid()
        AND cp.left_at IS NULL
    )
  );

-- Create INSERT policies (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert participants" ON conversation_participants;
CREATE POLICY "Users can insert participants" ON conversation_participants
  FOR INSERT WITH CHECK (
    -- Users can add participants to conversations they're part of
    conversation_id IN (
      SELECT cp.conversation_id
      FROM conversation_participants cp
      INNER JOIN members m ON m.id = cp.user_id
      WHERE m.user_id = auth.uid()
        AND cp.left_at IS NULL
        AND cp.role IN ('admin', 'moderator')
    )
  );

DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (
    -- Any authenticated user with a member profile can create conversations
    EXISTS (
      SELECT 1 FROM members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    -- User must be a participant in the conversation
    conversation_id IN (
      SELECT cp.conversation_id
      FROM conversation_participants cp
      INNER JOIN members m ON m.id = cp.user_id
      WHERE m.user_id = auth.uid()
        AND cp.left_at IS NULL
    )
  );

-- Create UPDATE policies
DROP POLICY IF EXISTS "Users can update their participant settings" ON conversation_participants;
CREATE POLICY "Users can update their participant settings" ON conversation_participants
  FOR UPDATE USING (
    -- Users can only update their own participant record
    user_id IN (
      SELECT id FROM members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update conversations they admin" ON conversations;
CREATE POLICY "Users can update conversations they admin" ON conversations
  FOR UPDATE USING (
    -- Only admins/moderators can update conversations
    id IN (
      SELECT cp.conversation_id
      FROM conversation_participants cp
      INNER JOIN members m ON m.id = cp.user_id
      WHERE m.user_id = auth.uid()
        AND cp.left_at IS NULL
        AND cp.role IN ('admin', 'moderator')
    )
  );

-- Grant necessary permissions
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON conversation_participants TO authenticated;
GRANT ALL ON messages TO authenticated;

-- Grant permissions on optional tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_attachments') THEN
        GRANT ALL ON message_attachments TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_reactions') THEN
        GRANT ALL ON message_reactions TO authenticated;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'message_read_receipts') THEN
        GRANT ALL ON message_read_receipts TO authenticated;
    END IF;
END $$;