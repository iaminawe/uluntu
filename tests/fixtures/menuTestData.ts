import { MenuItem, MenuStructure, CreateMenuItemInput } from '@/features/admin/api/menuManagement';

export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    label: 'Community',
    href: '/community',
    description: 'Community resources and connections',
    parent_id: null,
    order_index: 0,
    is_enabled: true,
    icon: 'users',
    feature_flag: 'community_features',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    label: 'Events',
    href: '/events',
    description: 'Community events and meetups',
    parent_id: '1',
    order_index: 0,
    is_enabled: true,
    icon: 'calendar',
    feature_flag: 'events_system',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    label: 'Directory',
    href: '/directory',
    description: 'Member directory',
    parent_id: '1',
    order_index: 1,
    is_enabled: true,
    icon: 'address-book',
    feature_flag: 'members_directory',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    label: 'Business',
    href: '/business',
    description: 'Business and professional resources',
    parent_id: null,
    order_index: 1,
    is_enabled: true,
    icon: 'briefcase',
    feature_flag: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    label: 'Companies',
    href: '/companies',
    description: 'Local tech companies',
    parent_id: '4',
    order_index: 0,
    is_enabled: false, // Disabled for testing
    icon: 'building',
    feature_flag: 'companies_listing',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    label: 'About',
    href: '/about',
    description: 'About our organization',
    parent_id: null,
    order_index: 2,
    is_enabled: true,
    icon: 'info',
    feature_flag: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export const mockMenuStructure: MenuStructure[] = [
  {
    id: '1',
    label: 'Community',
    href: '/community',
    description: 'Community resources and connections',
    icon: 'users',
    feature_flag: 'community_features',
    is_enabled: true,
    order_index: 0,
    children: [
      {
        id: '2',
        label: 'Events',
        href: '/events',
        description: 'Community events and meetups',
        icon: 'calendar',
        feature_flag: 'events_system',
        is_enabled: true,
        order_index: 0,
        children: []
      },
      {
        id: '3',
        label: 'Directory',
        href: '/directory',
        description: 'Member directory',
        icon: 'address-book',
        feature_flag: 'members_directory',
        is_enabled: true,
        order_index: 1,
        children: []
      }
    ]
  },
  {
    id: '4',
    label: 'Business',
    href: '/business',
    description: 'Business and professional resources',
    icon: 'briefcase',
    feature_flag: null,
    is_enabled: true,
    order_index: 1,
    children: [
      {
        id: '5',
        label: 'Companies',
        href: '/companies',
        description: 'Local tech companies',
        icon: 'building',
        feature_flag: 'companies_listing',
        is_enabled: false,
        order_index: 0,
        children: []
      }
    ]
  },
  {
    id: '6',
    label: 'About',
    href: '/about',
    description: 'About our organization',
    icon: 'info',
    feature_flag: null,
    is_enabled: true,
    order_index: 2,
    children: []
  }
];

export const mockEnabledMenuStructure: MenuStructure[] = [
  {
    id: '1',
    label: 'Community',
    href: '/community',
    description: 'Community resources and connections',
    icon: 'users',
    feature_flag: 'community_features',
    is_enabled: true,
    order_index: 0,
    children: [
      {
        id: '2',
        label: 'Events',
        href: '/events',
        description: 'Community events and meetups',
        icon: 'calendar',
        feature_flag: 'events_system',
        is_enabled: true,
        order_index: 0,
        children: []
      },
      {
        id: '3',
        label: 'Directory',
        href: '/directory',
        description: 'Member directory',
        icon: 'address-book',
        feature_flag: 'members_directory',
        is_enabled: true,
        order_index: 1,
        children: []
      }
    ]
  },
  {
    id: '4',
    label: 'Business',
    href: '/business',
    description: 'Business and professional resources',
    icon: 'briefcase',
    feature_flag: null,
    is_enabled: true,
    order_index: 1,
    children: [] // Companies filtered out because is_enabled: false
  },
  {
    id: '6',
    label: 'About',
    href: '/about',
    description: 'About our organization',
    icon: 'info',
    feature_flag: null,
    is_enabled: true,
    order_index: 2,
    children: []
  }
];

export const mockCreateMenuItemInput: CreateMenuItemInput = {
  label: 'Resources',
  href: '/resources',
  description: 'Educational resources and guides',
  parent_id: null,
  order_index: 3,
  is_enabled: true,
  icon: 'book',
  feature_flag: 'resources_library',
};

export const mockMenuReorderUpdates = [
  { id: '1', order_index: 1, parent_id: null },
  { id: '4', order_index: 0, parent_id: null },
  { id: '6', order_index: 2, parent_id: null },
];

export const createMockMenuItem = (overrides: Partial<MenuItem> = {}): MenuItem => ({
  id: `test-${Date.now()}`,
  label: 'Test Menu Item',
  href: '/test',
  description: 'Test description',
  parent_id: null,
  order_index: 0,
  is_enabled: true,
  icon: 'test',
  feature_flag: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});