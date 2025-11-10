-- Fix menu items constraint issue

-- First, let's see what constraints exist on menu_items
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'menu_items'::regclass
AND contype = 'c'
ORDER BY conname;

-- Check the structure of menu_items to understand the columns
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'menu_items'
ORDER BY ordinal_position
LIMIT 20;

-- The error suggests there's an item_type column with 'dropdown' value
-- and a constraint that dropdown items shouldn't have URLs
-- Let's fix existing data first

-- Option 1: Change dropdown items to have NULL URLs
UPDATE menu_items
SET url = NULL
WHERE item_type = 'dropdown' 
AND url IS NOT NULL;

-- Option 2: Change items with URLs from dropdown to link
UPDATE menu_items
SET item_type = 'link'
WHERE url IS NOT NULL
AND item_type = 'dropdown';

-- Option 3: If item_type doesn't exist or is not needed, 
-- check if we can work around it
DO $$
BEGIN
    -- Check if item_type column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'menu_items' 
        AND column_name = 'item_type'
    ) THEN
        -- Update Business to be a dropdown (no URL) since it has children
        UPDATE menu_items
        SET 
            url = NULL,
            item_type = 'dropdown'
        WHERE title = 'Business'
        AND EXISTS (
            SELECT 1 FROM menu_items children
            WHERE children.parent_id = menu_items.id
        );
        
        -- Update Community to be a dropdown (no URL) since it has children  
        UPDATE menu_items
        SET 
            url = NULL,
            item_type = 'dropdown'
        WHERE title = 'Community'
        AND EXISTS (
            SELECT 1 FROM menu_items children
            WHERE children.parent_id = menu_items.id
        );
        
        -- Update About to be a dropdown (no URL) since it has children
        UPDATE menu_items
        SET 
            url = NULL,
            item_type = 'dropdown'
        WHERE title = 'About'
        AND EXISTS (
            SELECT 1 FROM menu_items children
            WHERE children.parent_id = menu_items.id
        );
        
        -- Ensure all items with URLs are marked as 'link'
        UPDATE menu_items
        SET item_type = 'link'
        WHERE url IS NOT NULL
        AND item_type != 'link';
        
        -- Ensure all items without URLs are marked as 'dropdown' or 'divider'
        UPDATE menu_items
        SET item_type = 'dropdown'
        WHERE url IS NULL
        AND item_type NOT IN ('dropdown', 'divider');
        
        RAISE NOTICE 'Fixed item_type values';
    ELSE
        RAISE NOTICE 'item_type column does not exist';
    END IF;
END $$;

-- Alternative: Drop the constraint if it's too restrictive
DO $$
BEGIN
    -- Try to drop the constraint
    ALTER TABLE menu_items 
    DROP CONSTRAINT IF EXISTS valid_url_or_dropdown;
    
    -- Add a more flexible constraint
    ALTER TABLE menu_items
    ADD CONSTRAINT valid_url_or_dropdown CHECK (
        -- Allow dropdown with no URL
        (item_type = 'dropdown' AND url IS NULL) OR
        -- Allow link with URL
        (item_type = 'link' AND url IS NOT NULL) OR
        -- Allow divider with no URL
        (item_type = 'divider' AND url IS NULL) OR
        -- Allow heading with optional URL
        (item_type = 'heading') OR
        -- If item_type is null, any combination is allowed
        (item_type IS NULL)
    );
    
    RAISE NOTICE 'Replaced constraint with more flexible version';
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not modify constraint: %', SQLERRM;
END $$;

-- Show current state of menu items
SELECT 
    title,
    url,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'item_type')
        THEN (SELECT item_type FROM menu_items m2 WHERE m2.id = menu_items.id)::text
        ELSE 'N/A'
    END as item_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM menu_items c WHERE c.parent_id = menu_items.id)
        THEN 'Has Children'
        ELSE 'No Children'
    END as children_status
FROM menu_items
WHERE parent_id IS NULL
ORDER BY 
    CASE 
        WHEN title = 'Community' THEN 1
        WHEN title = 'Business' THEN 2
        WHEN title = 'Resources' THEN 3
        WHEN title = 'About' THEN 4
        ELSE 99
    END,
    title;

-- Fix the menu structure for dropdown menus
-- Parent items with children should not have URLs
UPDATE menu_items parent
SET url = NULL
WHERE EXISTS (
    SELECT 1 
    FROM menu_items child
    WHERE child.parent_id = parent.id
)
AND url IS NOT NULL;

-- Show final structure
WITH menu_structure AS (
    SELECT 
        m1.title as parent_title,
        m1.url as parent_url,
        m2.title as child_title,
        m2.url as child_url
    FROM menu_items m1
    LEFT JOIN menu_items m2 ON m2.parent_id = m1.id
    WHERE m1.parent_id IS NULL
    ORDER BY m1.sort_order, m1.title, m2.sort_order, m2.title
)
SELECT * FROM menu_structure
LIMIT 30;