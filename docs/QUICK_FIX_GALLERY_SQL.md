# Quick Fix for Gallery Admin Access

## Run This SQL in Your Supabase Dashboard

Go to: https://app.supabase.com/project/opkqtpmmtvprhfyjmkhx/sql/new

### Step 1: Fix the Gallery Table Structure
```sql
-- Add missing columns to user_galleries
ALTER TABLE user_galleries 
ADD COLUMN IF NOT EXISTS owner_type TEXT DEFAULT 'user' CHECK (owner_type IN ('user', 'group', 'company', 'page')),
ADD COLUMN IF NOT EXISTS owner_id UUID;

-- Set owner_id to user_id for existing records
UPDATE user_galleries 
SET owner_id = user_id 
WHERE owner_id IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_galleries_owner_type ON user_galleries(owner_type);
CREATE INDEX IF NOT EXISTS idx_user_galleries_owner_id ON user_galleries(owner_id);
```

### Step 2: Setup Admin Roles
```sql
-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('superadmin', 'Super Administrator with full system access'),
  ('admin', 'Administrator with management access'),
  ('moderator', 'Content moderator'),
  ('member', 'Regular member')
ON CONFLICT (name) DO NOTHING;
```

### Step 3: Grant Yourself Admin Access
```sql
-- First, find your user ID (replace with your email)
SELECT id, email FROM auth.users WHERE email = 'YOUR-EMAIL@example.com';

-- Then grant admin role (replace YOUR-USER-ID with the ID from above)
INSERT INTO user_roles (user_id, role_id)
SELECT 'YOUR-USER-ID', id
FROM roles 
WHERE name = 'admin'
ON CONFLICT DO NOTHING;
```

### Step 4: Create Admin Check Function
```sql
-- Function to check if user has admin access
CREATE OR REPLACE FUNCTION has_admin_access(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = $1
    AND r.name IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION has_admin_access TO authenticated;
```

### Step 5: Enable Row Level Security
```sql
-- Enable RLS on roles and user_roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Roles viewable by authenticated" ON roles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "User roles viewable by user or admin" ON user_roles
  FOR SELECT USING (
    user_id = auth.uid() 
    OR has_admin_access(auth.uid())
  );
```

## After Running the SQL

1. **Clear your browser cache** (important!)
2. **Sign out and sign back in**
3. **Check your roles** at `/admin/debug-roles`
4. **Access the gallery admin** at `/admin/media`

## Troubleshooting

If you still get "Access Denied":

1. Check the debug page at `/admin/debug-roles` to see your current roles
2. Make sure you replaced 'YOUR-EMAIL' and 'YOUR-USER-ID' with your actual values
3. Try running this to directly check your admin status:

```sql
-- Check if you have admin role
SELECT 
  u.email,
  r.name as role_name,
  ur.created_at as granted_at
FROM auth.users u
JOIN user_roles ur ON ur.user_id = u.id
JOIN roles r ON r.id = ur.role_id
WHERE u.email = 'YOUR-EMAIL@example.com';
```

The gallery admin interface should now be accessible!