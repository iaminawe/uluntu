-- Fix the dropdown constraint issue definitively

-- The constraint requires:
-- - dropdown items must have NULL URL
-- - non-dropdown items must have URL (except divider)

-- Step 1: Fix parent items with children (they should be dropdowns with no URL)
UPDATE menu_items
SET 
    url = NULL,
    item_type = 'dropdown'
WHERE EXISTS (
    SELECT 1 
    FROM menu_items child
    WHERE child.parent_id = menu_items.id
);

-- Step 2: Fix leaf items (they should be links with URLs)
UPDATE menu_items
SET item_type = 'link'
WHERE url IS NOT NULL
AND NOT EXISTS (
    SELECT 1 
    FROM menu_items child
    WHERE child.parent_id = menu_items.id
);

-- Step 3: Fix items with no URL and no children
-- These might be intended as section headers or placeholders
UPDATE menu_items
SET item_type = 'divider'
WHERE url IS NULL
AND NOT EXISTS (
    SELECT 1 
    FROM menu_items child
    WHERE child.parent_id = menu_items.id
)
AND item_type NOT IN ('divider', 'dropdown');

-- Step 4: Specifically fix the main navigation items
-- Community - has children, should be dropdown
UPDATE menu_items
SET url = NULL, item_type = 'dropdown'
WHERE title = 'Community' 
AND parent_id IS NULL
AND EXISTS (
    SELECT 1 FROM menu_items WHERE parent_id = menu_items.id
);

-- Business - has children, should be dropdown  
UPDATE menu_items
SET url = NULL, item_type = 'dropdown'
WHERE title = 'Business'
AND parent_id IS NULL
AND EXISTS (
    SELECT 1 FROM menu_items WHERE parent_id = menu_items.id
);

-- About - has children, should be dropdown
UPDATE menu_items
SET url = NULL, item_type = 'dropdown'
WHERE title = 'About'
AND parent_id IS NULL
AND EXISTS (
    SELECT 1 FROM menu_items WHERE parent_id = menu_items.id
);

-- Resources - standalone link
UPDATE menu_items
SET item_type = 'link'
WHERE title = 'Resources'
AND url IS NOT NULL
AND parent_id IS NULL;

-- Topics - standalone link
UPDATE menu_items
SET item_type = 'link'
WHERE title = 'Topics'
AND url IS NOT NULL
AND parent_id IS NULL;

-- Step 5: Verify the fix
SELECT 
    title,
    url,
    item_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM menu_items c WHERE c.parent_id = menu_items.id)
        THEN 'Has Children'
        ELSE 'No Children'
    END as children_status,
    CASE 
        WHEN item_type = 'dropdown' AND url IS NULL THEN '✓ Valid'
        WHEN item_type = 'link' AND url IS NOT NULL THEN '✓ Valid'
        WHEN item_type = 'divider' THEN '✓ Valid'
        ELSE '✗ Invalid'
    END as constraint_status
FROM menu_items
WHERE parent_id IS NULL
ORDER BY sort_order, title;

-- Step 6: Show the menu hierarchy
WITH RECURSIVE menu_tree AS (
    SELECT 
        id, 
        title, 
        url,
        item_type,
        parent_id,
        0 as level,
        CAST(title as VARCHAR(500)) as path
    FROM menu_items
    WHERE parent_id IS NULL
    
    UNION ALL
    
    SELECT 
        mi.id, 
        mi.title, 
        mi.url,
        mi.item_type,
        mi.parent_id,
        mt.level + 1,
        CAST(mt.path || ' > ' || mi.title as VARCHAR(500))
    FROM menu_items mi
    JOIN menu_tree mt ON mi.parent_id = mt.id
)
SELECT 
    REPEAT('  ', level) || 
    CASE 
        WHEN item_type = 'dropdown' THEN '▼ '
        WHEN item_type = 'link' THEN '→ '
        WHEN item_type = 'divider' THEN '─ '
        ELSE '• '
    END || title as menu_item,
    COALESCE(url, '(dropdown)') as url,
    item_type
FROM menu_tree
ORDER BY path
LIMIT 50;