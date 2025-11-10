-- Simple script to remove duplicate menu items
-- Works regardless of table structure

-- Step 1: Show current duplicates
SELECT 
    title,
    url,
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as all_ids
FROM public.menu_items
GROUP BY title, url
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: Remove duplicates, keeping the first one (by creation date or ID)
WITH duplicates AS (
    SELECT 
        id,
        title,
        url,
        ROW_NUMBER() OVER (
            PARTITION BY title, COALESCE(url, '')
            ORDER BY 
                -- Keep items that are parents first
                CASE WHEN EXISTS (SELECT 1 FROM menu_items c WHERE c.parent_id = menu_items.id) THEN 0 ELSE 1 END,
                -- Then keep the oldest one
                id
        ) as rn
    FROM menu_items
)
DELETE FROM menu_items
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Step 3: Fix orphaned children (set parent_id to NULL if parent doesn't exist)
UPDATE public.menu_items child
SET parent_id = NULL
WHERE parent_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.menu_items parent 
    WHERE parent.id = child.parent_id
);

-- Step 4: Update foreign key to CASCADE (this will make deletes easier)
BEGIN;
    -- Drop existing constraint
    ALTER TABLE public.menu_items 
    DROP CONSTRAINT IF EXISTS menu_items_parent_id_fkey;
    
    -- Add new constraint with CASCADE
    ALTER TABLE public.menu_items
    ADD CONSTRAINT menu_items_parent_id_fkey 
    FOREIGN KEY (parent_id) 
    REFERENCES public.menu_items(id) 
    ON DELETE CASCADE;
COMMIT;

-- Step 5: Show results
SELECT 
    'Total Items' as metric,
    COUNT(*)::text as value
FROM public.menu_items
UNION ALL
SELECT 
    'Root Items (no parent)',
    COUNT(*)::text
FROM public.menu_items
WHERE parent_id IS NULL
UNION ALL
SELECT 
    'Child Items',
    COUNT(*)::text
FROM public.menu_items
WHERE parent_id IS NOT NULL
UNION ALL
SELECT 
    'Remaining Duplicates',
    COUNT(*)::text
FROM (
    SELECT title, url
    FROM public.menu_items
    GROUP BY title, url
    HAVING COUNT(*) > 1
) dups;

-- Step 6: Show menu hierarchy (if you want to see the structure)
WITH RECURSIVE menu_tree AS (
    SELECT 
        id, 
        title, 
        url, 
        parent_id,
        0 as level,
        CAST(title as VARCHAR(500)) as path
    FROM public.menu_items
    WHERE parent_id IS NULL
    
    UNION ALL
    
    SELECT 
        mi.id, 
        mi.title, 
        mi.url, 
        mi.parent_id,
        mt.level + 1,
        CAST(mt.path || ' > ' || mi.title as VARCHAR(500))
    FROM public.menu_items mi
    JOIN menu_tree mt ON mi.parent_id = mt.id
)
SELECT 
    REPEAT('  ', level) || title as menu_structure,
    url
FROM menu_tree
ORDER BY path
LIMIT 50;