# Dynamic Menu Management System Documentation

## Overview

This comprehensive menu management system provides a flexible, hierarchical structure for managing navigation menus with advanced features including drag-and-drop reordering, permissions, audit trails, and internationalization support.

## Architecture

### Database Schema

The system consists of 5 main tables:

1. **menu_containers** - Defines different menu types (main, footer, sidebar, etc.)
2. **menu_items** - Hierarchical menu items with self-referencing relationships
3. **menu_permissions** - Role-based access control for menu visibility
4. **menu_audit_log** - Complete audit trail for all menu changes
5. **menu_item_translations** - Internationalization support

### Key Features

- ✅ Hierarchical menu structure (unlimited depth with configurable limits)
- ✅ Drag-and-drop reordering with materialized paths
- ✅ Role-based permissions system
- ✅ Complete audit trail with change tracking
- ✅ Internationalization support
- ✅ Menu validation and integrity checks
- ✅ Bulk operations support
- ✅ Export/import functionality
- ✅ Real-time updates with optimistic UI
- ✅ Comprehensive TypeScript types
- ✅ React hooks with caching

## Database Tables

### menu_containers
Contains definitions for different menu types and their configuration.

```sql
CREATE TABLE menu_containers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type menu_type NOT NULL, -- 'main', 'footer', 'sidebar', 'mobile', 'admin'
    title VARCHAR(200),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    max_depth INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
```

### menu_items
Hierarchical structure for menu items with efficient querying support.

```sql
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_container_id UUID NOT NULL REFERENCES menu_containers(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    
    -- Content
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(300),
    description TEXT,
    url VARCHAR(1000),
    icon VARCHAR(100),
    image_url VARCHAR(1000),
    
    -- Behavior
    item_type menu_item_type DEFAULT 'link', -- 'link', 'dropdown', 'divider', 'button', 'custom'
    target VARCHAR(20) DEFAULT '_self',
    is_enabled BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    requires_auth BOOLEAN DEFAULT false,
    
    -- Hierarchy
    sort_order INTEGER DEFAULT 0,
    depth_level INTEGER DEFAULT 0,
    path TEXT, -- Materialized path for efficient queries
    
    -- Extensibility
    custom_properties JSONB DEFAULT '{}',
    css_classes VARCHAR(500),
    data_attributes JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
```

## API Usage

### TypeScript Types

All types are available from `/src/types/menu.ts`:

```typescript
import type {
  MenuContainer,
  MenuItem,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  MenuTreeNode
} from '../types/menu';
```

### API Service

Use the menu API service for backend operations:

```typescript
import { menuApi } from '../api/menuApi';

// Get menu tree
const menuTree = await menuApi.getMenuTree({
  container_name: 'main-navigation',
  language_code: 'en',
  user_role: 'authenticated'
});

// Create menu item
const newItem = await menuApi.createMenuItem({
  menu_container_id: 'container-uuid',
  title: 'New Menu Item',
  url: '/new-page',
  item_type: 'link'
});

// Reorder items
await menuApi.reorderMenuItems({
  menu_container_id: 'container-uuid',
  parent_id: null,
  item_orders: [
    { id: 'item-1', sort_order: 0 },
    { id: 'item-2', sort_order: 1 }
  ]
});
```

### React Hooks

Use the provided hooks for state management:

```typescript
import {
  useMenuTree,
  useMenuItem,
  useMenuPermissions,
  useMenuSearch
} from '../hooks/useMenu';

// Menu tree with drag-and-drop
function MenuManager() {
  const {
    menuTree,
    isLoading,
    reorderItems,
    moveItem,
    duplicateItem
  } = useMenuTree({
    container_name: 'main-navigation'
  });

  const handleReorder = (request: ReorderMenuItemsRequest) => {
    reorderItems(request);
  };

  return (
    <div>
      {menuTree.map(item => (
        <MenuTreeItem key={item.id} item={item} />
      ))}
    </div>
  );
}

// Individual item management
function MenuItemEditor({ itemId }: { itemId?: string }) {
  const { item, save, remove, toggle } = useMenuItem(itemId);
  
  const handleSave = (data: CreateMenuItemRequest) => {
    save(data);
  };

  return (
    <form onSubmit={handleSave}>
      {/* Form fields */}
    </form>
  );
}
```

## Stored Procedures

### reorder_menu_items()
Efficiently reorders multiple menu items in a single transaction:

```sql
SELECT reorder_menu_items(
    'container-uuid'::uuid,
    null, -- parent_id
    '[{"id": "item-1", "sort_order": 0}, {"id": "item-2", "sort_order": 1}]'::jsonb
);
```

### move_menu_item()
Moves a menu item to a different parent:

```sql
SELECT move_menu_item(
    'item-uuid'::uuid,
    'new-parent-uuid'::uuid,
    0 -- new sort order
);
```

### duplicate_menu_item()
Duplicates a menu item with optional children:

```sql
SELECT duplicate_menu_item(
    'item-uuid'::uuid,
    true, -- include children
    'new-parent-uuid'::uuid,
    ' (Copy)' -- suffix
);
```

### get_menu_tree()
Retrieves complete menu tree with permissions:

```sql
SELECT * FROM get_menu_tree(
    'main-navigation', -- container name
    null, -- container type
    'en', -- language
    'authenticated' -- user role
);
```

### validate_menu_structure()
Validates menu integrity and reports issues:

```sql
SELECT * FROM validate_menu_structure('container-uuid'::uuid);
```

## Permissions System

### Role-Based Access Control

Menu items can have role-based visibility controls:

```typescript
// Set permissions for a menu item
await menuApi.saveMenuPermissions('item-uuid', [
  {
    menu_item_id: 'item-uuid',
    role_name: 'admin',
    permission_type: 'view',
    is_allowed: true
  },
  {
    menu_item_id: 'item-uuid',
    role_name: 'user',
    permission_type: 'view',
    is_allowed: false
  }
]);

// Check permissions
const { checkPermission } = useMenuPermissions('item-uuid');
const canView = checkPermission(['admin', 'user']);
```

### Row Level Security (RLS)

The database enforces permissions through RLS policies:

- Public users can only view enabled and visible items
- Authenticated users can view items they have permissions for
- Admins and menu editors can manage all items
- Audit logs are restricted to item owners and admins

## Audit Trail

All menu changes are automatically logged:

```typescript
// View audit logs
const { data: auditLogs } = useMenuAuditLogs('item-uuid');

// Log entry structure
interface MenuAuditLog {
  id: string;
  action: 'created' | 'updated' | 'deleted' | 'reordered' | 'enabled' | 'disabled';
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  changed_fields: string[];
  user_id: string;
  created_at: string;
}
```

## Internationalization

Support for multiple languages:

```typescript
// Add translation
await menuApi.saveMenuItemTranslation({
  menu_item_id: 'item-uuid',
  language_code: 'es',
  title: 'Título en español',
  subtitle: 'Subtítulo',
  description: 'Descripción'
});

// Get menu tree in specific language
const spanishMenu = await menuApi.getMenuTree({
  container_name: 'main-navigation',
  language_code: 'es'
});
```

## Drag-and-Drop Implementation

### Frontend Integration

```typescript
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function DraggableMenuTree() {
  const { menuTree, reorderItems } = useMenuTree({
    container_name: 'main-navigation'
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // Build reorder request
    const request: ReorderMenuItemsRequest = {
      menu_container_id: 'container-uuid',
      parent_id: destination.droppableId === 'root' ? null : destination.droppableId,
      item_orders: calculateNewOrder(menuTree, source, destination)
    };

    reorderItems(request);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="root">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {menuTree.map((item, index) => (
              <DraggableMenuItem key={item.id} item={item} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
```

## Performance Optimization

### Database Indexes

Comprehensive indexing for optimal performance:

```sql
-- Hierarchy queries
CREATE INDEX idx_menu_items_container ON menu_items(menu_container_id);
CREATE INDEX idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX idx_menu_items_path ON menu_items(path);

-- Sorting and filtering
CREATE INDEX idx_menu_items_sort_order ON menu_items(menu_container_id, parent_id, sort_order);
CREATE INDEX idx_menu_items_enabled_visible ON menu_items(is_enabled, is_visible);

-- Permissions
CREATE INDEX idx_menu_permissions_item ON menu_permissions(menu_item_id);
CREATE INDEX idx_menu_permissions_role ON menu_permissions(role_name);
```

### Materialized Paths

Efficient hierarchy queries using materialized paths:
- Path format: "1.2.3" represents depth and position
- Single query retrieval of entire subtrees
- Fast ancestor/descendant checks

### React Query Caching

Intelligent caching strategy:
- 5-minute cache for static data (containers, items)
- 2-minute cache for dynamic data (menu trees)
- 1-minute cache for real-time data (audit logs)
- Optimistic updates for immediate UI feedback

## Migration and Setup

### 1. Run Database Migrations

```bash
# Apply the menu system migrations
supabase db push

# Or manually run the SQL files
psql -f supabase/migrations/20250819000003_create_menu_management_system.sql
psql -f supabase/migrations/20250819000004_menu_utility_functions.sql
```

### 2. Install Dependencies

```bash
npm install @tanstack/react-query react-beautiful-dnd react-hot-toast
npm install --save-dev @types/react-beautiful-dnd
```

### 3. Setup React Query

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YourApp />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
```

## Examples

### Basic Menu Display

```tsx
import { useMenuTree } from '../hooks/useMenu';

function MainNavigation() {
  const { menuTree, isLoading } = useMenuTree({
    container_name: 'main-navigation',
    user_role: 'authenticated'
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <nav>
      <ul>
        {menuTree.map(item => (
          <MenuTreeItem key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  );
}

function MenuTreeItem({ item }: { item: MenuTreeNode }) {
  return (
    <li>
      <a href={item.url} target={item.target}>
        {item.icon && <span className={item.icon} />}
        {item.title}
        {item.subtitle && <span className="subtitle">{item.subtitle}</span>}
      </a>
      {item.children.length > 0 && (
        <ul>
          {item.children.map(child => (
            <MenuTreeItem key={child.id} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
}
```

### Admin Menu Manager

```tsx
import { useMenuTree, useMenuItem, useBulkMenuOperations } from '../hooks/useMenu';

function MenuAdminPanel() {
  const { menuTree, reorderItems } = useMenuTree({
    container_name: 'main-navigation'
  });
  const { bulkDelete, bulkUpdate } = useBulkMenuOperations();

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    switch (action) {
      case 'delete':
        bulkDelete(selectedIds);
        break;
      case 'enable':
        bulkUpdate(selectedIds.map(id => ({
          id,
          changes: { is_enabled: true }
        })));
        break;
      case 'disable':
        bulkUpdate(selectedIds.map(id => ({
          id,
          changes: { is_enabled: false }
        })));
        break;
    }
  };

  return (
    <div className="menu-admin-panel">
      <MenuTreeEditor menuTree={menuTree} onReorder={reorderItems} />
      <BulkActionToolbar onAction={handleBulkAction} />
    </div>
  );
}
```

## Best Practices

1. **Always use transactions** for multi-step operations
2. **Validate hierarchy depth** to prevent infinite nesting
3. **Cache menu trees** aggressively since they change infrequently
4. **Use materialized paths** for efficient hierarchy queries
5. **Implement optimistic updates** for better user experience
6. **Log all changes** for audit compliance
7. **Test permissions thoroughly** to prevent unauthorized access
8. **Use bulk operations** for performance when updating multiple items

## Troubleshooting

### Common Issues

1. **Circular References**: Use the validation function to detect and fix
2. **Orphaned Items**: Automatically detected by validation system
3. **Permission Errors**: Check RLS policies and user roles
4. **Performance Issues**: Review indexes and query patterns

### Debugging Queries

```sql
-- Find problematic menu structures
SELECT * FROM validate_menu_structure('container-uuid');

-- Check permissions for a user
SELECT mi.title, mp.role_name, mp.is_allowed
FROM menu_items mi
LEFT JOIN menu_permissions mp ON mi.id = mp.menu_item_id
WHERE mi.menu_container_id = 'container-uuid';

-- Analyze menu performance
EXPLAIN ANALYZE SELECT * FROM get_menu_tree('main-navigation');
```

## API Reference

### Menu API Methods

- `getMenuContainers()` - Get all menu containers
- `getMenuTree(request)` - Get hierarchical menu structure
- `createMenuItem(item)` - Create new menu item
- `updateMenuItem(item)` - Update existing menu item
- `deleteMenuItem(id)` - Delete menu item
- `reorderMenuItems(request)` - Reorder items via drag-and-drop
- `moveMenuItem(request)` - Move item to different parent
- `duplicateMenuItem(request)` - Duplicate item with optional children
- `validateMenuStructure(containerId)` - Validate menu integrity
- `exportMenuStructure(containerName)` - Export menu as JSON

### React Hooks

- `useMenuContainers()` - Container management
- `useMenuTree(request)` - Tree structure with drag-and-drop
- `useMenuItem(id)` - Individual item management
- `useMenuPermissions(itemId)` - Permission management
- `useMenuAuditLogs(itemId)` - Audit trail viewing
- `useMenuItemTranslations(itemId)` - Translation management
- `useMenuStats(containerId)` - Statistics and analytics
- `useMenuSearch()` - Search functionality
- `useBulkMenuOperations()` - Bulk operations
- `useMenuExport()` - Export functionality

This comprehensive menu management system provides a robust foundation for dynamic navigation with enterprise-grade features including permissions, audit trails, and internationalization support.