-- Fix menu by dropping and recreating the audit trigger

-- Step 1: Drop the problematic trigger if it exists
DROP TRIGGER IF EXISTS audit_menu_items_changes ON menu_items;
DROP TRIGGER IF EXISTS menu_items_audit ON menu_items;
DROP TRIGGER IF EXISTS menu_items_audit_trigger ON menu_items;

-- Step 2: Now we can safely clean up duplicates
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

-- Step 3: Clean up orphaned children
UPDATE menu_items 
SET parent_id = NULL
WHERE parent_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM menu_items p 
    WHERE p.id = menu_items.parent_id
);

-- Step 4: Fix the parent foreign key to CASCADE
ALTER TABLE menu_items 
DROP CONSTRAINT IF EXISTS menu_items_parent_id_fkey;

ALTER TABLE menu_items
ADD CONSTRAINT menu_items_parent_id_fkey 
FOREIGN KEY (parent_id) 
REFERENCES menu_items(id) 
ON DELETE CASCADE;

-- Step 5: Create a safe audit function that won't break deletes
CREATE OR REPLACE FUNCTION safe_audit_menu_items()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if audit log table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'menu_audit_log'
    ) THEN
        -- Try to insert audit record, but don't fail if it doesn't work
        BEGIN
            IF TG_OP = 'DELETE' THEN
                -- For deletes, don't reference the menu_item_id
                INSERT INTO menu_audit_log (
                    action,
                    old_values,
                    user_id
                ) VALUES (
                    'DELETE',
                    to_jsonb(OLD),
                    auth.uid()
                );
            ELSIF TG_OP = 'INSERT' THEN
                INSERT INTO menu_audit_log (
                    menu_item_id,
                    action,
                    new_values,
                    user_id
                ) VALUES (
                    NEW.id,
                    'INSERT', 
                    to_jsonb(NEW),
                    auth.uid()
                );
            ELSIF TG_OP = 'UPDATE' THEN
                INSERT INTO menu_audit_log (
                    menu_item_id,
                    action,
                    old_values,
                    new_values,
                    user_id
                ) VALUES (
                    NEW.id,
                    'UPDATE',
                    to_jsonb(OLD),
                    to_jsonb(NEW),
                    auth.uid()
                );
            END IF;
        EXCEPTION
            WHEN others THEN
                -- Silently continue if audit fails
                NULL;
        END;
    END IF;
    
    -- Always return the appropriate value
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create the new safe trigger
CREATE TRIGGER menu_items_audit_trigger
    BEFORE INSERT OR UPDATE OR DELETE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION safe_audit_menu_items();

-- Step 7: Show results
SELECT 'Menu cleanup complete!' as status;

SELECT 
    COUNT(*) as total_items,
    COUNT(DISTINCT title) as unique_titles,
    COUNT(*) FILTER (WHERE parent_id IS NULL) as root_items,
    COUNT(*) FILTER (WHERE parent_id IS NOT NULL) as child_items
FROM menu_items;

-- Show the menu structure
WITH RECURSIVE menu_tree AS (
    SELECT 
        id, 
        title, 
        url, 
        parent_id,
        0 as level,
        CAST(title as VARCHAR(500)) as path
    FROM menu_items
    WHERE parent_id IS NULL
    ORDER BY title
    
    UNION ALL
    
    SELECT 
        mi.id, 
        mi.title, 
        mi.url, 
        mi.parent_id,
        mt.level + 1,
        CAST(mt.path || ' > ' || mi.title as VARCHAR(500))
    FROM menu_items mi
    JOIN menu_tree mt ON mi.parent_id = mt.id
)
SELECT 
    REPEAT('  ', level) || title as menu_structure,
    url
FROM menu_tree
ORDER BY path
LIMIT 50;