-- Create likes table for polymorphic likes across different content types
CREATE TABLE IF NOT EXISTS "public"."likes" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "entity_type" text NOT NULL CHECK (entity_type IN ('event', 'news', 'resource', 'marketplace', 'opportunity', 'group', 'company', 'comment')),
    "entity_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create unique constraint to prevent duplicate likes
CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique ON public.likes (user_id, entity_type, entity_id);

-- Create comments table for polymorphic comments
CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "user_id" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    "entity_type" text NOT NULL CHECK (entity_type IN ('event', 'news', 'resource', 'marketplace', 'opportunity', 'group', 'company')),
    "entity_id" uuid NOT NULL,
    "parent_id" uuid REFERENCES public.comments(id) ON DELETE CASCADE,
    "content" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "is_deleted" boolean DEFAULT false NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_likes_entity ON public.likes (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON public.comments (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.comments (user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.comments (parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON public.comments (created_at DESC);

-- Function to safely add columns to tables that exist
DO $$
BEGIN
    -- Add like_count columns if tables exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
        ALTER TABLE public.events ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news') THEN
        ALTER TABLE public.news ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'resources') THEN
        ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_listings') THEN
        ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'opportunities') THEN
        ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'groups') THEN
        ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
        ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;
    END IF;
    
    -- Add like_count to comments table (this should exist since we just created it)
    ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;

    -- Add comment_count columns if tables exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
        ALTER TABLE public.events ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'news') THEN
        ALTER TABLE public.news ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'resources') THEN
        ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'marketplace_listings') THEN
        ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'opportunities') THEN
        ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'groups') THEN
        ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
        ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS comment_count integer DEFAULT 0;
    END IF;
END
$$;

-- Create function to update like counts
CREATE OR REPLACE FUNCTION update_like_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update like count based on entity type
        CASE NEW.entity_type
            WHEN 'event' THEN
                UPDATE public.events SET like_count = like_count + 1 WHERE id = NEW.entity_id;
            WHEN 'news' THEN
                UPDATE public.news SET like_count = like_count + 1 WHERE id = NEW.entity_id;
            WHEN 'resource' THEN
                UPDATE public.resources SET like_count = like_count + 1 WHERE id = NEW.entity_id;
            WHEN 'marketplace' THEN
                UPDATE public.marketplace_listings SET like_count = like_count + 1 WHERE id = NEW.entity_id;
            WHEN 'opportunity' THEN
                UPDATE public.opportunities SET like_count = like_count + 1 WHERE id = NEW.entity_id;
            WHEN 'group' THEN
                UPDATE public.groups SET like_count = like_count + 1 WHERE id = NEW.entity_id;
            WHEN 'company' THEN
                UPDATE public.companies SET like_count = like_count + 1 WHERE id = NEW.entity_id;
            WHEN 'comment' THEN
                UPDATE public.comments SET like_count = like_count + 1 WHERE id = NEW.entity_id;
        END CASE;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update like count based on entity type
        CASE OLD.entity_type
            WHEN 'event' THEN
                UPDATE public.events SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.entity_id;
            WHEN 'news' THEN
                UPDATE public.news SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.entity_id;
            WHEN 'resource' THEN
                UPDATE public.resources SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.entity_id;
            WHEN 'marketplace' THEN
                UPDATE public.marketplace_listings SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.entity_id;
            WHEN 'opportunity' THEN
                UPDATE public.opportunities SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.entity_id;
            WHEN 'group' THEN
                UPDATE public.groups SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.entity_id;
            WHEN 'company' THEN
                UPDATE public.companies SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.entity_id;
            WHEN 'comment' THEN
                UPDATE public.comments SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.entity_id;
        END CASE;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update comment counts
CREATE OR REPLACE FUNCTION update_comment_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update comment count based on entity type
        CASE NEW.entity_type
            WHEN 'event' THEN
                UPDATE public.events SET comment_count = comment_count + 1 WHERE id = NEW.entity_id;
            WHEN 'news' THEN
                UPDATE public.news SET comment_count = comment_count + 1 WHERE id = NEW.entity_id;
            WHEN 'resource' THEN
                UPDATE public.resources SET comment_count = comment_count + 1 WHERE id = NEW.entity_id;
            WHEN 'marketplace' THEN
                UPDATE public.marketplace_listings SET comment_count = comment_count + 1 WHERE id = NEW.entity_id;
            WHEN 'opportunity' THEN
                UPDATE public.opportunities SET comment_count = comment_count + 1 WHERE id = NEW.entity_id;
            WHEN 'group' THEN
                UPDATE public.groups SET comment_count = comment_count + 1 WHERE id = NEW.entity_id;
            WHEN 'company' THEN
                UPDATE public.companies SET comment_count = comment_count + 1 WHERE id = NEW.entity_id;
        END CASE;
    ELSIF TG_OP = 'UPDATE' AND OLD.is_deleted = false AND NEW.is_deleted = true THEN
        -- Decrement count when comment is soft deleted
        CASE NEW.entity_type
            WHEN 'event' THEN
                UPDATE public.events SET comment_count = GREATEST(0, comment_count - 1) WHERE id = NEW.entity_id;
            WHEN 'news' THEN
                UPDATE public.news SET comment_count = GREATEST(0, comment_count - 1) WHERE id = NEW.entity_id;
            WHEN 'resource' THEN
                UPDATE public.resources SET comment_count = GREATEST(0, comment_count - 1) WHERE id = NEW.entity_id;
            WHEN 'marketplace' THEN
                UPDATE public.marketplace_listings SET comment_count = GREATEST(0, comment_count - 1) WHERE id = NEW.entity_id;
            WHEN 'opportunity' THEN
                UPDATE public.opportunities SET comment_count = GREATEST(0, comment_count - 1) WHERE id = NEW.entity_id;
            WHEN 'group' THEN
                UPDATE public.groups SET comment_count = GREATEST(0, comment_count - 1) WHERE id = NEW.entity_id;
            WHEN 'company' THEN
                UPDATE public.companies SET comment_count = GREATEST(0, comment_count - 1) WHERE id = NEW.entity_id;
        END CASE;
    ELSIF TG_OP = 'UPDATE' AND OLD.is_deleted = true AND NEW.is_deleted = false THEN
        -- Increment count when comment is restored
        CASE NEW.entity_type
            WHEN 'event' THEN
                UPDATE public.events SET comment_count = comment_count + 1 WHERE id = NEW.entity_id;
            WHEN 'news' THEN
                UPDATE public.news SET comment_count = comment_count + 1 WHERE id = NEW.entity_id;
            WHEN 'resource' THEN
                UPDATE public.resources SET comment_count = comment_count + 1 WHERE id = NEW.entity_id;
            WHEN 'marketplace' THEN
                UPDATE public.marketplace_listings SET comment_count = comment_count + 1 WHERE id = NEW.entity_id;
            WHEN 'opportunity' THEN
                UPDATE public.opportunities SET comment_count = comment_count + 1 WHERE id = NEW.entity_id;
            WHEN 'group' THEN
                UPDATE public.groups SET comment_count = comment_count + 1 WHERE id = NEW.entity_id;
            WHEN 'company' THEN
                UPDATE public.companies SET comment_count = comment_count + 1 WHERE id = NEW.entity_id;
        END CASE;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers (drop first if they exist)
DROP TRIGGER IF EXISTS update_like_count_trigger ON public.likes;
CREATE TRIGGER update_like_count_trigger
    AFTER INSERT OR DELETE ON public.likes
    FOR EACH ROW
    EXECUTE FUNCTION update_like_count();

DROP TRIGGER IF EXISTS update_comment_count_trigger ON public.comments;
CREATE TRIGGER update_comment_count_trigger
    AFTER INSERT OR UPDATE OF is_deleted ON public.comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_count();

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for likes (drop existing first)
DROP POLICY IF EXISTS "Users can view all likes" ON public.likes;
CREATE POLICY "Users can view all likes" ON public.likes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create their own likes" ON public.likes;
CREATE POLICY "Users can create their own likes" ON public.likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own likes" ON public.likes;
CREATE POLICY "Users can delete their own likes" ON public.likes
    FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for comments (drop existing first)
DROP POLICY IF EXISTS "Users can view non-deleted comments" ON public.comments;
CREATE POLICY "Users can view non-deleted comments" ON public.comments
    FOR SELECT USING (is_deleted = false);

DROP POLICY IF EXISTS "Users can create comments when authenticated" ON public.comments;
CREATE POLICY "Users can create comments when authenticated" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can soft delete their own comments" ON public.comments;
CREATE POLICY "Users can soft delete their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (is_deleted = true);

-- Admins can view all comments including deleted ones
DROP POLICY IF EXISTS "Admins can view all comments" ON public.comments;
CREATE POLICY "Admins can view all comments" ON public.comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Admins can delete any comment
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.comments;
CREATE POLICY "Admins can delete any comment" ON public.comments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );