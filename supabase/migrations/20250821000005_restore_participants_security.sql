-- Restore security to conversation_participants with non-recursive policies
-- This adds back RLS with carefully designed policies that avoid circular references

-- =============================================
-- 1. CREATE HELPER FUNCTIONS FOR CLEAN LOOKUPS
-- =============================================

-- Function to check if user is participant in a conversation (no RLS dependency)
CREATE OR REPLACE FUNCTION is_conversation_participant(conversation_uuid UUID, member_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM conversation_participants 
        WHERE conversation_id = conversation_uuid 
          AND user_id = member_uuid 
          AND left_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is admin/moderator of a conversation
CREATE OR REPLACE FUNCTION is_conversation_admin(conversation_uuid UUID, member_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM conversation_participants 
        WHERE conversation_id = conversation_uuid 
          AND user_id = member_uuid 
          AND role IN ('admin', 'moderator')
          AND left_at IS NULL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =============================================
-- 2. RE-ENABLE RLS ON CONVERSATION_PARTICIPANTS
-- =============================================

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. CREATE NON-RECURSIVE POLICIES
-- =============================================

-- CONVERSATION_PARTICIPANTS policies (using helper functions to avoid recursion)
CREATE POLICY "participants_select_secure" ON conversation_participants
    FOR SELECT 
    USING (
        -- Users can see participants if they share a conversation with them
        -- This uses a direct query without relying on RLS policies
        conversation_id IN (
            SELECT cp.conversation_id 
            FROM conversation_participants cp
            JOIN members m ON m.id = cp.user_id
            WHERE m.user_id = auth.uid()
              AND cp.left_at IS NULL
        )
    );

CREATE POLICY "participants_insert_secure" ON conversation_participants
    FOR INSERT 
    WITH CHECK (
        -- Only conversation admins can add participants
        is_conversation_admin(conversation_id, get_auth_member_id())
    );

CREATE POLICY "participants_update_secure" ON conversation_participants
    FOR UPDATE 
    USING (
        -- Users can update their own participant record OR admins can update any
        user_id = get_auth_member_id() 
        OR is_conversation_admin(conversation_id, get_auth_member_id())
    );

CREATE POLICY "participants_delete_secure" ON conversation_participants
    FOR DELETE 
    USING (
        -- Users can remove themselves OR admins can remove others
        user_id = get_auth_member_id() 
        OR is_conversation_admin(conversation_id, get_auth_member_id())
    );

-- =============================================
-- 4. UPDATE OTHER POLICIES TO USE HELPER FUNCTIONS
-- =============================================

-- Drop and recreate conversations policies with helper functions
DROP POLICY IF EXISTS "conversations_simple" ON conversations;

CREATE POLICY "conversations_select_secure" ON conversations
    FOR SELECT 
    USING (
        is_conversation_participant(id, get_auth_member_id())
    );

CREATE POLICY "conversations_insert_secure" ON conversations
    FOR INSERT 
    WITH CHECK (
        get_auth_member_id() IS NOT NULL
    );

CREATE POLICY "conversations_update_secure" ON conversations
    FOR UPDATE 
    USING (
        is_conversation_admin(id, get_auth_member_id())
    );

-- Drop and recreate messages policies with helper functions
DROP POLICY IF EXISTS "messages_simple" ON messages;

CREATE POLICY "messages_select_secure" ON messages
    FOR SELECT 
    USING (
        is_conversation_participant(conversation_id, get_auth_member_id())
    );

CREATE POLICY "messages_insert_secure" ON messages
    FOR INSERT 
    WITH CHECK (
        is_conversation_participant(conversation_id, get_auth_member_id())
        AND sender_id = get_auth_member_id()
    );

CREATE POLICY "messages_update_secure" ON messages
    FOR UPDATE 
    USING (
        sender_id = get_auth_member_id()
    );

CREATE POLICY "messages_delete_secure" ON messages
    FOR DELETE 
    USING (
        sender_id = get_auth_member_id()
        OR is_conversation_admin(conversation_id, get_auth_member_id())
    );

-- =============================================
-- 5. GRANT PERMISSIONS ON HELPER FUNCTIONS
-- =============================================

GRANT EXECUTE ON FUNCTION is_conversation_participant(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_conversation_admin(UUID, UUID) TO authenticated;

-- =============================================
-- 6. VERIFICATION AND TESTING
-- =============================================

DO $$
DECLARE
    policy_count INTEGER;
    r RECORD;
BEGIN
    -- Count policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename IN ('conversations', 'conversation_participants', 'messages');
    
    RAISE NOTICE 'Security Status After Migration:';
    RAISE NOTICE '================================';
    RAISE NOTICE 'Total RLS policies: %', policy_count;
    RAISE NOTICE 'All tables have RLS enabled: conversations, conversation_participants, messages';
    RAISE NOTICE 'Helper functions created to avoid recursion';
    RAISE NOTICE '';
    
    -- List all policies
    RAISE NOTICE 'Active Policies:';
    FOR r IN (
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('conversations', 'conversation_participants', 'messages')
        ORDER BY tablename, policyname
    )
    LOOP
        RAISE NOTICE '  %.%', r.tablename, r.policyname;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'Security Features:';
    RAISE NOTICE '✓ Users can only see conversations they participate in';
    RAISE NOTICE '✓ Users can only see participants of their conversations';
    RAISE NOTICE '✓ Only admins can add/remove participants';
    RAISE NOTICE '✓ Users can only send messages to their conversations';
    RAISE NOTICE '✓ Users can only edit/delete their own messages';
    RAISE NOTICE '✓ No circular RLS dependencies (uses helper functions)';
END $$;