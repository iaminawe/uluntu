-- Seed preset themes into the database

-- Default Orange theme (active and default)
INSERT INTO public.themes (name, slug, description, is_active, is_default, is_preset)
VALUES (
    'Default Orange',
    'default-orange',
    'The default Nelson Tech theme with vibrant orange accents',
    true,
    true,
    true
) ON CONFLICT (slug) DO NOTHING;

-- Get Default Orange theme ID and insert configurations
DO $$
DECLARE
    v_theme_id uuid;
BEGIN
    SELECT id INTO v_theme_id FROM public.themes WHERE slug = 'default-orange';
    
    IF v_theme_id IS NOT NULL THEN
        -- Colors
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
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
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        -- Typography
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
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
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        -- Spacing
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
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
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        -- Borders
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
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
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        -- Shadows
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'shadows',
            '{
                "shadow_sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                "shadow_md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                "shadow_lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                "shadow_xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
    END IF;
END $$;

-- Professional Blue theme
INSERT INTO public.themes (name, slug, description, is_active, is_default, is_preset)
VALUES (
    'Professional Blue',
    'professional-blue',
    'A clean, professional theme with blue accents',
    false,
    false,
    true
) ON CONFLICT (slug) DO NOTHING;

-- Get Professional Blue theme ID and insert configurations
DO $$
DECLARE
    v_theme_id uuid;
BEGIN
    SELECT id INTO v_theme_id FROM public.themes WHERE slug = 'professional-blue';
    
    IF v_theme_id IS NOT NULL THEN
        -- Colors
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'colors',
            '{
                "primary": "#3B82F6",
                "primary_hover": "#2563EB",
                "primary_light": "#DBEAFE",
                "secondary": "#1E293B",
                "secondary_hover": "#0F172A",
                "secondary_light": "#475569",
                "background": "#FFFFFF",
                "surface": "#F8FAFC",
                "text": "#0F172A",
                "text_muted": "#64748B",
                "border": "#E2E8F0",
                "error": "#EF4444",
                "warning": "#F59E0B",
                "success": "#10B981",
                "info": "#06B6D4"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        -- Typography
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'typography',
            '{
                "font_family": "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
                "font_family_heading": "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
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
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        -- Other configurations...
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
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
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'borders',
            '{
                "radius_sm": "0.25rem",
                "radius_md": "0.5rem",
                "radius_lg": "0.75rem",
                "radius_xl": "1rem",
                "radius_full": "9999px",
                "width_thin": "1px",
                "width_medium": "2px",
                "width_thick": "4px"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'shadows',
            '{
                "shadow_sm": "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                "shadow_md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                "shadow_lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                "shadow_xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
    END IF;
END $$;

-- Modern Purple theme
INSERT INTO public.themes (name, slug, description, is_active, is_default, is_preset)
VALUES (
    'Modern Purple',
    'modern-purple',
    'A modern, vibrant theme with purple gradients',
    false,
    false,
    true
) ON CONFLICT (slug) DO NOTHING;

-- Get Modern Purple theme ID and insert configurations
DO $$
DECLARE
    v_theme_id uuid;
BEGIN
    SELECT id INTO v_theme_id FROM public.themes WHERE slug = 'modern-purple';
    
    IF v_theme_id IS NOT NULL THEN
        -- Colors
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'colors',
            '{
                "primary": "#8B5CF6",
                "primary_hover": "#7C3AED",
                "primary_light": "#EDE9FE",
                "secondary": "#1E1B4B",
                "secondary_hover": "#0F0A3C",
                "secondary_light": "#4C1D95",
                "background": "#FAFAFA",
                "surface": "#FFFFFF",
                "text": "#111827",
                "text_muted": "#6B7280",
                "border": "#E5E7EB",
                "error": "#DC2626",
                "warning": "#F59E0B",
                "success": "#059669",
                "info": "#0891B2"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        -- Typography
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'typography',
            '{
                "font_family": "\"Plus Jakarta Sans\", Inter, sans-serif",
                "font_family_heading": "\"Plus Jakarta Sans\", Inter, sans-serif",
                "font_size_base": "16px",
                "font_size_sm": "14px",
                "font_size_lg": "18px",
                "font_size_xl": "20px",
                "font_size_2xl": "24px",
                "font_size_3xl": "32px",
                "font_size_4xl": "40px",
                "line_height_base": "1.6",
                "line_height_tight": "1.2",
                "line_height_loose": "1.8"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        -- Other configurations...
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
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
                "container_padding": "1.25rem"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'borders',
            '{
                "radius_sm": "0.375rem",
                "radius_md": "0.75rem",
                "radius_lg": "1rem",
                "radius_xl": "1.5rem",
                "radius_full": "9999px",
                "width_thin": "1px",
                "width_medium": "2px",
                "width_thick": "3px"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'shadows',
            '{
                "shadow_sm": "0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                "shadow_md": "0 6px 10px -2px rgba(0, 0, 0, 0.08)",
                "shadow_lg": "0 12px 20px -4px rgba(0, 0, 0, 0.1)",
                "shadow_xl": "0 24px 40px -8px rgba(0, 0, 0, 0.12)"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
    END IF;
END $$;

-- Minimalist Green theme
INSERT INTO public.themes (name, slug, description, is_active, is_default, is_preset)
VALUES (
    'Minimalist Green',
    'minimalist-green',
    'A clean, eco-friendly theme with green accents',
    false,
    false,
    true
) ON CONFLICT (slug) DO NOTHING;

-- Get Minimalist Green theme ID and insert configurations
DO $$
DECLARE
    v_theme_id uuid;
BEGIN
    SELECT id INTO v_theme_id FROM public.themes WHERE slug = 'minimalist-green';
    
    IF v_theme_id IS NOT NULL THEN
        -- Colors
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'colors',
            '{
                "primary": "#10B981",
                "primary_hover": "#059669",
                "primary_light": "#D1FAE5",
                "secondary": "#064E3B",
                "secondary_hover": "#022C22",
                "secondary_light": "#047857",
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
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        -- Typography
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'typography',
            '{
                "font_family": "Helvetica, Arial, sans-serif",
                "font_family_heading": "Georgia, serif",
                "font_size_base": "16px",
                "font_size_sm": "14px",
                "font_size_lg": "18px",
                "font_size_xl": "20px",
                "font_size_2xl": "24px",
                "font_size_3xl": "30px",
                "font_size_4xl": "36px",
                "line_height_base": "1.625",
                "line_height_tight": "1.25",
                "line_height_loose": "2"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        -- Other configurations...
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'spacing',
            '{
                "spacing_xs": "0.25rem",
                "spacing_sm": "0.5rem",
                "spacing_md": "1rem",
                "spacing_lg": "1.5rem",
                "spacing_xl": "2rem",
                "spacing_2xl": "3rem",
                "spacing_3xl": "4rem",
                "container_max_width": "1200px",
                "container_padding": "1rem"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'borders',
            '{
                "radius_sm": "0",
                "radius_md": "0.125rem",
                "radius_lg": "0.25rem",
                "radius_xl": "0.5rem",
                "radius_full": "9999px",
                "width_thin": "1px",
                "width_medium": "2px",
                "width_thick": "4px"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'shadows',
            '{
                "shadow_sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                "shadow_md": "0 2px 4px -1px rgba(0, 0, 0, 0.07)",
                "shadow_lg": "0 4px 8px -2px rgba(0, 0, 0, 0.08)",
                "shadow_xl": "0 8px 16px -4px rgba(0, 0, 0, 0.1)"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
    END IF;
END $$;

-- Dark Mode theme
INSERT INTO public.themes (name, slug, description, is_active, is_default, is_preset)
VALUES (
    'Dark Mode',
    'dark-mode',
    'A sleek dark theme for reduced eye strain',
    false,
    false,
    true
) ON CONFLICT (slug) DO NOTHING;

-- Get Dark Mode theme ID and insert configurations
DO $$
DECLARE
    v_theme_id uuid;
BEGIN
    SELECT id INTO v_theme_id FROM public.themes WHERE slug = 'dark-mode';
    
    IF v_theme_id IS NOT NULL THEN
        -- Colors
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'colors',
            '{
                "primary": "#F97316",
                "primary_hover": "#FB923C",
                "primary_light": "#7C2D12",
                "secondary": "#E5E7EB",
                "secondary_hover": "#F3F4F6",
                "secondary_light": "#9CA3AF",
                "background": "#0F172A",
                "surface": "#1E293B",
                "text": "#F1F5F9",
                "text_muted": "#94A3B8",
                "border": "#334155",
                "error": "#F87171",
                "warning": "#FBBF24",
                "success": "#34D399",
                "info": "#60A5FA"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        -- Typography
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
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
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        -- Other configurations...
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
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
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
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
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
        
        INSERT INTO public.theme_configurations (theme_id, config_type, config_data)
        VALUES (
            v_theme_id,
            'shadows',
            '{
                "shadow_sm": "0 1px 2px 0 rgba(0, 0, 0, 0.3)",
                "shadow_md": "0 4px 6px -1px rgba(0, 0, 0, 0.4)",
                "shadow_lg": "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                "shadow_xl": "0 20px 25px -5px rgba(0, 0, 0, 0.6)"
            }'::jsonb
        ) ON CONFLICT (theme_id, config_type) DO UPDATE SET config_data = EXCLUDED.config_data;
    END IF;
END $$;