-- Admin Features Schema - Fixed Version
-- This migration creates tables for admin functionality compatible with existing user_roles schema

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin Features Table
-- Stores feature flags and their configurations
CREATE TABLE IF NOT EXISTS admin_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature Translations Table
-- Stores translations for admin features
CREATE TABLE IF NOT EXISTS admin_feature_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID REFERENCES admin_features(id) ON DELETE CASCADE,
  language_code VARCHAR(10) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feature_id, language_code)
);

-- Custom Roles Table (separate from enum-based user_roles)
-- Stores custom roles for the platform
CREATE TABLE IF NOT EXISTS custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]',
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moderation Queue Table
-- Stores items pending moderation
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  item_data JSONB NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'escalated')) DEFAULT 'pending',
  submitted_by UUID NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Audit Log Table
-- Tracks all admin actions for security and compliance
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admin_features_enabled ON admin_features(enabled);
CREATE INDEX IF NOT EXISTS idx_admin_features_feature_key ON admin_features(feature_key);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_item_type ON moderation_queue(item_type);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin_id ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_entity ON admin_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_admin_features_updated_at
  BEFORE UPDATE ON admin_features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_admin_feature_translations_updated_at
  BEFORE UPDATE ON admin_feature_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_custom_roles_updated_at
  BEFORE UPDATE ON custom_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_moderation_queue_updated_at
  BEFORE UPDATE ON moderation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Insert default system roles into custom_roles table
INSERT INTO custom_roles (name, description, permissions, is_system) VALUES
  ('superadmin', 'Full system access', '["*"]', true),
  ('admin', 'Administrative access', '["admin.access", "content.manage", "users.manage"]', true),
  ('moderator', 'Content moderation access', '["content.moderate", "users.view"]', true),
  ('member', 'Regular member access', '["content.create", "content.edit.own"]', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default admin features
INSERT INTO admin_features (feature_key, enabled, config) VALUES
  ('user_management', true, '{"max_users": null}'),
  ('content_moderation', true, '{"auto_flag_threshold": 3}'),
  ('analytics_dashboard', true, '{"retention_days": 90}'),
  ('bulk_operations', false, '{"batch_size": 100}'),
  ('api_access', false, '{"rate_limit": 1000}')
ON CONFLICT (feature_key) DO NOTHING;

-- RLS Policies
-- Enable RLS on all tables
ALTER TABLE admin_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_feature_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin features policies (only superadmins can manage) - using existing user_roles with enum
CREATE POLICY "Superadmins can view admin features" ON admin_features
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can manage admin features" ON admin_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  );

-- Feature translations policies
CREATE POLICY "Superadmins can manage feature translations" ON admin_feature_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  );

-- Custom roles policies
CREATE POLICY "Admins can view custom roles" ON custom_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('superadmin', 'admin')
    )
  );

CREATE POLICY "Superadmins can manage custom roles" ON custom_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role = 'superadmin'
    )
  );

-- Moderation queue policies
CREATE POLICY "Moderators can view moderation queue" ON moderation_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('superadmin', 'admin')
    )
    OR submitted_by = auth.uid()
  );

CREATE POLICY "Moderators can update moderation queue" ON moderation_queue
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('superadmin', 'admin')
    )
  );

CREATE POLICY "Users can submit to moderation queue" ON moderation_queue
  FOR INSERT WITH CHECK (submitted_by = auth.uid());

-- Audit log policies (read-only for admins)
CREATE POLICY "Admins can view audit log" ON admin_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('superadmin', 'admin')
    )
  );

-- Create audit log trigger for admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_audit_log (
    admin_id,
    action,
    entity_type,
    entity_id,
    changes
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'old', row_to_json(OLD),
      'new', row_to_json(NEW)
    )
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_admin_features
  AFTER INSERT OR UPDATE OR DELETE ON admin_features
  FOR EACH ROW
  EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_custom_roles
  AFTER INSERT OR UPDATE OR DELETE ON custom_roles
  FOR EACH ROW
  EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_moderation_queue
  AFTER UPDATE ON moderation_queue
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_admin_action();