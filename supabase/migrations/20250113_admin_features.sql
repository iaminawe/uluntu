-- Admin Features and Settings Tables
-- This migration adds tables for admin functionality including feature flags,
-- translations, custom roles, moderation queue, and audit logging

-- Feature flags and settings
CREATE TABLE IF NOT EXISTS admin_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feature translations
CREATE TABLE IF NOT EXISTS admin_feature_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID REFERENCES admin_features(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  translations JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feature_id, language_code)
);

-- Custom roles
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT false, -- System roles can't be deleted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description, permissions, is_system) VALUES
('superadmin', 'Full system access', '{"*": ["*"]}', true),
('admin', 'Administrative access', '{"entities": ["create", "read", "update", "delete"], "users": ["read", "update"], "moderation": ["*"]}', true),
('moderator', 'Content moderation access', '{"moderation": ["*"], "entities": ["read"]}', true),
('user', 'Standard user access', '{"own_profile": ["read", "update"]}', true)
ON CONFLICT (name) DO NOTHING;

-- Check if role_id column exists before adding it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'user_roles' 
                AND column_name = 'role_id') THEN
    ALTER TABLE user_roles ADD COLUMN role_id UUID REFERENCES roles(id);
    
    -- Migrate existing role data
    UPDATE user_roles ur
    SET role_id = r.id
    FROM roles r
    WHERE ur.role = r.name;
    
    -- Make role_id required after migration
    ALTER TABLE user_roles ALTER COLUMN role_id SET NOT NULL;
  END IF;
END $$;

-- Moderation queue
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('members', 'companies', 'groups', 'events', 'news', 'resources', 'marketplace', 'opportunities')),
  entity_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete')),
  content JSONB NOT NULL,
  submitted_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Audit log
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_features_key ON admin_features(feature_key);
CREATE INDEX IF NOT EXISTS idx_admin_features_enabled ON admin_features(enabled);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_entity ON moderation_queue(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_moderation_queue_created ON moderation_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON admin_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at DESC);

-- RLS Policies

-- Admin features (superadmin only)
ALTER TABLE admin_features ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmins can manage features" ON admin_features;
CREATE POLICY "Superadmins can manage features" ON admin_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'superadmin'
    )
  );

-- Feature translations (superadmin only)
ALTER TABLE admin_feature_translations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmins can manage translations" ON admin_feature_translations;
CREATE POLICY "Superadmins can manage translations" ON admin_feature_translations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'superadmin'
    )
  );

-- Roles (superadmin only for management, all authenticated for reading)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read roles" ON roles;
CREATE POLICY "Anyone can read roles" ON roles
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Superadmins can manage roles" ON roles;
CREATE POLICY "Superadmins can manage roles" ON roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'superadmin'
    )
  );

-- Moderation queue (admins and moderators)
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins and moderators can access moderation" ON moderation_queue;
CREATE POLICY "Admins and moderators can access moderation" ON moderation_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('superadmin', 'admin', 'moderator')
    )
  );

-- Audit log (superadmin read only)
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Superadmins can read audit log" ON admin_audit_log;
CREATE POLICY "Superadmins can read audit log" ON admin_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'superadmin'
    )
  );

-- Functions

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers only if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_admin_features_updated_at') THEN
    CREATE TRIGGER update_admin_features_updated_at
      BEFORE UPDATE ON admin_features
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_admin_feature_translations_updated_at') THEN
    CREATE TRIGGER update_admin_feature_translations_updated_at
      BEFORE UPDATE ON admin_feature_translations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_roles_updated_at') THEN
    CREATE TRIGGER update_roles_updated_at
      BEFORE UPDATE ON roles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- Audit logging function
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
DECLARE
  changes JSONB;
  action_type TEXT;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'create';
    changes := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'update';
    changes := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'delete';
    changes := to_jsonb(OLD);
  END IF;

  -- Insert audit log entry
  INSERT INTO admin_audit_log (
    admin_id,
    action,
    entity_type,
    entity_id,
    changes
  ) VALUES (
    auth.uid(),
    action_type,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    changes
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_user_roles_changes') THEN
    CREATE TRIGGER audit_user_roles_changes
      AFTER INSERT OR UPDATE OR DELETE ON user_roles
      FOR EACH ROW EXECUTE FUNCTION log_admin_action();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_roles_changes') THEN
    CREATE TRIGGER audit_roles_changes
      AFTER INSERT OR UPDATE OR DELETE ON roles
      FOR EACH ROW EXECUTE FUNCTION log_admin_action();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_admin_features_changes') THEN
    CREATE TRIGGER audit_admin_features_changes
      AFTER INSERT OR UPDATE OR DELETE ON admin_features
      FOR EACH ROW EXECUTE FUNCTION log_admin_action();
  END IF;
END $$;

-- Initialize default features
INSERT INTO admin_features (feature_key, enabled, config) VALUES
('members', true, '{"maxProfilesPerUser": 1, "requireApproval": false}'),
('companies', true, '{"maxCompaniesPerUser": 5, "requireApproval": false}'),
('groups', true, '{"maxGroupsPerUser": 10, "requireApproval": false}'),
('events', true, '{"maxEventsPerUser": 20, "requireApproval": false}'),
('news', true, '{"maxArticlesPerUser": null, "requireApproval": true}'),
('resources', true, '{"maxResourcesPerUser": null, "requireApproval": true}'),
('marketplace', true, '{"maxListingsPerUser": 10, "requireApproval": false}'),
('opportunities', true, '{"maxOpportunitiesPerUser": 5, "requireApproval": false}')
ON CONFLICT (feature_key) DO NOTHING;