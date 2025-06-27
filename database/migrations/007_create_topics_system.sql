-- Topics System Migration
-- This migration creates the topics table and integrates it with all content entities

-- Create the main topics table
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_topics_slug ON public.topics(slug);
CREATE INDEX idx_topics_sort_order ON public.topics(sort_order);

-- Create junction tables for many-to-many relationships
CREATE TABLE IF NOT EXISTS public.news_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(news_id, topic_id)
);

CREATE TABLE IF NOT EXISTS public.event_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, topic_id)
);

CREATE TABLE IF NOT EXISTS public.resource_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(resource_id, topic_id)
);

CREATE TABLE IF NOT EXISTS public.group_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, topic_id)
);

CREATE TABLE IF NOT EXISTS public.marketplace_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(listing_id, topic_id)
);

CREATE TABLE IF NOT EXISTS public.opportunity_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(opportunity_id, topic_id)
);

CREATE TABLE IF NOT EXISTS public.company_topics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, topic_id)
);

-- Create indexes for junction tables
CREATE INDEX idx_news_topics_news_id ON public.news_topics(news_id);
CREATE INDEX idx_news_topics_topic_id ON public.news_topics(topic_id);
CREATE INDEX idx_event_topics_event_id ON public.event_topics(event_id);
CREATE INDEX idx_event_topics_topic_id ON public.event_topics(topic_id);
CREATE INDEX idx_resource_topics_resource_id ON public.resource_topics(resource_id);
CREATE INDEX idx_resource_topics_topic_id ON public.resource_topics(topic_id);
CREATE INDEX idx_group_topics_group_id ON public.group_topics(group_id);
CREATE INDEX idx_group_topics_topic_id ON public.group_topics(topic_id);
CREATE INDEX idx_marketplace_topics_listing_id ON public.marketplace_topics(listing_id);
CREATE INDEX idx_marketplace_topics_topic_id ON public.marketplace_topics(topic_id);
CREATE INDEX idx_opportunity_topics_opportunity_id ON public.opportunity_topics(opportunity_id);
CREATE INDEX idx_opportunity_topics_topic_id ON public.opportunity_topics(topic_id);
CREATE INDEX idx_company_topics_company_id ON public.company_topics(company_id);
CREATE INDEX idx_company_topics_topic_id ON public.company_topics(topic_id);

-- Create view for topic analytics
CREATE OR REPLACE VIEW public.topic_analytics AS
SELECT 
    t.id as topic_id,
    t.name as topic_name,
    t.slug,
    COALESCE(news_count, 0) + COALESCE(event_count, 0) + COALESCE(resource_count, 0) + 
    COALESCE(group_count, 0) + COALESCE(marketplace_count, 0) + 
    COALESCE(opportunity_count, 0) + COALESCE(company_count, 0) as content_count,
    COALESCE(news_count, 0) as news_count,
    COALESCE(event_count, 0) as event_count,
    COALESCE(resource_count, 0) as resource_count,
    COALESCE(group_count, 0) as group_count,
    COALESCE(marketplace_count, 0) as marketplace_count,
    COALESCE(opportunity_count, 0) as opportunity_count,
    COALESCE(company_count, 0) as company_count
FROM public.topics t
LEFT JOIN (
    SELECT topic_id, COUNT(*) as news_count 
    FROM public.news_topics 
    GROUP BY topic_id
) n ON t.id = n.topic_id
LEFT JOIN (
    SELECT topic_id, COUNT(*) as event_count 
    FROM public.event_topics 
    GROUP BY topic_id
) e ON t.id = e.topic_id
LEFT JOIN (
    SELECT topic_id, COUNT(*) as resource_count 
    FROM public.resource_topics 
    GROUP BY topic_id
) r ON t.id = r.topic_id
LEFT JOIN (
    SELECT topic_id, COUNT(*) as group_count 
    FROM public.group_topics 
    GROUP BY topic_id
) g ON t.id = g.topic_id
LEFT JOIN (
    SELECT topic_id, COUNT(*) as marketplace_count 
    FROM public.marketplace_topics 
    GROUP BY topic_id
) m ON t.id = m.topic_id
LEFT JOIN (
    SELECT topic_id, COUNT(*) as opportunity_count 
    FROM public.opportunity_topics 
    GROUP BY topic_id
) o ON t.id = o.topic_id
LEFT JOIN (
    SELECT topic_id, COUNT(*) as company_count 
    FROM public.company_topics 
    GROUP BY topic_id
) c ON t.id = c.topic_id;

-- Function to generate slug from topic name
CREATE OR REPLACE FUNCTION public.generate_topic_slug(topic_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                TRIM(topic_name),
                '[^a-zA-Z0-9\s-]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION public.topic_slug_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := public.generate_topic_slug(NEW.name);
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER topic_slug_before_insert_update
    BEFORE INSERT OR UPDATE ON public.topics
    FOR EACH ROW
    EXECUTE FUNCTION public.topic_slug_trigger();

-- Insert initial topics
INSERT INTO public.topics (name, description, icon, color, sort_order) VALUES
    ('Technology', 'Software, hardware, and tech innovation', 'code', '#0EA5E9', 1),
    ('Business', 'Entrepreneurship, startups, and commerce', 'briefcase', '#10B981', 2),
    ('Art', 'Visual arts, performance, and creative expression', 'palette', '#F59E0B', 3),
    ('Photography', 'Photography techniques and visual storytelling', 'camera', '#8B5CF6', 4),
    ('Design', 'Design thinking, UX/UI, and visual design', 'pencil', '#EC4899', 5)
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_topics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for topics (read access for all, write for admins)
CREATE POLICY "Topics are viewable by everyone" 
    ON public.topics FOR SELECT 
    USING (true);

CREATE POLICY "Topics can be created by admins" 
    ON public.topics FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Topics can be updated by admins" 
    ON public.topics FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Topics can be deleted by admins" 
    ON public.topics FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Create RLS policies for junction tables (viewable by all, writable based on entity permissions)
-- News topics
CREATE POLICY "News topics are viewable by everyone" 
    ON public.news_topics FOR SELECT 
    USING (true);

CREATE POLICY "News topics can be managed by news authors" 
    ON public.news_topics FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.news 
            WHERE news.id = news_topics.news_id 
            AND (
                news.author_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.user_roles 
                    WHERE user_id = auth.uid() 
                    AND role IN ('admin', 'super_admin')
                )
            )
        )
    );

-- Similar policies for other junction tables
CREATE POLICY "Event topics are viewable by everyone" 
    ON public.event_topics FOR SELECT 
    USING (true);

CREATE POLICY "Resource topics are viewable by everyone" 
    ON public.resource_topics FOR SELECT 
    USING (true);

CREATE POLICY "Group topics are viewable by everyone" 
    ON public.group_topics FOR SELECT 
    USING (true);

CREATE POLICY "Marketplace topics are viewable by everyone" 
    ON public.marketplace_topics FOR SELECT 
    USING (true);

CREATE POLICY "Opportunity topics are viewable by everyone" 
    ON public.opportunity_topics FOR SELECT 
    USING (true);

CREATE POLICY "Company topics are viewable by everyone" 
    ON public.company_topics FOR SELECT 
    USING (true);