-- Temporarily disable RLS on conversation_participants to fix infinite recursion
-- This is a diagnostic/fix step to isolate the issue

-- Disable RLS on conversation_participants only
ALTER TABLE conversation_participants DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled on other tables but use simpler policies
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "conversations_select_v3" ON conversations;
DROP POLICY IF EXISTS "conversations_insert_v3" ON conversations;
DROP POLICY IF EXISTS "conversations_update_v3" ON conversations;
DROP POLICY IF EXISTS "participants_select_v3" ON conversation_participants;
DROP POLICY IF EXISTS "participants_insert_v3" ON conversation_participants;
DROP POLICY IF EXISTS "participants_update_v3" ON conversation_participants;
DROP POLICY IF EXISTS "messages_select_v3" ON messages;
DROP POLICY IF EXISTS "messages_insert_v3" ON messages;
DROP POLICY IF EXISTS "messages_update_v3" ON messages;
DROP POLICY IF EXISTS "messages_delete_v3" ON messages;

-- Re-enable RLS with very simple policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- CONVERSATIONS: Only check if user has a member profile
CREATE POLICY "conversations_simple" ON conversations
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM members WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM members WHERE user_id = auth.uid()
        )
    );

-- MESSAGES: Only check if user has a member profile
CREATE POLICY "messages_simple" ON messages
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM members WHERE user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM members WHERE user_id = auth.uid()
        )
    );

-- Grant full access to authenticated users for conversation_participants (no RLS)
GRANT ALL ON conversation_participants TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON messages TO authenticated;

-- Verify notification_settings column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
          AND table_name = 'conversation_participants' 
          AND column_name = 'notification_settings'
    ) THEN
        ALTER TABLE public.conversation_participants 
        ADD COLUMN notification_settings JSONB DEFAULT '{"email": true, "push": true}'::jsonb;
    END IF;
END $$;

-- Report status
DO $$
BEGIN
    RAISE NOTICE 'RLS Status:';
    RAISE NOTICE 'conversations: enabled with simple policy';
    RAISE NOTICE 'conversation_participants: disabled (no RLS)';
    RAISE NOTICE 'messages: enabled with simple policy';
END $$;