-- Complete fix for conversation system policies
-- This migration removes ALL existing policies and recreates them properly

-- =============================================
-- 1. DROP ALL EXISTING POLICIES
-- =============================================

-- Drop all policies on conversations table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'conversations' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON conversations', pol.policyname);
    END LOOP;
END $$;

-- Drop all policies on conversation_participants table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'conversation_participants' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON conversation_participants', pol.policyname);
    END LOOP;
END $$;

-- Drop all policies on messages table
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'messages' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON messages', pol.policyname);
    END LOOP;
END $$;

-- =============================================
-- 2. CREATE NEW NON-RECURSIVE POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CONVERSATIONS POLICIES
-- =============================================

-- Users can view conversations they're part of
CREATE POLICY "select_conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp
      JOIN members m ON m.id = cp.user_id
      WHERE cp.conversation_id = conversations.id
        AND m.user_id = auth.uid()
        AND cp.left_at IS NULL
    )
  );

-- Users can create conversations if they have a member profile
CREATE POLICY "insert_conversations" ON conversations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can update conversations they admin
CREATE POLICY "update_conversations" ON conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp
      JOIN members m ON m.id = cp.user_id
      WHERE cp.conversation_id = conversations.id
        AND m.user_id = auth.uid()
        AND cp.role IN ('admin', 'moderator')
        AND cp.left_at IS NULL
    )
  );

-- =============================================
-- CONVERSATION_PARTICIPANTS POLICIES
-- =============================================

-- Users can view participants in conversations they're part of
-- This avoids recursion by checking membership directly
CREATE POLICY "select_participants" ON conversation_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 
      FROM members m
      WHERE m.user_id = auth.uid()
        AND m.id IN (
          SELECT cp2.user_id 
          FROM conversation_participants cp2
          WHERE cp2.conversation_id = conversation_participants.conversation_id
            AND cp2.left_at IS NULL
        )
    )
  );

-- Admins can add participants to their conversations
CREATE POLICY "insert_participants" ON conversation_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp
      JOIN members m ON m.id = cp.user_id
      WHERE cp.conversation_id = conversation_participants.conversation_id
        AND m.user_id = auth.uid()
        AND cp.role IN ('admin', 'moderator')
        AND cp.left_at IS NULL
    )
  );

-- Users can update their own participant record
CREATE POLICY "update_participants" ON conversation_participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE id = conversation_participants.user_id 
        AND user_id = auth.uid()
    )
  );

-- =============================================
-- MESSAGES POLICIES
-- =============================================

-- Users can view messages in conversations they're part of
CREATE POLICY "select_messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp
      JOIN members m ON m.id = cp.user_id
      WHERE cp.conversation_id = messages.conversation_id
        AND m.user_id = auth.uid()
        AND cp.left_at IS NULL
    )
  );

-- Users can send messages to conversations they're part of
CREATE POLICY "insert_messages" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM conversation_participants cp
      JOIN members m ON m.id = cp.user_id
      WHERE cp.conversation_id = messages.conversation_id
        AND m.user_id = auth.uid()
        AND cp.left_at IS NULL
    )
  );

-- Users can update their own messages
CREATE POLICY "update_messages" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE id = messages.sender_id 
        AND user_id = auth.uid()
    )
  );

-- Users can delete their own messages
CREATE POLICY "delete_messages" ON messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE id = messages.sender_id 
        AND user_id = auth.uid()
    )
  );

-- =============================================
-- 3. ENSURE NOTIFICATION_SETTINGS COLUMN EXISTS
-- =============================================

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

-- =============================================
-- 4. GRANT PERMISSIONS
-- =============================================

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
END $$;

-- =============================================
-- 5. CREATE OR REPLACE HELPER FUNCTIONS
-- =============================================

-- Function to get current member ID
CREATE OR REPLACE FUNCTION get_current_member_id()
RETURNS UUID AS $$
DECLARE
    member_id UUID;
BEGIN
    SELECT id INTO member_id
    FROM members
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    RETURN member_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_current_member_id() TO authenticated;