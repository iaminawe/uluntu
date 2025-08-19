// Test suite for menu adapter utilities
import {
  adaptMenuItemFromDatabase,
  adaptMenuItemToSupabaseInsert,
  adaptMenuItemToSupabaseUpdate,
  buildMenuHierarchy,
  flattenMenuHierarchy,
  filterMenuItemsByVisibility,
  getNextSortOrder,
  validateMenuItemUrl,
  generateMenuBreadcrumbs
} from '../menuAdapter';
import { MenuItem, MenuItemInput, MenuItemDatabaseRow } from '@/types/menu';

describe('Menu Adapter', () => {
  const mockDatabaseRow: MenuItemDatabaseRow = {
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
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z'
  };

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

  describe('adaptMenuItemFromDatabase', () => {
    it('should adapt database row to frontend MenuItem', () => {
      const result = adaptMenuItemFromDatabase(mockDatabaseRow);

      expect(result).toMatchObject({
        id: mockDatabaseRow.id,
        title: mockDatabaseRow.title,
        url: mockDatabaseRow.url,
        description: mockDatabaseRow.description,
        menu_type: mockDatabaseRow.menu_type,
        sort_order: mockDatabaseRow.sort_order,
        is_enabled: mockDatabaseRow.is_enabled,
        target: mockDatabaseRow.target,
        visibility: mockDatabaseRow.visibility,
        is_external: mockDatabaseRow.is_external,
        children: []
      });
    });

    it('should handle null values correctly', () => {
      const rowWithNulls: MenuItemDatabaseRow = {
        ...mockDatabaseRow,
        description: null,
        icon: null,
        css_classes: null,
        required_roles: null,
        created_at: null,
        updated_at: null
      };

      const result = adaptMenuItemFromDatabase(rowWithNulls);

      expect(result.description).toBeUndefined();
      expect(result.icon).toBeUndefined();
      expect(result.css_classes).toBeUndefined();
      expect(result.required_roles).toBeUndefined();
    });
  });

  describe('adaptMenuItemToSupabaseInsert', () => {
    const mockInput: MenuItemInput = {
      title: 'New Menu Item',
      url: '/new',
      description: 'New description',
      menu_type: 'main',
      sort_order: 200,
      is_enabled: true,
      target: '_blank',
      visibility: 'authenticated'
    };

    it('should adapt MenuItemInput for database insert', () => {
      const result = adaptMenuItemToSupabaseInsert(mockInput);

      expect(result).toMatchObject({
        title: mockInput.title,
        url: mockInput.url,
        description: mockInput.description,
        menu_type: mockInput.menu_type,
        sort_order: mockInput.sort_order,
        is_enabled: mockInput.is_enabled,
        target: mockInput.target,
        visibility: mockInput.visibility,
        status: 'published',
        featured: false
      });
    });

    it('should apply default values', () => {
      const minimalInput: MenuItemInput = {
        title: 'Minimal Item',
        url: '/minimal',
        menu_type: 'main'
      };

      const result = adaptMenuItemToSupabaseInsert(minimalInput);

      expect(result.sort_order).toBe(0);
      expect(result.is_enabled).toBe(true);
      expect(result.target).toBe('_self');
      expect(result.visibility).toBe('public');
      expect(result.is_external).toBe(false);
    });
  });

  describe('adaptMenuItemToSupabaseUpdate', () => {
    it('should adapt partial updates correctly', () => {
      const updates = {
        title: 'Updated Title',
        is_enabled: false
      };

      const result = adaptMenuItemToSupabaseUpdate(updates);

      expect(result).toEqual({
        title: 'Updated Title',
        is_enabled: false
      });
    });

    it('should handle undefined values correctly', () => {
      const updates = {
        title: 'Updated Title',
        description: undefined,
        sort_order: 300
      };

      const result = adaptMenuItemToSupabaseUpdate(updates);

      expect(result).toEqual({
        title: 'Updated Title',
        sort_order: 300
      });
      expect('description' in result).toBe(false);
    });
  });

  describe('buildMenuHierarchy', () => {
    it('should build hierarchical structure from flat array', () => {
      const flatItems: MenuItem[] = [
        {
          ...mockMenuItem,
          id: 'parent-1',
          title: 'Parent 1',
          sort_order: 100
        },
        {
          ...mockMenuItem,
          id: 'child-1-1',
          title: 'Child 1.1',
          parent_id: 'parent-1',
          sort_order: 110
        },
        {
          ...mockMenuItem,
          id: 'child-1-2',
          title: 'Child 1.2',
          parent_id: 'parent-1',
          sort_order: 120
        },
        {
          ...mockMenuItem,
          id: 'parent-2',
          title: 'Parent 2',
          sort_order: 200
        }
      ];

      const result = buildMenuHierarchy(flatItems);

      expect(result).toHaveLength(2); // Two root items
      expect(result[0].title).toBe('Parent 1');
      expect(result[0].children).toHaveLength(2);
      expect(result[0].children![0].title).toBe('Child 1.1');
      expect(result[0].children![1].title).toBe('Child 1.2');
      expect(result[1].title).toBe('Parent 2');
      expect(result[1].children).toHaveLength(0);
    });

    it('should sort items by sort_order', () => {
      const flatItems: MenuItem[] = [
        {
          ...mockMenuItem,
          id: 'item-3',
          title: 'Third',
          sort_order: 300
        },
        {
          ...mockMenuItem,
          id: 'item-1',
          title: 'First',
          sort_order: 100
        },
        {
          ...mockMenuItem,
          id: 'item-2',
          title: 'Second',
          sort_order: 200
        }
      ];

      const result = buildMenuHierarchy(flatItems);

      expect(result[0].title).toBe('First');
      expect(result[1].title).toBe('Second');
      expect(result[2].title).toBe('Third');
    });
  });

  describe('flattenMenuHierarchy', () => {
    it('should flatten hierarchical structure to flat array', () => {
      const hierarchicalItems: MenuItem[] = [
        {
          ...mockMenuItem,
          id: 'parent-1',
          title: 'Parent 1',
          children: [
            {
              ...mockMenuItem,
              id: 'child-1-1',
              title: 'Child 1.1',
              children: []
            }
          ]
        }
      ];

      const result = flattenMenuHierarchy(hierarchicalItems);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Parent 1');
      expect(result[0].children).toEqual([]);
      expect(result[1].title).toBe('Child 1.1');
      expect(result[1].parent_id).toBe('parent-1');
    });
  });

  describe('filterMenuItemsByVisibility', () => {
    const testItems: MenuItem[] = [
      { ...mockMenuItem, id: '1', title: 'Public', visibility: 'public' },
      { ...mockMenuItem, id: '2', title: 'Authenticated', visibility: 'authenticated' },
      { ...mockMenuItem, id: '3', title: 'Admin', visibility: 'admin' },
      { ...mockMenuItem, id: '4', title: 'Role Based', visibility: 'role_based', required_roles: ['editor'] }
    ];

    it('should show public items to anonymous users', () => {
      const result = filterMenuItemsByVisibility(testItems, [], false);
      
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Public');
    });

    it('should show public and authenticated items to authenticated users', () => {
      const result = filterMenuItemsByVisibility(testItems, [], true);
      
      expect(result).toHaveLength(2);
      expect(result.map(item => item.title)).toEqual(['Public', 'Authenticated']);
    });

    it('should show admin items to admin users', () => {
      const result = filterMenuItemsByVisibility(testItems, ['admin'], true);
      
      expect(result).toHaveLength(3);
      expect(result.map(item => item.title)).toEqual(['Public', 'Authenticated', 'Admin']);
    });

    it('should show role-based items to users with required roles', () => {
      const result = filterMenuItemsByVisibility(testItems, ['editor'], true);
      
      expect(result).toHaveLength(3);
      expect(result.map(item => item.title)).toEqual(['Public', 'Authenticated', 'Role Based']);
    });
  });

  describe('getNextSortOrder', () => {
    const testItems: MenuItem[] = [
      { ...mockMenuItem, id: '1', menu_type: 'main', sort_order: 100 },
      { ...mockMenuItem, id: '2', menu_type: 'main', sort_order: 200 },
      { ...mockMenuItem, id: '3', menu_type: 'footer', sort_order: 50 }
    ];

    it('should return next sort order for menu type', () => {
      const result = getNextSortOrder(testItems, 'main');
      
      expect(result).toBe(300); // Max main sort_order (200) + 100
    });

    it('should return 0 for empty menu type', () => {
      const result = getNextSortOrder(testItems, 'mobile');
      
      expect(result).toBe(0);
    });

    it('should consider parent_id when calculating sort order', () => {
      const itemsWithParents: MenuItem[] = [
        { ...mockMenuItem, id: '1', menu_type: 'main', parent_id: 'parent-1', sort_order: 100 },
        { ...mockMenuItem, id: '2', menu_type: 'main', parent_id: 'parent-1', sort_order: 200 },
        { ...mockMenuItem, id: '3', menu_type: 'main', parent_id: null, sort_order: 50 }
      ];

      const result = getNextSortOrder(itemsWithParents, 'main', 'parent-1');
      
      expect(result).toBe(300); // Max for parent-1 children (200) + 100
    });
  });

  describe('validateMenuItemUrl', () => {
    it('should accept valid relative URLs', () => {
      const result = validateMenuItemUrl('/about');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid absolute URLs', () => {
      const result = validateMenuItemUrl('https://example.com/page');
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid URL formats', () => {
      const result = validateMenuItemUrl('not-a-valid-url');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should accept URLs with protocols', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'mailto:test@example.com',
        'tel:+1234567890'
      ];

      validUrls.forEach(url => {
        const result = validateMenuItemUrl(url);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('generateMenuBreadcrumbs', () => {
    const hierarchicalMenu: MenuItem[] = [
      {
        ...mockMenuItem,
        id: 'products',
        title: 'Products',
        url: '/products',
        children: [
          {
            ...mockMenuItem,
            id: 'software',
            title: 'Software',
            url: '/products/software',
            children: [
              {
                ...mockMenuItem,
                id: 'web-apps',
                title: 'Web Apps',
                url: '/products/software/web-apps',
                children: []
              }
            ]
          },
          {
            ...mockMenuItem,
            id: 'hardware',
            title: 'Hardware',
            url: '/products/hardware',
            children: []
          }
        ]
      },
      {
        ...mockMenuItem,
        id: 'about',
        title: 'About',
        url: '/about',
        children: []
      }
    ];

    it('should generate breadcrumbs for nested path', () => {
      const breadcrumbs = generateMenuBreadcrumbs(hierarchicalMenu, '/products/software/web-apps');
      
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0].title).toBe('Products');
      expect(breadcrumbs[1].title).toBe('Software');
      expect(breadcrumbs[2].title).toBe('Web Apps');
    });

    it('should generate breadcrumbs for top-level path', () => {
      const breadcrumbs = generateMenuBreadcrumbs(hierarchicalMenu, '/about');
      
      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs[0].title).toBe('About');
    });

    it('should return empty array for non-existent path', () => {
      const breadcrumbs = generateMenuBreadcrumbs(hierarchicalMenu, '/non-existent');
      
      expect(breadcrumbs).toHaveLength(0);
    });

    it('should generate breadcrumbs for middle-level path', () => {
      const breadcrumbs = generateMenuBreadcrumbs(hierarchicalMenu, '/products/software');
      
      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs[0].title).toBe('Products');
      expect(breadcrumbs[1].title).toBe('Software');
    });
  });
});