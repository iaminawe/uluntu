-- Menu Management Utility Functions
-- Helper functions for common menu operations

-- Function to reorder menu items (for drag-and-drop)
CREATE OR REPLACE FUNCTION reorder_menu_items(
    p_menu_container_id UUID,
    p_parent_id UUID DEFAULT NULL,
    p_item_orders JSONB -- Array of {id, sort_order} objects
)
RETURNS BOOLEAN AS $$
DECLARE
    item_record RECORD;
    old_order INTEGER;
BEGIN
    -- Validate container exists
    IF NOT EXISTS (SELECT 1 FROM menu_containers WHERE id = p_menu_container_id) THEN
        RAISE EXCEPTION 'Menu container not found';
    END IF;
    
    -- Update sort orders for each item
    FOR item_record IN 
        SELECT 
            (item->>'id')::UUID as item_id,
            (item->>'sort_order')::INTEGER as new_order
        FROM jsonb_array_elements(p_item_orders) as item
    LOOP
        -- Get current sort order for audit
        SELECT sort_order INTO old_order 
        FROM menu_items 
        WHERE id = item_record.item_id;
        
        -- Update the sort order
        UPDATE menu_items 
        SET 
            sort_order = item_record.new_order,
            updated_at = NOW(),
            updated_by = auth.uid()
        WHERE id = item_record.item_id
        AND menu_container_id = p_menu_container_id
        AND (parent_id = p_parent_id OR (parent_id IS NULL AND p_parent_id IS NULL));
        
        -- Log the reorder action
        INSERT INTO menu_audit_log (
            menu_item_id,
            menu_container_id,
            action,
            table_name,
            record_id,
            old_values,
            new_values,
            user_id
        ) VALUES (
            item_record.item_id,
            p_menu_container_id,
            'reordered',
            'menu_items',
            item_record.item_id,
            jsonb_build_object('sort_order', old_order),
            jsonb_build_object('sort_order', item_record.new_order),
            auth.uid()
        );
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to move menu item to different parent
CREATE OR REPLACE FUNCTION move_menu_item(
    p_item_id UUID,
    p_new_parent_id UUID DEFAULT NULL,
    p_new_sort_order INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
    old_parent UUID;
    old_sort INTEGER;
    item_container UUID;
    max_depth INTEGER;
    new_depth INTEGER;
BEGIN
    -- Get current item details
    SELECT parent_id, sort_order, menu_container_id, depth_level
    INTO old_parent, old_sort, item_container, new_depth
    FROM menu_items 
    WHERE id = p_item_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Menu item not found';
    END IF;
    
    -- Check max depth constraint
    SELECT max_depth INTO max_depth
    FROM menu_containers 
    WHERE id = item_container;
    
    -- Calculate new depth
    IF p_new_parent_id IS NOT NULL THEN
        SELECT depth_level + 1 INTO new_depth
        FROM menu_items 
        WHERE id = p_new_parent_id;
        
        IF new_depth > max_depth THEN
            RAISE EXCEPTION 'Moving item would exceed maximum depth of %', max_depth;
        END IF;
    ELSE
        new_depth = 0;
    END IF;
    
    -- Validate new parent is in same container
    IF p_new_parent_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM menu_items 
            WHERE id = p_new_parent_id 
            AND menu_container_id = item_container
        ) THEN
            RAISE EXCEPTION 'New parent must be in the same menu container';
        END IF;
    END IF;
    
    -- Update the item
    UPDATE menu_items 
    SET 
        parent_id = p_new_parent_id,
        sort_order = p_new_sort_order,
        updated_at = NOW(),
        updated_by = auth.uid()
    WHERE id = p_item_id;
    
    -- Update all children paths (will be handled by trigger)
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to duplicate menu item (with optional children)
CREATE OR REPLACE FUNCTION duplicate_menu_item(
    p_item_id UUID,
    p_include_children BOOLEAN DEFAULT false,
    p_new_parent_id UUID DEFAULT NULL,
    p_suffix TEXT DEFAULT ' (Copy)'
)
RETURNS UUID AS $$
DECLARE
    new_item_id UUID;
    original_item RECORD;
    child_item RECORD;
    new_child_id UUID;
BEGIN
    -- Get original item
    SELECT * INTO original_item
    FROM menu_items 
    WHERE id = p_item_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Menu item not found';
    END IF;
    
    -- Create new item
    INSERT INTO menu_items (
        menu_container_id,
        parent_id,
        title,
        subtitle,
        description,
        url,
        icon,
        image_url,
        item_type,
        target,
        is_enabled,
        is_visible,
        requires_auth,
        sort_order,
        custom_properties,
        css_classes,
        data_attributes,
        created_by,
        updated_by
    ) VALUES (
        original_item.menu_container_id,
        COALESCE(p_new_parent_id, original_item.parent_id),
        original_item.title || p_suffix,
        original_item.subtitle,
        original_item.description,
        original_item.url,
        original_item.icon,
        original_item.image_url,
        original_item.item_type,
        original_item.target,
        original_item.is_enabled,
        original_item.is_visible,
        original_item.requires_auth,
        (
            SELECT COALESCE(MAX(sort_order), 0) + 1 
            FROM menu_items 
            WHERE parent_id = COALESCE(p_new_parent_id, original_item.parent_id)
            AND menu_container_id = original_item.menu_container_id
        ),
        original_item.custom_properties,
        original_item.css_classes,
        original_item.data_attributes,
        auth.uid(),
        auth.uid()
    ) RETURNING id INTO new_item_id;
    
    -- Copy permissions
    INSERT INTO menu_permissions (menu_item_id, role_name, permission_type, is_allowed, created_by)
    SELECT new_item_id, role_name, permission_type, is_allowed, auth.uid()
    FROM menu_permissions 
    WHERE menu_item_id = p_item_id;
    
    -- Copy translations
    INSERT INTO menu_item_translations (menu_item_id, language_code, title, subtitle, description)
    SELECT new_item_id, language_code, title || p_suffix, subtitle, description
    FROM menu_item_translations 
    WHERE menu_item_id = p_item_id;
    
    -- Recursively copy children if requested
    IF p_include_children THEN
        FOR child_item IN 
            SELECT id FROM menu_items 
            WHERE parent_id = p_item_id
        LOOP
            SELECT duplicate_menu_item(child_item.id, true, new_item_id, '') INTO new_child_id;
        END LOOP;
    END IF;
    
    RETURN new_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get complete menu tree for a container
CREATE OR REPLACE FUNCTION get_menu_tree(
    p_container_name TEXT DEFAULT NULL,
    p_container_type menu_type DEFAULT NULL,
    p_language_code TEXT DEFAULT 'en',
    p_user_role TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    parent_id UUID,
    title TEXT,
    subtitle TEXT,
    description TEXT,
    url TEXT,
    icon TEXT,
    image_url TEXT,
    item_type menu_item_type,
    target TEXT,
    sort_order INTEGER,
    depth_level INTEGER,
    path TEXT,
    custom_properties JSONB,
    css_classes TEXT,
    data_attributes JSONB,
    container_name TEXT,
    container_type menu_type,
    has_permission BOOLEAN,
    children_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE menu_tree AS (
        -- Root level items
        SELECT 
            mi.id,
            mi.parent_id,
            COALESCE(tr.title, mi.title) as title,
            COALESCE(tr.subtitle, mi.subtitle) as subtitle,
            COALESCE(tr.description, mi.description) as description,
            mi.url,
            mi.icon,
            mi.image_url,
            mi.item_type,
            mi.target,
            mi.sort_order,
            mi.depth_level,
            mi.path,
            mi.custom_properties,
            mi.css_classes,
            mi.data_attributes,
            mc.name as container_name,
            mc.type as container_type,
            CASE 
                WHEN mi.requires_auth = false THEN true
                WHEN p_user_role IS NULL THEN false
                ELSE COALESCE(
                    (SELECT mp.is_allowed FROM menu_permissions mp 
                     WHERE mp.menu_item_id = mi.id AND mp.role_name = p_user_role),
                    false
                )
            END as has_permission,
            (SELECT COUNT(*) FROM menu_items children WHERE children.parent_id = mi.id)::INTEGER as children_count
        FROM menu_items mi
        JOIN menu_containers mc ON mi.menu_container_id = mc.id
        LEFT JOIN menu_item_translations tr ON mi.id = tr.menu_item_id AND tr.language_code = p_language_code
        WHERE mi.parent_id IS NULL
        AND mi.is_enabled = true
        AND mi.is_visible = true
        AND mc.is_active = true
        AND (p_container_name IS NULL OR mc.name = p_container_name)
        AND (p_container_type IS NULL OR mc.type = p_container_type)
        
        UNION ALL
        
        -- Child items
        SELECT 
            mi.id,
            mi.parent_id,
            COALESCE(tr.title, mi.title) as title,
            COALESCE(tr.subtitle, mi.subtitle) as subtitle,
            COALESCE(tr.description, mi.description) as description,
            mi.url,
            mi.icon,
            mi.image_url,
            mi.item_type,
            mi.target,
            mi.sort_order,
            mi.depth_level,
            mi.path,
            mi.custom_properties,
            mi.css_classes,
            mi.data_attributes,
            mt.container_name,
            mt.container_type,
            CASE 
                WHEN mi.requires_auth = false THEN true
                WHEN p_user_role IS NULL THEN false
                ELSE COALESCE(
                    (SELECT mp.is_allowed FROM menu_permissions mp 
                     WHERE mp.menu_item_id = mi.id AND mp.role_name = p_user_role),
                    false
                )
            END as has_permission,
            (SELECT COUNT(*) FROM menu_items children WHERE children.parent_id = mi.id)::INTEGER as children_count
        FROM menu_items mi
        JOIN menu_tree mt ON mi.parent_id = mt.id
        LEFT JOIN menu_item_translations tr ON mi.id = tr.menu_item_id AND tr.language_code = p_language_code
        WHERE mi.is_enabled = true
        AND mi.is_visible = true
    )
    SELECT * FROM menu_tree
    ORDER BY container_name, path, sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate menu structure
CREATE OR REPLACE FUNCTION validate_menu_structure(p_container_id UUID)
RETURNS TABLE (
    issue_type TEXT,
    item_id UUID,
    item_title TEXT,
    issue_description TEXT,
    severity TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Check for orphaned items
    SELECT 
        'orphaned_item' as issue_type,
        mi.id as item_id,
        mi.title as item_title,
        'Menu item has parent_id that does not exist' as issue_description,
        'high' as severity
    FROM menu_items mi
    WHERE mi.menu_container_id = p_container_id
    AND mi.parent_id IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM menu_items parent 
        WHERE parent.id = mi.parent_id
    )
    
    UNION ALL
    
    -- Check for circular references
    SELECT 
        'circular_reference' as issue_type,
        mi.id as item_id,
        mi.title as item_title,
        'Menu item creates circular reference in hierarchy' as issue_description,
        'critical' as severity
    FROM menu_items mi
    WHERE mi.menu_container_id = p_container_id
    AND mi.id IN (
        WITH RECURSIVE cycle_check AS (
            SELECT id, parent_id, ARRAY[id] as path
            FROM menu_items 
            WHERE menu_container_id = p_container_id
            
            UNION ALL
            
            SELECT mi.id, mi.parent_id, cc.path || mi.id
            FROM menu_items mi
            JOIN cycle_check cc ON mi.parent_id = cc.id
            WHERE mi.menu_container_id = p_container_id
            AND mi.id != ALL(cc.path)
        )
        SELECT id FROM cycle_check 
        WHERE id = ANY(path[1:array_length(path,1)-1])
    )
    
    UNION ALL
    
    -- Check for items exceeding max depth
    SELECT 
        'max_depth_exceeded' as issue_type,
        mi.id as item_id,
        mi.title as item_title,
        'Menu item exceeds maximum allowed depth for container' as issue_description,
        'medium' as severity
    FROM menu_items mi
    JOIN menu_containers mc ON mi.menu_container_id = mc.id
    WHERE mi.menu_container_id = p_container_id
    AND mi.depth_level > mc.max_depth
    
    UNION ALL
    
    -- Check for duplicate sort orders
    SELECT 
        'duplicate_sort_order' as issue_type,
        mi.id as item_id,
        mi.title as item_title,
        'Multiple items have the same sort order under the same parent' as issue_description,
        'low' as severity
    FROM menu_items mi
    WHERE mi.menu_container_id = p_container_id
    AND EXISTS (
        SELECT 1 FROM menu_items mi2
        WHERE mi2.menu_container_id = mi.menu_container_id
        AND mi2.parent_id = mi.parent_id
        AND mi2.sort_order = mi.sort_order
        AND mi2.id != mi.id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to export menu structure as JSON
CREATE OR REPLACE FUNCTION export_menu_structure(
    p_container_name TEXT,
    p_include_disabled BOOLEAN DEFAULT false
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    WITH RECURSIVE menu_tree AS (
        -- Root items
        SELECT 
            mi.*,
            to_jsonb(mi) as item_json,
            0 as level
        FROM menu_items mi
        JOIN menu_containers mc ON mi.menu_container_id = mc.id
        WHERE mc.name = p_container_name
        AND mi.parent_id IS NULL
        AND (p_include_disabled OR mi.is_enabled = true)
        
        UNION ALL
        
        -- Child items
        SELECT 
            mi.*,
            to_jsonb(mi) as item_json,
            mt.level + 1
        FROM menu_items mi
        JOIN menu_tree mt ON mi.parent_id = mt.id
        WHERE (p_include_disabled OR mi.is_enabled = true)
    ),
    nested_menu AS (
        SELECT 
            item_json || jsonb_build_object(
                'children', 
                COALESCE(
                    (SELECT jsonb_agg(child_json ORDER BY sort_order)
                     FROM nested_menu nm 
                     WHERE nm.parent_id = menu_tree.id),
                    '[]'::jsonb
                )
            ) as item_with_children
        FROM menu_tree
        WHERE level = 0
        ORDER BY sort_order
    )
    SELECT jsonb_build_object(
        'container', p_container_name,
        'exported_at', NOW(),
        'items', COALESCE(jsonb_agg(item_with_children ORDER BY (item_with_children->>'sort_order')::integer), '[]'::jsonb)
    ) INTO result
    FROM nested_menu;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION reorder_menu_items TO authenticated;
GRANT EXECUTE ON FUNCTION move_menu_item TO authenticated;
GRANT EXECUTE ON FUNCTION duplicate_menu_item TO authenticated;
GRANT EXECUTE ON FUNCTION get_menu_tree TO anon, authenticated;
GRANT EXECUTE ON FUNCTION validate_menu_structure TO authenticated;
GRANT EXECUTE ON FUNCTION export_menu_structure TO authenticated;