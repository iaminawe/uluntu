import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ReactNode } from 'react';
import { usePermissions } from '../usePermissions';
import * as adminRolesApi from '@/api/admin/roles';
import { rootReducer } from '@/redux/store';

// Mock the admin roles API
jest.mock('@/api/admin/roles');

const mockCustomRoles = [
  {
    id: '1',
    name: 'content_manager',
    display_name: 'Content Manager',
    description: 'Manages content and news',
    permissions: {
      news: ['read', 'create', 'update'],
      events: ['read', 'create', 'update'],
    },
    inherits_from: [],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'moderator',
    display_name: 'Moderator',
    description: 'Moderates user content',
    permissions: {
      moderation: ['read', 'update'],
      users: ['read'],
    },
    inherits_from: [],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

describe('usePermissions - Admin Functionality', () => {
  let store: ReturnType<typeof configureStore>;

  const createTestStore = (roles: string[] = []) => {
    return configureStore({
      reducer: rootReducer,
      preloadedState: {
        auth: {
          user: {
            id: '1',
            email: 'test@example.com',
            role: 'admin',
          },
          isAuthenticated: true,
          sessionChecked: true,
          publicProfile: null,
          error: null,
          loading: false,
          roles: {
            list: roles,
            loading: false,
            error: null,
          },
        },
      },
    });
  };

  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  beforeEach(() => {
    store = createTestStore(['admin']);
    jest.clearAllMocks();
  });

  describe('System Role Permissions', () => {
    it('grants admin access to authenticated admin user', () => {
      store = createTestStore(['admin']);
      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.isAdmin()).toBe(true);
      expect(result.current.hasRole('admin')).toBe(true);
      expect(result.current.hasPermission({ resource: 'users', action: 'update' })).toBe(true);
      expect(result.current.hasPermission({ resource: 'companies', action: 'delete' })).toBe(true);
    });

    it('grants superadmin all permissions', () => {
      store = createTestStore(['superadmin']);
      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.isSuperAdmin()).toBe(true);
      expect(result.current.isAdmin()).toBe(true);
      expect(result.current.hasPermission({ resource: 'anything', action: 'everything' })).toBe(true);
      expect(result.current.hasPermission({ resource: 'system', action: 'admin' })).toBe(true);
    });

    it('limits authenticated user permissions', () => {
      store = createTestStore(['authenticated']);
      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.isAuthenticated()).toBe(true);
      expect(result.current.isAdmin()).toBe(false);
      expect(result.current.hasPermission({ resource: 'users', action: 'update' })).toBe(false);
      expect(result.current.hasPermission({ resource: 'companies', action: 'read' })).toBe(true);
    });

    it('provides group member permissions', () => {
      store = createTestStore(['group_member']);
      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.isGroupMember()).toBe(true);
      expect(result.current.hasPermission({ resource: 'events', action: 'create' })).toBe(true);
      expect(result.current.hasPermission({ resource: 'groups', action: 'update' })).toBe(true);
      expect(result.current.hasPermission({ resource: 'users', action: 'delete' })).toBe(false);
    });
  });

  describe('Custom Role Permissions', () => {
    it('combines system and custom roles', async () => {
      store = createTestStore(['authenticated']);
      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue(mockCustomRoles);

      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => {
        expect(result.current.roles).toHaveLength(3); // 1 system + 2 custom
      });

      expect(result.current.customRoles).toHaveLength(2);
      expect(result.current.hasPermission({ resource: 'news', action: 'create' })).toBe(true);
      expect(result.current.hasPermission({ resource: 'moderation', action: 'read' })).toBe(true);
    });

    it('handles custom role inheritance', async () => {
      store = createTestStore(['authenticated']);
      const customRolesWithInheritance = [
        {
          ...mockCustomRoles[0],
          inherits_from: ['authenticated'],
        },
      ];
      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue(customRolesWithInheritance);

      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => {
        expect(result.current.hasPermission({ resource: 'companies', action: 'read' })).toBe(true);
      });

      expect(result.current.hasPermission({ resource: 'news', action: 'create' })).toBe(true);
    });
  });

  describe('Admin Interface Permissions', () => {
    it('allows admin to access all admin pages', () => {
      store = createTestStore(['admin']);
      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.hasPermission({ resource: 'admin', action: 'read' })).toBe(true);
      expect(result.current.hasPermission({ resource: 'companies', action: 'update' })).toBe(true);
      expect(result.current.hasPermission({ resource: 'events', action: 'delete' })).toBe(true);
      expect(result.current.hasPermission({ resource: 'users', action: 'update' })).toBe(true);
      expect(result.current.hasPermission({ resource: 'settings', action: 'update' })).toBe(true);
      expect(result.current.hasPermission({ resource: 'moderation', action: 'read' })).toBe(true);
    });

    it('restricts non-admin users from admin areas', () => {
      store = createTestStore(['authenticated']);
      (adminRolesApi.getUserRoles as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => usePermissions(), { wrapper });

      expect(result.current.hasPermission({ resource: 'admin', action: 'read' })).toBe(false);
      expect(result.current.hasPermission({ resource: 'users', action: 'update' })).toBe(false);
      expect(result.current.hasPermission({ resource: 'settings', action: 'update' })).toBe(false);
      expect(result.current.hasPermission({ resource: 'moderation', action: 'read' })).toBe(false);
    });
  });
});