/**
 * Test file to validate menu API type fixes
 */

import { MenuItem, MenuType, MenuTarget, MenuVisibility } from '@/types/menu';
import { convertDatabaseRowToMenuItem, validateMenuItem, adaptLegacyMenuItem } from '@/features/menu/utils/typeAdapters';

describe('Menu Type Validation', () => {
  test('MenuItem interface should have all required fields', () => {
    const validMenuItem: MenuItem = {
      id: 'test-id',
      title: 'Test Menu Item',
      url: '/test',
      menu_type: 'main',
      sort_order: 1,
      is_enabled: true,
      target: '_self',
      visibility: 'public',
      is_external: false
    };

    expect(validateMenuItem(validMenuItem)).toBe(true);
  });

  test('Database row conversion should work correctly', () => {
    const dbRow = {
      id: 'db-test-id',
      title: 'Database Test Item',
      url: '/db-test',
      description: 'Test description',
      menu_type: 'footer',
      parent_id: null,
      sort_order: 2,
      is_enabled: true,
      target: '_blank',
      icon: 'test-icon',
      css_classes: 'test-class',
      visibility: 'authenticated',
      required_roles: ['admin'],
      is_external: false,
      status: 'published',
      featured: false,
      menu_container_id: 'container-1',
      is_visible: true,
      custom_properties: { feature_flag: 'test-feature' },
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-02T00:00:00Z'
    };

    const menuItem = convertDatabaseRowToMenuItem(dbRow);
    
    expect(menuItem.id).toBe('db-test-id');
    expect(menuItem.title).toBe('Database Test Item');
    expect(menuItem.menu_type).toBe('footer');
    expect(menuItem.target).toBe('_blank');
    expect(menuItem.visibility).toBe('authenticated');
    expect(menuItem.feature_flag).toBe('test-feature');
  });

  test('Legacy interface adaptation should work', () => {
    const legacyItem = {
      id: 'legacy-id',
      label: 'Legacy Label',
      href: '/legacy',
      subtitle: 'Legacy subtitle',
      order: 5,
      enabled: true,
      icon: 'legacy-icon'
    };

    const adaptedItem = adaptLegacyMenuItem(legacyItem);
    
    expect(adaptedItem.title).toBe('Legacy Label');
    expect(adaptedItem.url).toBe('/legacy');
    expect(adaptedItem.description).toBe('Legacy subtitle');
    expect(adaptedItem.sort_order).toBe(5);
    expect(adaptedItem.is_enabled).toBe(true);
    expect(adaptedItem.menu_type).toBe('main'); // Default value
  });

  test('Invalid menu type should throw error', () => {
    const invalidRow = {
      id: 'invalid-id',
      title: 'Invalid Item',
      url: '/invalid',
      menu_type: 'invalid-type', // This should cause an error
      sort_order: 1,
      is_enabled: true
    };

    expect(() => convertDatabaseRowToMenuItem(invalidRow)).toThrow();
  });

  test('Type validation should catch missing required fields', () => {
    const incompleteItem = {
      id: 'incomplete-id',
      // Missing title and url
      menu_type: 'main',
      sort_order: 1,
      is_enabled: true
    };

    expect(validateMenuItem(incompleteItem)).toBe(false);
  });
});

// Type checking at compile time
const testCompileTimeTypes = () => {
  // These should compile without errors
  const menuTypes: MenuType[] = ['main', 'footer', 'mobile', 'admin'];
  const targets: MenuTarget[] = ['_self', '_blank', '_parent', '_top'];
  const visibilities: MenuVisibility[] = ['public', 'authenticated', 'admin', 'role_based'];

  // This should be a valid MenuItem
  const validItem: MenuItem = {
    id: '1',
    title: 'Test',
    url: '/test',
    menu_type: 'main',
    sort_order: 1,
    is_enabled: true,
    target: '_self',
    visibility: 'public',
    is_external: false
  };

  return { menuTypes, targets, visibilities, validItem };
};

export { testCompileTimeTypes };