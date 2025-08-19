-- Fix member access for messaging system
-- Add policy to allow authenticated users to read basic member info for messaging

-- Add a specific policy for messaging to read member info
CREATE POLICY "authenticated_can_read_members_for_messaging" 
ON members 
FOR SELECT 
TO authenticated 
USING (true);

-- Ensure messaging functions have proper access
-- Grant necessary permissions for messaging
GRANT SELECT ON members TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;