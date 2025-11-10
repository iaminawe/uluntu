-- Quick fix for menu constraint issue

-- The error shows that 'Business' is set as a dropdown but has a URL
-- Dropdowns (parent items with children) should not have URLs

-- Fix 1: Remove URLs from parent items that have children
UPDATE menu_items parent
SET url = NULL
WHERE EXISTS (
    SELECT 1 
    FROM menu_items child
    WHERE child.parent_id = parent.id
);

-- Fix 2: If item_type column exists, set it correctly
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'item_type'
    ) THEN
        -- Items with children are dropdowns
        UPDATE menu_items
        SET item_type = 'dropdown'
        WHERE EXISTS (
            SELECT 1 FROM menu_items c
            WHERE c.parent_id = menu_items.id
        );
        
        -- Items with URLs and no children are links
        UPDATE menu_items
        SET item_type = 'link'
        WHERE url IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM menu_items c
            WHERE c.parent_id = menu_items.id
        );
        
        -- Items without URLs and no children are also dropdowns (or could be dividers)
        UPDATE menu_items
        SET item_type = 'dropdown'
        WHERE url IS NULL
        AND NOT EXISTS (
            SELECT 1 FROM menu_items c
            WHERE c.parent_id = menu_items.id
        )
        AND item_type IS NULL;
    END IF;
END $$;

-- Show what we have now
SELECT 
    title,
    url,
    CASE 
        WHEN EXISTS (SELECT 1 FROM menu_items c WHERE c.parent_id = menu_items.id)
        THEN 'Parent (Dropdown)'
        WHEN url IS NOT NULL
        THEN 'Link'
        ELSE 'Other'
    END as menu_type,
    COUNT(c.id) as child_count
FROM menu_items
LEFT JOIN menu_items c ON c.parent_id = menu_items.id
WHERE menu_items.parent_id IS NULL
GROUP BY menu_items.id, menu_items.title, menu_items.url
ORDER BY menu_items.sort_order, menu_items.title;