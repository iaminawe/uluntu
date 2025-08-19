import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNavigation, useHeaderNavigation, useFooterNavigation } from '@/hooks/useNavigation';
import { NavigationProvider } from '@/providers/NavigationProvider';
import { useEnabledFeatures } from '@/hooks/useSettings';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useMenuItems } from '@/features/menu/contexts/MenuContext';

// Mock dependencies
vi.mock('@/hooks/useSettings');
vi.mock('@/shared/contexts/SessionContextWithRedux');
vi.mock('@/features/menu/contexts/MenuContext');

const mockUseEnabledFeatures = useEnabledFeatures as MockedFunction<typeof useEnabledFeatures>;
const mockUseSession = useSession as MockedFunction<typeof useSession>;
const mockUseMenuItems = useMenuItems as MockedFunction<typeof useMenuItems>;

describe('Navigation Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Default mock implementations
    mockUseEnabledFeatures.mockReturnValue({
      features: {
        dynamic_menu_system: { value: true, enabled: true },
        menu_caching: { value: true, enabled: true },
        role_based_menus: { value: true, enabled: true }
      },
      isFeatureEnabled: vi.fn().mockReturnValue(true),
      loading: false,
      error: null
    });
    
    mockUseSession.mockReturnValue({
      session: { id: 'test-session' },
      user: { id: 'test-user', roles: ['authenticated'], is_admin: false },
      loading: false,
      signOut: vi.fn(),
      signIn: vi.fn()
    });
    
    mockUseMenuItems.mockReturnValue({
      items: [],
      loading: false,
      error: null,
      refresh: vi.fn()
    });
  });

  describe('NavigationProvider', () => {
    it('should provide navigation context with default values', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NavigationProvider>{children}</NavigationProvider>
      );
      
      const { result } = renderHook(() => useNavigation(), { wrapper });
      
      expect(result.current).toBeDefined();
      expect(result.current.isDynamicEnabled).toBe(true);
      expect(result.current.headerNavLinks).toBeInstanceOf(Array);
      expect(result.current.footerNavLinks).toBeInstanceOf(Array);
      expect(result.current.mobileNavLinks).toBeInstanceOf(Array);
    });

    it('should fall back to static navigation when dynamic is disabled', () => {
      mockUseEnabledFeatures.mockReturnValue({
        features: {
          dynamic_menu_system: { value: false, enabled: false }
        },
        isFeatureEnabled: vi.fn().mockReturnValue(false),
        loading: false,
        error: null
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NavigationProvider>{children}</NavigationProvider>
      );
      
      const { result } = renderHook(() => useNavigation(), { wrapper });
      
      expect(result.current.isDynamicEnabled).toBe(false);
      expect(result.current.headerNavLinks.length).toBeGreaterThan(0);
    });

    it('should handle loading states properly', () => {
      mockUseMenuItems.mockReturnValue({
        items: [],
        loading: true,
        error: null,
        refresh: vi.fn()
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NavigationProvider>{children}</NavigationProvider>
      );
      
      const { result } = renderHook(() => useHeaderNavigation(), { wrapper });
      
      expect(result.current.loading).toBe(true);
      expect(result.current.navLinks).toHaveLength(0);
    });

    it('should handle error states with fallback navigation', () => {
      mockUseMenuItems.mockReturnValue({
        items: [],
        loading: false,
        error: 'Failed to load menu',
        refresh: vi.fn()
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NavigationProvider>{children}</NavigationProvider>
      );
      
      const { result } = renderHook(() => useHeaderNavigation(), { wrapper });
      
      expect(result.current.error).toBe('Failed to load menu');
      expect(result.current.navLinks.length).toBeGreaterThan(0); // Should fallback
    });
  });

  describe('Role-based filtering', () => {
    it('should filter menu items based on user roles', () => {
      // Mock menu items with different visibility requirements
      mockUseMenuItems.mockReturnValue({
        items: [
          {
            id: 'public-item',
            title: 'Public Item',
            url: '/public',
            visibility: 'public',
            menu_type: 'main',
            sort_order: 1,
            is_enabled: true,
            target: '_self',
            is_external: false
          },
          {
            id: 'admin-item',
            title: 'Admin Item',
            url: '/admin',
            visibility: 'admin',
            menu_type: 'main',
            sort_order: 2,
            is_enabled: true,
            target: '_self',
            is_external: false
          }
        ],
        loading: false,
        error: null,
        refresh: vi.fn()
      });

      // Mock regular user (not admin)
      mockUseSession.mockReturnValue({
        session: { id: 'test-session' },
        user: { id: 'test-user', roles: ['authenticated'], is_admin: false },
        loading: false,
        signOut: vi.fn(),
        signIn: vi.fn()
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NavigationProvider>{children}</NavigationProvider>
      );
      
      const { result } = renderHook(() => useHeaderNavigation(), { wrapper });
      
      // Should only see public item, not admin item
      expect(result.current.navLinks).toHaveLength(1);
      expect(result.current.navLinks[0].text).toBe('Public Item');
    });

    it('should show admin items to admin users', () => {
      mockUseMenuItems.mockReturnValue({
        items: [
          {
            id: 'public-item',
            title: 'Public Item',
            url: '/public',
            visibility: 'public',
            menu_type: 'main',
            sort_order: 1,
            is_enabled: true,
            target: '_self',
            is_external: false
          },
          {
            id: 'admin-item',
            title: 'Admin Item',
            url: '/admin',
            visibility: 'admin',
            menu_type: 'main',
            sort_order: 2,
            is_enabled: true,
            target: '_self',
            is_external: false
          }
        ],
        loading: false,
        error: null,
        refresh: vi.fn()
      });

      // Mock admin user
      mockUseSession.mockReturnValue({
        session: { id: 'test-session' },
        user: { id: 'test-user', roles: ['authenticated', 'admin'], is_admin: true },
        loading: false,
        signOut: vi.fn(),
        signIn: vi.fn()
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NavigationProvider>{children}</NavigationProvider>
      );
      
      const { result } = renderHook(() => useHeaderNavigation(), { wrapper });
      
      // Should see both public and admin items
      expect(result.current.navLinks).toHaveLength(2);
    });
  });

  describe('Feature flag filtering', () => {
    it('should filter menu items based on feature flags', () => {
      mockUseMenuItems.mockReturnValue({
        items: [
          {
            id: 'enabled-item',
            title: 'Enabled Item',
            url: '/enabled',
            visibility: 'public',
            feature_flag: 'enabled_feature',
            menu_type: 'main',
            sort_order: 1,
            is_enabled: true,
            target: '_self',
            is_external: false
          },
          {
            id: 'disabled-item',
            title: 'Disabled Item',
            url: '/disabled',
            visibility: 'public',
            feature_flag: 'disabled_feature',
            menu_type: 'main',
            sort_order: 2,
            is_enabled: true,
            target: '_self',
            is_external: false
          }
        ],
        loading: false,
        error: null,
        refresh: vi.fn()
      });

      // Mock feature flags
      mockUseEnabledFeatures.mockReturnValue({
        features: {
          enabled_feature: { value: true, enabled: true },
          disabled_feature: { value: false, enabled: false }
        },
        isFeatureEnabled: vi.fn().mockImplementation((feature: string) => {
          return feature === 'enabled_feature' || feature === 'dynamic_menu_system';
        }),
        loading: false,
        error: null
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NavigationProvider>{children}</NavigationProvider>
      );
      
      const { result } = renderHook(() => useHeaderNavigation(), { wrapper });
      
      // Should only see enabled item
      expect(result.current.navLinks).toHaveLength(1);
      expect(result.current.navLinks[0].text).toBe('Enabled Item');
    });
  });

  describe('Backward compatibility', () => {
    it('should maintain backward compatibility with static nav links', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NavigationProvider>{children}</NavigationProvider>
      );
      
      const { result } = renderHook(() => useNavigation(), { wrapper });
      
      // Should provide default navigation structure
      expect(result.current.headerNavLinks).toContain(
        expect.objectContaining({ text: expect.stringMatching(/Community|Business|Resources|About/) })
      );
    });

    it('should handle missing navigation gracefully', () => {
      mockUseMenuItems.mockReturnValue({
        items: [],
        loading: false,
        error: 'Network error',
        refresh: vi.fn()
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NavigationProvider>{children}</NavigationProvider>
      );
      
      const { result } = renderHook(() => useHeaderNavigation(), { wrapper });
      
      // Should fallback to default navigation
      expect(result.current.navLinks.length).toBeGreaterThan(0);
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('Caching behavior', () => {
    it('should refresh navigation when requested', () => {
      const mockRefresh = vi.fn();
      mockUseMenuItems.mockReturnValue({
        items: [],
        loading: false,
        error: null,
        refresh: mockRefresh
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <NavigationProvider>{children}</NavigationProvider>
      );
      
      const { result } = renderHook(() => useHeaderNavigation(), { wrapper });
      
      result.current.refresh();
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Navigation Performance', () => {
  it('should not cause excessive re-renders', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <NavigationProvider>{children}</NavigationProvider>
    );
    
    const { result, rerender } = renderHook(() => useNavigation(), { wrapper });
    
    const initialResult = result.current;
    rerender();
    
    // Navigation context should be stable
    expect(result.current.refreshNavigation).toBe(initialResult.refreshNavigation);
  });
});