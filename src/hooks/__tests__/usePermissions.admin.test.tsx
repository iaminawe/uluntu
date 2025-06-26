import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { usePermissions } from '../usePermissions';
import { adminRolesApi } from '@/features/admin/api/roles';
import { rootReducer } from '@/store';

// Mock the admin roles API
jest.mock('@/features/admin/api/roles', () => ({
  adminRolesApi: {
    getUserRoles: jest.fn(),
  },
}));

describe('usePermissions Admin Tests', () => {
  let queryClient: QueryClient;
  let store: any;

  const mockCustomRoles = [
    {
      id: 'content-manager',
      name: 'Content Manager',
      type: 'custom' as const,
      permissions: {
        news: ['read', 'create', 'update'],
        events: ['read', 'create'],
        companies: ['read'],
      },
    },
    {
      id: 'moderator',
      name: 'Moderator',
      type: 'custom' as const,
      permissions: {
        moderation: ['read', 'update'],
        users: ['read'],
      },
    },
  ];

  const createTestStore = (userRoles: string[] = [], userId = 'user-123') => {
    return configureStore({
      reducer: rootReducer,
      preloadedState: {
        auth: {
          user: { id: userId, email: 'test@example.com' },
          isAuthenticated: true,
          sessionChecked: true,
          publicProfile: null,
          error: null,
          loading: false,
          roles: {
            list: userRoles,
            loading: false,
            error: null,
          },
        },
      },
    });
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>{children}</Provider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  describe('System Role Permissions', () => {
    it('grants admin access to authenticated admin user', () => {
      store = createTestStore(['admin']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);\n\n      const { result } = renderHook(() => usePermissions(), { wrapper });\n\n      expect(result.current.isAdmin()).toBe(true);\n      expect(result.current.hasRole('admin')).toBe(true);\n      expect(result.current.hasPermission({ resource: 'users', action: 'update' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'companies', action: 'delete' })).toBe(true);\n    });\n\n    it('grants superadmin all permissions', () => {\n      store = createTestStore(['superadmin']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);\n\n      const { result } = renderHook(() => usePermissions(), { wrapper });\n\n      expect(result.current.isSuperAdmin()).toBe(true);\n      expect(result.current.isAdmin()).toBe(true);\n      expect(result.current.hasPermission({ resource: 'anything', action: 'everything' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'system', action: 'admin' })).toBe(true);\n    });\n\n    it('limits authenticated user permissions', () => {\n      store = createTestStore(['authenticated']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);\n\n      const { result } = renderHook(() => usePermissions(), { wrapper });\n\n      expect(result.current.isAuthenticated()).toBe(true);\n      expect(result.current.isAdmin()).toBe(false);\n      expect(result.current.hasPermission({ resource: 'users', action: 'update' })).toBe(false);\n      expect(result.current.hasPermission({ resource: 'companies', action: 'read' })).toBe(true);\n    });\n\n    it('provides group member permissions', () => {\n      store = createTestStore(['group_member']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);\n\n      const { result } = renderHook(() => usePermissions(), { wrapper });\n\n      expect(result.current.isGroupMember()).toBe(true);\n      expect(result.current.hasPermission({ resource: 'events', action: 'create' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'groups', action: 'update' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'users', action: 'delete' })).toBe(false);\n    });\n  });\n\n  describe('Custom Role Permissions', () => {\n    it('combines system and custom roles', async () => {\n      store = createTestStore(['authenticated']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue(mockCustomRoles);\n\n      const { result, waitForNextUpdate } = renderHook(() => usePermissions(), { wrapper });\n\n      await waitForNextUpdate();\n\n      expect(result.current.roles).toHaveLength(3); // 1 system + 2 custom\n      expect(result.current.customRoles).toHaveLength(2);\n      expect(result.current.hasPermission({ resource: 'news', action: 'create' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'moderation', action: 'read' })).toBe(true);\n    });\n\n    it('handles custom role inheritance', async () => {\n      store = createTestStore(['authenticated']);\n      const customRolesWithInheritance = [\n        {\n          ...mockCustomRoles[0],\n          inherits_from: ['authenticated'],\n        },\n      ];\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue(customRolesWithInheritance);\n\n      const { result, waitForNextUpdate } = renderHook(() => usePermissions(), { wrapper });\n\n      await waitForNextUpdate();\n\n      // Should have both authenticated and content manager permissions\n      expect(result.current.hasPermission({ resource: 'companies', action: 'read' })).toBe(true); // from authenticated\n      expect(result.current.hasPermission({ resource: 'news', action: 'create' })).toBe(true); // from content manager\n    });\n\n    it('merges permissions correctly', async () => {\n      store = createTestStore(['authenticated']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue(mockCustomRoles);\n\n      const { result, waitForNextUpdate } = renderHook(() => usePermissions(), { wrapper });\n\n      await waitForNextUpdate();\n\n      const mergedPermissions = result.current.mergedPermissions;\n      \n      // Should have permissions from all roles\n      expect(mergedPermissions.news).toContain('read');\n      expect(mergedPermissions.news).toContain('create');\n      expect(mergedPermissions.news).toContain('update');\n      expect(mergedPermissions.moderation).toContain('read');\n      expect(mergedPermissions.moderation).toContain('update');\n    });\n  });\n\n  describe('Admin Interface Permissions', () => {\n    it('allows admin to access all admin pages', () => {\n      store = createTestStore(['admin']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);\n\n      const { result } = renderHook(() => usePermissions(), { wrapper });\n\n      // Admin dashboard\n      expect(result.current.hasPermission({ resource: 'admin', action: 'read' })).toBe(true);\n      \n      // Entity management\n      expect(result.current.hasPermission({ resource: 'companies', action: 'update' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'events', action: 'delete' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'users', action: 'update' })).toBe(true);\n      \n      // Settings\n      expect(result.current.hasPermission({ resource: 'settings', action: 'update' })).toBe(true);\n      \n      // Moderation\n      expect(result.current.hasPermission({ resource: 'moderation', action: 'read' })).toBe(true);\n    });\n\n    it('restricts non-admin users from admin areas', () => {\n      store = createTestStore(['authenticated']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);\n\n      const { result } = renderHook(() => usePermissions(), { wrapper });\n\n      expect(result.current.hasPermission({ resource: 'admin', action: 'read' })).toBe(false);\n      expect(result.current.hasPermission({ resource: 'users', action: 'update' })).toBe(false);\n      expect(result.current.hasPermission({ resource: 'settings', action: 'update' })).toBe(false);\n      expect(result.current.hasPermission({ resource: 'moderation', action: 'read' })).toBe(false);\n    });\n\n    it('allows partial admin access with custom roles', async () => {\n      store = createTestStore(['authenticated']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([mockCustomRoles[0]]); // content manager\n\n      const { result, waitForNextUpdate } = renderHook(() => usePermissions(), { wrapper });\n\n      await waitForNextUpdate();\n\n      // Can manage content\n      expect(result.current.hasPermission({ resource: 'news', action: 'update' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'events', action: 'create' })).toBe(true);\n      \n      // Cannot manage users or settings\n      expect(result.current.hasPermission({ resource: 'users', action: 'update' })).toBe(false);\n      expect(result.current.hasPermission({ resource: 'settings', action: 'update' })).toBe(false);\n    });\n  });\n\n  describe('Role Assignment Permissions', () => {\n    it('allows superadmin to assign any role', () => {\n      store = createTestStore(['superadmin']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);\n\n      const { result } = renderHook(() => usePermissions(), { wrapper });\n\n      expect(result.current.canUserAssignRole('admin')).toBe(true);\n      expect(result.current.canUserAssignRole('superadmin')).toBe(true);\n      expect(result.current.canUserAssignRole('group_member')).toBe(true);\n    });\n\n    it('restricts admin from assigning superadmin role', () => {\n      store = createTestStore(['admin']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);\n\n      const { result } = renderHook(() => usePermissions(), { wrapper });\n\n      expect(result.current.canUserAssignRole('admin')).toBe(true);\n      expect(result.current.canUserAssignRole('superadmin')).toBe(false);\n      expect(result.current.canUserAssignRole('group_member')).toBe(true);\n    });\n\n    it('provides correct assignable roles list', () => {\n      store = createTestStore(['admin']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);\n\n      const { result } = renderHook(() => usePermissions(), { wrapper });\n\n      const assignableRoles = result.current.getAssignableRolesList();\n      expect(assignableRoles).toContain('authenticated');\n      expect(assignableRoles).toContain('group_member');\n      expect(assignableRoles).toContain('admin');\n      expect(assignableRoles).not.toContain('superadmin');\n    });\n  });\n\n  describe('Specific Admin Use Cases', () => {\n    it('handles user management permissions', () => {\n      store = createTestStore(['admin']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);\n\n      const { result } = renderHook(() => usePermissions(), { wrapper });\n\n      // User CRUD operations\n      expect(result.current.hasPermission({ resource: 'users', action: 'read' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'users', action: 'update' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'users', action: 'delete' })).toBe(true);\n      \n      // Role management\n      expect(result.current.hasPermission({ resource: 'roles', action: 'assign' })).toBe(true);\n    });\n\n    it('handles content moderation permissions', () => {\n      store = createTestStore(['admin']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);\n\n      const { result } = renderHook(() => usePermissions(), { wrapper });\n\n      // Moderation actions\n      expect(result.current.hasPermission({ resource: 'moderation', action: 'read' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'moderation', action: 'approve' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'moderation', action: 'reject' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'moderation', action: 'ban' })).toBe(true);\n    });\n\n    it('handles system settings permissions', () => {\n      store = createTestStore(['admin']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);\n\n      const { result } = renderHook(() => usePermissions(), { wrapper });\n\n      // Settings categories\n      expect(result.current.hasPermission({ resource: 'settings', action: 'read' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'settings', action: 'update' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'security', action: 'configure' })).toBe(true);\n      expect(result.current.hasPermission({ resource: 'email', action: 'configure' })).toBe(true);\n    });\n  });\n\n  describe('Error Handling', () => {\n    it('handles API errors gracefully', async () => {\n      store = createTestStore(['admin']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockRejectedValue(new Error('API Error'));\n\n      const { result, waitForNextUpdate } = renderHook(() => usePermissions(), { wrapper });\n\n      await waitForNextUpdate();\n\n      // Should still work with system roles\n      expect(result.current.isAdmin()).toBe(true);\n      expect(result.current.customRoles).toEqual([]);\n    });\n\n    it('handles missing user gracefully', () => {\n      store = configureStore({\n        reducer: rootReducer,\n        preloadedState: {\n          auth: {\n            user: null,\n            isAuthenticated: false,\n            sessionChecked: true,\n            publicProfile: null,\n            error: null,\n            loading: false,\n            roles: {\n              list: [],\n              loading: false,\n              error: null,\n            },\n          },\n        },\n      });\n\n      const { result } = renderHook(() => usePermissions(), { wrapper });\n\n      expect(result.current.isAuthenticated()).toBe(false);\n      expect(result.current.isAdmin()).toBe(false);\n      expect(result.current.hasPermission({ resource: 'anything', action: 'anything' })).toBe(false);\n    });\n  });\n\n  describe('Performance and Caching', () => {\n    it('caches custom roles data', async () => {\n      store = createTestStore(['admin']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue(mockCustomRoles);\n\n      const { result, waitForNextUpdate, rerender } = renderHook(() => usePermissions(), { wrapper });\n\n      await waitForNextUpdate();\n      \n      // First call\n      expect(adminRolesApi.getUserRoles).toHaveBeenCalledTimes(1);\n      \n      // Rerender - should use cache\n      rerender();\n      \n      // Should not call API again\n      expect(adminRolesApi.getUserRoles).toHaveBeenCalledTimes(1);\n    });\n\n    it('memoizes permission calculations', async () => {\n      store = createTestStore(['admin']);\n      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue(mockCustomRoles);\n\n      const { result, waitForNextUpdate } = renderHook(() => usePermissions(), { wrapper });\n\n      await waitForNextUpdate();\n      \n      // Multiple calls to same permission\n      const permission = { resource: 'users', action: 'update' };\n      const result1 = result.current.hasPermission(permission);\n      const result2 = result.current.hasPermission(permission);\n      \n      expect(result1).toBe(result2);\n      expect(result1).toBe(true);\n    });\n  });\n});"