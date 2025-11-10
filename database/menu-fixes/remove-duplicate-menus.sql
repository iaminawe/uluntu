-- Remove duplicate menu items while preserving hierarchy
-- This script safely removes duplicates and fixes the structure

-- First, let's see what duplicates we have
WITH duplicates AS (
    SELECT 
        title,
        url,
        menu_type,
        COUNT(*) as duplicate_count,
        MIN(created_at) as first_created,
        ARRAY_AGG(id ORDER BY created_at) as all_ids
    FROM public.menu_items
    GROUP BY title, url, menu_type
    HAVING COUNT(*) > 1
)
SELECT * FROM duplicates;

-- Create a temporary table to store parent-child relationships
CREATE TEMP TABLE IF NOT EXISTS menu_hierarchy_backup AS
SELECT 
    child.id as child_id,
    child.title as child_title,
    parent.id as parent_id,
    parent.title as parent_title,
    child.menu_type
FROM menu_items child
LEFT JOIN menu_items parent ON child.parent_id = parent.id
WHERE child.parent_id IS NOT NULL;

-- Remove duplicates, keeping the oldest one (or the one with children)
WITH duplicates_to_delete AS (
    SELECT 
        mi.id,
        mi.title,
        mi.url,
        mi.menu_type,
        mi.created_at,
        ROW_NUMBER() OVER (
            PARTITION BY mi.title, mi.url, mi.menu_type 
            ORDER BY 
                -- Prioritize items that are parents
                CASE WHEN EXISTS (SELECT 1 FROM menu_items child WHERE child.parent_id = mi.id) THEN 0 ELSE 1 END,
                -- Then by creation date
                mi.created_at
        ) as rn
    FROM menu_items mi
)
DELETE FROM menu_items
WHERE id IN (
    SELECT id 
    FROM duplicates_to_delete 
    WHERE rn > 1
);

-- Now let's fix any orphaned children
UPDATE menu_items child
SET parent_id = NULL
WHERE parent_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM menu_items parent 
    WHERE parent.id = child.parent_id
);

-- Update foreign key constraint to CASCADE deletes
ALTER TABLE public.menu_items 
DROP CONSTRAINT IF EXISTS menu_items_parent_id_fkey;

ALTER TABLE public.menu_items
ADD CONSTRAINT menu_items_parent_id_fkey 
FOREIGN KEY (parent_id) 
REFERENCES public.menu_items(id) 
ON DELETE CASCADE;

-- Show the cleaned up structure
SELECT 
    menu_type,
    COUNT(*) as item_count,
    COUNT(DISTINCT parent_id) as parent_count
FROM public.menu_items
GROUP BY menu_type
ORDER BY menu_type;

-- Show main menu hierarchy after cleanup
WITH RECURSIVE menu_tree AS (
    SELECT 
        id, 
        title, 
        url, 
        parent_id, 
        sort_order,
        0 as level,
        CAST(title as VARCHAR(500)) as path
    FROM public.menu_items
    WHERE menu_type = 'main'::menu_type AND parent_id IS NULL
    
    UNION ALL
    
    SELECT 
        mi.id, 
        mi.title, 
        mi.url, 
        mi.parent_id, 
        mi.sort_order,
        mt.level + 1,
        CAST(mt.path || ' > ' || mi.title as VARCHAR(500))
    FROM public.menu_items mi
    JOIN menu_tree mt ON mi.parent_id = mt.id
    WHERE mi.menu_type = 'main'::menu_type
)
SELECT 
    REPEAT('  ', level) || title as menu_structure,
    url,
    sort_order
FROM menu_tree
ORDER BY 
    CASE WHEN level = 0 THEN sort_order ELSE 999 END,
    path;