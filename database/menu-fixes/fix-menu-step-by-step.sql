-- Fix menu issues - Run each section separately if needed

-- ============================================
-- SECTION 1: Drop problematic triggers
-- ============================================
DROP TRIGGER IF EXISTS audit_menu_items_changes ON menu_items;
DROP TRIGGER IF EXISTS menu_items_audit ON menu_items;
DROP TRIGGER IF EXISTS menu_items_audit_trigger ON menu_items;

-- ============================================
-- SECTION 2: Remove duplicate menu items
-- ============================================
DELETE FROM menu_items
WHERE id IN (
    SELECT id
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                PARTITION BY title, COALESCE(url, '')
                ORDER BY id
            ) as rn
        FROM menu_items
    ) t
    WHERE rn > 1
);

-- ============================================
-- SECTION 3: Fix orphaned children
-- ============================================
UPDATE menu_items 
SET parent_id = NULL
WHERE parent_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM menu_items p 
    WHERE p.id = menu_items.parent_id
);

-- ============================================
-- SECTION 4: Show current state
-- ============================================
SELECT 
    COUNT(*) as total_items,
    COUNT(DISTINCT title) as unique_titles,
    COUNT(*) FILTER (WHERE parent_id IS NULL) as root_items,
    COUNT(*) FILTER (WHERE parent_id IS NOT NULL) as child_items
FROM menu_items;

-- ============================================
-- SECTION 5: Check for remaining duplicates
-- ============================================
SELECT 
    title,
    COUNT(*) as count
FROM menu_items
GROUP BY title
HAVING COUNT(*) > 1;

-- ============================================
-- SECTION 6: Show menu structure (top 20 items)
-- ============================================
SELECT 
    CASE 
        WHEN parent_id IS NULL THEN title
        ELSE '  → ' || title
    END as menu_item,
    url,
    id
FROM menu_items
ORDER BY 
    CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END,
    title
LIMIT 20;