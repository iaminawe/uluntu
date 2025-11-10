/**
 * useMenuData Hook
 * Handles data fetching and security context for menu management
 */

import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useAppSelector } from '@/store/hooks';
import { useMenuSecurity } from '@/features/menu/hooks/useMenuSecurity';
import { createSecureMenuApi, SecureMenuApiContext } from '@/features/menu/api/secureMenuApi';

export const useMenuData = () => {
  const { user } = useSession();
  const authState = useAppSelector(state => state.auth);
  const userRoles = authState.roles.list;
  const menuSecurity = useMenuSecurity();

  // Create secure API context
  const secureApiContext: SecureMenuApiContext = {
    userId: user?.id || '',
    userEmail: user?.email || '',
    userRoles: userRoles,
    sessionId: sessionStorage.getItem('session_id') || undefined,
    ipAddress: localStorage.getItem('client_ip') || undefined
  };

  const secureMenuApi = createSecureMenuApi(secureApiContext);

  // Permission check
  const hasAdminAccess = menuSecurity.canReadMenus &&
    (userRoles?.includes('superadmin') ||
     userRoles?.includes('admin') ||
     userRoles?.includes('menu_manager'));

  // Fetch menu items with security
  const { data: menuResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['secure-menu-items'],
    queryFn: async () => {
      const result = await secureMenuApi.getMenuItems();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch menu items');
      }
      return result.data || [];
    },
    enabled: hasAdminAccess
  });

  const allMenuItems = menuResponse || [];

  return {
    allMenuItems,
    isLoading,
    error,
    refetch,
    hasAdminAccess,
    userRoles,
    menuSecurity,
    secureMenuApi
  };
};
