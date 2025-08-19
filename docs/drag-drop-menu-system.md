# Comprehensive Drag-and-Drop Menu System

## Overview

A feature-rich drag-and-drop menu management system built with React Beautiful DND, providing comprehensive functionality for managing hierarchical menu structures with accessibility, touch support, and advanced user experience features.

## Core Features

### 1. **Drag and Drop Functionality**
- **Visual Feedback**: Real-time drag preview with rotation and scaling effects
- **Drop Zone Indicators**: Clear visual indicators for valid/invalid drop targets
- **Nested Dragging**: Support for multi-level menu hierarchies
- **Smooth Animations**: 200ms transition duration for all interactions

### 2. **Accessibility Support**
- **Keyboard Navigation**: Full keyboard support with Ctrl+Arrow keys
- **Screen Reader Support**: ARIA attributes and live announcements
- **Focus Management**: Proper focus handling and visual indicators
- **Semantic HTML**: Proper role attributes and accessible markup

### 3. **Touch Device Support**
- **Long Press**: Long press to initiate drag on mobile devices
- **Touch Gestures**: Swipe left/right for quick actions
- **Haptic Feedback**: Vibration feedback on supported devices
- **Touch-Optimized**: Larger touch targets and gesture recognition

### 4. **Auto-Save & Error Handling**
- **Optimistic Updates**: Immediate UI updates with server sync
- **Debounced Auto-Save**: 1-second debounce to prevent excessive API calls
- **Error Rollback**: Automatic rollback on server errors
- **Loading States**: Visual feedback during save operations

### 5. **Visual Design & UX**
- **Material Design Inspired**: Clean, modern interface
- **Status Indicators**: Clear enabled/disabled states
- **Hover Effects**: Interactive feedback on all elements
- **Responsive Design**: Works on all screen sizes

## Component Architecture

### Core Components

#### `DragDropMenuTree`
Main component providing the complete drag-and-drop interface.

```tsx
<DragDropMenuTree
  items={menuItems}
  onItemsChange={handleChange}
  onItemEdit={handleEdit}
  onItemDelete={handleDelete}
  onItemAdd={handleAdd}
  menuType="main"
  autoSave={true}
  showActions={true}
  allowNesting={true}
  maxDepth={3}
/>
```

#### `AccessibleDragHandle`
Specialized drag handle with keyboard accessibility.

```tsx
<AccessibleDragHandle
  itemTitle="Home"
  position={1}
  totalItems={5}
  level={0}
  canMoveUp={true}
  canMoveDown={true}
  canNest={false}
  dragHandleProps={provided.dragHandleProps}
/>
```

#### `TouchGestures`
Touch gesture wrapper for mobile interactions.

```tsx
<TouchGestures
  onLongPress={() => startDrag()}
  onSwipeLeft={() => deleteItem()}
  onSwipeRight={() => editItem()}
>
  {children}
</TouchGestures>
```

#### `MenuItemIcon`
Icon component with fallback handling.

```tsx
<MenuItemIcon 
  icon="Users" 
  size="md" 
  className="text-gray-600" 
/>
```

### Hooks

#### `useDragDropMenu`
Comprehensive hook for menu state management.

```tsx
const {
  items,
  isLoading,
  isSaving,
  hasChanges,
  error,
  updateItems,
  createItem,
  updateItem,
  deleteItem,
  toggleItemEnabled,
  manualSave,
  rollbackChanges,
  getStats
} = useDragDropMenu(initialItems, autoSave);
```

### Utility Functions

#### `dragDropHelpers.ts`
- `buildMenuTree()` - Convert flat items to hierarchical structure
- `flattenMenuTree()` - Convert tree back to flat array
- `validateDragOperation()` - Validate drag operations
- `applyDragOperation()` - Apply drag changes to tree
- `calculateTreeStats()` - Generate menu statistics

## API Integration

### Menu Management API

```typescript
// Create new menu item
await menuManagementApi.createMenuItem({
  label: 'New Item',
  href: '/new-item',
  description: 'Description',
  is_enabled: true,
  icon: 'Plus'
}, 'main');

// Update existing item
await menuManagementApi.updateMenuItem({
  id: 'item-1',
  label: 'Updated Item'
});

// Reorder items
await menuManagementApi.reorderMenuItems([
  { id: 'item-1', order_index: 0, parent_id: null },
  { id: 'item-2', order_index: 1, parent_id: null }
]);

// Delete item and children
await menuManagementApi.deleteMenuItem('item-1');

// Toggle enabled status
await menuManagementApi.toggleMenuItemStatus('item-1', false);
```

## Usage Examples

### Basic Implementation

```tsx
import { DragDropMenuTree, useDragDropMenu } from '@/features/menu';

export const MenuManager: React.FC = () => {
  const {
    items,
    updateItems,
    createItem,
    deleteItem
  } = useDragDropMenu(initialItems, true);

  return (
    <DragDropMenuTree
      items={items}
      onItemsChange={updateItems}
      onItemAdd={(parentId) => createItem({
        label: 'New Item',
        href: '/new'
      }, 'main')}
      onItemDelete={deleteItem}
      autoSave={true}
    />
  );
};
```

### Advanced Configuration

```tsx
<DragDropMenuTree
  items={items}
  onItemsChange={updateItems}
  onItemEdit={handleEdit}
  onItemDelete={handleDelete}
  onItemAdd={handleAdd}
  menuType="main"
  autoSave={true}
  showActions={true}
  allowNesting={true}
  maxDepth={4}
  disabled={isReadOnly}
  className="custom-menu-tree"
/>
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + ↑` | Move item up |
| `Ctrl + ↓` | Move item down |
| `Ctrl + →` | Nest item into parent |
| `↑/↓` | Navigate items |
| `Enter` | Edit focused item |
| `Space` | Announce instructions |

## Touch Gestures

| Gesture | Action |
|---------|--------|
| Long Press | Start dragging |
| Swipe Left | Delete item |
| Swipe Right | Edit item |
| Tap | Select/focus item |

## Accessibility Features

### ARIA Support
- `role="tree"` for the container
- `role="treeitem"` for each menu item
- `aria-expanded` for expandable items
- `aria-level` for nesting levels
- `aria-selected` for focused items

### Screen Reader Features
- Live announcements for drag operations
- Detailed instructions for keyboard users
- Position announcements (e.g., "Item 2 of 5, Level 1")
- Status updates for enable/disable actions

### Keyboard Navigation
- Full keyboard accessibility
- Clear focus indicators
- Logical tab order
- Keyboard shortcuts for all actions

## Performance Optimizations

### Rendering Performance
- `React.memo` for item components
- Virtualization for large lists (optional)
- Debounced updates to prevent excessive re-renders

### Network Efficiency
- Debounced auto-save (1 second)
- Optimistic updates for immediate feedback
- Batch operations when possible
- Error handling with automatic retry

### Memory Management
- Cleanup of event listeners
- Proper ref management
- Efficient tree traversal algorithms

## Browser Support

### Desktop Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Mobile Browsers
- Chrome Mobile 80+
- Safari iOS 13+
- Samsung Internet 12+
- Firefox Mobile 75+

### Accessibility Tools
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

## Configuration Options

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `MenuItem[]` | `[]` | Menu items array |
| `onItemsChange` | `Function` | Required | Items change handler |
| `onItemEdit` | `Function` | Optional | Edit item handler |
| `onItemDelete` | `Function` | Optional | Delete item handler |
| `onItemAdd` | `Function` | Optional | Add item handler |
| `menuType` | `'main' \| 'footer'` | `'main'` | Menu type identifier |
| `autoSave` | `boolean` | `false` | Enable auto-save |
| `showActions` | `boolean` | `true` | Show action buttons |
| `allowNesting` | `boolean` | `true` | Allow item nesting |
| `maxDepth` | `number` | `3` | Maximum nesting depth |
| `disabled` | `boolean` | `false` | Disable all interactions |
| `className` | `string` | `''` | Additional CSS classes |

### Hook Configuration

```tsx
const menuHook = useDragDropMenu(
  initialItems,     // MenuItem[]
  autoSave,         // boolean
  debounceMs        // number (default: 1000)
);
```

## Best Practices

### Performance
1. Use `React.memo` for custom item renderers
2. Implement virtualization for 100+ items
3. Debounce rapid changes
4. Use optimistic updates

### Accessibility
1. Always provide meaningful labels
2. Test with screen readers
3. Ensure keyboard navigation works
4. Provide clear instructions

### UX Design
1. Clear visual feedback for all states
2. Consistent interaction patterns
3. Error messages that guide users
4. Progressive enhancement

### Code Organization
1. Separate concerns with custom hooks
2. Use TypeScript for type safety
3. Follow component composition patterns
4. Write comprehensive tests

## Testing

### Unit Tests
```bash
npm test -- --testPathPattern=DragDropMenuTree
```

### Integration Tests
```bash
npm test -- --testPathPattern=menu-integration
```

### Accessibility Tests
```bash
npm run test:a11y
```

## Troubleshooting

### Common Issues

1. **Items not updating after drag**
   - Check that `onItemsChange` is properly connected
   - Verify API endpoints are responding correctly

2. **Keyboard navigation not working**
   - Ensure focus management is not being overridden
   - Check for conflicting keyboard event handlers

3. **Touch gestures not responding**
   - Verify touch events aren't being prevented elsewhere
   - Check viewport meta tag for proper touch handling

### Debug Mode

Enable debug logging:
```tsx
<DragDropMenuTree
  {...props}
  debug={true}  // Enables console logging
/>
```

## Migration Guide

### From Basic Drag & Drop

1. Replace existing drag components with `DragDropMenuTree`
2. Update state management to use `useDragDropMenu` hook
3. Add accessibility attributes to existing markup
4. Test keyboard and touch interactions

### Database Migration

Ensure your database schema includes:
- `parent_id` for hierarchical relationships
- `order_index` for item ordering
- `is_enabled` for status management

## Future Enhancements

### Planned Features
- [ ] Bulk operations (multi-select)
- [ ] Undo/redo functionality
- [ ] Import/export capabilities
- [ ] Visual menu preview
- [ ] Custom validation rules
- [ ] Plugin system for extensions

### Performance Improvements
- [ ] Virtual scrolling for large datasets
- [ ] Web Workers for heavy computations
- [ ] IndexedDB caching
- [ ] Service Worker integration

## Support

For questions, issues, or contributions:
- Check the documentation
- Review existing issues
- Create detailed bug reports
- Follow contribution guidelines