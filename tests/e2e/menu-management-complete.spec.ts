/**
 * End-to-End Tests for Complete Menu Management Workflow
 * 
 * Tests the entire admin workflow including navigation,
 * CRUD operations, drag & drop, permissions, and UI interactions.
 */

import { test, expect, Page, Locator } from '@playwright/test';
import { faker } from '@faker-js/faker';

class MenuManagementPage {
  constructor(private page: Page) {}

  // Selectors
  get menuManagementLink() { return this.page.getByText('Menu Management'); }
  get addItemButton() { return this.page.getByRole('button', { name: 'Add Item' }); }
  get titleInput() { return this.page.getByPlaceholder('Menu item title'); }
  get urlInput() { return this.page.getByPlaceholder('/page or https://external-site.com'); }
  get descriptionTextarea() { return this.page.getByPlaceholder('Optional description for admin reference'); }
  get saveButton() { return this.page.getByRole('button', { name: 'Create Menu Item' }); }
  get updateButton() { return this.page.getByRole('button', { name: 'Save Changes' }); }
  get searchInput() { return this.page.getByPlaceholder('Search menu items...'); }
  get visibilityFilter() { return this.page.getByDisplayValue('All Visibility'); }
  get enabledFilter() { return this.page.getByDisplayValue('All Status'); }
  
  // Tab selectors
  get mainMenuTab() { return this.page.getByText('Main Menu'); }
  get footerMenuTab() { return this.page.getByText('Footer Menu'); }
  get mobileMenuTab() { return this.page.getByText('Mobile Menu'); }
  
  // Bulk operation selectors
  get enableAllButton() { return this.page.getByText('Enable All'); }
  get disableAllButton() { return this.page.getByText('Disable All'); }
  get deleteAllButton() { return this.page.getByText('Delete All'); }
  
  // Navigation and authentication
  async navigate() {
    await this.page.goto('/admin/menu-management');
    await this.page.waitForLoadState('networkidle');
  }

  async loginAsAdmin() {
    await this.page.goto('/login');
    await this.page.getByPlaceholder('Email').fill('admin@test.com');
    await this.page.getByPlaceholder('Password').fill('password');
    await this.page.getByRole('button', { name: 'Sign In' }).click();
    await this.page.waitForURL('/admin/**');
  }

  // Menu item operations
  async createMenuItem(data: {
    title: string;
    url: string;
    description?: string;
    menuType?: 'main' | 'footer' | 'mobile';
    visibility?: 'public' | 'authenticated' | 'admin' | 'role_based';
    target?: '_self' | '_blank';
    icon?: string;
    parent?: string;
  }) {
    await this.addItemButton.click();
    
    await this.titleInput.fill(data.title);
    await this.urlInput.fill(data.url);
    
    if (data.description) {
      await this.descriptionTextarea.fill(data.description);
    }
    
    if (data.visibility && data.visibility !== 'public') {
      await this.page.getByDisplayValue('Public').selectOption(data.visibility);
    }
    
    if (data.target && data.target !== '_self') {
      await this.page.getByDisplayValue('Same Window').selectOption(data.target);
    }
    
    if (data.icon) {
      await this.page.getByDisplayValue('No Icon').selectOption(data.icon);
    }
    
    if (data.parent) {
      await this.page.getByDisplayValue('No Parent (Top Level)').selectOption(data.parent);
    }
    
    await this.saveButton.click();
    
    // Wait for success toast and modal to close
    await expect(this.page.getByText('Menu item created successfully')).toBeVisible();
    await expect(this.titleInput).not.toBeVisible();
  }

  async editMenuItem(title: string, newData: { title?: string; url?: string; description?: string }) {
    const menuItem = this.page.getByText(title).locator('xpath=ancestor::div[contains(@class, "menu-item")]');
    await menuItem.getByTitle('Edit item').click();
    
    if (newData.title) {
      await this.titleInput.clear();
      await this.titleInput.fill(newData.title);
    }
    
    if (newData.url) {
      await this.urlInput.clear();
      await this.urlInput.fill(newData.url);
    }
    
    if (newData.description) {
      await this.descriptionTextarea.clear();
      await this.descriptionTextarea.fill(newData.description);
    }
    
    await this.updateButton.click();
    
    await expect(this.page.getByText('Menu item updated successfully')).toBeVisible();
    await expect(this.titleInput).not.toBeVisible();
  }

  async deleteMenuItem(title: string) {
    const menuItem = this.page.getByText(title).locator('xpath=ancestor::div[contains(@class, "menu-item")]');
    await menuItem.getByTitle('Delete item').click();
    
    await this.page.getByRole('button', { name: 'Delete Menu Item' }).click();
    
    await expect(this.page.getByText('Menu item deleted successfully')).toBeVisible();
  }

  async toggleMenuItemStatus(title: string) {
    const menuItem = this.page.getByText(title).locator('xpath=ancestor::div[contains(@class, "menu-item")]');
    await menuItem.getByRole('switch').click();
  }

  async duplicateMenuItem(title: string) {
    const menuItem = this.page.getByText(title).locator('xpath=ancestor::div[contains(@class, "menu-item")]');
    await menuItem.getByTitle('Duplicate item').click();
    
    await expect(this.page.getByText('Menu item created successfully')).toBeVisible();
  }

  // Bulk operations
  async selectMenuItem(title: string) {
    const menuItem = this.page.getByText(title).locator('xpath=ancestor::div[contains(@class, "menu-item")]');
    await menuItem.getByRole('checkbox').check();
  }

  async selectAllVisibleItems() {
    const checkboxes = await this.page.getByRole('checkbox').all();
    for (const checkbox of checkboxes) {
      await checkbox.check();
    }
  }

  // Search and filtering
  async searchMenuItems(term: string) {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(300); // Debounce
  }

  async filterByVisibility(visibility: string) {
    await this.visibilityFilter.selectOption(visibility);
  }

  async filterByStatus(status: string) {
    await this.enabledFilter.selectOption(status);
  }

  // Tab navigation
  async switchToTab(tab: 'main' | 'footer' | 'mobile') {
    switch (tab) {
      case 'main':
        await this.mainMenuTab.click();
        break;
      case 'footer':
        await this.footerMenuTab.click();
        break;
      case 'mobile':
        await this.mobileMenuTab.click();
        break;
    }
    
    await this.page.waitForTimeout(300);
  }

  // Drag and drop
  async dragMenuItem(sourceTitle: string, targetTitle: string) {
    const sourceItem = this.page.getByText(sourceTitle).locator('xpath=ancestor::div[contains(@class, "menu-item")]');
    const targetItem = this.page.getByText(targetTitle).locator('xpath=ancestor::div[contains(@class, "menu-item")]');
    
    const sourceDragHandle = sourceItem.getByTestId('grip-icon');
    const targetBox = await targetItem.boundingBox();
    
    if (targetBox) {
      await sourceDragHandle.dragTo(targetItem, {
        targetPosition: { x: targetBox.width / 2, y: targetBox.height / 2 }
      });
      
      await expect(this.page.getByText('Menu items reordered successfully')).toBeVisible();
    }
  }

  // Assertions
  async expectMenuItemVisible(title: string) {
    await expect(this.page.getByText(title)).toBeVisible();
  }

  async expectMenuItemNotVisible(title: string) {
    await expect(this.page.getByText(title)).not.toBeVisible();
  }

  async expectMenuItemCount(count: number) {
    const items = await this.page.locator('[data-testid*="menu-item"]').count();
    expect(items).toBe(count);
  }

  async expectPreviewContains(text: string) {
    await expect(this.page.getByText('Menu Preview').locator('xpath=following-sibling::*').getByText(text)).toBeVisible();
  }

  async expectStatistic(label: string, value: string) {
    const statistic = this.page.getByText(label).locator('xpath=preceding-sibling::*');
    await expect(statistic).toHaveText(value);
  }
}

test.describe('Menu Management E2E Tests', () => {
  let menuPage: MenuManagementPage;

  test.beforeEach(async ({ page }) => {
    menuPage = new MenuManagementPage(page);
    await menuPage.loginAsAdmin();
    await menuPage.navigate();
  });

  test.describe('Complete CRUD Workflow', () => {
    test('should complete full create-read-update-delete cycle', async ({ page }) => {
      const menuItemData = {
        title: faker.commerce.productName(),
        url: `/${faker.helpers.slugify(faker.commerce.productName()).toLowerCase()}`,
        description: faker.lorem.sentence(),
        visibility: 'public' as const,
        target: '_self' as const,
        icon: 'Home',
      };

      // CREATE
      await test.step('Create new menu item', async () => {
        await menuPage.createMenuItem(menuItemData);
        await menuPage.expectMenuItemVisible(menuItemData.title);
      });

      // READ - Verify in list
      await test.step('Verify item in list', async () => {
        await page.reload();
        await menuPage.expectMenuItemVisible(menuItemData.title);
      });

      // UPDATE
      const updatedData = {
        title: `Updated ${menuItemData.title}`,
        description: 'Updated description',
      };

      await test.step('Update menu item', async () => {
        await menuPage.editMenuItem(menuItemData.title, updatedData);
        await menuPage.expectMenuItemVisible(updatedData.title);
        await menuPage.expectMenuItemNotVisible(menuItemData.title);
      });

      // DELETE
      await test.step('Delete menu item', async () => {
        await menuPage.deleteMenuItem(updatedData.title);
        await menuPage.expectMenuItemNotVisible(updatedData.title);
      });
    });

    test('should handle menu item duplication', async ({ page }) => {
      const originalItem = {
        title: 'Original Item',
        url: '/original',
        description: 'Original description',
      };

      await menuPage.createMenuItem(originalItem);
      await menuPage.duplicateMenuItem(originalItem.title);

      // Should create copy with "(Copy)" suffix
      await menuPage.expectMenuItemVisible('Original Item (Copy)');
      
      // Both items should exist
      await menuPage.expectMenuItemVisible(originalItem.title);
    });

    test('should handle hierarchical menu creation', async ({ page }) => {
      // Create parent item
      const parentItem = {
        title: 'Parent Menu',
        url: '/parent',
      };
      
      await menuPage.createMenuItem(parentItem);

      // Create child item
      const childItem = {
        title: 'Child Menu',
        url: '/parent/child',
        parent: parentItem.title,
      };
      
      await menuPage.createMenuItem(childItem);

      // Verify hierarchy in preview
      await menuPage.expectPreviewContains(parentItem.title);
      await menuPage.expectPreviewContains(childItem.title);
    });
  });

  test.describe('Search and Filtering', () => {
    test.beforeEach(async () => {
      // Create test data
      const testItems = [
        { title: 'Community Events', url: '/events', visibility: 'public' as const },
        { title: 'Admin Dashboard', url: '/admin', visibility: 'admin' as const },
        { title: 'User Profile', url: '/profile', visibility: 'authenticated' as const },
      ];

      for (const item of testItems) {
        await menuPage.createMenuItem(item);
      }
    });

    test('should filter items by search term', async () => {
      await menuPage.searchMenuItems('admin');
      
      await menuPage.expectMenuItemVisible('Admin Dashboard');
      await menuPage.expectMenuItemNotVisible('Community Events');
      await menuPage.expectMenuItemNotVisible('User Profile');
    });

    test('should filter items by visibility', async () => {
      await menuPage.filterByVisibility('admin');
      
      await menuPage.expectMenuItemVisible('Admin Dashboard');
      await menuPage.expectMenuItemNotVisible('Community Events');
      await menuPage.expectMenuItemNotVisible('User Profile');
    });

    test('should combine search and visibility filters', async () => {
      await menuPage.searchMenuItems('user');
      await menuPage.filterByVisibility('authenticated');
      
      await menuPage.expectMenuItemVisible('User Profile');
      await menuPage.expectMenuItemNotVisible('Community Events');
      await menuPage.expectMenuItemNotVisible('Admin Dashboard');
    });

    test('should filter by enabled status', async () => {
      // Disable one item
      await menuPage.toggleMenuItemStatus('Community Events');
      
      // Filter to show only disabled items
      await menuPage.filterByStatus('false');
      
      await menuPage.expectMenuItemVisible('Community Events');
      await menuPage.expectMenuItemNotVisible('Admin Dashboard');
      await menuPage.expectMenuItemNotVisible('User Profile');
    });
  });

  test.describe('Menu Type Tab Navigation', () => {
    test('should switch between different menu types', async ({ page }) => {
      // Create items for different menu types
      await menuPage.createMenuItem({
        title: 'Main Navigation',
        url: '/main',
      });
      
      await menuPage.switchToTab('footer');
      await menuPage.createMenuItem({
        title: 'Footer Link',
        url: '/footer',
      });
      
      await menuPage.switchToTab('mobile');
      await menuPage.createMenuItem({
        title: 'Mobile Menu',
        url: '/mobile',
      });

      // Test filtering by tab
      await menuPage.switchToTab('main');
      await menuPage.expectMenuItemVisible('Main Navigation');
      await menuPage.expectMenuItemNotVisible('Footer Link');
      
      await menuPage.switchToTab('footer');
      await menuPage.expectMenuItemVisible('Footer Link');
      await menuPage.expectMenuItemNotVisible('Main Navigation');
      
      await menuPage.switchToTab('mobile');
      await menuPage.expectMenuItemVisible('Mobile Menu');
      await menuPage.expectMenuItemNotVisible('Footer Link');
    });

    test('should show accurate item counts in tabs', async () => {
      // Create multiple items in main menu
      for (let i = 0; i < 3; i++) {
        await menuPage.createMenuItem({
          title: `Main Item ${i + 1}`,
          url: `/main-${i + 1}`,
        });
      }

      // Switch to footer and create items
      await menuPage.switchToTab('footer');
      for (let i = 0; i < 2; i++) {
        await menuPage.createMenuItem({
          title: `Footer Item ${i + 1}`,
          url: `/footer-${i + 1}`,
        });
      }

      // Verify tab counts
      await expect(menuPage.mainMenuTab.locator('span')).toHaveText('3');
      await expect(menuPage.footerMenuTab.locator('span')).toHaveText('2');
      await expect(menuPage.mobileMenuTab.locator('span')).toHaveText('0');
    });
  });

  test.describe('Bulk Operations', () => {
    test.beforeEach(async () => {
      // Create test items with mixed states
      const testItems = [
        { title: 'Enabled Item 1', url: '/enabled-1' },
        { title: 'Enabled Item 2', url: '/enabled-2' },
        { title: 'Enabled Item 3', url: '/enabled-3' },
      ];

      for (const item of testItems) {
        await menuPage.createMenuItem(item);
      }

      // Disable one item
      await menuPage.toggleMenuItemStatus('Enabled Item 2');
    });

    test('should perform bulk enable operation', async () => {
      await menuPage.selectMenuItem('Enabled Item 2'); // Disabled item
      await menuPage.selectMenuItem('Enabled Item 3'); // Already enabled item
      
      await menuPage.enableAllButton.click();
      
      // Should only affect the disabled item
      await expect(menuPage.page.getByText('1 item enabled')).toBeVisible();
    });

    test('should perform bulk disable operation', async () => {
      await menuPage.selectMenuItem('Enabled Item 1');
      await menuPage.selectMenuItem('Enabled Item 3');
      
      await menuPage.disableAllButton.click();
      
      await expect(menuPage.page.getByText('2 items disabled')).toBeVisible();
    });

    test('should perform bulk delete with confirmation', async () => {
      await menuPage.selectMenuItem('Enabled Item 1');
      await menuPage.selectMenuItem('Enabled Item 2');
      
      // Handle confirmation dialog
      menuPage.page.on('dialog', dialog => dialog.accept());
      
      await menuPage.deleteAllButton.click();
      
      await menuPage.expectMenuItemNotVisible('Enabled Item 1');
      await menuPage.expectMenuItemNotVisible('Enabled Item 2');
      await menuPage.expectMenuItemVisible('Enabled Item 3');
    });

    test('should clear bulk selection', async () => {
      await menuPage.selectMenuItem('Enabled Item 1');
      await menuPage.selectMenuItem('Enabled Item 2');
      
      // Should show bulk toolbar
      await expect(menuPage.page.getByText('2 items selected')).toBeVisible();
      
      await menuPage.page.getByText('Clear').click();
      
      // Should hide bulk toolbar
      await expect(menuPage.page.getByText('2 items selected')).not.toBeVisible();
    });
  });

  test.describe('Drag and Drop Functionality', () => {
    test('should reorder menu items via drag and drop', async () => {
      // Create ordered test items
      const items = ['First Item', 'Second Item', 'Third Item'];
      
      for (const item of items) {
        await menuPage.createMenuItem({
          title: item,
          url: `/${item.toLowerCase().replace(' ', '-')}`,
        });
      }

      // Drag first item to second position
      await menuPage.dragMenuItem('First Item', 'Second Item');
      
      // Verify new order in the UI
      const menuItems = await menuPage.page.locator('[data-testid*="menu-item"] h3').allTextContents();
      expect(menuItems).toEqual(['Second Item', 'First Item', 'Third Item']);
      
      // Verify in preview
      await menuPage.expectPreviewContains('Second Item');
    });

    test('should handle complex hierarchy changes', async () => {
      // Create parent and standalone items
      await menuPage.createMenuItem({
        title: 'Parent Menu',
        url: '/parent',
      });
      
      await menuPage.createMenuItem({
        title: 'Standalone Item',
        url: '/standalone',
      });
      
      await menuPage.createMenuItem({
        title: 'Child Item',
        url: '/parent/child',
        parent: 'Parent Menu',
      });

      // Move standalone item under parent
      await menuPage.dragMenuItem('Standalone Item', 'Parent Menu');
      
      // Should now be a child of Parent Menu
      await menuPage.expectPreviewContains('Standalone Item');
    });
  });

  test.describe('Menu Preview Functionality', () => {
    test('should show live preview updates', async () => {
      const testItem = {
        title: 'Preview Test Item',
        url: '/preview-test',
        icon: 'Home',
      };

      await menuPage.createMenuItem(testItem);
      
      // Should appear in preview
      await menuPage.expectPreviewContains(testItem.title);
      
      // Disable item
      await menuPage.toggleMenuItemStatus(testItem.title);
      
      // Should disappear from preview (disabled items are filtered)
      await expect(
        menuPage.page.getByText('Menu Preview').locator('xpath=following-sibling::*').getByText(testItem.title)
      ).not.toBeVisible();
    });

    test('should show different previews for different menu types', async () => {
      // Create main menu item
      await menuPage.createMenuItem({
        title: 'Main Menu Item',
        url: '/main',
      });
      
      await menuPage.expectPreviewContains('Main Menu Item');
      await expect(menuPage.page.getByText('Main Menu Preview')).toBeVisible();
      
      // Switch to footer
      await menuPage.switchToTab('footer');
      await menuPage.createMenuItem({
        title: 'Footer Menu Item',
        url: '/footer',
      });
      
      await menuPage.expectPreviewContains('Footer Menu Item');
      await expect(menuPage.page.getByText('Footer Menu Preview')).toBeVisible();
    });
  });

  test.describe('Statistics and Quick Actions', () => {
    test('should display accurate statistics', async () => {
      // Create test data with mixed states
      await menuPage.createMenuItem({ title: 'Enabled Public', url: '/pub', visibility: 'public' });
      await menuPage.createMenuItem({ title: 'Enabled Admin', url: '/admin', visibility: 'admin' });
      await menuPage.createMenuItem({ title: 'Disabled Item', url: '/disabled' });
      
      // Disable one item
      await menuPage.toggleMenuItemStatus('Disabled Item');
      
      // Verify statistics
      await menuPage.expectStatistic('Total Items', '3');
      await menuPage.expectStatistic('Enabled', '2');
      await menuPage.expectStatistic('Top Level', '3');
    });

    test('should export menu structure', async ({ page, context }) => {
      await menuPage.createMenuItem({
        title: 'Export Test Item',
        url: '/export-test',
      });

      // Setup download handler
      const downloadPromise = page.waitForEvent('download');
      
      await page.getByText('Export main Menu').click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/main-menu-\d{4}-\d{2}-\d{2}\.json/);
      
      // Verify download content
      const downloadPath = await download.path();
      if (downloadPath) {
        const fs = await import('fs');
        const content = fs.readFileSync(downloadPath, 'utf-8');
        const menuData = JSON.parse(content);
        
        expect(menuData).toBeInstanceOf(Array);
        expect(menuData.some((item: any) => item.title === 'Export Test Item')).toBe(true);
      }
    });

    test('should refresh data', async ({ page }) => {
      await menuPage.createMenuItem({
        title: 'Refresh Test Item',
        url: '/refresh-test',
      });

      // Click refresh button
      await page.getByRole('button', { name: 'Refresh Data' }).click();
      
      // Should show loading state briefly
      await expect(page.getByText('Loading...')).toBeVisible();
      
      // Should reload and show items
      await menuPage.expectMenuItemVisible('Refresh Test Item');
    });
  });

  test.describe('Form Validation and Error Handling', () => {
    test('should validate required fields', async ({ page }) => {
      await menuPage.addItemButton.click();
      
      // Try to save without filling required fields
      await menuPage.saveButton.click();
      
      await expect(page.getByText('Title and URL are required')).toBeVisible();
      
      // Form should remain open
      await expect(menuPage.titleInput).toBeVisible();
    });

    test('should detect external URLs', async () => {
      await menuPage.addItemButton.click();
      
      await menuPage.titleInput.fill('External Link');
      await menuPage.urlInput.fill('https://external-site.com');
      
      // Should show external link indicator
      await expect(menuPage.page.getByText('External link detected')).toBeVisible();
      
      // Should set target to _blank by default
      const targetSelect = menuPage.page.getByDisplayValue('New Window');
      await expect(targetSelect).toBeVisible();
    });

    test('should handle role-based visibility', async () => {
      await menuPage.addItemButton.click();
      
      await menuPage.titleInput.fill('Role Based Item');
      await menuPage.urlInput.fill('/role-based');
      
      // Select role-based visibility
      await menuPage.page.getByDisplayValue('Public').selectOption('role_based');
      
      // Should show roles input
      await expect(menuPage.page.getByPlaceholder('admin, superadmin, editor (comma separated)')).toBeVisible();
      
      // Add roles
      await menuPage.page.getByPlaceholder('admin, superadmin, editor (comma separated)').fill('admin, editor');
      
      await menuPage.saveButton.click();
      
      await expect(menuPage.page.getByText('Menu item created successfully')).toBeVisible();
    });

    test('should handle server errors gracefully', async ({ page }) => {
      // Mock network error
      await page.route('**/api/menu-items', route => {
        route.abort();
      });

      await menuPage.addItemButton.click();
      await menuPage.titleInput.fill('Test Item');
      await menuPage.urlInput.fill('/test');
      
      await menuPage.saveButton.click();
      
      // Should show error message
      await expect(page.getByText(/failed to create/i)).toBeVisible();
      
      // Form should remain open for retry
      await expect(menuPage.titleInput).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      // Mobile layout should be active
      await expect(page.locator('.mobile-layout')).toBeVisible();
      
      // Should still be functional
      await menuPage.createMenuItem({
        title: 'Mobile Test Item',
        url: '/mobile-test',
      });
      
      await menuPage.expectMenuItemVisible('Mobile Test Item');
    });

    test('should adapt to tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      
      // Tablet layout adjustments
      await expect(page.locator('.tablet-layout')).toBeVisible();
      
      // Drag and drop should still work
      await menuPage.createMenuItem({ title: 'Item 1', url: '/item1' });
      await menuPage.createMenuItem({ title: 'Item 2', url: '/item2' });
      
      await menuPage.dragMenuItem('Item 1', 'Item 2');
      
      await expect(page.getByText('Menu items reordered successfully')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should handle large menu structures efficiently', async ({ page }) => {
      // Create many menu items
      const itemCount = 50;
      
      for (let i = 0; i < itemCount; i++) {
        await menuPage.createMenuItem({
          title: `Performance Test Item ${i + 1}`,
          url: `/perf-test-${i + 1}`,
        });
        
        // Only wait every 10 items to speed up test
        if ((i + 1) % 10 === 0) {
          await page.waitForTimeout(100);
        }
      }
      
      // Should still be responsive
      await menuPage.searchMenuItems('Performance Test Item 25');
      await menuPage.expectMenuItemVisible('Performance Test Item 25');
      
      // Bulk operations should work
      await menuPage.selectAllVisibleItems();
      await expect(page.getByText('1 item selected')).toBeVisible();
    });

    test('should load quickly after navigation', async ({ page }) => {
      const startTime = Date.now();
      
      await menuPage.navigate();
      
      // Should load within reasonable time
      await expect(page.getByText('Menu Management')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });
  });
});