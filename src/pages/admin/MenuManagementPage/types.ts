/**
 * Menu Management Types
 * Local type definitions for the menu management page
 */

import { MenuItem, MenuType, MenuVisibility } from '@/types/menu';

export interface TabPanelProps {
  activeTab: MenuType;
  onTabChange: (tab: MenuType) => void;
  menuCounts: Record<MenuType, number>;
}

export interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  visibilityFilter: MenuVisibility | 'all';
  onVisibilityFilterChange: (visibility: MenuVisibility | 'all') => void;
  enabledFilter: boolean | 'all';
  onEnabledFilterChange: (enabled: boolean | 'all') => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggleEnabled: (item: MenuItem, enabled: boolean) => void;
  onDuplicate: (item: MenuItem) => void;
  isSelected: boolean;
  onSelect: (item: MenuItem, selected: boolean) => void;
  children?: MenuItem[];
  isExpanded?: boolean;
  onToggleExpand?: (item: MenuItem) => void;
  depth: number;
}

export interface MenuPreviewProps {
  items: MenuItem[];
  type: MenuType;
}

export interface BulkOperationsProps {
  selectedItems: MenuItem[];
  onBulkEnable: () => void;
  onBulkDisable: () => void;
  onBulkDelete: () => void;
  onDeselectAll: () => void;
  isLoading: boolean;
}

export interface MenuStatisticsProps {
  items: MenuItem[];
}

export interface MenuQuickActionsProps {
  activeTab: MenuType;
  items: MenuItem[];
  onRefresh: () => void;
  isLoading: boolean;
}

export interface HierarchicalMenuItem extends MenuItem {
  children: HierarchicalMenuItem[];
}
