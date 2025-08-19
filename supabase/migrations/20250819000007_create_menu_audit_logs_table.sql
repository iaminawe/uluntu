-- Create menu_audit_logs table for tracking menu changes
CREATE TABLE IF NOT EXISTS public.menu_audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    menu_type VARCHAR(50),
    menu_item_id UUID,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT menu_audit_logs_action_check CHECK (
        action IN ('create', 'update', 'delete', 'reorder', 'enable', 'disable', 'publish', 'unpublish')
    )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_menu_audit_logs_created_at ON public.menu_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_menu_audit_logs_user_id ON public.menu_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_menu_audit_logs_menu_item_id ON public.menu_audit_logs(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_menu_audit_logs_action ON public.menu_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_menu_audit_logs_menu_type ON public.menu_audit_logs(menu_type);

-- Enable RLS
ALTER TABLE public.menu_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for menu_audit_logs
-- Allow authenticated users to view audit logs (admins only in practice)
CREATE POLICY "Admins can view menu audit logs"
    ON public.menu_audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role IN ('admin', 'superadmin')
        )
    );

-- Allow system to insert audit logs
CREATE POLICY "System can insert menu audit logs"
    ON public.menu_audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON public.menu_audit_logs TO authenticated;
GRANT INSERT ON public.menu_audit_logs TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE public.menu_audit_logs IS 'Audit trail for menu management actions';
COMMENT ON COLUMN public.menu_audit_logs.action IS 'Type of action performed';
COMMENT ON COLUMN public.menu_audit_logs.menu_type IS 'Type of menu affected (main, footer, mobile, admin)';
COMMENT ON COLUMN public.menu_audit_logs.menu_item_id IS 'ID of the menu item affected';
COMMENT ON COLUMN public.menu_audit_logs.old_values IS 'Previous values before the change';
COMMENT ON COLUMN public.menu_audit_logs.new_values IS 'New values after the change';
COMMENT ON COLUMN public.menu_audit_logs.metadata IS 'Additional context about the change';
COMMENT ON COLUMN public.menu_audit_logs.user_id IS 'User who performed the action';