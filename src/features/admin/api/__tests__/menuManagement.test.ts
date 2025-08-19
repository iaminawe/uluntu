import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { menuManagementApi } from '../menuManagement';
import { mockMenuItems, mockCreateMenuItemInput, mockMenuReorderUpdates, createMockMenuItem } from '../../../../tests/fixtures/menuTestData';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => mockSupabase),
  select: jest.fn(() => mockSupabase),
  insert: jest.fn(() => mockSupabase),
  update: jest.fn(() => mockSupabase),
  delete: jest.fn(() => mockSupabase),
  eq: jest.fn(() => mockSupabase),
  is: jest.fn(() => mockSupabase),
  order: jest.fn(() => mockSupabase),
  limit: jest.fn(() => mockSupabase),
  single: jest.fn(() => mockSupabase),
  rpc: jest.fn(() => mockSupabase),
};

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
}));

describe('MenuManagementAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMenuItems', () => {
    it('should fetch all menu items successfully', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: mockMenuItems,
        error: null,
      });

      const result = await menuManagementApi.getMenuItems();

      expect(result).toEqual(mockMenuItems);
      expect(mockSupabase.from).toHaveBeenCalledWith('menu_items');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.order).toHaveBeenCalledWith('order_index', { ascending: true });
    });

    it('should handle database errors gracefully', async () => {
      const mockError = { message: 'Database connection failed' };
      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      await expect(menuManagementApi.getMenuItems()).rejects.toThrow(
        'Failed to fetch menu items: Database connection failed'
      );
    });

    it('should return empty array when no items exist', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const result = await menuManagementApi.getMenuItems();

      expect(result).toEqual([]);
    });
  });

  describe('getMenuItem', () => {
    it('should fetch menu item by ID successfully', async () => {
      const mockItem = mockMenuItems[0];
      mockSupabase.single.mockResolvedValueOnce({
        data: mockItem,
        error: null,
      });

      const result = await menuManagementApi.getMenuItem('1');

      expect(result).toEqual(mockItem);
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
      expect(mockSupabase.single).toHaveBeenCalled();
    });

    it('should return null when item not found', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' }, // Not found error
      });

      const result = await menuManagementApi.getMenuItem('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Query failed', code: 'OTHER_ERROR' };
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      await expect(menuManagementApi.getMenuItem('1')).rejects.toThrow(
        'Failed to fetch menu item: Query failed'
      );
    });
  });

  describe('createMenuItem', () => {
    it('should create menu item successfully', async () => {
      const mockCreatedItem = createMockMenuItem({
        id: 'new-id',
        ...mockCreateMenuItemInput,
      });

      // Mock order index query
      mockSupabase.limit.mockResolvedValueOnce({
        data: [{ order_index: 2 }],
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: mockCreatedItem,
        error: null,
      });

      const result = await menuManagementApi.createMenuItem(mockCreateMenuItemInput);

      expect(result).toEqual(mockCreatedItem);
      expect(mockSupabase.insert).toHaveBeenCalledWith([{
        ...mockCreateMenuItemInput,
        is_enabled: true,
        order_index: 3, // Should be max + 1
      }]);
    });

    it('should handle order_index when no existing items', async () => {
      const mockCreatedItem = createMockMenuItem({
        id: 'new-id',
        ...mockCreateMenuItemInput,
        order_index: 0,
      });

      // Mock empty order index query
      mockSupabase.limit.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: mockCreatedItem,
        error: null,
      });

      const result = await menuManagementApi.createMenuItem({
        ...mockCreateMenuItemInput,
        order_index: undefined,
      });

      expect(result.order_index).toBe(0);
    });

    it('should use provided order_index when specified', async () => {
      const inputWithOrder = { ...mockCreateMenuItemInput, order_index: 5 };
      const mockCreatedItem = createMockMenuItem({
        id: 'new-id',
        ...inputWithOrder,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: mockCreatedItem,
        error: null,
      });

      const result = await menuManagementApi.createMenuItem(inputWithOrder);

      expect(result.order_index).toBe(5);
      // Should not query for max order_index
      expect(mockSupabase.limit).not.toHaveBeenCalled();
    });

    it('should handle database errors during creation', async () => {
      const mockError = { message: 'Constraint violation' };

      mockSupabase.limit.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      await expect(menuManagementApi.createMenuItem(mockCreateMenuItemInput)).rejects.toThrow(
        'Failed to create menu item: Constraint violation'
      );
    });
  });

  describe('updateMenuItem', () => {
    it('should update menu item successfully', async () => {
      const updateInput = { id: '1', label: 'Updated Label' };
      const mockUpdatedItem = { ...mockMenuItems[0], label: 'Updated Label' };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockUpdatedItem,
        error: null,
      });

      const result = await menuManagementApi.updateMenuItem(updateInput);

      expect(result).toEqual(mockUpdatedItem);
      expect(mockSupabase.update).toHaveBeenCalledWith({
        label: 'Updated Label',
        updated_at: expect.any(String),
      });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should handle database errors during update', async () => {
      const mockError = { message: 'Update failed' };
      
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      await expect(menuManagementApi.updateMenuItem({ id: '1', label: 'New Label' })).rejects.toThrow(
        'Failed to update menu item: Update failed'
      );
    });
  });

  describe('deleteMenuItem', () => {
    it('should delete menu item and its children successfully', async () => {
      // Mock successful deletion of children
      mockSupabase.delete.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock successful deletion of parent
      mockSupabase.delete.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await menuManagementApi.deleteMenuItem('1');

      expect(result).toBe(true);
      expect(mockSupabase.delete).toHaveBeenCalledTimes(2);
      expect(mockSupabase.eq).toHaveBeenCalledWith('parent_id', '1');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', '1');
    });

    it('should handle errors when deleting children', async () => {
      const mockError = { message: 'Child deletion failed' };

      mockSupabase.delete.mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      await expect(menuManagementApi.deleteMenuItem('1')).rejects.toThrow(
        'Failed to delete child menu items: Child deletion failed'
      );
    });

    it('should handle errors when deleting parent', async () => {
      const mockError = { message: 'Parent deletion failed' };

      // Children deletion succeeds
      mockSupabase.delete.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Parent deletion fails
      mockSupabase.delete.mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      await expect(menuManagementApi.deleteMenuItem('1')).rejects.toThrow(
        'Failed to delete menu item: Parent deletion failed'
      );
    });
  });

  describe('toggleMenuItemStatus', () => {
    it('should toggle menu item status successfully', async () => {
      const mockUpdatedItem = { ...mockMenuItems[0], is_enabled: false };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockUpdatedItem,
        error: null,
      });

      const result = await menuManagementApi.toggleMenuItemStatus('1', false);

      expect(result).toEqual(mockUpdatedItem);
      expect(mockSupabase.update).toHaveBeenCalledWith({
        is_enabled: false,
        updated_at: expect.any(String),
      });
    });

    it('should handle database errors during toggle', async () => {
      const mockError = { message: 'Toggle failed' };

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      await expect(menuManagementApi.toggleMenuItemStatus('1', false)).rejects.toThrow(
        'Failed to toggle menu item status: Toggle failed'
      );
    });
  });

  describe('reorderMenuItems', () => {
    it('should reorder menu items successfully', async () => {
      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await menuManagementApi.reorderMenuItems(mockMenuReorderUpdates);

      expect(result).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('update_menu_items_order', {
        updates: mockMenuReorderUpdates,
      });
    });

    it('should handle database errors during reorder', async () => {
      const mockError = { message: 'Reorder failed' };

      mockSupabase.rpc.mockResolvedValueOnce({
        data: null,
        error: mockError,
      });

      await expect(menuManagementApi.reorderMenuItems(mockMenuReorderUpdates)).rejects.toThrow(
        'Failed to reorder menu items: Reorder failed'
      );
    });
  });

  describe('getMenuStructure', () => {
    it('should build hierarchical menu structure correctly', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: mockMenuItems,
        error: null,
      });

      const result = await menuManagementApi.getMenuStructure();

      expect(result).toHaveLength(3); // 3 root items
      expect(result[0].children).toHaveLength(2); // Community has 2 children
      expect(result[1].children).toHaveLength(1); // Business has 1 child
      expect(result[2].children).toHaveLength(0); // About has no children

      // Verify order
      expect(result[0].label).toBe('Community');
      expect(result[1].label).toBe('Business');
      expect(result[2].label).toBe('About');
    });

    it('should handle empty menu items', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      const result = await menuManagementApi.getMenuStructure();

      expect(result).toEqual([]);
    });
  });

  describe('getEnabledMenuStructure', () => {
    it('should filter out disabled menu items', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: mockMenuItems,
        error: null,
      });

      const result = await menuManagementApi.getEnabledMenuStructure();

      // Business section should still exist but without Companies child
      const businessSection = result.find(item => item.label === 'Business');
      expect(businessSection).toBeTruthy();
      expect(businessSection?.children).toHaveLength(0); // Companies is disabled
    });

    it('should include all enabled items in hierarchy', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: mockMenuItems.map(item => ({ ...item, is_enabled: true })),
        error: null,
      });

      const result = await menuManagementApi.getEnabledMenuStructure();

      expect(result).toHaveLength(3);
      expect(result[0].children).toHaveLength(2); // Community children
      expect(result[1].children).toHaveLength(1); // Business children (now enabled)
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null parent_id correctly', async () => {
      const inputWithNullParent = { ...mockCreateMenuItemInput, parent_id: null };

      mockSupabase.limit.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: createMockMenuItem(inputWithNullParent),
        error: null,
      });

      const result = await menuManagementApi.createMenuItem(inputWithNullParent);

      expect(mockSupabase.is).toHaveBeenCalledWith('parent_id', null);
      expect(result.parent_id).toBeNull();
    });

    it('should handle malformed menu data gracefully', async () => {
      const malformedData = [
        { ...mockMenuItems[0], parent_id: 'nonexistent' }
      ];

      mockSupabase.select.mockResolvedValueOnce({
        data: malformedData,
        error: null,
      });

      const result = await menuManagementApi.getMenuStructure();

      // Should still return the item as root level since parent doesn't exist
      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Community');
    });
  });
});