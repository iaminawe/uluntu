-- =============================================
-- MESSAGING SYSTEM MIGRATION
-- =============================================
-- Description: Complete messaging system for direct user communication
-- Dependencies: auth, user_roles, application_settings
-- Version: 1.0
-- Date: 2025-06-26

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. CONVERSATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255), -- Optional title for group conversations
  type VARCHAR(20) NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}' -- For future extensions
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);

-- =============================================
-- 2. CONVERSATION PARTICIPANTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('participant', 'admin', 'moderator')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  last_read_message_id UUID, -- References messages.id, added later
  notification_settings JSONB DEFAULT '{"email": true, "push": true}',
  UNIQUE(conversation_id, user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_active ON conversation_participants(conversation_id, user_id) WHERE left_at IS NULL;

-- =============================================
-- 3. MESSAGES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- For attachments, formatting, etc.
  parent_message_id UUID REFERENCES messages(id), -- For replies/threads
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  edit_history JSONB DEFAULT '[]' -- Track message edits
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON messages(parent_message_id) WHERE parent_message_id IS NOT NULL;

-- Add foreign key constraint for last_read_message_id
ALTER TABLE conversation_participants 
ADD CONSTRAINT fk_last_read_message 
FOREIGN KEY (last_read_message_id) REFERENCES messages(id) ON DELETE SET NULL;

-- =============================================
-- 4. MESSAGE REACTIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction VARCHAR(50) NOT NULL, -- emoji or reaction type
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);

-- =============================================
-- 5. MESSAGE ATTACHMENTS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL, -- Path in Supabase storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id ON message_attachments(message_id);

-- =============================================
-- 6. MESSAGING BLOCKING TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS messaging_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id) -- Users can't block themselves
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_messaging_blocks_blocker_id ON messaging_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_messaging_blocks_blocked_id ON messaging_blocks(blocked_id);

-- =============================================
-- 7. INTEGRATION TABLES
-- =============================================

-- Link messages to marketplace listings
CREATE TABLE IF NOT EXISTS message_marketplace_contexts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  marketplace_listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, marketplace_listing_id)
);

-- Link messages to opportunities
CREATE TABLE IF NOT EXISTS message_opportunity_contexts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, opportunity_id)
);

-- Add indexes for context tables
CREATE INDEX IF NOT EXISTS idx_message_marketplace_contexts_conversation_id ON message_marketplace_contexts(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_marketplace_contexts_listing_id ON message_marketplace_contexts(marketplace_listing_id);
CREATE INDEX IF NOT EXISTS idx_message_opportunity_contexts_conversation_id ON message_opportunity_contexts(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_opportunity_contexts_opportunity_id ON message_opportunity_contexts(opportunity_id);

-- =============================================
-- 8. FUNCTIONS FOR CONVERSATION MANAGEMENT
-- =============================================

-- Function to create a direct conversation between two users
CREATE OR REPLACE FUNCTION create_direct_conversation(
  user1_id UUID,
  user2_id UUID
) RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
  existing_conversation_id UUID;
BEGIN
  -- Check if conversation already exists between these users
  SELECT c.id INTO existing_conversation_id
  FROM conversations c
  JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
  JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
  WHERE c.type = 'direct'
    AND cp1.user_id = user1_id AND cp1.left_at IS NULL
    AND cp2.user_id = user2_id AND cp2.left_at IS NULL;

  IF existing_conversation_id IS NOT NULL THEN
    RETURN existing_conversation_id;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (type, created_by)
  VALUES ('direct', user1_id)
  RETURNING id INTO conversation_id;

  -- Add participants
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES 
    (conversation_id, user1_id),
    (conversation_id, user2_id);

  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COALESCE(SUM(
    CASE 
      WHEN cp.last_read_message_id IS NULL THEN 
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = cp.conversation_id AND m.sender_id != user_uuid)
      ELSE 
        (SELECT COUNT(*) FROM messages m 
         WHERE m.conversation_id = cp.conversation_id 
         AND m.sender_id != user_uuid
         AND m.created_at > (SELECT created_at FROM messages WHERE id = cp.last_read_message_id))
    END
  ), 0) INTO unread_count
  FROM conversation_participants cp
  WHERE cp.user_id = user_uuid AND cp.left_at IS NULL;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_conversation_as_read(
  conversation_uuid UUID,
  user_uuid UUID
) RETURNS VOID AS $$
DECLARE
  latest_message_id UUID;
BEGIN
  -- Get the latest message in the conversation
  SELECT id INTO latest_message_id
  FROM messages
  WHERE conversation_id = conversation_uuid
  ORDER BY created_at DESC
  LIMIT 1;

  -- Update the participant's last read message
  UPDATE conversation_participants
  SET last_read_message_id = latest_message_id
  WHERE conversation_id = conversation_uuid AND user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messaging_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_marketplace_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_opportunity_contexts ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can only see conversations they participate in
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (
    id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND left_at IS NULL
    )
  );

CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Conversation creators can update their conversations" ON conversations
  FOR UPDATE USING (created_by = auth.uid());

-- Conversation Participants: Users can see participants of their conversations
CREATE POLICY "Users can view conversation participants" ON conversation_participants
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND left_at IS NULL
    )
  );

CREATE POLICY "Users can join conversations" ON conversation_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their participation" ON conversation_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Messages: Users can only see messages in their conversations
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND left_at IS NULL
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND left_at IS NULL
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (sender_id = auth.uid());

-- Message Reactions: Users can react to messages they can see
CREATE POLICY "Users can view reactions on accessible messages" ON message_reactions
  FOR SELECT USING (
    message_id IN (
      SELECT m.id FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = auth.uid() AND cp.left_at IS NULL
    )
  );

CREATE POLICY "Users can add reactions" ON message_reactions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    message_id IN (
      SELECT m.id FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = auth.uid() AND cp.left_at IS NULL
    )
  );

CREATE POLICY "Users can remove their own reactions" ON message_reactions
  FOR DELETE USING (user_id = auth.uid());

-- Message Attachments: Follow message permissions
CREATE POLICY "Users can view attachments for accessible messages" ON message_attachments
  FOR SELECT USING (
    message_id IN (
      SELECT m.id FROM messages m
      JOIN conversation_participants cp ON m.conversation_id = cp.conversation_id
      WHERE cp.user_id = auth.uid() AND cp.left_at IS NULL
    )
  );

CREATE POLICY "Users can add attachments to their messages" ON message_attachments
  FOR INSERT WITH CHECK (
    message_id IN (
      SELECT id FROM messages WHERE sender_id = auth.uid()
    )
  );

-- Messaging Blocks: Users can manage their own blocks
CREATE POLICY "Users can view their blocks" ON messaging_blocks
  FOR SELECT USING (blocker_id = auth.uid());

CREATE POLICY "Users can create blocks" ON messaging_blocks
  FOR INSERT WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can remove their blocks" ON messaging_blocks
  FOR DELETE USING (blocker_id = auth.uid());

-- Context tables: Follow conversation permissions
CREATE POLICY "Users can view marketplace contexts for their conversations" ON message_marketplace_contexts
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND left_at IS NULL
    )
  );

CREATE POLICY "Users can view opportunity contexts for their conversations" ON message_opportunity_contexts
  FOR SELECT USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM conversation_participants 
      WHERE user_id = auth.uid() AND left_at IS NULL
    )
  );

-- =============================================
-- 10. TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Update conversation timestamp when new message is added
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Automatically add created_by user as participant when creating conversation
CREATE OR REPLACE FUNCTION add_creator_as_participant()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO conversation_participants (conversation_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_add_creator_as_participant
  AFTER INSERT ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_participant();

-- =============================================
-- 11. GRANT PERMISSIONS
-- =============================================

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON conversation_participants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON message_reactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON message_attachments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON messaging_blocks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON message_marketplace_contexts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON message_opportunity_contexts TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION create_direct_conversation(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_message_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_conversation_as_read(UUID, UUID) TO authenticated;

-- =============================================
-- 12. CREATE STORAGE BUCKET FOR MESSAGE ATTACHMENTS
-- =============================================

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for message attachments
CREATE POLICY "Users can upload message attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their message attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their message attachments" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their message attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'message-attachments' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
-- This migration creates a complete messaging system with:
-- - Direct and group conversations
-- - Message threading and reactions
-- - File attachments with secure storage
-- - User blocking functionality
-- - Integration with marketplace and opportunities
-- - Comprehensive security policies
-- - Automatic timestamp management
-- - Unread message tracking