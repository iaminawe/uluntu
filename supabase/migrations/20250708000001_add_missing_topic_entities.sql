-- Add missing topic associations for gallery and pages entities
-- This migration ensures all entities can have topics for landing page aggregation

-- Gallery topics (for photo galleries)
CREATE TABLE IF NOT EXISTS "public"."gallery_topics" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "gallery_id" uuid NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
    "topic_id" uuid NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create unique constraint and indexes for gallery topics
CREATE UNIQUE INDEX IF NOT EXISTS idx_gallery_topics_unique ON public.gallery_topics (gallery_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_gallery_topics_gallery ON public.gallery_topics (gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_topics_topic ON public.gallery_topics (topic_id);

-- Enable RLS for gallery topics
ALTER TABLE public.gallery_topics ENABLE ROW LEVEL SECURITY;

-- RLS policies for gallery topics
DROP POLICY IF EXISTS "Anyone can view gallery topics" ON public.gallery_topics;
CREATE POLICY "Anyone can view gallery topics" ON public.gallery_topics
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage gallery topics" ON public.gallery_topics;
CREATE POLICY "Admins can manage gallery topics" ON public.gallery_topics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Update topic analytics view to include galleries
DROP VIEW IF EXISTS topic_analytics;
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
        COALESCE(member_count, 0) + 
        COALESCE(gallery_count, 0) AS total_content_count,
        COALESCE(event_count, 0) AS event_count,
        COALESCE(news_count, 0) AS news_count,
        COALESCE(resource_count, 0) AS resource_count,
        COALESCE(marketplace_count, 0) AS marketplace_count,
        COALESCE(opportunity_count, 0) AS opportunity_count,
        COALESCE(group_count, 0) AS group_count,
        COALESCE(company_count, 0) AS company_count,
        COALESCE(member_count, 0) AS member_count,
        COALESCE(gallery_count, 0) AS gallery_count
    FROM topics t
    LEFT JOIN (SELECT topic_id, COUNT(*) as event_count FROM event_topics GROUP BY topic_id) et ON t.id = et.topic_id
    LEFT JOIN (SELECT topic_id, COUNT(*) as news_count FROM news_topics GROUP BY topic_id) nt ON t.id = nt.topic_id
    LEFT JOIN (SELECT topic_id, COUNT(*) as resource_count FROM resource_topics GROUP BY topic_id) rt ON t.id = rt.topic_id
    LEFT JOIN (SELECT topic_id, COUNT(*) as marketplace_count FROM marketplace_topics GROUP BY topic_id) mt ON t.id = mt.topic_id
    LEFT JOIN (SELECT topic_id, COUNT(*) as opportunity_count FROM opportunity_topics GROUP BY topic_id) ot ON t.id = ot.topic_id
    LEFT JOIN (SELECT topic_id, COUNT(*) as group_count FROM group_topics GROUP BY topic_id) gt ON t.id = gt.topic_id
    LEFT JOIN (SELECT topic_id, COUNT(*) as company_count FROM company_topics GROUP BY topic_id) ct ON t.id = ct.topic_id
    LEFT JOIN (SELECT topic_id, COUNT(*) as member_count FROM member_topics GROUP BY topic_id) met ON t.id = met.topic_id
    LEFT JOIN (SELECT topic_id, COUNT(*) as gallery_count FROM gallery_topics GROUP BY topic_id) gat ON t.id = gat.topic_id
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

-- Update the get_topic_content_counts function to include galleries
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
    JOIN topic_info ti ON met.topic_id = ti.id
    UNION ALL
    SELECT 'galleries'::text, COUNT(*) FROM gallery_topics gat 
    JOIN topic_info ti ON gat.topic_id = ti.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the updated function
GRANT EXECUTE ON FUNCTION get_topic_content_counts(text) TO authenticated, anon;