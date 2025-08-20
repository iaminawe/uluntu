-- Final cleanup to consolidate similar menu items

-- Show current duplicates with different URLs
SELECT 
    title,
    COUNT(*) as count,
    STRING_AGG(DISTINCT COALESCE(url, 'NULL'), ', ') as urls,
    STRING_AGG(id::text, ', ') as ids
FROM menu_items
WHERE parent_id IS NULL
GROUP BY title
HAVING COUNT(*) > 1
ORDER BY title;

-- Remove entries with NULL URLs when a proper URL exists
DELETE FROM menu_items
WHERE id IN (
    SELECT m1.id
    FROM menu_items m1
    WHERE m1.url IS NULL
    AND EXISTS (
        SELECT 1 
        FROM menu_items m2 
        WHERE m2.title = m1.title 
        AND m2.url IS NOT NULL
        AND m2.parent_id IS NULL
    )
    AND m1.parent_id IS NULL
);

-- For "About" entries, keep the one with /about URL
DELETE FROM menu_items
WHERE title = 'About' 
AND parent_id IS NULL
AND url != '/about';

-- For "About Uluntu", keep the one with /about-uluntu URL
DELETE FROM menu_items
WHERE title = 'About Uluntu'
AND parent_id IS NULL
AND url != '/about-uluntu';

-- For "About Us", keep the one with /about URL
DELETE FROM menu_items
WHERE title = 'About Us'
AND parent_id IS NULL
AND url != '/about';

-- For "Community", keep the one with /community URL
DELETE FROM menu_items
WHERE title = 'Community'
AND parent_id IS NULL
AND (url IS NULL OR url != '/community');

-- For "Business", keep the one with proper URL or create one
UPDATE menu_items
SET url = '/business'
WHERE title = 'Business'
AND parent_id IS NULL
AND url IS NULL;

-- Clean up any remaining duplicates by keeping the first one
WITH duplicates AS (
    SELECT 
        id,
        title,
        ROW_NUMBER() OVER (
            PARTITION BY title, parent_id
            ORDER BY 
                CASE WHEN url IS NOT NULL THEN 0 ELSE 1 END,
                id
        ) as rn
    FROM menu_items
)
DELETE FROM menu_items
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Update sort_order to be sequential
WITH numbered AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY COALESCE(parent_id, '00000000-0000-0000-0000-000000000000')
            ORDER BY 
                CASE title
                    WHEN 'Community' THEN 1
                    WHEN 'Business' THEN 2
                    WHEN 'Resources' THEN 3
                    WHEN 'Topics' THEN 4
                    WHEN 'About' THEN 5
                    WHEN 'Events' THEN 10
                    WHEN 'Directory' THEN 11
                    WHEN 'Groups' THEN 12
                    WHEN 'Companies' THEN 13
                    WHEN 'Opportunities' THEN 14
                    WHEN 'News' THEN 15
                    WHEN 'Galleries' THEN 16
                    WHEN 'Contact' THEN 90
                    WHEN 'Privacy' THEN 91
                    WHEN 'Terms' THEN 92
                    ELSE 50
                END,
                title
        ) - 1 as new_order
    FROM menu_items
)
UPDATE menu_items m
SET sort_order = n.new_order * 100
FROM numbered n
WHERE m.id = n.id;

-- Show final results
SELECT 'Final Cleanup Complete!' as status;

-- Show statistics
SELECT 
    COUNT(*) as total_items,
    COUNT(DISTINCT title) as unique_titles,
    COUNT(*) FILTER (WHERE parent_id IS NULL) as root_items,
    COUNT(*) FILTER (WHERE parent_id IS NOT NULL) as child_items
FROM menu_items;

-- Show root menu items with proper ordering
SELECT 
    title,
    url,
    sort_order
FROM menu_items
WHERE parent_id IS NULL
ORDER BY sort_order, title;

-- Show menu hierarchy
WITH RECURSIVE menu_tree AS (
    SELECT 
        id, 
        title, 
        url, 
        parent_id,
        sort_order,
        0 as level,
        CAST(LPAD(sort_order::text, 5, '0') || '-' || title as VARCHAR(500)) as path
    FROM menu_items
    WHERE parent_id IS NULL
    
    UNION ALL
    
    SELECT 
        mi.id, 
        mi.title, 
        mi.url, 
        mi.parent_id,
        mi.sort_order,
        mt.level + 1,
        CAST(mt.path || ' > ' || mi.title as VARCHAR(500))
    FROM menu_items mi
    JOIN menu_tree mt ON mi.parent_id = mt.id
)
SELECT 
    REPEAT('  ', level) || title as menu_structure,
    url,
    sort_order
FROM menu_tree
ORDER BY path
LIMIT 50;