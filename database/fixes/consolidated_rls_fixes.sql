-- Consolidated RLS (Row Level Security) Fixes for Nelson Tech Community Platform
-- This file combines all the working RLS policies from various fix files
-- Generated on: 2024-01-14

-- ============================================
-- 1. USER ROLES RLS POLICIES
-- ============================================
-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_roles;
DROP POLICY IF EXISTS "Enable insert for service role only" ON public.user_roles;
DROP POLICY IF EXISTS "Enable update for service role only" ON public.user_roles;
DROP POLICY IF EXISTS "Enable delete for service role only" ON public.user_roles;

-- Create clean policies
CREATE POLICY "Enable read access for authenticated users" 
ON public.user_roles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert for service role only" 
ON public.user_roles FOR INSERT 
TO service_role 
WITH CHECK (true);

CREATE POLICY "Enable update for service role only" 
ON public.user_roles FOR UPDATE 
TO service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable delete for service role only" 
ON public.user_roles FOR DELETE 
TO service_role 
USING (true);

-- ============================================
-- 2. EVENTS RLS POLICIES
-- ============================================
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can create events" ON public.events;
DROP POLICY IF EXISTS "Users can update their own events" ON public.events;
DROP POLICY IF EXISTS "Users can delete their own events" ON public.events;

-- Create simple, working policies
CREATE POLICY "Events are viewable by everyone" 
ON public.events FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create events" 
ON public.events FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Users can update their own events" 
ON public.events FOR UPDATE 
TO authenticated 
USING (auth.uid()::text = organizer_id);

CREATE POLICY "Users can delete their own events" 
ON public.events FOR DELETE 
TO authenticated 
USING (auth.uid()::text = organizer_id);

-- ============================================
-- 3. GROUP MEMBERS RLS POLICIES
-- ============================================
-- Drop existing policies if any
DROP POLICY IF EXISTS "Group members can view their groups" ON public.group_members;
DROP POLICY IF EXISTS "Group members can join groups" ON public.group_members;
DROP POLICY IF EXISTS "Group members can leave groups" ON public.group_members;

-- Create policies for group_members
CREATE POLICY "Group members can view their groups" 
ON public.group_members FOR SELECT 
USING (true);

CREATE POLICY "Group members can join groups" 
ON public.group_members FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Group members can leave groups" 
ON public.group_members FOR DELETE 
TO authenticated 
USING (auth.uid()::text = user_id);

-- ============================================
-- 4. GROUPS RLS POLICIES (Fixed for recursion)
-- ============================================
-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Groups viewable based on visibility" ON public.groups;
DROP POLICY IF EXISTS "Users can manage groups they created" ON public.groups;

-- Create non-recursive policy for groups
CREATE POLICY "Groups viewable based on visibility" 
ON public.groups FOR SELECT 
USING (
  visibility = 'open' 
  OR (
    visibility = 'closed' 
    AND auth.uid() IS NOT NULL
  )
  OR (
    visibility = 'secret' 
    AND auth.uid()::text IN (
      SELECT user_id 
      FROM public.group_members 
      WHERE group_id = groups.id
    )
  )
);

CREATE POLICY "Users can manage groups they created" 
ON public.groups FOR ALL 
TO authenticated 
USING (created_by = auth.uid()::text) 
WITH CHECK (created_by = auth.uid()::text);

-- ============================================
-- 5. NEWSLETTER RLS POLICIES
-- ============================================
-- Drop existing policies
DROP POLICY IF EXISTS "Newsletter subscriptions viewable by owner" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON public.newsletter_subscriptions;
DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.newsletter_subscriptions;

-- Create policies for newsletter_subscriptions
CREATE POLICY "Newsletter subscriptions viewable by owner" 
ON public.newsletter_subscriptions FOR SELECT 
USING (
  auth.uid()::text = member_id 
  OR auth.jwt() ->> 'role' = 'service_role'
);

CREATE POLICY "Users can manage their own subscriptions" 
ON public.newsletter_subscriptions FOR ALL 
TO authenticated 
USING (auth.uid()::text = member_id) 
WITH CHECK (auth.uid()::text = member_id);

CREATE POLICY "Service role can manage all subscriptions" 
ON public.newsletter_subscriptions FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- ============================================
-- 6. ADMIN TABLES RLS POLICIES
-- ============================================
-- Admin audit log policies
DROP POLICY IF EXISTS "Admin audit logs are viewable by admins" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.admin_audit_log;

CREATE POLICY "Admin audit logs are viewable by admins" 
ON public.admin_audit_log FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid()::text 
    AND role_name IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Service role can insert audit logs" 
ON public.admin_audit_log FOR INSERT 
TO service_role 
WITH CHECK (true);

-- Admin features policies
DROP POLICY IF EXISTS "Admin features viewable by admins" ON public.admin_features;
DROP POLICY IF EXISTS "Admin features manageable by superadmins" ON public.admin_features;

CREATE POLICY "Admin features viewable by admins" 
ON public.admin_features FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid()::text 
    AND role_name IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin features manageable by superadmins" 
ON public.admin_features FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid()::text 
    AND role_name = 'superadmin'
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid()::text 
    AND role_name = 'superadmin'
  )
);

-- Admin roles policies
DROP POLICY IF EXISTS "Admin roles viewable by admins" ON public.admin_roles;
DROP POLICY IF EXISTS "Admin roles manageable by superadmins" ON public.admin_roles;

CREATE POLICY "Admin roles viewable by admins" 
ON public.admin_roles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid()::text 
    AND role_name IN ('admin', 'superadmin')
  )
);

CREATE POLICY "Admin roles manageable by superadmins" 
ON public.admin_roles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid()::text 
    AND role_name = 'superadmin'
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid()::text 
    AND role_name = 'superadmin'
  )
);

-- ============================================
-- 7. MEMBER PROFILE POLICIES
-- ============================================
-- Members table should be viewable by all, editable by owner
DROP POLICY IF EXISTS "Members are viewable by everyone" ON public.members;
DROP POLICY IF EXISTS "Users can update their own member profile" ON public.members;

CREATE POLICY "Members are viewable by everyone" 
ON public.members FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own member profile" 
ON public.members FOR UPDATE 
TO authenticated 
USING (auth.uid()::text = user_id) 
WITH CHECK (auth.uid()::text = user_id);

-- Member skills policies
DROP POLICY IF EXISTS "Member skills are viewable by everyone" ON public.member_skills;
DROP POLICY IF EXISTS "Users can manage their own skills" ON public.member_skills;

CREATE POLICY "Member skills are viewable by everyone" 
ON public.member_skills FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own skills" 
ON public.member_skills FOR ALL 
TO authenticated 
USING (
  member_id IN (
    SELECT id FROM public.members 
    WHERE user_id = auth.uid()::text
  )
) 
WITH CHECK (
  member_id IN (
    SELECT id FROM public.members 
    WHERE user_id = auth.uid()::text
  )
);

-- Member interests policies
DROP POLICY IF EXISTS "Member interests are viewable by everyone" ON public.member_interests;
DROP POLICY IF EXISTS "Users can manage their own interests" ON public.member_interests;

CREATE POLICY "Member interests are viewable by everyone" 
ON public.member_interests FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own interests" 
ON public.member_interests FOR ALL 
TO authenticated 
USING (
  member_id IN (
    SELECT id FROM public.members 
    WHERE user_id = auth.uid()::text
  )
) 
WITH CHECK (
  member_id IN (
    SELECT id FROM public.members 
    WHERE user_id = auth.uid()::text
  )
);

-- ============================================
-- 8. COMPANIES RLS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;

CREATE POLICY "Companies are viewable by everyone" 
ON public.companies FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create companies" 
ON public.companies FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- ============================================
-- 9. ENSURE RLS IS ENABLED ON ALL TABLES
-- ============================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT ON public.user_roles TO anon;

-- End of consolidated RLS fixes