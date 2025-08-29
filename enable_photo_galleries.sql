-- Enable Photo Galleries Feature in Admin Features Table
-- This script ensures the photo galleries feature is enabled in the admin UI

-- First, check if the admin_features table exists and has the photo_galleries feature
DO $$ 
BEGIN
    -- Check if admin_features table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'admin_features') THEN
        -- Update or insert the photo_galleries feature
        INSERT INTO admin_features (key, enabled, name, description, category, updated_at)
        VALUES (
            'photo_galleries',
            true,
            'Photo Galleries',
            'Enable photo gallery functionality including admin management',
            'content',
            NOW()
        )
        ON CONFLICT (key) DO UPDATE
        SET 
            enabled = true,
            updated_at = NOW();
        
        RAISE NOTICE 'Photo galleries feature enabled in admin_features table';
    END IF;

    -- Also check feature_toggles table (alternative location)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'feature_toggles') THEN
        INSERT INTO feature_toggles (feature_key, enabled, description, updated_at)
        VALUES (
            'photo_galleries',
            true,
            'Photo galleries feature with admin management',
            NOW()
        )
        ON CONFLICT (feature_key) DO UPDATE
        SET 
            enabled = true,
            updated_at = NOW();
        
        RAISE NOTICE 'Photo galleries feature enabled in feature_toggles table';
    END IF;
END $$;

-- Verify the feature is enabled
SELECT 
    'admin_features' as table_name,
    key as feature_key,
    enabled,
    name,
    description
FROM admin_features 
WHERE key = 'photo_galleries'
UNION ALL
SELECT 
    'feature_toggles' as table_name,
    feature_key,
    enabled,
    'Photo Galleries' as name,
    description
FROM feature_toggles 
WHERE feature_key = 'photo_galleries';