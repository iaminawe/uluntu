import { renderHook } from '@testing-library/react';
import { usePermissions } from '../usePermissions';
import { getEffectiveRoles, getMergedPermissions } from '@/utils/roleInheritance';

// Mock dependencies
jest.mock('@/app/hooks', () => ({
  useAppSelector: jest.fn()
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn()
}));

jest.mock('@/utils/roleInheritance', () => ({
  getEffectiveRoles: jest.fn(),
  getMergedPermissions: jest.fn(),
  canAssignRole: jest.fn(),
  getAssignableRoles: jest.fn()
}));

const mockUseAppSelector = require('@/app/hooks').useAppSelector;
const mockUseQuery = require('@tanstack/react-query').useQuery;
const mockGetEffectiveRoles = getEffectiveRoles as jest.MockedFunction<typeof getEffectiveRoles>;
const mockGetMergedPermissions = getMergedPermissions as jest.MockedFunction<typeof getMergedPermissions>;

describe('usePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockUseAppSelector.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      roles: { list: ['authenticated'], loading: false }
    });
    
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false
    });
    
    mockGetEffectiveRoles.mockReturnValue(['authenticated']);
    mockGetMergedPermissions.mockReturnValue({
      members: ['read'],
      groups: ['read']
    });
  });

  it('should return user authentication status', () => {
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.isAuthenticated()).toBe(true);
  });

  it('should check roles correctly with inheritance', () => {
    mockGetEffectiveRoles.mockReturnValue(['authenticated', 'group_member']);
    
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasRole('authenticated')).toBe(true);
    expect(result.current.hasRole('group_member')).toBe(true);
    expect(result.current.hasRole('admin')).toBe(false);
  });

  it('should check permissions correctly', () => {
    mockGetMergedPermissions.mockReturnValue({
      members: ['read', 'update'],
      events: ['create']
    });
    
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasPermission({ resource: 'members', action: 'read' })).toBe(true);
    expect(result.current.hasPermission({ resource: 'members', action: 'update' })).toBe(true);
    expect(result.current.hasPermission({ resource: 'members', action: 'delete' })).toBe(false);
    expect(result.current.hasPermission({ resource: 'events', action: 'create' })).toBe(true);
  });

  it('should grant all permissions to superadmin', () => {
    mockGetEffectiveRoles.mockReturnValue(['superadmin', 'admin', 'group_member', 'authenticated']);
    
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasPermission({ resource: 'any', action: 'any' })).toBe(true);
    expect(result.current.isSuperAdmin()).toBe(true);
  });

  it('should handle multiple role checks', () => {
    mockGetEffectiveRoles.mockReturnValue(['authenticated', 'group_member']);
    
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasAnyRole(['admin', 'group_member'])).toBe(true);
    expect(result.current.hasAnyRole(['admin', 'superadmin'])).toBe(false);
    expect(result.current.hasAllRoles(['authenticated', 'group_member'])).toBe(true);
    expect(result.current.hasAllRoles(['authenticated', 'admin'])).toBe(false);
  });

  it('should handle wildcard permissions', () => {
    mockGetMergedPermissions.mockReturnValue({
      '*': ['*']
    });
    
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasPermission({ resource: 'anything', action: 'anything' })).toBe(true);
  });

  it('should handle resource-specific wildcard permissions', () => {
    mockGetMergedPermissions.mockReturnValue({
      members: ['*'],
      events: ['read']
    });
    
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.hasPermission({ resource: 'members', action: 'anything' })).toBe(true);
    expect(result.current.hasPermission({ resource: 'events', action: 'read' })).toBe(true);
    expect(result.current.hasPermission({ resource: 'events', action: 'create' })).toBe(false);
  });

  it('should return correct admin status', () => {
    mockGetEffectiveRoles.mockReturnValue(['admin', 'group_member', 'authenticated']);
    
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.isAdmin()).toBe(true);
    expect(result.current.isSuperAdmin()).toBe(false);
  });

  it('should handle unauthenticated users', () => {
    mockUseAppSelector.mockReturnValue({
      user: null,
      roles: { list: [], loading: false }
    });
    
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.isAuthenticated()).toBe(false);
    expect(result.current.hasPermission({ resource: 'members', action: 'read' })).toBe(false);
  });

  it('should handle loading state', () => {
    mockUseAppSelector.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      roles: { list: ['authenticated'], loading: true }
    });
    
    const { result } = renderHook(() => usePermissions());
    
    expect(result.current.isLoading).toBe(true);
  });
});