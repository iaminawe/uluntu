/*
  # Add group activities and announcements support

  1. New Tables
    - `group_activities`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups.id)
      - `title` (text)
      - `description` (text)
      - `activity_date` (timestamp)
      - `location` (text, optional)
      - `created_by` (uuid, references members.id)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `group_announcements`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups.id)
      - `title` (text)
      - `content` (text)
      - `priority` (text: normal, high, urgent)
      - `created_by` (uuid, references members.id)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `expires_at` (timestamp, optional)

  2. Security
    - Enable RLS on both tables
    - Add policies for group members to read
    - Add policies for group admins to manage
*/

-- Create group_activities table
CREATE TABLE IF NOT EXISTS group_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  activity_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  created_by UUID NOT NULL REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create group_announcements table
CREATE TABLE IF NOT EXISTS group_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
  created_by UUID NOT NULL REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Add indexes for better query performance
CREATE INDEX idx_group_activities_group_id ON group_activities(group_id);
CREATE INDEX idx_group_activities_activity_date ON group_activities(activity_date);
CREATE INDEX idx_group_announcements_group_id ON group_announcements(group_id);
CREATE INDEX idx_group_announcements_expires_at ON group_announcements(expires_at);

-- Enable Row Level Security
ALTER TABLE group_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_announcements ENABLE ROW LEVEL SECURITY;

-- Policies for group_activities

-- Policy: Group members can read activities
CREATE POLICY "Group members can read activities"
  ON group_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_activities.group_id
      AND group_members.member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Group admins can manage activities
CREATE POLICY "Group admins can manage activities"
  ON group_activities
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_activities.group_id
      AND group_members.role = 'admin'
      AND group_members.member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Policies for group_announcements

-- Policy: Group members can read announcements
CREATE POLICY "Group members can read announcements"
  ON group_announcements
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_announcements.group_id
      AND group_members.member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Policy: Group admins can manage announcements
CREATE POLICY "Group admins can manage announcements"
  ON group_announcements
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_announcements.group_id
      AND group_members.role = 'admin'
      AND group_members.member_id IN (
        SELECT id FROM members WHERE user_id = auth.uid()
      )
    )
  );

-- Add update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_group_activities_updated_at
  BEFORE UPDATE ON group_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_announcements_updated_at
  BEFORE UPDATE ON group_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE group_activities IS 'Stores activities and events organized by groups';
COMMENT ON TABLE group_announcements IS 'Stores announcements and notices for group members';
COMMENT ON COLUMN group_announcements.priority IS 'Priority level: normal, high, or urgent';
COMMENT ON COLUMN group_announcements.expires_at IS 'Optional expiration date for time-sensitive announcements';