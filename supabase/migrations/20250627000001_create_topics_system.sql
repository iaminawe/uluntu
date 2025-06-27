-- Create topics system migration
-- This migration creates a comprehensive topics entity system that can be assigned to any content type

-- Create topics table
CREATE TABLE IF NOT EXISTS "public"."topics" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "name" text NOT NULL UNIQUE,
    "slug" text NOT NULL UNIQUE,
    "description" text,
    "icon" text DEFAULT 'tag',
    "color" text DEFAULT '#6366f1',
    "sort_order" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create function for auto-generating slugs
CREATE OR REPLACE FUNCTION generate_topic_slug() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
        NEW.slug := trim(both '-' from NEW.slug);
    END IF;
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating slugs
DROP TRIGGER IF EXISTS generate_topic_slug_trigger ON public.topics;
CREATE TRIGGER generate_topic_slug_trigger
    BEFORE INSERT OR UPDATE ON public.topics
    FOR EACH ROW
    EXECUTE FUNCTION generate_topic_slug();

-- Create junction tables for topic-entity relationships
-- Using polymorphic approach similar to likes/comments system

-- Events topics
CREATE TABLE IF NOT EXISTS "public"."event_topics" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "event_id" uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    "topic_id" uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- News topics
CREATE TABLE IF NOT EXISTS "public"."news_topics" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "news_id" uuid NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
    "topic_id" uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Resources topics
CREATE TABLE IF NOT EXISTS "public"."resource_topics" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "resource_id" uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    "topic_id" uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Marketplace topics
CREATE TABLE IF NOT EXISTS "public"."marketplace_topics" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "marketplace_id" uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    "topic_id" uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Opportunities topics
CREATE TABLE IF NOT EXISTS "public"."opportunity_topics" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "opportunity_id" uuid NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    "topic_id" uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Groups topics
CREATE TABLE IF NOT EXISTS "public"."group_topics" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "group_id" uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    "topic_id" uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Companies topics
CREATE TABLE IF NOT EXISTS "public"."company_topics" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "company_id" uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    "topic_id" uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Members topics (for member profiles/expertise)
CREATE TABLE IF NOT EXISTS "public"."member_topics" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "member_id" uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    "topic_id" uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Pages topics (if pages table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pages') THEN
        CREATE TABLE IF NOT EXISTS "public"."page_topics" (
            "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
            "page_id" uuid NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
            "topic_id" uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
            "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
    END IF;
END
$$;

-- Create unique constraints to prevent duplicate topic assignments
CREATE UNIQUE INDEX IF NOT EXISTS idx_event_topics_unique ON public.event_topics (event_id, topic_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_topics_unique ON public.news_topics (news_id, topic_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_resource_topics_unique ON public.resource_topics (resource_id, topic_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_marketplace_topics_unique ON public.marketplace_topics (marketplace_id, topic_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_opportunity_topics_unique ON public.opportunity_topics (opportunity_id, topic_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_group_topics_unique ON public.group_topics (group_id, topic_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_topics_unique ON public.company_topics (company_id, topic_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_member_topics_unique ON public.member_topics (member_id, topic_id);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_topics_slug ON public.topics (slug);
CREATE INDEX IF NOT EXISTS idx_topics_active ON public.topics (is_active);
CREATE INDEX IF NOT EXISTS idx_topics_sort_order ON public.topics (sort_order);
CREATE INDEX IF NOT EXISTS idx_topics_name ON public.topics (name);

-- Junction table indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_topics_event ON public.event_topics (event_id);
CREATE INDEX IF NOT EXISTS idx_event_topics_topic ON public.event_topics (topic_id);
CREATE INDEX IF NOT EXISTS idx_news_topics_news ON public.news_topics (news_id);
CREATE INDEX IF NOT EXISTS idx_news_topics_topic ON public.news_topics (topic_id);
CREATE INDEX IF NOT EXISTS idx_resource_topics_resource ON public.resource_topics (resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_topics_topic ON public.resource_topics (topic_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_topics_marketplace ON public.marketplace_topics (marketplace_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_topics_topic ON public.marketplace_topics (topic_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_topics_opportunity ON public.opportunity_topics (opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opportunity_topics_topic ON public.opportunity_topics (topic_id);
CREATE INDEX IF NOT EXISTS idx_group_topics_group ON public.group_topics (group_id);
CREATE INDEX IF NOT EXISTS idx_group_topics_topic ON public.group_topics (topic_id);
CREATE INDEX IF NOT EXISTS idx_company_topics_company ON public.company_topics (company_id);
CREATE INDEX IF NOT EXISTS idx_company_topics_topic ON public.company_topics (topic_id);
CREATE INDEX IF NOT EXISTS idx_member_topics_member ON public.member_topics (member_id);
CREATE INDEX IF NOT EXISTS idx_member_topics_topic ON public.member_topics (topic_id);

-- Create analytics view for topic usage statistics
CREATE OR REPLACE VIEW topic_analytics AS
WITH topic_counts AS (
    SELECT 
        t.id,
        t.name,
        t.slug,
        t.color,
        t.icon,
        COALESCE(event_count, 0) + 
        COALESCE(news_count, 0) + 
        COALESCE(resource_count, 0) + 
        COALESCE(marketplace_count, 0) + 
        COALESCE(opportunity_count, 0) + 
        COALESCE(group_count, 0) + 
        COALESCE(company_count, 0) + 
        COALESCE(member_count, 0) AS total_content_count,
        COALESCE(event_count, 0) AS event_count,
        COALESCE(news_count, 0) AS news_count,
        COALESCE(resource_count, 0) AS resource_count,
        COALESCE(marketplace_count, 0) AS marketplace_count,
        COALESCE(opportunity_count, 0) AS opportunity_count,
        COALESCE(group_count, 0) AS group_count,
        COALESCE(company_count, 0) AS company_count,
        COALESCE(member_count, 0) AS member_count
    FROM topics t
    LEFT JOIN (SELECT topic_id, COUNT(*) as event_count FROM event_topics GROUP BY topic_id) et ON t.id = et.topic_id
    LEFT JOIN (SELECT topic_id, COUNT(*) as news_count FROM news_topics GROUP BY topic_id) nt ON t.id = nt.topic_id
    LEFT JOIN (SELECT topic_id, COUNT(*) as resource_count FROM resource_topics GROUP BY topic_id) rt ON t.id = rt.topic_id
    LEFT JOIN (SELECT topic_id, COUNT(*) as marketplace_count FROM marketplace_topics GROUP BY topic_id) mt ON t.id = mt.topic_id
    LEFT JOIN (SELECT topic_id, COUNT(*) as opportunity_count FROM opportunity_topics GROUP BY topic_id) ot ON t.id = ot.topic_id
    LEFT JOIN (SELECT topic_id, COUNT(*) as group_count FROM group_topics GROUP BY topic_id) gt ON t.id = gt.topic_id
    LEFT JOIN (SELECT topic_id, COUNT(*) as company_count FROM company_topics GROUP BY topic_id) ct ON t.id = ct.topic_id
    LEFT JOIN (SELECT topic_id, COUNT(*) as member_count FROM member_topics GROUP BY topic_id) met ON t.id = met.topic_id
    WHERE t.is_active = true
)
SELECT 
    *,
    CASE 
        WHEN total_content_count = 0 THEN 0
        ELSE ROUND((total_content_count::decimal / (SELECT MAX(total_content_count) FROM topic_counts)) * 100, 2)
    END as popularity_percentage
FROM topic_counts
ORDER BY total_content_count DESC, name ASC;

-- Insert starter topics
INSERT INTO public.topics (name, slug, description, icon, color, sort_order) VALUES
    ('Technology', 'technology', 'Latest in tech, software development, AI, and digital innovation', 'laptop', '#3b82f6', 1),
    ('Business', 'business', 'Entrepreneurship, startups, business strategy, and professional growth', 'briefcase', '#10b981', 2),
    ('Art', 'art', 'Creative arts, visual design, artistic expression, and cultural events', 'palette', '#f59e0b', 3),
    ('Photography', 'photography', 'Photography techniques, visual storytelling, and image creation', 'camera', '#ef4444', 4),
    ('Design', 'design', 'UI/UX design, graphic design, product design, and creative processes', 'layers', '#8b5cf6', 5)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_topics ENABLE ROW LEVEL SECURITY;

-- RLS policies for topics
DROP POLICY IF EXISTS "Anyone can view active topics" ON public.topics;
CREATE POLICY "Anyone can view active topics" ON public.topics
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage topics" ON public.topics;
CREATE POLICY "Admins can manage topics" ON public.topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- RLS policies for junction tables (users can view, admins can manage)
-- Event topics
DROP POLICY IF EXISTS "Anyone can view event topics" ON public.event_topics;
CREATE POLICY "Anyone can view event topics" ON public.event_topics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage event topics" ON public.event_topics;
CREATE POLICY "Admins can manage event topics" ON public.event_topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- News topics
DROP POLICY IF EXISTS "Anyone can view news topics" ON public.news_topics;
CREATE POLICY "Anyone can view news topics" ON public.news_topics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage news topics" ON public.news_topics;
CREATE POLICY "Admins can manage news topics" ON public.news_topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Resource topics
DROP POLICY IF EXISTS "Anyone can view resource topics" ON public.resource_topics;
CREATE POLICY "Anyone can view resource topics" ON public.resource_topics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage resource topics" ON public.resource_topics;
CREATE POLICY "Admins can manage resource topics" ON public.resource_topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Marketplace topics
DROP POLICY IF EXISTS "Anyone can view marketplace topics" ON public.marketplace_topics;
CREATE POLICY "Anyone can view marketplace topics" ON public.marketplace_topics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage marketplace topics" ON public.marketplace_topics;
CREATE POLICY "Admins can manage marketplace topics" ON public.marketplace_topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Opportunity topics
DROP POLICY IF EXISTS "Anyone can view opportunity topics" ON public.opportunity_topics;
CREATE POLICY "Anyone can view opportunity topics" ON public.opportunity_topics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage opportunity topics" ON public.opportunity_topics;
CREATE POLICY "Admins can manage opportunity topics" ON public.opportunity_topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Group topics
DROP POLICY IF EXISTS "Anyone can view group topics" ON public.group_topics;
CREATE POLICY "Anyone can view group topics" ON public.group_topics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage group topics" ON public.group_topics;
CREATE POLICY "Admins can manage group topics" ON public.group_topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Company topics
DROP POLICY IF EXISTS "Anyone can view company topics" ON public.company_topics;
CREATE POLICY "Anyone can view company topics" ON public.company_topics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage company topics" ON public.company_topics;
CREATE POLICY "Admins can manage company topics" ON public.company_topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Member topics
DROP POLICY IF EXISTS "Anyone can view member topics" ON public.member_topics;
CREATE POLICY "Anyone can view member topics" ON public.member_topics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage member topics" ON public.member_topics;
CREATE POLICY "Admins can manage member topics" ON public.member_topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Create page topics policies if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'page_topics') THEN
        ALTER TABLE public.page_topics ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Anyone can view page topics" ON public.page_topics;
        CREATE POLICY "Anyone can view page topics" ON public.page_topics
            FOR SELECT USING (true);

        DROP POLICY IF EXISTS "Admins can manage page topics" ON public.page_topics;
        CREATE POLICY "Admins can manage page topics" ON public.page_topics
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.user_roles 
                    WHERE user_id = auth.uid() 
                    AND role IN ('admin', 'superadmin')
                )
            );
            
        CREATE UNIQUE INDEX IF NOT EXISTS idx_page_topics_unique ON public.page_topics (page_id, topic_id);
        CREATE INDEX IF NOT EXISTS idx_page_topics_page ON public.page_topics (page_id);
        CREATE INDEX IF NOT EXISTS idx_page_topics_topic ON public.page_topics (topic_id);
    END IF;
END
$$;

-- Create function to get topic counts for a specific topic
CREATE OR REPLACE FUNCTION get_topic_content_counts(topic_slug_param text)
RETURNS TABLE (
    entity_type text,
    count bigint
) AS $$
BEGIN
    RETURN QUERY
    WITH topic_info AS (
        SELECT id FROM topics WHERE slug = topic_slug_param AND is_active = true
    )
    SELECT 'events'::text, COUNT(*) FROM event_topics et 
    JOIN topic_info ti ON et.topic_id = ti.id
    UNION ALL
    SELECT 'news'::text, COUNT(*) FROM news_topics nt 
    JOIN topic_info ti ON nt.topic_id = ti.id
    UNION ALL
    SELECT 'resources'::text, COUNT(*) FROM resource_topics rt 
    JOIN topic_info ti ON rt.topic_id = ti.id
    UNION ALL
    SELECT 'marketplace'::text, COUNT(*) FROM marketplace_topics mt 
    JOIN topic_info ti ON mt.topic_id = ti.id
    UNION ALL
    SELECT 'opportunities'::text, COUNT(*) FROM opportunity_topics ot 
    JOIN topic_info ti ON ot.topic_id = ti.id
    UNION ALL
    SELECT 'groups'::text, COUNT(*) FROM group_topics gt 
    JOIN topic_info ti ON gt.topic_id = ti.id
    UNION ALL
    SELECT 'companies'::text, COUNT(*) FROM company_topics ct 
    JOIN topic_info ti ON ct.topic_id = ti.id
    UNION ALL
    SELECT 'members'::text, COUNT(*) FROM member_topics met 
    JOIN topic_info ti ON met.topic_id = ti.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_topic_content_counts(text) TO authenticated, anon;