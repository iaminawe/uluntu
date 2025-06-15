-- Create comprehensive tagging system for the Nelson Tech platform
-- This creates reusable tags that can be applied to any content type

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#3B82F6', -- Default blue color
    icon TEXT, -- Optional icon name
    category TEXT, -- Group tags by category (e.g., 'technology', 'skill', 'industry')
    usage_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deprecated')),
    created_by UUID REFERENCES members(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);
CREATE INDEX IF NOT EXISTS idx_tags_status ON tags(status);

-- Create junction tables for many-to-many relationships

-- Resource tags (table already exists, modify to use tag_id instead of tag string)
-- First, we'll rename the existing table and create a new one
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'resource_tags' AND table_schema = 'public') THEN
        -- Check if column is 'tag' (string) and not 'tag_id'
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resource_tags' AND column_name = 'tag' AND table_schema = 'public') THEN
            -- Rename existing table to preserve data temporarily
            ALTER TABLE resource_tags RENAME TO resource_tags_old;
        END IF;
    END IF;
END
$$;

-- Create new resource_tags table with tag_id reference
CREATE TABLE IF NOT EXISTS resource_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(resource_id, tag_id)
);

-- Event tags
CREATE TABLE IF NOT EXISTS event_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(event_id, tag_id)
);

-- News tags (if not already using ARRAY)
CREATE TABLE IF NOT EXISTS news_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(news_id, tag_id)
);

-- Group tags
CREATE TABLE IF NOT EXISTS group_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(group_id, tag_id)
);

-- Company tags
CREATE TABLE IF NOT EXISTS company_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(company_id, tag_id)
);

-- Member skill tags (replace member_skills if needed)
CREATE TABLE IF NOT EXISTS member_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    years_experience INTEGER,
    UNIQUE(member_id, tag_id)
);

-- Opportunity tags
CREATE TABLE IF NOT EXISTS opportunity_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(opportunity_id, tag_id)
);

-- Marketplace listing tags
CREATE TABLE IF NOT EXISTS marketplace_listing_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(listing_id, tag_id)
);

-- Create indexes for junction tables
CREATE INDEX IF NOT EXISTS idx_resource_tags_resource_id ON resource_tags(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_tags_tag_id ON resource_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_event_tags_event_id ON event_tags(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tags_tag_id ON event_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_news_tags_news_id ON news_tags(news_id);
CREATE INDEX IF NOT EXISTS idx_news_tags_tag_id ON news_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_group_tags_group_id ON group_tags(group_id);
CREATE INDEX IF NOT EXISTS idx_group_tags_tag_id ON group_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_company_tags_company_id ON company_tags(company_id);
CREATE INDEX IF NOT EXISTS idx_company_tags_tag_id ON company_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_member_tags_member_id ON member_tags(member_id);
CREATE INDEX IF NOT EXISTS idx_member_tags_tag_id ON member_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_tags_opportunity_id ON opportunity_tags(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_tags_tag_id ON opportunity_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listing_tags_listing_id ON marketplace_listing_tags(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listing_tags_tag_id ON marketplace_listing_tags(tag_id);

-- Create RLS policies for tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listing_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "public_can_read_active_tags" ON tags FOR SELECT USING (status = 'active');
CREATE POLICY "authenticated_can_read_all_tags" ON tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_can_create_tags" ON tags FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Junction table policies (allow read for all, write for authenticated)
CREATE POLICY "public_can_read_resource_tags" ON resource_tags FOR SELECT USING (true);
CREATE POLICY "authenticated_can_manage_resource_tags" ON resource_tags FOR ALL TO authenticated USING (true);

CREATE POLICY "public_can_read_event_tags" ON event_tags FOR SELECT USING (true);
CREATE POLICY "authenticated_can_manage_event_tags" ON event_tags FOR ALL TO authenticated USING (true);

CREATE POLICY "public_can_read_news_tags" ON news_tags FOR SELECT USING (true);
CREATE POLICY "authenticated_can_manage_news_tags" ON news_tags FOR ALL TO authenticated USING (true);

CREATE POLICY "public_can_read_group_tags" ON group_tags FOR SELECT USING (true);
CREATE POLICY "authenticated_can_manage_group_tags" ON group_tags FOR ALL TO authenticated USING (true);

CREATE POLICY "public_can_read_company_tags" ON company_tags FOR SELECT USING (true);
CREATE POLICY "authenticated_can_manage_company_tags" ON company_tags FOR ALL TO authenticated USING (true);

CREATE POLICY "public_can_read_member_tags" ON member_tags FOR SELECT USING (true);
CREATE POLICY "authenticated_can_manage_member_tags" ON member_tags FOR ALL TO authenticated USING (true);

CREATE POLICY "public_can_read_opportunity_tags" ON opportunity_tags FOR SELECT USING (true);
CREATE POLICY "authenticated_can_manage_opportunity_tags" ON opportunity_tags FOR ALL TO authenticated USING (true);

CREATE POLICY "public_can_read_marketplace_listing_tags" ON marketplace_listing_tags FOR SELECT USING (true);
CREATE POLICY "authenticated_can_manage_marketplace_listing_tags" ON marketplace_listing_tags FOR ALL TO authenticated USING (true);

-- Create function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update usage counts
CREATE TRIGGER trigger_update_tag_usage_resource_tags
    AFTER INSERT OR DELETE ON resource_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER trigger_update_tag_usage_event_tags
    AFTER INSERT OR DELETE ON event_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER trigger_update_tag_usage_news_tags
    AFTER INSERT OR DELETE ON news_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER trigger_update_tag_usage_group_tags
    AFTER INSERT OR DELETE ON group_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER trigger_update_tag_usage_company_tags
    AFTER INSERT OR DELETE ON company_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER trigger_update_tag_usage_member_tags
    AFTER INSERT OR DELETE ON member_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER trigger_update_tag_usage_opportunity_tags
    AFTER INSERT OR DELETE ON opportunity_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER trigger_update_tag_usage_marketplace_listing_tags
    AFTER INSERT OR DELETE ON marketplace_listing_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- Create helper function to generate slug from name
CREATE OR REPLACE FUNCTION generate_tag_slug(tag_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(regexp_replace(trim(tag_name), '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Verify tables were created
SELECT 'Tags system created successfully!' as status;
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'tags' THEN 'Main tags table'
        WHEN table_name LIKE '%_tags' THEN 'Junction table for ' || replace(table_name, '_tags', '')
        ELSE 'Other table'
    END as description
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name = 'tags' OR table_name LIKE '%_tags')
ORDER BY 
    CASE WHEN table_name = 'tags' THEN 1 ELSE 2 END,
    table_name;