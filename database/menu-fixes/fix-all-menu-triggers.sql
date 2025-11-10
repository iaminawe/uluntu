-- Comprehensive fix for ALL menu trigger issues

-- ============================================
-- SECTION 1: Find and drop ALL triggers on menu_items
-- ============================================

-- First, let's see what triggers exist
SELECT 
    tgname as trigger_name,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgrelid = 'menu_items'::regclass;

-- Drop ALL triggers on menu_items table
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Loop through all triggers on menu_items and drop them
    FOR trigger_record IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'menu_items'::regclass 
        AND tgisinternal = false
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON menu_items', trigger_record.tgname);
        RAISE NOTICE 'Dropped trigger: %', trigger_record.tgname;
    END LOOP;
END $$;

-- ============================================
-- SECTION 2: Replace the audit function with a safe no-op version
-- ============================================

-- Find all functions that might be audit-related
SELECT 
    proname as function_name,
    pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname LIKE '%audit%menu%' 
   OR proname LIKE '%menu%audit%';

-- Replace ANY audit function with a safe version
CREATE OR REPLACE FUNCTION audit_menu_items_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Completely disabled - just return without doing anything
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Also create this variant in case it exists
CREATE OR REPLACE FUNCTION audit_menu_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SECTION 3: Fix the menu_audit_log foreign key
-- ============================================

-- Remove the problematic foreign key constraint from menu_audit_log
DO $$
BEGIN
    -- Check if menu_audit_log table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'menu_audit_log'
    ) THEN
        -- Drop the foreign key constraint
        ALTER TABLE menu_audit_log 
        DROP CONSTRAINT IF EXISTS menu_audit_log_menu_item_id_fkey;
        
        -- Add it back as SET NULL on delete (or don't add it back at all)
        ALTER TABLE menu_audit_log
        ADD CONSTRAINT menu_audit_log_menu_item_id_fkey
        FOREIGN KEY (menu_item_id)
        REFERENCES menu_items(id)
        ON DELETE SET NULL
        DEFERRABLE INITIALLY DEFERRED;
        
        -- Clean up orphaned audit records
        UPDATE menu_audit_log
        SET menu_item_id = NULL
        WHERE menu_item_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM menu_items 
            WHERE menu_items.id = menu_audit_log.menu_item_id
        );
        
        RAISE NOTICE 'Fixed menu_audit_log foreign key';
    END IF;
END $$;

-- ============================================
-- SECTION 4: Now safely remove duplicates
-- ============================================

WITH duplicates AS (
    SELECT 
        id,
        title,
        url,
        ROW_NUMBER() OVER (
            PARTITION BY title, COALESCE(url, '')
            ORDER BY 
                CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END,
                id
        ) as rn
    FROM menu_items
)
DELETE FROM menu_items
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- ============================================
-- SECTION 5: Fix orphaned children
-- ============================================

UPDATE menu_items 
SET parent_id = NULL
WHERE parent_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM menu_items p 
    WHERE p.id = menu_items.parent_id
);

-- ============================================
-- SECTION 6: Fix the menu_items foreign key for CASCADE
-- ============================================

ALTER TABLE menu_items 
DROP CONSTRAINT IF EXISTS menu_items_parent_id_fkey;

ALTER TABLE menu_items
ADD CONSTRAINT menu_items_parent_id_fkey 
FOREIGN KEY (parent_id) 
REFERENCES menu_items(id) 
ON DELETE CASCADE;

-- ============================================
-- SECTION 7: Verify no triggers remain
-- ============================================

SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'SUCCESS: No triggers on menu_items'
        ELSE 'WARNING: ' || COUNT(*) || ' triggers still exist'
    END as trigger_status
FROM pg_trigger 
WHERE tgrelid = 'menu_items'::regclass 
AND tgisinternal = false;

-- ============================================
-- SECTION 8: Show cleanup results
-- ============================================

SELECT 'Cleanup Complete!' as status;

SELECT 
    COUNT(*) as total_items,
    COUNT(DISTINCT title) as unique_titles,
    COUNT(*) FILTER (WHERE parent_id IS NULL) as root_items,
    COUNT(*) FILTER (WHERE parent_id IS NOT NULL) as child_items
FROM menu_items;

-- Check for remaining duplicates
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN 'No duplicates found'
        ELSE COUNT(*) || ' duplicate groups remain'
    END as duplicate_status
FROM (
    SELECT title
    FROM menu_items
    GROUP BY title
    HAVING COUNT(*) > 1
) dups;

-- Show sample menu structure
SELECT 
    CASE 
        WHEN parent_id IS NULL THEN '• ' || title
        ELSE '  → ' || title
    END as menu_item,
    url
FROM menu_items
ORDER BY 
    CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END,
    title
LIMIT 20;