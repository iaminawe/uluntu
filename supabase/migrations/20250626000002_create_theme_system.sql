-- Create theme system tables for customizable branding and visual appearance

-- Create themes table to store theme configurations
CREATE TABLE IF NOT EXISTS "public"."themes" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "name" text NOT NULL,
    "slug" text NOT NULL UNIQUE,
    "description" text,
    "is_active" boolean DEFAULT false NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "is_preset" boolean DEFAULT false NOT NULL,
    "created_by" uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create theme configurations table for color schemes and styling
CREATE TABLE IF NOT EXISTS "public"."theme_configurations" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "theme_id" uuid NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
    "config_type" text NOT NULL CHECK (config_type IN ('colors', 'typography', 'spacing', 'borders', 'shadows', 'animations')),
    "config_data" jsonb NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(theme_id, config_type)
);

-- Create theme assets table for logos and images
CREATE TABLE IF NOT EXISTS "public"."theme_assets" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "theme_id" uuid NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
    "asset_type" text NOT NULL CHECK (asset_type IN ('logo', 'logo_dark', 'favicon', 'og_image', 'background', 'pattern')),
    "file_path" text NOT NULL,
    "file_url" text NOT NULL,
    "file_size" integer,
    "mime_type" text,
    "width" integer,
    "height" integer,
    "alt_text" text,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(theme_id, asset_type)
);

-- Create theme metadata table for additional settings
CREATE TABLE IF NOT EXISTS "public"."theme_metadata" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "theme_id" uuid NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
    "site_name" text,
    "site_tagline" text,
    "site_description" text,
    "contact_email" text,
    "social_links" jsonb DEFAULT '{}',
    "custom_css" text,
    "custom_head_html" text,
    "custom_body_html" text,
    "meta_tags" jsonb DEFAULT '{}',
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(theme_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_themes_slug ON public.themes (slug);
CREATE INDEX IF NOT EXISTS idx_themes_active ON public.themes (is_active);
CREATE INDEX IF NOT EXISTS idx_themes_default ON public.themes (is_default);
CREATE INDEX IF NOT EXISTS idx_theme_configurations_theme ON public.theme_configurations (theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_assets_theme ON public.theme_assets (theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_metadata_theme ON public.theme_metadata (theme_id);

-- Create function to ensure only one active theme
CREATE OR REPLACE FUNCTION ensure_single_active_theme() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = true THEN
        -- Deactivate all other themes
        UPDATE public.themes 
        SET is_active = false 
        WHERE id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to ensure only one default theme
CREATE OR REPLACE FUNCTION ensure_single_default_theme() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = true THEN
        -- Remove default status from all other themes
        UPDATE public.themes 
        SET is_default = false 
        WHERE id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS ensure_single_active_theme_trigger ON public.themes;
CREATE TRIGGER ensure_single_active_theme_trigger
    BEFORE INSERT OR UPDATE OF is_active ON public.themes
    FOR EACH ROW
    WHEN (NEW.is_active = true)
    EXECUTE FUNCTION ensure_single_active_theme();

DROP TRIGGER IF EXISTS ensure_single_default_theme_trigger ON public.themes;
CREATE TRIGGER ensure_single_default_theme_trigger
    BEFORE INSERT OR UPDATE OF is_default ON public.themes
    FOR EACH ROW
    WHEN (NEW.is_default = true)
    EXECUTE FUNCTION ensure_single_default_theme();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_theme_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_themes_updated_at ON public.themes;
CREATE TRIGGER update_themes_updated_at
    BEFORE UPDATE ON public.themes
    FOR EACH ROW
    EXECUTE FUNCTION update_theme_updated_at();

DROP TRIGGER IF EXISTS update_theme_configurations_updated_at ON public.theme_configurations;
CREATE TRIGGER update_theme_configurations_updated_at
    BEFORE UPDATE ON public.theme_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_theme_updated_at();

DROP TRIGGER IF EXISTS update_theme_assets_updated_at ON public.theme_assets;
CREATE TRIGGER update_theme_assets_updated_at
    BEFORE UPDATE ON public.theme_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_theme_updated_at();

DROP TRIGGER IF EXISTS update_theme_metadata_updated_at ON public.theme_metadata;
CREATE TRIGGER update_theme_metadata_updated_at
    BEFORE UPDATE ON public.theme_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_theme_updated_at();

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_metadata ENABLE ROW LEVEL SECURITY;

-- RLS policies for themes
DROP POLICY IF EXISTS "Anyone can view active themes" ON public.themes;
CREATE POLICY "Anyone can view active themes" ON public.themes
    FOR SELECT USING (is_active = true OR is_preset = true);

DROP POLICY IF EXISTS "Admins can view all themes" ON public.themes;
CREATE POLICY "Admins can view all themes" ON public.themes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

DROP POLICY IF EXISTS "Admins can create themes" ON public.themes;
CREATE POLICY "Admins can create themes" ON public.themes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

DROP POLICY IF EXISTS "Admins can update themes" ON public.themes;
CREATE POLICY "Admins can update themes" ON public.themes
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

DROP POLICY IF EXISTS "Admins can delete non-preset themes" ON public.themes;
CREATE POLICY "Admins can delete non-preset themes" ON public.themes
    FOR DELETE USING (
        is_preset = false AND
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- RLS policies for theme configurations
DROP POLICY IF EXISTS "Anyone can view configurations of active themes" ON public.theme_configurations;
CREATE POLICY "Anyone can view configurations of active themes" ON public.theme_configurations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.themes 
            WHERE id = theme_configurations.theme_id 
            AND (is_active = true OR is_preset = true)
        )
    );

DROP POLICY IF EXISTS "Admins can manage theme configurations" ON public.theme_configurations;
CREATE POLICY "Admins can manage theme configurations" ON public.theme_configurations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- RLS policies for theme assets
DROP POLICY IF EXISTS "Anyone can view assets of active themes" ON public.theme_assets;
CREATE POLICY "Anyone can view assets of active themes" ON public.theme_assets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.themes 
            WHERE id = theme_assets.theme_id 
            AND (is_active = true OR is_preset = true)
        )
    );

DROP POLICY IF EXISTS "Admins can manage theme assets" ON public.theme_assets;
CREATE POLICY "Admins can manage theme assets" ON public.theme_assets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- RLS policies for theme metadata
DROP POLICY IF EXISTS "Anyone can view metadata of active themes" ON public.theme_metadata;
CREATE POLICY "Anyone can view metadata of active themes" ON public.theme_metadata
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.themes 
            WHERE id = theme_metadata.theme_id 
            AND (is_active = true OR is_preset = true)
        )
    );

DROP POLICY IF EXISTS "Admins can manage theme metadata" ON public.theme_metadata;
CREATE POLICY "Admins can manage theme metadata" ON public.theme_metadata
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Create storage bucket for theme assets
INSERT INTO storage.buckets (id, name, public, avif_autodetection, allowed_mime_types)
VALUES (
    'theme-assets',
    'theme-assets',
    true,
    false,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/x-icon']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for theme assets bucket
DROP POLICY IF EXISTS "Anyone can view theme assets" ON storage.objects;
CREATE POLICY "Anyone can view theme assets" ON storage.objects
    FOR SELECT USING (bucket_id = 'theme-assets');

DROP POLICY IF EXISTS "Admins can upload theme assets" ON storage.objects;
CREATE POLICY "Admins can upload theme assets" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'theme-assets' AND
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

DROP POLICY IF EXISTS "Admins can update theme assets" ON storage.objects;
CREATE POLICY "Admins can update theme assets" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'theme-assets' AND
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

DROP POLICY IF EXISTS "Admins can delete theme assets" ON storage.objects;
CREATE POLICY "Admins can delete theme assets" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'theme-assets' AND
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Insert default theme
INSERT INTO public.themes (name, slug, description, is_active, is_default, is_preset)
VALUES (
    'Default Theme',
    'default',
    'The default Nelson Tech theme with orange accents and modern design',
    true,
    true,
    true
) ON CONFLICT (slug) DO NOTHING;

-- Get the default theme ID and insert configurations
DO $$
DECLARE
    default_theme_id uuid;
BEGIN
    SELECT id INTO default_theme_id FROM public.themes WHERE slug = 'default';
    
    -- Only proceed if the theme exists
    IF default_theme_id IS NOT NULL THEN
        -- Insert default color configuration
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            default_theme_id,
            'colors',
            '{
                "primary": "#F97316",
                "primary_hover": "#EA580C",
                "primary_light": "#FED7AA",
                "secondary": "#1F2937",
                "secondary_hover": "#111827",
                "secondary_light": "#4B5563",
                "background": "#FFFFFF",
                "surface": "#F9FAFB",
                "text": "#111827",
                "text_muted": "#6B7280",
                "border": "#E5E7EB",
                "error": "#EF4444",
                "warning": "#F59E0B",
                "success": "#10B981",
                "info": "#3B82F6"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO NOTHING;
        
        -- Insert default typography configuration
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            default_theme_id,
            'typography',
            '{
                "font_family": "Inter, system-ui, -apple-system, sans-serif",
                "font_family_heading": "Inter, system-ui, -apple-system, sans-serif",
                "font_size_base": "16px",
                "font_size_sm": "14px",
                "font_size_lg": "18px",
                "font_size_xl": "20px",
                "font_size_2xl": "24px",
                "font_size_3xl": "30px",
                "font_size_4xl": "36px",
                "line_height_base": "1.5",
                "line_height_tight": "1.25",
                "line_height_loose": "1.75"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO NOTHING;
        
        -- Insert default spacing configuration
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            default_theme_id,
            'spacing',
            '{
                "spacing_xs": "0.25rem",
                "spacing_sm": "0.5rem",
                "spacing_md": "1rem",
                "spacing_lg": "1.5rem",
                "spacing_xl": "2rem",
                "spacing_2xl": "3rem",
                "spacing_3xl": "4rem",
                "container_max_width": "1280px",
                "container_padding": "1rem"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO NOTHING;
        
        -- Insert default borders configuration
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            default_theme_id,
            'borders',
            '{
                "radius_sm": "0.125rem",
                "radius_md": "0.375rem",
                "radius_lg": "0.5rem",
                "radius_xl": "0.75rem",
                "radius_full": "9999px",
                "width_thin": "1px",
                "width_medium": "2px",
                "width_thick": "4px"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO NOTHING;
        
        -- Insert default shadows configuration
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            default_theme_id,
            'shadows',
            '{
                "shadow_sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                "shadow_md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                "shadow_lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                "shadow_xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO NOTHING;
        
        -- Insert default metadata
        INSERT INTO public.theme_metadata (theme_id, site_name, site_tagline, site_description)
        VALUES (
            default_theme_id,
            'Nelson Tech',
            'Building the Future of Technology',
            'Nelson Tech is a vibrant community of innovators, entrepreneurs, and technology enthusiasts.'
        ) ON CONFLICT (theme_id) DO NOTHING;
    END IF;
END $$;