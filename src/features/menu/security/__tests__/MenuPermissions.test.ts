// Menu Permissions Security Tests
// Comprehensive test suite for menu security implementation

import { MenuSecurity, MenuPermissionContext, MENU_SECURITY_RULES } from '../MenuPermissions';
import { MenuItem } from '@/types/menu';

describe('MenuSecurity', () => {
  const mockContext: MenuPermissionContext = {
    userId: 'test-user-id',
    userRoles: ['admin'],
    sessionId: 'test-session',
    ipAddress: '127.0.0.1'
  };

  const mockMenuItem: MenuItem = {
    id: 'test-item',
    title: 'Test Menu Item',
    url: '/test',
    description: 'Test item',
    menu_type: 'main',
    parent_id: null,
    sort_order: 1,
    is_enabled: true,
    target: '_self',
    icon: null,
    css_classes: null,
    visibility: 'public',
    required_roles: null,
    is_external: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkPermission', () => {
    test('should allow admin to read menu management', async () => {
      const result = await MenuSecurity.checkPermission(
        mockContext,
        'menu_management',
        'read'
      );

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    test('should deny non-admin from deleting menu items', async () => {
      const nonAdminContext = {
        ...mockContext,
        userRoles: ['user']
      };

      const result = await MenuSecurity.checkPermission(
        nonAdminContext,
        'menu_item',
        'delete',
        mockMenuItem
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    test('should allow superadmin all permissions', async () => {
      const superAdminContext = {
        ...mockContext,
        userRoles: ['superadmin']
      };

      const result = await MenuSecurity.checkPermission(
        superAdminContext,
        'menu_item',
        'manage_permissions'
      );

      expect(result.allowed).toBe(true);
    });

    test('should check cascading permissions for child items', async () => {
      const childItem = {
        ...mockMenuItem,
        id: 'child-item',
        parent_id: 'parent-item',
        visibility: 'admin' as const
      };

      // Mock the parent permission check
      jest.spyOn(MenuSecurity as any, 'checkParentPermissions')
        .mockResolvedValue({ allowed: false, reason: 'Parent restricted' });

      const result = await MenuSecurity.checkPermission(
        mockContext,
        'menu_item',
        'delete',
        childItem
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Parent item restrictions');
    });
  });

  describe('filterMenuItemsByPermissions', () => {
    const testUser = { id: 'test-user', email: 'test@example.com' };

    test('should filter public items correctly', () => {
      const items = [
        { ...mockMenuItem, visibility: 'public' },
        { ...mockMenuItem, id: 'item2', visibility: 'admin' },
        { ...mockMenuItem, id: 'item3', visibility: 'authenticated' }
      ] as MenuItem[];

      const filtered = MenuSecurity.filterMenuItemsByPermissions(
        items,
        { ...mockContext, userRoles: [] },
        testUser
      );

      expect(filtered).toHaveLength(2); // public + authenticated
      expect(filtered[0].visibility).toBe('public');
      expect(filtered[1].visibility).toBe('authenticated');
    });

    test('should filter admin items for admin users', () => {
      const items = [
        { ...mockMenuItem, visibility: 'public' },
        { ...mockMenuItem, id: 'item2', visibility: 'admin' }
      ] as MenuItem[];

      const filtered = MenuSecurity.filterMenuItemsByPermissions(
        items,
        mockContext,
        testUser
      );

      expect(filtered).toHaveLength(2);
    });

    test('should filter role-based items correctly', () => {
      const items = [
        {
          ...mockMenuItem,
          visibility: 'role_based',
          required_roles: ['editor', 'admin']
        }
      ] as MenuItem[];

      const filtered = MenuSecurity.filterMenuItemsByPermissions(
        items,
        mockContext,
        testUser
      );

      expect(filtered).toHaveLength(1);
    });

    test('should handle unauthenticated users', () => {
      const items = [
        { ...mockMenuItem, visibility: 'public' },
        { ...mockMenuItem, id: 'item2', visibility: 'authenticated' }
      ] as MenuItem[];

      const filtered = MenuSecurity.filterMenuItemsByPermissions(
        items,
        mockContext,
        undefined
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].visibility).toBe('public');
    });
  });

  describe('validateMenuItemSecurity', () => {
    test('should validate safe menu items', () => {
      const safeItem = {
        title: 'Safe Item',
        url: '/safe-path',
        visibility: 'public',
        is_external: false
      };

      const result = MenuSecurity.validateMenuItemSecurity(safeItem, mockContext);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject admin-only items for non-superadmin', () => {
      const adminItem = {
        title: 'Admin Item',
        url: '/admin',
        visibility: 'admin'
      };

      const nonSuperAdminContext = {
        ...mockContext,
        userRoles: ['admin'] // admin but not superadmin
      };

      const result = MenuSecurity.validateMenuItemSecurity(adminItem, nonSuperAdminContext);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Only super administrators can create admin-only menu items');
    });

    test('should reject unsafe URLs', () => {
      const unsafeItem = {
        title: 'Unsafe Item',
        url: 'javascript:alert("xss")',
        visibility: 'public'
      };

      const result = MenuSecurity.validateMenuItemSecurity(unsafeItem, mockContext);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('URL appears to be unsafe or suspicious');
    });

    test('should require roles for role-based visibility', () => {
      const roleBasedItem = {
        title: 'Role Item',
        url: '/role-based',
        visibility: 'role_based',
        required_roles: []
      };

      const result = MenuSecurity.validateMenuItemSecurity(roleBasedItem, mockContext);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Role-based menu items must specify required roles');
    });

    test('should validate external links', () => {
      const externalItem = {
        title: 'External Item',
        url: 'https://example.com',
        visibility: 'public',
        is_external: true,
        target: '_self' // Should be _blank for external
      };

      const result = MenuSecurity.validateMenuItemSecurity(externalItem, mockContext);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('External links should open in a new window for security');
    });
  });

  describe('validateBulkOperation', () => {
    test('should validate bulk operations with proper permissions', async () => {
      const items = [
        mockMenuItem,
        { ...mockMenuItem, id: 'item2' }
      ] as MenuItem[];

      const result = await MenuSecurity.validateBulkOperation(
        'update',
        items,
        mockContext
      );

      expect(result.allowed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject bulk operations without permission', async () => {
      const nonAdminContext = {
        ...mockContext,
        userRoles: ['user']
      };

      const items = [mockMenuItem] as MenuItem[];

      const result = await MenuSecurity.validateBulkOperation(
        'delete',
        items,
        nonAdminContext
      );

      expect(result.allowed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Security Rules Configuration', () => {
    test('should have all required security rules defined', () => {
      const requiredRules = [
        'menu_management:read',
        'menu_item:create',
        'menu_item:update',
        'menu_item:delete',
        'menu_item:manage_visibility',
        'menu_item:manage_permissions',
        'menu_audit_logs:view_audit_logs',
        'menu_items:bulk_operations'
      ];

      const definedRules = MENU_SECURITY_RULES.map(rule => 
        `${rule.resource}:${rule.action}`
      );

      requiredRules.forEach(requiredRule => {
        expect(definedRules).toContain(requiredRule);
      });
    });

    test('should have proper role hierarchies', () => {
      const deleteRule = MENU_SECURITY_RULES.find(
        rule => rule.action === 'delete' && rule.resource === 'menu_item'
      );

      expect(deleteRule).toBeDefined();
      expect(deleteRule?.requiredRoles).toContain('admin');
      expect(deleteRule?.requiredRoles).toContain('superadmin');
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing menu item gracefully', async () => {
      const result = await MenuSecurity.checkPermission(
        mockContext,
        'menu_item',
        'read',
        undefined
      );

      // Should still check permission even without specific item
      expect(result).toBeDefined();
      expect(typeof result.allowed).toBe('boolean');
    });

    test('should handle empty user roles', async () => {
      const emptyRoleContext = {
        ...mockContext,
        userRoles: []
      };

      const result = await MenuSecurity.checkPermission(
        emptyRoleContext,
        'menu_management',
        'read'
      );

      expect(result.allowed).toBe(false);
    });

    test('should handle undefined URL validation', () => {
      const itemWithoutUrl = {
        title: 'No URL Item',
        visibility: 'public'
      };

      const result = MenuSecurity.validateMenuItemSecurity(itemWithoutUrl, mockContext);

      // Should be valid if URL is not required
      expect(result.valid).toBe(true);
    });
  });
});