-- Create admin activity logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_activity_logs_entity_type ON admin_activity_logs(entity_type);
CREATE INDEX idx_admin_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX idx_admin_activity_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX idx_admin_activity_logs_entity_id ON admin_activity_logs(entity_id) WHERE entity_id IS NOT NULL;

-- Add RLS policies
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view all logs
CREATE POLICY "Admins can view all activity logs" ON admin_activity_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'superadmin')
        )
    );

-- Policy for admins to insert logs
CREATE POLICY "Admins can insert activity logs" ON admin_activity_logs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'superadmin')
        )
    );

-- Create a function to automatically clean old logs (older than 90 days)
CREATE OR REPLACE FUNCTION clean_old_activity_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM admin_activity_logs
    WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean old logs (requires pg_cron extension)
-- SELECT cron.schedule('clean-old-activity-logs', '0 0 * * *', 'SELECT clean_old_activity_logs();');