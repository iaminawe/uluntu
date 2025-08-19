/**
 * Comprehensive Unit Tests for Menu Management API
 * 
 * Tests all CRUD operations, error handling, and edge cases
 * for the menu management system API.
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { menuManagementApi, MenuItem, CreateMenuItemInput, UpdateMenuItemInput } from '../menuManagement';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

describe('MenuManagementAPI', () => {
  const mockSupabaseQuery = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  };

  const mockMenuItem: MenuItem = {
    id: 'test-123',
    label: 'Test Menu Item',
    href: '/test',
    description: 'Test description',
    parent_id: null,
    order_index: 0,
    is_enabled: true,
    icon: 'test-icon',
    feature_flag: 'test_feature',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.from as Mock).mockReturnValue(mockSupabaseQuery);
    (supabase.rpc as Mock).mockReturnValue(mockSupabaseQuery);
  });

  describe('getMenuItems', () => {
    it('should fetch all menu items successfully', async () => {
      const mockData = [mockMenuItem];
      mockSupabaseQuery.order.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await menuManagementApi.getMenuItems();

      expect(supabase.from).toHaveBeenCalledWith('menu_items');
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseQuery.order).toHaveBeenCalledWith('order_index', { ascending: true });
      expect(result).toEqual(mockData);
    });

    it('should handle empty result', async () => {
      mockSupabaseQuery.order.mockResolvedValueOnce({ data: null, error: null });

      const result = await menuManagementApi.getMenuItems();

      expect(result).toEqual([]);
    });

    it('should throw error on database failure', async () => {
      const mockError = { message: 'Database connection failed' };
      mockSupabaseQuery.order.mockResolvedValueOnce({ data: null, error: mockError });

      await expect(menuManagementApi.getMenuItems()).rejects.toThrow('Failed to fetch menu items: Database connection failed');
    });

    it('should handle network timeout', async () => {
      mockSupabaseQuery.order.mockRejectedValueOnce(new Error('Network timeout'));

      await expect(menuManagementApi.getMenuItems()).rejects.toThrow('Network timeout');
    });
  });

  describe('getMenuItem', () => {
    it('should fetch single menu item successfully', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: mockMenuItem, error: null });

      const result = await menuManagementApi.getMenuItem('test-123');

      expect(supabase.from).toHaveBeenCalledWith('menu_items');
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'test-123');
      expect(result).toEqual(mockMenuItem);
    });

    it('should return null for non-existent item', async () => {
      const mockError = { code: 'PGRST116', message: 'Not found' };
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: null, error: mockError });

      const result = await menuManagementApi.getMenuItem('non-existent');

      expect(result).toBeNull();
    });

    it('should throw error for other database errors', async () => {
      const mockError = { code: 'PGRST001', message: 'Database error' };
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: null, error: mockError });

      await expect(menuManagementApi.getMenuItem('test-123')).rejects.toThrow('Failed to fetch menu item: Database error');
    });

    it('should validate UUID format', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: null, error: { code: 'PGRST001', message: 'Invalid UUID' } });

      await expect(menuManagementApi.getMenuItem('invalid-uuid')).rejects.toThrow('Failed to fetch menu item: Invalid UUID');
    });
  });

  describe('createMenuItem', () => {
    const mockInput: CreateMenuItemInput = {
      label: 'New Menu Item',
      href: '/new',
      description: 'New description',
      parent_id: null,
      is_enabled: true,
      icon: 'new-icon',
    };

    it('should create menu item successfully', async () => {
      const createdItem = { ...mockMenuItem, ...mockInput };
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: createdItem, error: null });
      mockSupabaseQuery.limit.mockResolvedValueOnce({ data: [], error: null });

      const result = await menuManagementApi.createMenuItem(mockInput);

      expect(supabase.from).toHaveBeenCalledWith('menu_items');
      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith([{
        ...mockInput,
        order_index: 0,
        is_enabled: true,
      }]);
      expect(result).toEqual(createdItem);
    });

    it('should auto-assign order_index when not provided', async () => {
      const maxOrderData = [{ order_index: 5 }];
      mockSupabaseQuery.limit.mockResolvedValueOnce({ data: maxOrderData, error: null });
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: mockMenuItem, error: null });

      await menuManagementApi.createMenuItem({ ...mockInput, order_index: undefined });

      expect(mockSupabaseQuery.insert).toHaveBeenCalledWith([{
        ...mockInput,
        order_index: 6,
        is_enabled: true,
      }]);
    });

    it('should handle parent_id validation', async () => {
      mockSupabaseQuery.limit.mockResolvedValueOnce({ data: [], error: null });
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: null, error: { message: 'Foreign key violation' } });

      await expect(menuManagementApi.createMenuItem({ ...mockInput, parent_id: 'invalid-parent' }))
        .rejects.toThrow('Failed to create menu item: Foreign key violation');
    });

    it('should validate required fields', async () => {
      const invalidInput = { ...mockInput, label: '' };
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: null, error: { message: 'Label cannot be empty' } });

      await expect(menuManagementApi.createMenuItem(invalidInput))
        .rejects.toThrow('Failed to create menu item: Label cannot be empty');
    });

    it('should handle duplicate href constraints', async () => {
      mockSupabaseQuery.limit.mockResolvedValueOnce({ data: [], error: null });
      mockSupabaseQuery.single.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Duplicate key value violates unique constraint' } 
      });

      await expect(menuManagementApi.createMenuItem(mockInput))
        .rejects.toThrow('Failed to create menu item: Duplicate key value violates unique constraint');
    });
  });

  describe('updateMenuItem', () => {
    const mockUpdate: UpdateMenuItemInput = {
      id: 'test-123',
      label: 'Updated Label',
      href: '/updated',
    };

    it('should update menu item successfully', async () => {
      const updatedItem = { ...mockMenuItem, ...mockUpdate };
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: updatedItem, error: null });

      const result = await menuManagementApi.updateMenuItem(mockUpdate);

      expect(supabase.from).toHaveBeenCalledWith('menu_items');
      expect(mockSupabaseQuery.update).toHaveBeenCalledWith({
        label: 'Updated Label',
        href: '/updated',
        updated_at: expect.any(String),
      });
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'test-123');
      expect(result).toEqual(updatedItem);
    });

    it('should handle non-existent item', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'No rows updated' } 
      });

      await expect(menuManagementApi.updateMenuItem(mockUpdate))
        .rejects.toThrow('Failed to update menu item: No rows updated');
    });

    it('should validate href uniqueness', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Duplicate key value violates unique constraint' } 
      });

      await expect(menuManagementApi.updateMenuItem({ ...mockUpdate, href: '/existing' }))
        .rejects.toThrow('Failed to update menu item: Duplicate key value violates unique constraint');
    });

    it('should handle circular reference prevention', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'Circular reference detected' } 
      });

      await expect(menuManagementApi.updateMenuItem({ ...mockUpdate, parent_id: 'test-123' }))
        .rejects.toThrow('Failed to update menu item: Circular reference detected');
    });
  });

  describe('deleteMenuItem', () => {
    it('should delete menu item and children successfully', async () => {
      mockSupabaseQuery.delete.mockResolvedValueOnce({ error: null });
      mockSupabaseQuery.delete.mockResolvedValueOnce({ error: null });

      const result = await menuManagementApi.deleteMenuItem('test-123');

      expect(supabase.from).toHaveBeenCalledWith('menu_items');
      expect(mockSupabaseQuery.delete).toHaveBeenCalledTimes(2);
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('parent_id', 'test-123');
      expect(mockSupabaseQuery.eq).toHaveBeenCalledWith('id', 'test-123');
      expect(result).toBe(true);
    });

    it('should handle deletion of non-existent item', async () => {
      mockSupabaseQuery.delete.mockResolvedValueOnce({ error: null });
      mockSupabaseQuery.delete.mockResolvedValueOnce({ 
        error: { message: 'No rows deleted' } 
      });

      await expect(menuManagementApi.deleteMenuItem('non-existent'))
        .rejects.toThrow('Failed to delete menu item: No rows deleted');
    });

    it('should handle cascading delete errors', async () => {
      mockSupabaseQuery.delete.mockResolvedValueOnce({ 
        error: { message: 'Failed to delete children' } 
      });

      await expect(menuManagementApi.deleteMenuItem('test-123'))
        .rejects.toThrow('Failed to delete child menu items: Failed to delete children');
    });
  });

  describe('toggleMenuItemStatus', () => {
    it('should toggle status successfully', async () => {
      const toggledItem = { ...mockMenuItem, is_enabled: false };
      mockSupabaseQuery.single.mockResolvedValueOnce({ data: toggledItem, error: null });

      const result = await menuManagementApi.toggleMenuItemStatus('test-123', false);

      expect(mockSupabaseQuery.update).toHaveBeenCalledWith({
        is_enabled: false,
        updated_at: expect.any(String),
      });
      expect(result).toEqual(toggledItem);
    });

    it('should handle toggle of non-existent item', async () => {
      mockSupabaseQuery.single.mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'No rows updated' } 
      });

      await expect(menuManagementApi.toggleMenuItemStatus('non-existent', false))
        .rejects.toThrow('Failed to toggle menu item status: No rows updated');
    });
  });

  describe('reorderMenuItems', () => {
    const mockUpdates = [
      { id: 'test-1', order_index: 0, parent_id: null },
      { id: 'test-2', order_index: 1, parent_id: null },
    ];

    it('should reorder items successfully', async () => {
      (supabase.rpc as Mock).mockResolvedValueOnce({ error: null });

      const result = await menuManagementApi.reorderMenuItems(mockUpdates);

      expect(supabase.rpc).toHaveBeenCalledWith('update_menu_items_order', {
        updates: mockUpdates
      });
      expect(result).toBe(true);
    });

    it('should handle reorder database error', async () => {
      (supabase.rpc as Mock).mockResolvedValueOnce({ 
        error: { message: 'Reorder operation failed' } 
      });

      await expect(menuManagementApi.reorderMenuItems(mockUpdates))
        .rejects.toThrow('Failed to reorder menu items: Reorder operation failed');
    });

    it('should validate order_index constraints', async () => {
      const invalidUpdates = [{ id: 'test-1', order_index: -1, parent_id: null }];
      (supabase.rpc as Mock).mockResolvedValueOnce({ 
        error: { message: 'Invalid order index' } 
      });

      await expect(menuManagementApi.reorderMenuItems(invalidUpdates))
        .rejects.toThrow('Failed to reorder menu items: Invalid order index');
    });
  });

  describe('getMenuStructure', () => {
    it('should build hierarchical structure correctly', async () => {
      const mockItems = [
        { ...mockMenuItem, id: '1', label: 'Parent', parent_id: null, order_index: 0 },
        { ...mockMenuItem, id: '2', label: 'Child 1', parent_id: '1', order_index: 0 },
        { ...mockMenuItem, id: '3', label: 'Child 2', parent_id: '1', order_index: 1 },
        { ...mockMenuItem, id: '4', label: 'Root 2', parent_id: null, order_index: 1 },
      ];
      mockSupabaseQuery.order.mockResolvedValueOnce({ data: mockItems, error: null });

      const result = await menuManagementApi.getMenuStructure();

      expect(result).toHaveLength(2); // Two root items
      expect(result[0].id).toBe('1');
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children![0].id).toBe('2');
      expect(result[0].children![1].id).toBe('3');
      expect(result[1].id).toBe('4');
      expect(result[1].children).toHaveLength(0);
    });

    it('should handle orphaned items gracefully', async () => {
      const mockItems = [
        { ...mockMenuItem, id: '1', parent_id: 'non-existent', order_index: 0 },
      ];
      mockSupabaseQuery.order.mockResolvedValueOnce({ data: mockItems, error: null });

      const result = await menuManagementApi.getMenuStructure();

      expect(result).toHaveLength(0); // Orphaned item not included in root
    });

    it('should sort items by order_index', async () => {
      const mockItems = [
        { ...mockMenuItem, id: '1', order_index: 2 },
        { ...mockMenuItem, id: '2', order_index: 0 },
        { ...mockMenuItem, id: '3', order_index: 1 },
      ];
      mockSupabaseQuery.order.mockResolvedValueOnce({ data: mockItems, error: null });

      const result = await menuManagementApi.getMenuStructure();

      expect(result[0].id).toBe('2'); // order_index: 0
      expect(result[1].id).toBe('3'); // order_index: 1
      expect(result[2].id).toBe('1'); // order_index: 2
    });
  });

  describe('getEnabledMenuStructure', () => {
    it('should filter out disabled items recursively', async () => {
      const mockItems = [
        { ...mockMenuItem, id: '1', is_enabled: true, parent_id: null },
        { ...mockMenuItem, id: '2', is_enabled: false, parent_id: '1' }, // Disabled child
        { ...mockMenuItem, id: '3', is_enabled: true, parent_id: '1' },
        { ...mockMenuItem, id: '4', is_enabled: false, parent_id: null }, // Disabled root
      ];
      mockSupabaseQuery.order.mockResolvedValueOnce({ data: mockItems, error: null });

      const result = await menuManagementApi.getEnabledMenuStructure();

      expect(result).toHaveLength(1); // Only one enabled root item
      expect(result[0].id).toBe('1');
      expect(result[0].children).toHaveLength(1); // Only enabled child
      expect(result[0].children![0].id).toBe('3');
    });

    it('should handle all disabled items', async () => {
      const mockItems = [
        { ...mockMenuItem, id: '1', is_enabled: false },
        { ...mockMenuItem, id: '2', is_enabled: false },
      ];
      mockSupabaseQuery.order.mockResolvedValueOnce({ data: mockItems, error: null });

      const result = await menuManagementApi.getEnabledMenuStructure();

      expect(result).toHaveLength(0);
    });
  });

  describe('Edge Cases and Performance', () => {
    it('should handle large menu structures efficiently', async () => {
      const largeMenuItems = Array.from({ length: 1000 }, (_, i) => ({
        ...mockMenuItem,
        id: `item-${i}`,
        label: `Item ${i}`,
        parent_id: i > 0 && i % 10 === 0 ? `item-${i - 1}` : null,
        order_index: i,
      }));
      
      mockSupabaseQuery.order.mockResolvedValueOnce({ data: largeMenuItems, error: null });

      const startTime = Date.now();
      const result = await menuManagementApi.getMenuStructure();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle deeply nested menu structures', async () => {
      const deepMenuItems = Array.from({ length: 20 }, (_, i) => ({
        ...mockMenuItem,
        id: `item-${i}`,
        label: `Item ${i}`,
        parent_id: i > 0 ? `item-${i - 1}` : null,
        order_index: 0,
      }));
      
      mockSupabaseQuery.order.mockResolvedValueOnce({ data: deepMenuItems, error: null });

      const result = await menuManagementApi.getMenuStructure();

      expect(result).toHaveLength(1); // One root item
      let currentLevel = result[0];
      let depth = 1;
      
      while (currentLevel.children && currentLevel.children.length > 0) {
        currentLevel = currentLevel.children[0];
        depth++;
      }
      
      expect(depth).toBe(20); // Full depth preserved
    });

    it('should handle concurrent operations safely', async () => {
      mockSupabaseQuery.order.mockResolvedValue({ data: [mockMenuItem], error: null });
      mockSupabaseQuery.single.mockResolvedValue({ data: mockMenuItem, error: null });

      const operations = [
        menuManagementApi.getMenuItems(),
        menuManagementApi.getMenuItem('test-123'),
        menuManagementApi.getMenuStructure(),
        menuManagementApi.getEnabledMenuStructure(),
      ];

      const results = await Promise.all(operations);

      expect(results).toHaveLength(4);
      results.forEach(result => expect(result).toBeDefined());
    });
  });
});