-- Add notification_settings, privacy_settings, and updated_at columns to members table
-- This fixes the errors: "Could not find the 'notification_settings' column of 'members' in the schema cache"
-- and "Could not find the 'updated_at' column of 'members' in the schema cache"

ALTER TABLE members 
ADD COLUMN IF NOT EXISTS notification_settings JSONB DEFAULT '{"email": {"messages": true, "groupInvites": true, "eventReminders": true, "newsletter": true, "communityUpdates": true}, "frequency": "daily"}';

ALTER TABLE members 
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"profileVisibility": "members", "showEmail": false, "showLocation": true, "showCompany": true, "showActivity": true, "allowMessages": true, "allowInvites": true}';

-- Add updated_at column to track when members were last modified
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_notification_settings ON members USING GIN(notification_settings);
CREATE INDEX IF NOT EXISTS idx_members_privacy_settings ON members USING GIN(privacy_settings);

-- Update any existing members that might have NULL values
UPDATE members 
SET notification_settings = '{"email": {"messages": true, "groupInvites": true, "eventReminders": true, "newsletter": true, "communityUpdates": true}, "frequency": "daily"}'
WHERE notification_settings IS NULL;

UPDATE members 
SET privacy_settings = '{"profileVisibility": "members", "showEmail": false, "showLocation": true, "showCompany": true, "showActivity": true, "allowMessages": true, "allowInvites": true}'
WHERE privacy_settings IS NULL;

-- Update any existing members that might have NULL updated_at values
UPDATE members 
SET updated_at = COALESCE(updated_at, created_at, NOW())
WHERE updated_at IS NULL;

-- Create trigger to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to members table
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();