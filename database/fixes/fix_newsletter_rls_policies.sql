-- Fix Newsletter RLS Policies to use user_roles table correctly

-- Drop incorrect policies that reference non-existent roles table
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Admins can manage templates" ON newsletter_templates;
DROP POLICY IF EXISTS "Admins can manage campaigns" ON newsletter_campaigns;
DROP POLICY IF EXISTS "Admins can manage content rules" ON newsletter_content_rules;
DROP POLICY IF EXISTS "Admins can view analytics" ON newsletter_analytics;

-- Correct policies using is_superadmin function and user_roles table

-- Newsletter Subscriptions
CREATE POLICY "Superadmins can manage all subscriptions" ON newsletter_subscriptions
  FOR ALL USING (public.is_superadmin(auth.uid()));

-- Newsletter Templates  
CREATE POLICY "Superadmins can manage templates" ON newsletter_templates
  FOR ALL USING (public.is_superadmin(auth.uid()));

-- Newsletter Campaigns
CREATE POLICY "Superadmins can manage campaigns" ON newsletter_campaigns
  FOR ALL USING (public.is_superadmin(auth.uid()));

-- Newsletter Content Rules
CREATE POLICY "Superadmins can manage content rules" ON newsletter_content_rules
  FOR ALL USING (public.is_superadmin(auth.uid()));

-- Newsletter Analytics
CREATE POLICY "Superadmins can view analytics" ON newsletter_analytics
  FOR SELECT USING (public.is_superadmin(auth.uid()));

-- Allow system/service role to insert analytics
CREATE POLICY "Service role can insert analytics" ON newsletter_analytics
  FOR INSERT TO service_role WITH CHECK (true);