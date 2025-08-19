import { describe, it, expect, jest, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { menuManagementApi } from '../menuManagement';
import { mockMenuItems, mockCreateMenuItemInput, createMockMenuItem } from '../../../../tests/fixtures/menuTestData';

// Integration tests that mock the full database flow
// These test the API layer with realistic database scenarios

describe('MenuManagementAPI Integration Tests', () => {
  // Mock database state
  let mockDatabase: any[] = [];
  let nextId = 100;

  const resetDatabase = () => {
    mockDatabase = [...mockMenuItems];
    nextId = 100;
  };

  // Create a more realistic Supabase mock
  const createRealisticMock = () => {
    const mockSupabase: any = {
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

    // Mock select behavior
    mockSupabase.select.mockImplementation((columns: string) => {
      const chain = { ...mockSupabase };
      
      chain.order = jest.fn((column: string, options: any) => {
        const result = [...mockDatabase];
        if (column === 'order_index') {
          result.sort((a, b) => options.ascending ? a.order_index - b.order_index : b.order_index - a.order_index);
        }
        return {
          ...chain,
          then: (resolve: any) => resolve({ data: result, error: null })
        };
      });

      chain.single = jest.fn(() => ({
        then: (resolve: any) => {
          // For single queries, we need to apply the eq filter
          const item = mockDatabase.find(item => 
            chain._eqFilters ? chain._eqFilters.every((filter: any) => item[filter.column] === filter.value) : true
          );
          resolve({ data: item || null, error: item ? null : { code: 'PGRST116' } });
        }
      }));

      chain.limit = jest.fn((count: number) => ({
        then: (resolve: any) => {
          const filtered = mockDatabase.filter(item => {
            return chain._isFilters ? chain._isFilters.every((filter: any) => 
              item[filter.column] === filter.value
            ) : true;
          });
          const limited = filtered.slice(0, count);
          resolve({ data: limited, error: null });
        }
      }));

      return {
        ...chain,
        then: (resolve: any) => resolve({ data: mockDatabase, error: null })
      };
    });

    // Mock eq filter
    mockSupabase.eq.mockImplementation((column: string, value: any) => {
      const chain = { ...mockSupabase };
      chain._eqFilters = chain._eqFilters || [];
      chain._eqFilters.push({ column, value });
      return chain;
    });

    // Mock is filter
    mockSupabase.is.mockImplementation((column: string, value: any) => {
      const chain = { ...mockSupabase };
      chain._isFilters = chain._isFilters || [];
      chain._isFilters.push({ column, value });
      return chain;
    });

    // Mock insert behavior
    mockSupabase.insert.mockImplementation((data: any[]) => {
      const newItems = data.map(item => ({
        ...item,
        id: `${nextId++}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      
      mockDatabase.push(...newItems);
      
      return {
        ...mockSupabase,
        single: jest.fn(() => ({
          then: (resolve: any) => resolve({ data: newItems[0], error: null })
        }))
      };
    });

    // Mock update behavior
    mockSupabase.update.mockImplementation((updates: any) => {
      return {
        ...mockSupabase,
        single: jest.fn(() => ({
          then: (resolve: any) => {
            const itemIndex = mockDatabase.findIndex(item => 
              mockSupabase._eqFilters?.every((filter: any) => item[filter.column] === filter.value)
            );
            
            if (itemIndex >= 0) {
              mockDatabase[itemIndex] = { ...mockDatabase[itemIndex], ...updates };
              resolve({ data: mockDatabase[itemIndex], error: null });
            } else {
              resolve({ data: null, error: { message: 'Item not found' } });
            }
          }
        }))
      };
    });

    // Mock delete behavior
    mockSupabase.delete.mockImplementation(() => ({
      then: (resolve: any) => {
        const initialLength = mockDatabase.length;
        mockDatabase = mockDatabase.filter(item => {
          return !mockSupabase._eqFilters?.every((filter: any) => item[filter.column] === filter.value);
        });
        
        resolve({ 
          data: null, 
          error: mockDatabase.length < initialLength ? null : { message: 'No items to delete' }
        });
      }
    }));

    // Mock RPC for reordering
    mockSupabase.rpc.mockImplementation((functionName: string, params: any) => {
      if (functionName === 'update_menu_items_order') {
        params.updates.forEach((update: any) => {
          const itemIndex = mockDatabase.findIndex(item => item.id === update.id);
          if (itemIndex >= 0) {
            mockDatabase[itemIndex] = { ...mockDatabase[itemIndex], ...update };
          }
        });
        return { then: (resolve: any) => resolve({ data: null, error: null }) };
      }
      return { then: (resolve: any) => resolve({ data: null, error: { message: 'Unknown function' } }) };
    });

    return mockSupabase;
  };

  beforeAll(() => {
    // Replace the Supabase mock with our realistic version
    jest.doMock('@/lib/supabase', () => ({
      supabase: createRealisticMock()
    }));
  });

  beforeEach(() => {
    resetDatabase();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Full CRUD Workflow Integration', () => {
    it('should handle complete menu item lifecycle', async () => {
      // 1. Get initial menu items
      const initialItems = await menuManagementApi.getMenuItems();
      expect(initialItems.length).toBeGreaterThan(0);

      // 2. Create a new menu item
      const newMenuItem = await menuManagementApi.createMenuItem({
        label: 'New Section',
        href: '/new-section',
        description: 'A new section for testing',
      });

      expect(newMenuItem).toBeDefined();
      expect(newMenuItem.label).toBe('New Section');
      expect(newMenuItem.id).toBeDefined();

      // 3. Verify it exists in the list
      const afterCreate = await menuManagementApi.getMenuItems();
      expect(afterCreate.length).toBe(initialItems.length + 1);

      // 4. Update the menu item
      const updatedMenuItem = await menuManagementApi.updateMenuItem({
        id: newMenuItem.id,
        label: 'Updated Section',
        description: 'Updated description',
      });

      expect(updatedMenuItem.label).toBe('Updated Section');
      expect(updatedMenuItem.description).toBe('Updated description');

      // 5. Toggle its status
      const toggledMenuItem = await menuManagementApi.toggleMenuItemStatus(newMenuItem.id, false);
      expect(toggledMenuItem.is_enabled).toBe(false);

      // 6. Delete the menu item
      const deleteResult = await menuManagementApi.deleteMenuItem(newMenuItem.id);
      expect(deleteResult).toBe(true);

      // 7. Verify it's gone
      const afterDelete = await menuManagementApi.getMenuItems();
      expect(afterDelete.length).toBe(initialItems.length);
    });

    it('should handle hierarchical menu operations', async () => {
      // Create parent menu item
      const parentItem = await menuManagementApi.createMenuItem({
        label: 'Parent Menu',
        href: '/parent',
        description: 'Parent menu item',
      });

      // Create child menu items
      const child1 = await menuManagementApi.createMenuItem({
        label: 'Child 1',
        href: '/parent/child1',
        parent_id: parentItem.id,
        order_index: 0,
      });

      const child2 = await menuManagementApi.createMenuItem({
        label: 'Child 2',
        href: '/parent/child2',
        parent_id: parentItem.id,
        order_index: 1,
      });

      // Get hierarchical structure
      const structure = await menuManagementApi.getMenuStructure();
      const parentInStructure = structure.find(item => item.id === parentItem.id);

      expect(parentInStructure).toBeDefined();
      expect(parentInStructure?.children).toHaveLength(2);
      expect(parentInStructure?.children?.[0].label).toBe('Child 1');
      expect(parentInStructure?.children?.[1].label).toBe('Child 2');

      // Delete parent (should also delete children)
      await menuManagementApi.deleteMenuItem(parentItem.id);

      // Verify all are gone
      const afterDelete = await menuManagementApi.getMenuItem(parentItem.id);
      const child1AfterDelete = await menuManagementApi.getMenuItem(child1.id);
      const child2AfterDelete = await menuManagementApi.getMenuItem(child2.id);

      expect(afterDelete).toBeNull();
      expect(child1AfterDelete).toBeNull();
      expect(child2AfterDelete).toBeNull();
    });
  });

  describe('Menu Structure and Filtering Integration', () => {
    it('should correctly build and filter menu structures', async () => {
      // Get full structure
      const fullStructure = await menuManagementApi.getMenuStructure();
      expect(fullStructure.length).toBeGreaterThan(0);

      // Get enabled-only structure
      const enabledStructure = await menuManagementApi.getEnabledMenuStructure();
      
      // Should have fewer or equal items
      expect(enabledStructure.length).toBeLessThanOrEqual(fullStructure.length);

      // All items in enabled structure should be enabled
      const checkEnabled = (items: any[]) => {
        items.forEach(item => {
          expect(item.is_enabled).toBe(true);
          if (item.children) {
            checkEnabled(item.children);
          }
        });
      };

      checkEnabled(enabledStructure);
    });

    it('should handle reordering operations', async () => {
      const initialItems = await menuManagementApi.getMenuItems();
      const rootItems = initialItems.filter(item => !item.parent_id);

      if (rootItems.length >= 2) {
        // Swap the order of first two root items
        const reorderUpdates = [
          { id: rootItems[0].id, order_index: rootItems[1].order_index, parent_id: null },
          { id: rootItems[1].id, order_index: rootItems[0].order_index, parent_id: null },
        ];

        const reorderResult = await menuManagementApi.reorderMenuItems(reorderUpdates);
        expect(reorderResult).toBe(true);

        // Verify the order changed in the structure
        const newStructure = await menuManagementApi.getMenuStructure();
        const newFirstItem = newStructure[0];
        const newSecondItem = newStructure[1];

        // The items should be in their new positions
        expect(newFirstItem.id).toBe(rootItems[1].id);
        expect(newSecondItem.id).toBe(rootItems[0].id);
      }
    });
  });

  describe('Database Constraint and Validation Integration', () => {
    it('should handle order_index generation correctly', async () => {
      // Create items without specifying order_index
      const item1 = await menuManagementApi.createMenuItem({
        label: 'Auto Order 1',
        href: '/auto1',
      });

      const item2 = await menuManagementApi.createMenuItem({
        label: 'Auto Order 2',
        href: '/auto2',
      });

      // They should have sequential order indices
      expect(item2.order_index).toBeGreaterThan(item1.order_index);

      // Clean up
      await menuManagementApi.deleteMenuItem(item1.id);
      await menuManagementApi.deleteMenuItem(item2.id);
    });

    it('should handle missing menu item operations gracefully', async () => {
      // Try to get non-existent item
      const nonExistent = await menuManagementApi.getMenuItem('non-existent-id');
      expect(nonExistent).toBeNull();

      // Try to update non-existent item
      await expect(
        menuManagementApi.updateMenuItem({
          id: 'non-existent-id',
          label: 'Updated',
        })
      ).rejects.toThrow();

      // Try to delete non-existent item
      // This should succeed (idempotent operation)
      const deleteResult = await menuManagementApi.deleteMenuItem('non-existent-id');
      expect(deleteResult).toBe(true);
    });
  });

  describe('Performance and Edge Case Integration', () => {
    it('should handle large menu hierarchies efficiently', async () => {
      const startTime = performance.now();

      // Create a moderately large menu structure
      const parentItems = [];
      for (let i = 0; i < 5; i++) {
        const parent = await menuManagementApi.createMenuItem({
          label: `Parent ${i}`,
          href: `/parent${i}`,
        });
        parentItems.push(parent);

        // Add children
        for (let j = 0; j < 3; j++) {
          await menuManagementApi.createMenuItem({
            label: `Child ${i}-${j}`,
            href: `/parent${i}/child${j}`,
            parent_id: parent.id,
          });
        }
      }

      // Get the structure
      const structure = await menuManagementApi.getMenuStructure();
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(1000); // 1 second

      // Verify structure correctness
      const newParents = structure.filter(item => 
        parentItems.some(parent => parent.id === item.id)
      );
      
      expect(newParents).toHaveLength(5);
      newParents.forEach(parent => {
        expect(parent.children).toHaveLength(3);
      });

      // Clean up
      for (const parent of parentItems) {
        await menuManagementApi.deleteMenuItem(parent.id);
      }
    });

    it('should maintain data consistency during concurrent operations', async () => {
      // Simulate concurrent creation of menu items
      const creationPromises = [];
      for (let i = 0; i < 3; i++) {
        creationPromises.push(
          menuManagementApi.createMenuItem({
            label: `Concurrent ${i}`,
            href: `/concurrent${i}`,
          })
        );
      }

      const createdItems = await Promise.all(creationPromises);
      
      // All should be created successfully
      expect(createdItems).toHaveLength(3);
      createdItems.forEach((item, index) => {
        expect(item.label).toBe(`Concurrent ${index}`);
        expect(item.id).toBeDefined();
      });

      // Simulate concurrent updates
      const updatePromises = createdItems.map((item, index) => 
        menuManagementApi.updateMenuItem({
          id: item.id,
          description: `Updated concurrently ${index}`,
        })
      );

      const updatedItems = await Promise.all(updatePromises);
      
      // All should be updated successfully
      expect(updatedItems).toHaveLength(3);
      updatedItems.forEach((item, index) => {
        expect(item.description).toBe(`Updated concurrently ${index}`);
      });

      // Clean up
      for (const item of createdItems) {
        await menuManagementApi.deleteMenuItem(item.id);
      }
    });
  });
});