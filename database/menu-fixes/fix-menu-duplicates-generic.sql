-- Generic script to fix menu duplicates that works with any table structure
-- This script adapts to whatever columns exist in your menu_items table

-- First, let's see what columns we have
DO $$
DECLARE
    has_menu_type BOOLEAN;
    has_position_id BOOLEAN;
    has_menu_container_id BOOLEAN;
    grouping_column TEXT;
BEGIN
    -- Check which columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'menu_type'
    ) INTO has_menu_type;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'position_id'
    ) INTO has_position_id;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'menu_container_id'
    ) INTO has_menu_container_id;
    
    -- Determine which column to use for grouping
    IF has_menu_type THEN
        grouping_column := 'menu_type';
    ELSIF has_position_id THEN
        grouping_column := 'position_id';
    ELSIF has_menu_container_id THEN
        grouping_column := 'menu_container_id';
    ELSE
        grouping_column := 'NULL';
    END IF;
    
    RAISE NOTICE 'Using grouping column: %', grouping_column;
END $$;

-- Remove duplicates based on title and url
WITH duplicates AS (
    SELECT 
        id,
        title,
        url,
        ROW_NUMBER() OVER (
            PARTITION BY title, url
            ORDER BY 
                -- Keep items that are parents first
                CASE WHEN EXISTS (SELECT 1 FROM menu_items c WHERE c.parent_id = menu_items.id) THEN 0 ELSE 1 END,
                -- Then by creation date if available
                CASE WHEN created_at IS NOT NULL THEN created_at ELSE NOW() END
        ) as rn
    FROM menu_items
)
DELETE FROM menu_items
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Fix the foreign key constraint to allow CASCADE deletes
DO $$
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE public.menu_items 
    DROP CONSTRAINT IF EXISTS menu_items_parent_id_fkey;
    
    -- Add new constraint with CASCADE
    ALTER TABLE public.menu_items
    ADD CONSTRAINT menu_items_parent_id_fkey 
    FOREIGN KEY (parent_id) 
    REFERENCES public.menu_items(id) 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Foreign key constraint updated to CASCADE deletes';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not update foreign key: %', SQLERRM;
END $$;

-- Clean up any orphaned child items
UPDATE public.menu_items child
SET parent_id = NULL
WHERE parent_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.menu_items parent 
    WHERE parent.id = child.parent_id
);

-- Fix sort_order values to be sequential
DO $$
BEGIN
    -- Check if sort_order column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'sort_order'
    ) THEN
        WITH numbered_items AS (
            SELECT 
                id,
                ROW_NUMBER() OVER (
                    PARTITION BY COALESCE(parent_id, '00000000-0000-0000-0000-000000000000')
                    ORDER BY sort_order, created_at
                ) - 1 as new_order
            FROM public.menu_items
        )
        UPDATE public.menu_items mi
        SET sort_order = ni.new_order * 100
        FROM numbered_items ni
        WHERE mi.id = ni.id;
        
        RAISE NOTICE 'Sort orders updated';
    ELSE
        RAISE NOTICE 'No sort_order column found';
    END IF;
END $$;

-- Create a function to safely delete menu items with children
CREATE OR REPLACE FUNCTION delete_menu_item_cascade(item_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete the item and all its children (CASCADE will handle this)
    DELETE FROM public.menu_items WHERE id = item_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count > 0;
EXCEPTION
    WHEN foreign_key_violation THEN
        -- If CASCADE is not working, manually delete children first
        DELETE FROM public.menu_items WHERE parent_id = item_id;
        DELETE FROM public.menu_items WHERE id = item_id;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RETURN deleted_count > 0;
    WHEN others THEN
        RAISE NOTICE 'Error deleting menu item: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION delete_menu_item_cascade TO authenticated;

-- Report on the cleanup results
DO $$
DECLARE
    total_count INTEGER;
    orphan_count INTEGER;
    duplicate_count INTEGER;
    columns_list TEXT;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO total_count FROM public.menu_items;
    
    -- Check for orphaned items
    SELECT COUNT(*) INTO orphan_count
    FROM public.menu_items child
    WHERE child.parent_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM public.menu_items parent 
        WHERE parent.id = child.parent_id
    );
    
    -- Check for remaining duplicates
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT title, url, COUNT(*) as cnt
        FROM public.menu_items
        GROUP BY title, url
        HAVING COUNT(*) > 1
    ) dups;
    
    -- Get list of columns
    SELECT string_agg(column_name, ', ' ORDER BY ordinal_position) INTO columns_list
    FROM information_schema.columns
    WHERE table_name = 'menu_items'
    AND table_schema = 'public';
    
    RAISE NOTICE '=== Menu Items Cleanup Report ===';
    RAISE NOTICE 'Total menu items: %', total_count;
    RAISE NOTICE 'Orphaned items: %', orphan_count;
    RAISE NOTICE 'Remaining duplicates: %', duplicate_count;
    RAISE NOTICE 'Table columns: %', columns_list;
END $$;

-- Show sample of menu items
SELECT 
    id,
    title,
    url,
    parent_id,
    CASE 
        WHEN EXISTS (SELECT 1 FROM menu_items c WHERE c.parent_id = menu_items.id) 
        THEN 'Parent' 
        ELSE 'Leaf' 
    END as item_type
FROM public.menu_items
LIMIT 10;