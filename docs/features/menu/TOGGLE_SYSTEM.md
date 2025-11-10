# Menu Item Toggle System - Usage Guide

## Overview
A comprehensive enable/disable toggle system for menu items with bulk operations, audit trails, and advanced UI features.

## Features Implemented ✅

### 1. MenuItemToggle Component
- **Instant Visual Feedback**: Real-time state changes with loading indicators
- **Optimistic UI Updates**: Immediate state changes with rollback on failure
- **Accessibility Support**: Full keyboard navigation and ARIA labels
- **Error Handling**: Visual error indicators and automatic rollback
- **Undo Functionality**: 10-second undo window with one-click revert

```tsx
import { MenuItemToggle } from '@/features/menu/components';

<MenuItemToggle
  item={menuItem}
  onToggle={handleToggle}
  showLabel={true}
  showVisualIndicator={true}
  confirmCritical={true}
/>
```

### 2. BulkToggleToolbar Component
- **Bulk Selection**: Checkbox selection with "Select All" functionality
- **Smart Filtering**: Select enabled/disabled items automatically
- **Cascade Operations**: Apply changes to child items automatically
- **Confirmation Dialogs**: Critical operation warnings
- **Operation History**: Undo last bulk operation

```tsx
import { BulkToggleToolbar } from '@/features/menu/components';

<BulkToggleToolbar
  items={menuItems}
  selectedItems={selectedItemIds}
  onSelectionChange={setSelectedItemIds}
  onBulkToggle={handleBulkToggle}
  onBulkDelete={handleBulkDelete}
  showCascade={true}
/>
```

### 3. Enhanced API Service
- **Bulk Operations**: Process multiple items efficiently
- **Hierarchy Management**: Handle parent-child relationships
- **Error Recovery**: Detailed error reporting and rollback support
- **Validation**: Menu hierarchy integrity checks

```tsx
import { menuToggleApi } from '@/features/menu/api/menuToggleApi';

// Toggle single item
const success = await menuToggleApi.toggleMenuItem(itemId, enabled);

// Bulk toggle with cascade
const result = await menuToggleApi.bulkToggleMenuItems(itemIds, enabled, cascade);

// Get hierarchy validation
const validation = await menuToggleApi.validateMenuHierarchy();
```

## Key Components

### MenuItemToggle Features
- ✅ Visual state indicators (green/gray dots)
- ✅ Loading states during operations
- ✅ Error handling with red error indicators  
- ✅ Optimistic updates with automatic rollback
- ✅ Undo functionality (10-second window)
- ✅ Confirmation dialogs for critical operations
- ✅ Full keyboard accessibility
- ✅ Toast notifications for all operations

### BulkToggleToolbar Features
- ✅ Selection statistics display
- ✅ Quick selection buttons (All, Enabled, Disabled)
- ✅ Cascade toggle for parent-child relationships
- ✅ Confirmation modals with detailed impact info
- ✅ Operation progress tracking
- ✅ Bulk undo functionality
- ✅ Advanced options panel
- ✅ Error reporting with success/failure counts

### Audit Trail Integration
- ✅ Automatic logging of all toggle actions
- ✅ Bulk operation tracking
- ✅ User context and metadata capture
- ✅ Admin activity dashboard integration

## Usage Examples

### Basic Toggle Implementation
```tsx
const MyMenuManager = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  const handleToggle = async (itemId: string, enabled: boolean): Promise<boolean> => {
    try {
      const success = await menuToggleApi.toggleMenuItem(itemId, enabled);
      if (success) {
        setMenuItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, is_enabled: enabled } : item
        ));
      }
      return success;
    } catch (error) {
      return false;
    }
  };

  return (
    <div>
      {menuItems.map(item => (
        <MenuItemToggle
          key={item.id}
          item={item}
          onToggle={handleToggle}
          showLabel={true}
          confirmCritical={true}
        />
      ))}
    </div>
  );
};
```

### Bulk Operations Implementation
```tsx
const MyBulkMenuManager = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  const handleBulkToggle = async (itemIds: string[], enabled: boolean) => {
    const result = await menuToggleApi.bulkToggleMenuItems(itemIds, enabled, true);
    
    // Update state based on successful operations
    const successfulIds = result.operations
      .filter(op => op.success)
      .map(op => op.id);
      
    setMenuItems(prev => prev.map(item => 
      successfulIds.includes(item.id) 
        ? { ...item, is_enabled: enabled }
        : item
    ));
    
    return result.operations;
  };

  return (
    <BulkToggleToolbar
      items={menuItems}
      selectedItems={selectedItems}
      onSelectionChange={setSelectedItems}
      onBulkToggle={handleBulkToggle}
      showCascade={true}
    />
  );
};
```

## Access Points

### Admin Routes
- **Standard**: `/admin/menu-management` (existing page)
- **Enhanced**: `/admin/menu-management-enhanced` (new enhanced page with all features)

### Component Imports
```tsx
import { 
  MenuItemToggle, 
  MenuItemToggleWithKeyboard,
  BulkToggleToolbar 
} from '@/features/menu/components';

import { 
  menuToggleApi,
  type BulkOperation,
  type BulkToggleResult 
} from '@/features/menu/api/menuToggleApi';
```

## Error Handling

All components include comprehensive error handling:

1. **Network Errors**: Automatic retry suggestions and rollback
2. **Permission Errors**: Clear error messages and admin contact info
3. **Validation Errors**: Detailed field-specific error messages
4. **Bulk Operation Errors**: Partial success reporting with retry options

## Performance Features

- **Optimistic UI**: Instant visual feedback before API confirmation
- **Debounced Operations**: Prevents rapid-fire API calls
- **Batch Processing**: Efficient bulk operations with progress tracking
- **Memory Management**: Automatic cleanup of undo states

## Accessibility Features

- **Keyboard Navigation**: Full tab/enter/space key support
- **Screen Reader Support**: Proper ARIA labels and announcements
- **Focus Management**: Logical focus flow and visible focus indicators
- **High Contrast Support**: Works with system accessibility settings

## Integration Notes

The toggle system integrates seamlessly with:
- ✅ Existing admin activity logging
- ✅ Menu management API
- ✅ Toast notification system
- ✅ Confirmation modal system
- ✅ Drag-and-drop menu reordering
- ✅ Search and filtering functionality

## Future Enhancements

Potential future additions:
- [ ] Scheduled toggle operations
- [ ] Role-based toggle permissions
- [ ] Menu item preview before toggle
- [ ] Export/import toggle configurations
- [ ] Advanced audit reporting dashboard