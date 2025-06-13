/*
  # Add group invitations support

  1. New Tables
    - `group_invitations`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups.id)
      - `email` (text, email of invitee)
      - `invited_by` (uuid, references members.id)
      - `status` (text: pending, accepted, declined, expired)
      - `token` (text, unique invitation token)
      - `message` (text, optional invitation message)
      - `created_at` (timestamp)
      - `expires_at` (timestamp)
      - `accepted_at` (timestamp, optional)

  2. Security
    - Enable RLS on `group_invitations` table
    - Add policies for group admins to create/manage invitations
    - Add policies for users to accept their own invitations
*/

-- Create group_invitations table
CREATE TABLE IF NOT EXISTS group_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES members(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  UNIQUE(group_id, email, status)
);

-- Add indexes for better query performance
CREATE INDEX idx_group_invitations_group_id ON group_invitations(group_id);
CREATE INDEX idx_group_invitations_email ON group_invitations(email);
CREATE INDEX idx_group_invitations_token ON group_invitations(token);
CREATE INDEX idx_group_invitations_status ON group_invitations(status);
CREATE INDEX idx_group_invitations_expires_at ON group_invitations(expires_at);

-- Enable Row Level Security
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Group admins can view all invitations for their groups
CREATE POLICY "Group admins can view group invitations"
  ON group_invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_invitations.group_id
      AND group_members.role = 'admin'
      AND group_members.member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Group admins can create invitations
CREATE POLICY "Group admins can create invitations"
  ON group_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_invitations.group_id
      AND group_members.role = 'admin'
      AND group_members.member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
    AND invited_by IN (
      SELECT id FROM members WHERE user_id = auth.uid()
    )
  );

-- Policy: Group admins can update invitations (e.g., cancel)
CREATE POLICY "Group admins can update invitations"
  ON group_invitations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_invitations.group_id
      AND group_members.role = 'admin'
      AND group_members.member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Users can view invitations sent to their email
CREATE POLICY "Users can view their own invitations"
  ON group_invitations
  FOR SELECT
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Policy: Users can accept/decline their own invitations
CREATE POLICY "Users can update their own invitations"
  ON group_invitations
  FOR UPDATE
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'pending'
    AND expires_at > now()
  );

-- Function to automatically expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE group_invitations
  SET status = 'expired'
  WHERE status = 'pending'
  AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to expire invitations (if using pg_cron)
-- This would need to be set up separately in your Supabase dashboard
-- Example: SELECT cron.schedule('expire-invitations', '0 * * * *', 'SELECT expire_old_invitations();');

-- Add comment for documentation
COMMENT ON TABLE group_invitations IS 'Stores email invitations to join groups';
COMMENT ON COLUMN group_invitations.token IS 'Unique token for invitation link';
COMMENT ON COLUMN group_invitations.expires_at IS 'Invitation expiration date, defaults to 7 days';