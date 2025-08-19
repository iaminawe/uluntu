-- Comprehensive fix for menu management issues
-- 1. Remove duplicates
-- 2. Fix foreign key constraints
-- 3. Clean up orphaned records

-- Step 1: Backup current menu items
CREATE TEMP TABLE menu_items_backup AS 
SELECT * FROM public.menu_items;

-- Step 2: Identify and remove duplicates, keeping the parent items
WITH duplicate_groups AS (
    SELECT 
        title,
        url,
        menu_type,
        MIN(id) as keep_id,
        ARRAY_AGG(id ORDER BY 
            CASE WHEN EXISTS (SELECT 1 FROM menu_items c WHERE c.parent_id = menu_items.id) THEN 0 ELSE 1 END,
            created_at
        ) as all_ids
    FROM public.menu_items
    GROUP BY title, url, menu_type
    HAVING COUNT(*) > 1
),
ids_to_delete AS (
    SELECT unnest(all_ids[2:]) as id
    FROM duplicate_groups
)
DELETE FROM public.menu_items
WHERE id IN (SELECT id FROM ids_to_delete);

-- Step 3: Fix the foreign key constraint to allow CASCADE deletes
ALTER TABLE public.menu_items 
DROP CONSTRAINT IF EXISTS menu_items_parent_id_fkey;

ALTER TABLE public.menu_items
ADD CONSTRAINT menu_items_parent_id_fkey 
FOREIGN KEY (parent_id) 
REFERENCES public.menu_items(id) 
ON DELETE CASCADE;

-- Step 4: Clean up any orphaned child items
UPDATE public.menu_items child
SET parent_id = NULL
WHERE parent_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.menu_items parent 
    WHERE parent.id = child.parent_id
);

-- Step 5: Fix sort_order values to be sequential
WITH numbered_items AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY menu_type, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000')
            ORDER BY sort_order, created_at
        ) - 1 as new_order
    FROM public.menu_items
)
UPDATE public.menu_items mi
SET sort_order = ni.new_order * 100
FROM numbered_items ni
WHERE mi.id = ni.id;

-- Step 6: Ensure all required fields have proper defaults
UPDATE public.menu_items 
SET 
    is_enabled = COALESCE(is_enabled, true),
    visibility = COALESCE(visibility, 'public'::menu_visibility),
    target = COALESCE(target, '_self'::menu_target),
    is_external = COALESCE(is_external, false),
    status = COALESCE(status, 'published'::content_status)
WHERE is_enabled IS NULL 
   OR visibility IS NULL 
   OR target IS NULL 
   OR is_external IS NULL
   OR status IS NULL;

-- Step 7: Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_enabled 
ON public.menu_items(parent_id, is_enabled, sort_order);

CREATE INDEX IF NOT EXISTS idx_menu_items_type_status 
ON public.menu_items(menu_type, status, sort_order);

-- Step 8: Create a function to safely delete menu items with children
CREATE OR REPLACE FUNCTION delete_menu_item_cascade(item_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete the item and all its children (CASCADE will handle this)
    DELETE FROM public.menu_items WHERE id = item_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_menu_item_cascade TO authenticated;

-- Step 9: Verify the cleanup
DO $$
DECLARE
    duplicate_count INTEGER;
    orphan_count INTEGER;
    total_count INTEGER;
BEGIN
    -- Check for remaining duplicates
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT title, url, menu_type, COUNT(*) as cnt
        FROM public.menu_items
        GROUP BY title, url, menu_type
        HAVING COUNT(*) > 1
    ) dups;
    
    -- Check for orphaned items
    SELECT COUNT(*) INTO orphan_count
    FROM public.menu_items child
    WHERE child.parent_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM public.menu_items parent 
        WHERE parent.id = child.parent_id
    );
    
    -- Get total count
    SELECT COUNT(*) INTO total_count FROM public.menu_items;
    
    RAISE NOTICE 'Cleanup complete:';
    RAISE NOTICE '  Total menu items: %', total_count;
    RAISE NOTICE '  Remaining duplicates: %', duplicate_count;
    RAISE NOTICE '  Orphaned items: %', orphan_count;
END $$;

-- Step 10: Show the final menu structure
SELECT 
    menu_type,
    COUNT(*) as item_count,
    COUNT(DISTINCT parent_id) FILTER (WHERE parent_id IS NOT NULL) as child_count,
    COUNT(*) FILTER (WHERE parent_id IS NULL) as root_count
FROM public.menu_items
GROUP BY menu_type
ORDER BY menu_type;

-- Show hierarchical view of main menu
WITH RECURSIVE menu_tree AS (
    SELECT 
        id, 
        title, 
        url, 
        parent_id, 
        sort_order,
        is_enabled,
        0 as level,
        CAST(LPAD(sort_order::text, 5, '0') as VARCHAR(500)) as sort_path,
        CAST(title as VARCHAR(500)) as display_path
    FROM public.menu_items
    WHERE menu_type = 'main'::menu_type AND parent_id IS NULL
    
    UNION ALL
    
    SELECT 
        mi.id, 
        mi.title, 
        mi.url, 
        mi.parent_id, 
        mi.sort_order,
        mi.is_enabled,
        mt.level + 1,
        CAST(mt.sort_path || '.' || LPAD(mi.sort_order::text, 5, '0') as VARCHAR(500)),
        CAST(mt.display_path || ' > ' || mi.title as VARCHAR(500))
    FROM public.menu_items mi
    JOIN menu_tree mt ON mi.parent_id = mt.id
    WHERE mi.menu_type = 'main'::menu_type
)
SELECT 
    REPEAT('  ', level) || title as menu_structure,
    url,
    CASE WHEN is_enabled THEN '✓' ELSE '✗' END as enabled,
    sort_order
FROM menu_tree
ORDER BY sort_path;