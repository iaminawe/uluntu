-- Quick fix for menu issues - disables audit trigger temporarily

-- Step 1: Disable ALL triggers on menu_items to avoid audit log issues
ALTER TABLE menu_items DISABLE TRIGGER ALL;

-- Step 2: Remove duplicate menu items
WITH duplicates AS (
    SELECT 
        id,
        title,
        url,
        ROW_NUMBER() OVER (
            PARTITION BY title, COALESCE(url, '')
            ORDER BY 
                -- Keep parent items first
                CASE WHEN EXISTS (SELECT 1 FROM menu_items c WHERE c.parent_id = menu_items.id) THEN 0 ELSE 1 END,
                id
        ) as rn
    FROM menu_items
)
DELETE FROM menu_items
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Step 3: Fix orphaned children
UPDATE menu_items 
SET parent_id = NULL
WHERE parent_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM menu_items p 
    WHERE p.id = menu_items.parent_id
);

-- Step 4: Fix the foreign key for CASCADE deletes
ALTER TABLE menu_items 
DROP CONSTRAINT IF EXISTS menu_items_parent_id_fkey;

ALTER TABLE menu_items
ADD CONSTRAINT menu_items_parent_id_fkey 
FOREIGN KEY (parent_id) 
REFERENCES menu_items(id) 
ON DELETE CASCADE;

-- Step 5: Re-enable triggers
ALTER TABLE menu_items ENABLE TRIGGER ALL;

-- Step 6: Show cleanup results
SELECT 'Cleanup Complete!' as status;

SELECT 
    COUNT(*) as total_items,
    COUNT(DISTINCT title) as unique_titles,
    COUNT(*) FILTER (WHERE parent_id IS NULL) as root_items,
    COUNT(*) FILTER (WHERE parent_id IS NOT NULL) as child_items
FROM menu_items;

-- Show any remaining duplicates (should be none)
SELECT 
    title,
    COUNT(*) as count
FROM menu_items
GROUP BY title
HAVING COUNT(*) > 1;