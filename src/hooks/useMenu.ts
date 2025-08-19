// Menu Management React Hooks
// Custom hooks for menu operations with caching and state management

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { menuApi } from '../api/menuApi';
import type {
  MenuContainer,
  MenuItem,
  MenuPermission,
  MenuAuditLog,
  MenuItemTranslation,
  CreateMenuItemRequest,
  UpdateMenuItemRequest,
  ReorderMenuItemsRequest,
  MoveMenuItemRequest,
  DuplicateMenuItemRequest,
  GetMenuTreeRequest,
  MenuValidationIssue,
  MenuStats,
  MenuTreeNode,
  UseMenuTreeReturn,
  UseMenuItemReturn,
  UseMenuPermissionsReturn
} from '../types/menu';

// Query Keys
const MENU_QUERY_KEYS = {
  containers: ['menu-containers'],
  container: (id: string) => ['menu-container', id],
  items: (containerName?: string, parentId?: string) => ['menu-items', containerName, parentId],
  item: (id: string) => ['menu-item', id],
  tree: (request: GetMenuTreeRequest) => ['menu-tree', request],
  permissions: (itemId?: string, roleName?: string) => ['menu-permissions', itemId, roleName],
  auditLogs: (itemId?: string, userId?: string) => ['menu-audit-logs', itemId, userId],
  translations: (itemId: string) => ['menu-translations', itemId],
  stats: (containerId?: string) => ['menu-stats', containerId],
  validation: (containerId: string) => ['menu-validation', containerId]
};

// Hook for menu containers
export function useMenuContainers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MENU_QUERY_KEYS.containers,
    queryFn: menuApi.getMenuContainers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: menuApi.createMenuContainer,
    onSuccess: (newContainer) => {
      queryClient.setQueryData<MenuContainer[]>(
        MENU_QUERY_KEYS.containers,
        (old) => [...(old || []), newContainer]
      );
      toast.success('Menu container created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create container: ${error.message}`);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MenuContainer> }) =>
      menuApi.updateMenuContainer(id, updates),
    onSuccess: (updatedContainer) => {
      queryClient.setQueryData<MenuContainer[]>(
        MENU_QUERY_KEYS.containers,
        (old) => old?.map(c => c.id === updatedContainer.id ? updatedContainer : c) || []
      );
      toast.success('Menu container updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update container: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: menuApi.deleteMenuContainer,
    onSuccess: (_, id) => {
      queryClient.setQueryData<MenuContainer[]>(
        MENU_QUERY_KEYS.containers,
        (old) => old?.filter(c => c.id !== id) || []
      );
      toast.success('Menu container deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete container: ${error.message}`);
    }
  });

  return {
    containers: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    remove: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}

// Hook for menu tree with drag-and-drop support
export function useMenuTree(request: GetMenuTreeRequest = {}): UseMenuTreeReturn {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MENU_QUERY_KEYS.tree(request),
    queryFn: () => menuApi.getMenuTree(request),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const reorderMutation = useMutation({
    mutationFn: menuApi.reorderMenuItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.tree(request) });
      toast.success('Menu items reordered successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to reorder items: ${error.message}`);
    }
  });

  const moveMutation = useMutation({
    mutationFn: menuApi.moveMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.tree(request) });
      toast.success('Menu item moved successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to move item: ${error.message}`);
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: menuApi.duplicateMenuItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.tree(request) });
      toast.success('Menu item duplicated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to duplicate item: ${error.message}`);
    }
  });

  return {
    menuTree: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refresh: query.refetch,
    reorderItems: reorderMutation.mutate,
    moveItem: moveMutation.mutate,
    duplicateItem: duplicateMutation.mutateAsync
  };
}

// Hook for individual menu item management
export function useMenuItem(id?: string): UseMenuItemReturn {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MENU_QUERY_KEYS.item(id!),
    queryFn: () => menuApi.getMenuItem(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const saveMutation = useMutation({
    mutationFn: (data: CreateMenuItemRequest | UpdateMenuItemRequest) => {
      if ('id' in data) {
        return menuApi.updateMenuItem(data);
      } else {
        return menuApi.createMenuItem(data);
      }
    },
    onSuccess: (savedItem) => {
      // Update item cache
      queryClient.setQueryData(MENU_QUERY_KEYS.item(savedItem.id), savedItem);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['menu-tree'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      
      const action = 'id' in savedItem ? 'updated' : 'created';
      toast.success(`Menu item ${action} successfully`);
    },
    onError: (error: any) => {
      toast.error(`Failed to save menu item: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => menuApi.deleteMenuItem(id!),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: MENU_QUERY_KEYS.item(id!) });
      queryClient.invalidateQueries({ queryKey: ['menu-tree'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast.success('Menu item deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete menu item: ${error.message}`);
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (field: 'is_enabled' | 'is_visible') => 
      menuApi.toggleMenuItem(id!, field),
    onSuccess: (updatedItem, field) => {
      queryClient.setQueryData(MENU_QUERY_KEYS.item(id!), updatedItem);
      queryClient.invalidateQueries({ queryKey: ['menu-tree'] });
      const status = updatedItem[field] ? 'enabled' : 'disabled';
      toast.success(`Menu item ${status} successfully`);
    },
    onError: (error: any) => {
      toast.error(`Failed to toggle menu item: ${error.message}`);
    }
  });

  return {
    item: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
    save: saveMutation.mutate,
    remove: deleteMutation.mutate,
    toggle: toggleMutation.mutate
  };
}

// Hook for menu permissions management
export function useMenuPermissions(itemId: string): UseMenuPermissionsReturn {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MENU_QUERY_KEYS.permissions(itemId),
    queryFn: () => menuApi.getMenuPermissions(itemId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const saveMutation = useMutation({
    mutationFn: (permissions: Omit<MenuPermission, 'id' | 'created_at' | 'created_by'>[]) =>
      menuApi.saveMenuPermissions(itemId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.permissions(itemId) });
      toast.success('Menu permissions updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to save permissions: ${error.message}`);
    }
  });

  const checkPermission = useCallback((roleNames: string[]): boolean => {
    if (!query.data || roleNames.length === 0) return false;
    
    return query.data.some(permission => 
      roleNames.includes(permission.role_name) && permission.is_allowed
    );
  }, [query.data]);

  return {
    permissions: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    save: saveMutation.mutate,
    checkPermission
  };
}

// Hook for menu audit logs
export function useMenuAuditLogs(itemId?: string, userId?: string, limit = 50) {
  return useQuery({
    queryKey: MENU_QUERY_KEYS.auditLogs(itemId, userId),
    queryFn: () => menuApi.getMenuAuditLogs(itemId, userId, limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Hook for menu item translations
export function useMenuItemTranslations(itemId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MENU_QUERY_KEYS.translations(itemId),
    queryFn: () => menuApi.getMenuItemTranslations(itemId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const saveMutation = useMutation({
    mutationFn: menuApi.saveMenuItemTranslation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.translations(itemId) });
      queryClient.invalidateQueries({ queryKey: ['menu-tree'] });
      toast.success('Translation saved successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to save translation: ${error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: ({ languageCode }: { languageCode: string }) =>
      menuApi.deleteMenuItemTranslation(itemId, languageCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_QUERY_KEYS.translations(itemId) });
      toast.success('Translation deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete translation: ${error.message}`);
    }
  });

  return {
    translations: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    save: saveMutation.mutate,
    remove: deleteMutation.mutate
  };
}

// Hook for menu statistics
export function useMenuStats(containerId?: string) {
  return useQuery({
    queryKey: MENU_QUERY_KEYS.stats(containerId),
    queryFn: () => menuApi.getMenuStats(containerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for menu validation
export function useMenuValidation(containerId: string) {
  return useQuery({
    queryKey: MENU_QUERY_KEYS.validation(containerId),
    queryFn: () => menuApi.validateMenuStructure(containerId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for menu search
export function useMenuSearch() {
  const [query, setQuery] = useState('');
  const [containerName, setContainerName] = useState<string>();
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchQuery = useQuery({
    queryKey: ['menu-search', debouncedQuery, containerName],
    queryFn: () => menuApi.searchMenuItems(debouncedQuery, containerName),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  return {
    query,
    setQuery,
    containerName,
    setContainerName,
    results: searchQuery.data || [],
    isLoading: searchQuery.isLoading,
    error: searchQuery.error
  };
}

// Hook for bulk operations
export function useBulkMenuOperations() {
  const queryClient = useQueryClient();

  const bulkUpdateMutation = useMutation({
    mutationFn: menuApi.bulkUpdateMenuItems,
    onSuccess: (results) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['menu-tree'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      
      results.forEach(item => {
        queryClient.setQueryData(MENU_QUERY_KEYS.item(item.id), item);
      });

      toast.success(`${results.length} items updated successfully`);
    },
    onError: (error: any) => {
      toast.error(`Failed to bulk update items: ${error.message}`);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: menuApi.bulkDeleteMenuItems,
    onSuccess: (_, ids) => {
      // Remove items from cache
      ids.forEach(id => {
        queryClient.removeQueries({ queryKey: MENU_QUERY_KEYS.item(id) });
      });

      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['menu-tree'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });

      toast.success(`${ids.length} items deleted successfully`);
    },
    onError: (error: any) => {
      toast.error(`Failed to bulk delete items: ${error.message}`);
    }
  });

  return {
    bulkUpdate: bulkUpdateMutation.mutate,
    bulkDelete: bulkDeleteMutation.mutate,
    isBulkUpdating: bulkUpdateMutation.isPending,
    isBulkDeleting: bulkDeleteMutation.isPending
  };
}

// Hook for menu export
export function useMenuExport() {
  const exportMutation = useMutation({
    mutationFn: ({ containerName, includeDisabled }: { containerName: string; includeDisabled?: boolean }) =>
      menuApi.exportMenuStructure(containerName, includeDisabled),
    onSuccess: (data, { containerName }) => {
      // Create downloadable file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${containerName}-menu-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Menu exported successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to export menu: ${error.message}`);
    }
  });

  return {
    exportMenu: exportMutation.mutate,
    isExporting: exportMutation.isPending
  };
}