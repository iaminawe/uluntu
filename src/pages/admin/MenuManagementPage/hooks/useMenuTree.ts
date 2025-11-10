/**
 * useMenuTree Hook
 * Manages menu hierarchy, filtering, and tree state
 */

import { useState, useMemo } from 'react';
import { MenuItem, MenuType, MenuVisibility } from '@/types/menu';
import { filterMenuItems, getMenuCounts, getParentOptions } from '../utils/menuHelpers';

interface UseMenuTreeProps {
  allMenuItems: MenuItem[];
  activeTab: MenuType;
}

export const useMenuTree = ({ allMenuItems, activeTab }: UseMenuTreeProps) => {
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<MenuVisibility | 'all'>('all');
  const [enabledFilter, setEnabledFilter] = useState<boolean | 'all'>('all');

  // Tree expansion state
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  /**
   * Get items for current tab with filters applied
   */
  const currentTabItems = useMemo(() => {
    const tabItems = allMenuItems.filter(item => item.menu_type === activeTab);
    return filterMenuItems(tabItems, searchTerm, visibilityFilter, enabledFilter);
  }, [allMenuItems, activeTab, searchTerm, visibilityFilter, enabledFilter]);

  /**
   * Get parent options for dropdown (excludes self and children when editing)
   */
  const getParentOptionsForItem = (editingItem?: MenuItem) => {
    return getParentOptions(allMenuItems, activeTab, editingItem);
  };

  /**
   * Get menu counts for all tabs
   */
  const menuCounts = useMemo(() => {
    return getMenuCounts(allMenuItems);
  }, [allMenuItems]);

  /**
   * Toggle item expansion
   */
  const handleToggleExpand = (item: MenuItem) => {
    setExpandedItems(prev => {
      if (prev.includes(item.id)) {
        return prev.filter(id => id !== item.id);
      } else {
        return [...prev, item.id];
      }
    });
  };

  /**
   * Get children for a menu item
   */
  const getItemChildren = (itemId: string): MenuItem[] => {
    return allMenuItems.filter(item => item.parent_id === itemId);
  };

  return {
    // Filter state
    searchTerm,
    setSearchTerm,
    visibilityFilter,
    setVisibilityFilter,
    enabledFilter,
    setEnabledFilter,

    // Tree state
    expandedItems,
    handleToggleExpand,

    // Computed data
    currentTabItems,
    menuCounts,
    getParentOptionsForItem,
    getItemChildren
  };
};
