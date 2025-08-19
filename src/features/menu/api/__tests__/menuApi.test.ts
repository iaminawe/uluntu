// Comprehensive test suite for Menu API
import { menuApi, MenuApiError } from '../menuApi';
import { supabase } from '@/shared/api';
import { MenuItem, MenuItemInput, MenuType } from '@/types/menu';

// Mock the supabase client
jest.mock('@/shared/api', () => ({
  supabase: {
    from: jest.fn(),
  },
  handleSupabaseError: jest.fn(),
  adaptItemsList: jest.fn(),
}));

// Mock admin roles API
jest.mock('@/features/admin/api/roles', () => ({
  adminRolesApi: {
    getUserRoles: jest.fn(),
    checkPermission: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('MenuApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMenuItem: MenuItem = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Menu Item',
    url: '/test',
    description: 'Test description',
    menu_type: 'main',
    parent_id: null,
    sort_order: 100,
    is_enabled: true,
    target: '_self',
    icon: 'test-icon',
    css_classes: 'test-class',
    visibility: 'public',
    required_roles: null,
    is_external: false,
    status: 'published',
    featured: false,
    createdAt: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    children: []
  };

  describe('getAll', () => {
    it('should fetch all menu items with default filters', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      
      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockQuery.select.mockResolvedValue({
        data: [mockMenuItem],
        error: null
      });

      const result = await menuApi.getAll();

      expect(mockSupabase.from).toHaveBeenCalledWith('menu_items');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should apply menu type filter correctly', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      
      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockQuery.select.mockResolvedValue({
        data: [mockMenuItem],
        error: null
      });

      await menuApi.getAll({ menu_type: 'main' });

      expect(mockQuery.eq).toHaveBeenCalledWith('menu_type', 'main');
    });

    it('should apply multiple menu types filter', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      
      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockQuery.select.mockResolvedValue({
        data: [mockMenuItem],
        error: null
      });

      await menuApi.getAll({ menu_type: ['main', 'footer'] });

      expect(mockQuery.in).toHaveBeenCalledWith('menu_type', ['main', 'footer']);
    });

    it('should apply search filter correctly', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      
      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockQuery.select.mockResolvedValue({
        data: [mockMenuItem],
        error: null
      });

      await menuApi.getAll({ search: 'test' });

      expect(mockQuery.or).toHaveBeenCalledWith('title.ilike.%test%,description.ilike.%test%,url.ilike.%test%');
    });
  });

  describe('getById', () => {
    it('should fetch menu item by ID', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMenuItem,
          error: null
        })
      };
      
      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await menuApi.getById('123e4567-e89b-12d3-a456-426614174000');

      expect(mockSupabase.from).toHaveBeenCalledWith('menu_items');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', '123e4567-e89b-12d3-a456-426614174000');
      expect(result).toBeTruthy();
    });

    it('should return null for non-existent ID', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      };
      
      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await menuApi.getById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const validMenuInput: MenuItemInput = {
      title: 'New Menu Item',
      url: '/new-item',
      description: 'New item description',
      menu_type: 'main',
      is_enabled: true,
      target: '_self',
      visibility: 'public',
      is_external: false
    };

    it('should create a new menu item with valid input', async () => {
      // Mock getAll to return empty array for sort order calculation
      const mockGetAllQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      
      mockGetAllQuery.select.mockResolvedValue({
        data: [],
        error: null
      });

      const mockCreateQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockMenuItem, ...validMenuInput },
          error: null
        })
      };

      mockSupabase.from
        .mockReturnValueOnce(mockGetAllQuery as any) // First call for getAll
        .mockReturnValueOnce(mockCreateQuery as any); // Second call for insert

      const result = await menuApi.create(validMenuInput);

      expect(mockCreateQuery.insert).toHaveBeenCalled();
      expect(result).toBeTruthy();
      expect(result?.title).toBe(validMenuInput.title);
    });

    it('should throw error for invalid URL format', async () => {
      const invalidInput: MenuItemInput = {
        ...validMenuInput,
        url: 'invalid-url-format'
      };

      await expect(menuApi.create(invalidInput)).rejects.toThrow(MenuApiError);
    });

    it('should validate input using Zod schema', async () => {
      const invalidInput = {
        title: '', // Empty title should fail validation
        url: '/test',
        menu_type: 'main'
      } as MenuItemInput;

      await expect(menuApi.create(invalidInput)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update existing menu item', async () => {
      // Mock getById to return existing item
      const mockGetByIdQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMenuItem,
          error: null
        })
      };

      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockMenuItem, title: 'Updated Title' },
          error: null
        })
      };

      mockSupabase.from
        .mockReturnValueOnce(mockGetByIdQuery as any) // getById call
        .mockReturnValueOnce(mockUpdateQuery as any); // update call

      const result = await menuApi.update(mockMenuItem.id, { title: 'Updated Title' });

      expect(mockUpdateQuery.update).toHaveBeenCalled();
      expect(result?.title).toBe('Updated Title');
    });

    it('should throw error when updating non-existent item', async () => {
      const mockGetByIdQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }
        })
      };

      mockSupabase.from.mockReturnValue(mockGetByIdQuery as any);

      await expect(menuApi.update('non-existent-id', { title: 'Test' })).rejects.toThrow(MenuApiError);
    });

    it('should prevent circular parent relationships', async () => {
      // Mock getById to return existing item
      const mockGetByIdQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMenuItem,
          error: null
        })
      };

      mockSupabase.from.mockReturnValue(mockGetByIdQuery as any);

      await expect(menuApi.update(mockMenuItem.id, { parent_id: mockMenuItem.id })).rejects.toThrow(MenuApiError);
    });
  });

  describe('delete', () => {
    it('should delete menu item without children', async () => {
      // Mock getAll to return empty array (no children)
      const mockGetAllQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      
      mockGetAllQuery.select.mockResolvedValue({
        data: [],
        error: null
      });

      const mockDeleteQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      };

      mockSupabase.from
        .mockReturnValueOnce(mockGetAllQuery as any) // getAll call for children check
        .mockReturnValueOnce(mockDeleteQuery as any); // delete call

      const result = await menuApi.delete(mockMenuItem.id);

      expect(mockDeleteQuery.delete).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw error when deleting item with children', async () => {
      // Mock getAll to return children
      const mockGetAllQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      
      mockGetAllQuery.select.mockResolvedValue({
        data: [{ ...mockMenuItem, parent_id: mockMenuItem.id }],
        error: null
      });

      mockSupabase.from.mockReturnValue(mockGetAllQuery as any);

      await expect(menuApi.delete(mockMenuItem.id)).rejects.toThrow(MenuApiError);
    });
  });

  describe('bulkReorder', () => {
    it('should reorder multiple menu items', async () => {
      const reorderData = [
        { id: '123e4567-e89b-12d3-a456-426614174001', sort_order: 200 },
        { id: '123e4567-e89b-12d3-a456-426614174002', sort_order: 100 }
      ];

      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      };

      mockSupabase.from.mockReturnValue(mockUpdateQuery as any);

      const result = await menuApi.bulkReorder(reorderData);

      expect(mockUpdateQuery.update).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });

    it('should validate reorder data using Zod schema', async () => {
      const invalidData = [
        { id: 'invalid-uuid', sort_order: 100 }
      ];

      await expect(menuApi.bulkReorder(invalidData)).rejects.toThrow();
    });
  });

  describe('bulkToggle', () => {
    it('should toggle enabled status for multiple items', async () => {
      const toggleData = [
        { id: '123e4567-e89b-12d3-a456-426614174001', is_enabled: false },
        { id: '123e4567-e89b-12d3-a456-426614174002', is_enabled: true }
      ];

      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          error: null
        })
      };

      mockSupabase.from.mockReturnValue(mockUpdateQuery as any);

      const result = await menuApi.bulkToggle(toggleData);

      expect(mockUpdateQuery.update).toHaveBeenCalledTimes(2);
      expect(result).toBe(true);
    });
  });

  describe('getByType', () => {
    it('should fetch menu items by type with hierarchy', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      
      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockQuery.select.mockResolvedValue({
        data: [mockMenuItem],
        error: null
      });

      const result = await menuApi.getByType('main');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter disabled items by default', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      
      mockSupabase.from.mockReturnValue(mockQuery as any);
      mockQuery.select.mockResolvedValue({
        data: [mockMenuItem],
        error: null
      });

      await menuApi.getByType('main', { includeDisabled: false });

      expect(mockQuery.eq).toHaveBeenCalledWith('menu_type', 'main');
      expect(mockQuery.eq).toHaveBeenCalledWith('is_enabled', true);
    });
  });

  describe('getStats', () => {
    it('should return menu statistics', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({
          data: [
            { menu_type: 'main', is_enabled: true, visibility: 'public' },
            { menu_type: 'footer', is_enabled: false, visibility: 'authenticated' }
          ],
          error: null
        })
      };
      
      mockSupabase.from.mockReturnValue(mockQuery as any);

      const result = await menuApi.getStats();

      expect(result).toEqual({
        total_items: 2,
        enabled_items: 1,
        by_type: { main: 1, footer: 1, mobile: 0, admin: 0 },
        by_visibility: { public: 1, authenticated: 1, admin: 0, role_based: 0 }
      });
    });
  });

  describe('duplicate', () => {
    it('should duplicate a menu item', async () => {
      // Mock getById
      const mockGetByIdQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockMenuItem,
          error: null
        })
      };

      // Mock create operation
      const mockGetAllQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
      };
      
      mockGetAllQuery.select.mockResolvedValue({
        data: [],
        error: null
      });

      const mockCreateQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockMenuItem, title: 'Test Menu Item (Copy)' },
          error: null
        })
      };

      mockSupabase.from
        .mockReturnValueOnce(mockGetByIdQuery as any) // getById call
        .mockReturnValueOnce(mockGetAllQuery as any) // getAll for sort order
        .mockReturnValueOnce(mockCreateQuery as any); // create call

      const result = await menuApi.duplicate(mockMenuItem.id);

      expect(result).toBeTruthy();
      expect(result?.title).toBe('Test Menu Item (Copy)');
      expect(result?.is_enabled).toBe(false); // Should be disabled for safety
    });
  });

  describe('checkPermissions', () => {
    it('should return read-only permissions for anonymous users', async () => {
      const result = await menuApi.checkPermissions();

      expect(result).toEqual({
        canRead: true,
        canWrite: false,
        canDelete: false,
        canManageAll: false
      });
    });
  });

  describe('URL validation', () => {
    it('should accept valid relative URLs', () => {
      const { validateMenuItemUrl } = require('../menuAdapter');
      
      const result = validateMenuItemUrl('/about');
      expect(result.isValid).toBe(true);
    });

    it('should accept valid absolute URLs', () => {
      const { validateMenuItemUrl } = require('../menuAdapter');
      
      const result = validateMenuItemUrl('https://example.com');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const { validateMenuItemUrl } = require('../menuAdapter');
      
      const result = validateMenuItemUrl('invalid-url');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
});