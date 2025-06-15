-- Master Database Setup Script for Nelson Tech Community Platform
-- This script runs all necessary migrations, fixes, and seeds in the correct order
-- Generated on: 2024-01-14

-- ============================================
-- IMPORTANT: Run this script as a superuser in your Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. SCHEMA MIGRATIONS
-- ============================================
-- Add member profile fields if not exists
DO $$
BEGIN
  -- Add member_skills table if not exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'member_skills') THEN
    CREATE TABLE public.member_skills (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
      skill TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(member_id, skill)
    );
  END IF;

  -- Add member_interests table if not exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'member_interests') THEN
    CREATE TABLE public.member_interests (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
      interest TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(member_id, interest)
    );
  END IF;

  -- Add missing columns to members table
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'skills') THEN
    ALTER TABLE public.members ADD COLUMN skills TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'interests') THEN
    ALTER TABLE public.members ADD COLUMN interests TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'employment_status') THEN
    ALTER TABLE public.members ADD COLUMN employment_status TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'company') THEN
    ALTER TABLE public.members ADD COLUMN company TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'linkedin') THEN
    ALTER TABLE public.members ADD COLUMN linkedin TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'github') THEN
    ALTER TABLE public.members ADD COLUMN github TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'twitter') THEN
    ALTER TABLE public.members ADD COLUMN twitter TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'members' AND column_name = 'website') THEN
    ALTER TABLE public.members ADD COLUMN website TEXT;
  END IF;
END $$;

-- ============================================
-- 2. TAGS SYSTEM
-- ============================================
-- Create tags table if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tags') THEN
    CREATE TABLE public.tags (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      category TEXT,
      usage_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;

  -- Create resource_tags junction table
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'resource_tags') THEN
    CREATE TABLE public.resource_tags (
      resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
      tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (resource_id, tag_id)
    );
  END IF;

  -- Create marketplace_tags junction table
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'marketplace_tags') THEN
    CREATE TABLE public.marketplace_tags (
      listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
      tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      PRIMARY KEY (listing_id, tag_id)
    );
  END IF;
END $$;

-- ============================================
-- 3. ADD MISSING COLUMNS TO OPPORTUNITIES
-- ============================================
DO $$
BEGIN
  -- Add all the missing fields that the OpportunityEditPage expects
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'organization') THEN
    ALTER TABLE public.opportunities ADD COLUMN organization TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'compensation') THEN
    ALTER TABLE public.opportunities ADD COLUMN compensation TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'contact_email') THEN
    ALTER TABLE public.opportunities ADD COLUMN contact_email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'website') THEN
    ALTER TABLE public.opportunities ADD COLUMN website TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'image') THEN
    ALTER TABLE public.opportunities ADD COLUMN image TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'requirements') THEN
    ALTER TABLE public.opportunities ADD COLUMN requirements TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'responsibilities') THEN
    ALTER TABLE public.opportunities ADD COLUMN responsibilities TEXT[] DEFAULT '{}';
  END IF;
  
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'benefits') THEN
    ALTER TABLE public.opportunities ADD COLUMN benefits TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- ============================================
-- 4. APPLY RLS FIXES
-- ============================================
-- Source the consolidated RLS fixes
\i fixes/consolidated_rls_fixes.sql

-- ============================================
-- 5. SEED DATA
-- ============================================
-- Source the consolidated seed data
\i seeds/consolidated_seed_data.sql

-- ============================================
-- 6. GRANT PERMISSIONS
-- ============================================
-- Ensure proper permissions are set
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Grant appropriate permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant read-only access to anonymous users for public data
GRANT SELECT ON public.members, public.companies, public.events, public.groups, public.news, public.resources, public.marketplace_listings, public.opportunities, public.tags TO anon;

-- ============================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- ============================================
-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_resources_contributor_id ON public.resources(contributor_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_seller_id ON public.marketplace_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_posted_by ON public.opportunities(posted_by);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);
CREATE INDEX IF NOT EXISTS idx_resource_tags_resource ON public.resource_tags(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_tags_tag ON public.resource_tags(tag_id);

-- ============================================
-- 8. FINAL VERIFICATION
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE 'Tables with RLS enabled:';
  
  FOR r IN SELECT tablename FROM pg_tables 
           WHERE schemaname = 'public' 
           AND tablename IN ('user_roles', 'events', 'groups', 'group_members', 'members', 
                            'member_skills', 'member_interests', 'companies', 
                            'newsletter_subscriptions', 'admin_audit_log', 
                            'admin_features', 'admin_roles')
  LOOP
    RAISE NOTICE '  - %', r.tablename;
  END LOOP;
END $$;

-- End of master setup script