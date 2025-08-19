import { test, expect, Page } from '@playwright/test';

// Test data setup
const testMenuItem = {
  label: 'Test Menu Item',
  href: '/test-item',
  description: 'A test menu item for E2E testing',
};

const testMenuItems = [
  { id: '1', label: 'Community', href: '/community', order_index: 0 },
  { id: '2', label: 'Business', href: '/business', order_index: 1 },
  { id: '3', label: 'Resources', href: '/resources', order_index: 2 },
  { id: '4', label: 'About', href: '/about', order_index: 3 },
];

// Helper functions
const loginAsAdmin = async (page: Page) => {
  await page.goto('/admin/login');
  await page.fill('[data-testid="email-input"]', 'admin@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/admin');
};

const navigateToMenuManagement = async (page: Page) => {
  await page.goto('/admin/menu-management');
  await page.waitForLoadState('networkidle');
};

const createMenuItemViaUI = async (page: Page, menuItem: any) => {
  await page.click('[data-testid="add-menu-item-button"]');
  
  await page.fill('[data-testid="label-input"]', menuItem.label);
  await page.fill('[data-testid="href-input"]', menuItem.href);
  if (menuItem.description) {
    await page.fill('[data-testid="description-input"]', menuItem.description);
  }
  
  await page.click('[data-testid="save-button"]');
  await page.waitForSelector('[data-testid="success-toast"]', { timeout: 5000 });
};

test.describe('Menu Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the API responses
    await page.route('**/api/menu-items', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(testMenuItems),
        });
      }
    });

    await page.route('**/api/menu-items/*', (route) => {
      const method = route.request().method();
      
      if (method === 'PUT') {
        const id = route.request().url().split('/').pop();
        const updatedItem = { ...testMenuItems.find(item => item.id === id) };
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(updatedItem),
        });
      }
      
      if (method === 'DELETE') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      }
    });

    await loginAsAdmin(page);
  });

  test.describe('Drag and Drop Menu Reordering', () => {
    test('should reorder menu items using drag and drop', async ({ page }) => {
      await navigateToMenuManagement(page);

      // Wait for menu items to load
      await page.waitForSelector('[data-testid="menu-item-1"]');
      
      // Verify initial order
      const initialOrder = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('[data-testid^="menu-item-"]'));
        return items.map(item => item.getAttribute('data-testid'));
      });
      
      expect(initialOrder).toEqual(['menu-item-1', 'menu-item-2', 'menu-item-3', 'menu-item-4']);

      // Mock the reorder API endpoint
      await page.route('**/api/menu-items/reorder', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      });

      // Perform drag and drop operation
      const sourceItem = page.locator('[data-testid="menu-item-1"]');
      const targetItem = page.locator('[data-testid="menu-item-3"]');

      // Get bounding boxes for drag calculation
      const sourceBounds = await sourceItem.boundingBox();
      const targetBounds = await targetItem.boundingBox();

      if (sourceBounds && targetBounds) {
        // Simulate drag and drop
        await page.mouse.move(
          sourceBounds.x + sourceBounds.width / 2,
          sourceBounds.y + sourceBounds.height / 2
        );
        await page.mouse.down();
        
        // Drag to target position
        await page.mouse.move(
          targetBounds.x + targetBounds.width / 2,
          targetBounds.y + targetBounds.height / 2,
          { steps: 5 }
        );
        
        await page.mouse.up();
      }

      // Wait for reorder animation/API call to complete
      await page.waitForTimeout(500);
      
      // Verify the new order
      const newOrder = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('[data-testid^="menu-item-"]'));
        return items.map(item => item.getAttribute('data-testid'));
      });

      // Community should now be after Resources
      expect(newOrder).not.toEqual(initialOrder);
    });

    test('should show visual feedback during drag operation', async ({ page }) => {
      await navigateToMenuManagement(page);
      await page.waitForSelector('[data-testid="menu-item-1"]');

      const dragItem = page.locator('[data-testid="menu-item-1"]');
      
      // Start dragging
      await dragItem.hover();
      await page.mouse.down();

      // Check for drag visual feedback
      await expect(dragItem).toHaveClass(/dragging|drag-preview/);
      
      // Check for drop zones becoming visible
      await expect(page.locator('[data-testid="drop-zone"]').first()).toBeVisible();

      // End drag
      await page.mouse.up();
    });

    test('should handle drag and drop with nested menu items', async ({ page }) => {
      // Add nested items to mock data
      const nestedTestItems = [
        ...testMenuItems,
        { id: '5', label: 'Events', href: '/events', parent_id: '1', order_index: 0 },
        { id: '6', label: 'Directory', href: '/directory', parent_id: '1', order_index: 1 },
      ];

      await page.route('**/api/menu-items', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(nestedTestItems),
        });
      });

      await navigateToMenuManagement(page);
      await page.waitForSelector('[data-testid="menu-item-5"]');

      // Try to drag a child item to become a top-level item
      const childItem = page.locator('[data-testid="menu-item-5"]');
      const rootDropZone = page.locator('[data-testid="root-drop-zone"]');

      await childItem.dragTo(rootDropZone);

      // Verify the API was called to update parent_id
      await page.waitForSelector('[data-testid="success-toast"]');
    });

    test('should prevent invalid drag operations', async ({ page }) => {
      await navigateToMenuManagement(page);
      await page.waitForSelector('[data-testid="menu-item-1"]');

      // Try to drag a parent item into its own child (should be prevented)
      const parentItem = page.locator('[data-testid="menu-item-1"]');
      const childDropZone = page.locator('[data-testid="child-drop-zone-1"]');

      // Attempt the invalid drag
      await parentItem.hover();
      await page.mouse.down();
      await childDropZone.hover();

      // Drop zone should show as invalid
      await expect(childDropZone).toHaveClass(/invalid|disabled/);

      await page.mouse.up();
      
      // No API call should be made
      await page.waitForTimeout(100);
      expect(await page.locator('[data-testid="error-toast"]').count()).toBe(0);
    });
  });

  test.describe('Menu Reordering with Keyboard', () => {
    test('should support keyboard navigation for reordering', async ({ page }) => {
      await navigateToMenuManagement(page);
      await page.waitForSelector('[data-testid="menu-item-1"]');

      // Focus on first menu item
      await page.focus('[data-testid="menu-item-1"]');

      // Use keyboard shortcuts to move item down
      await page.keyboard.press('Control+ArrowDown');
      
      // Should trigger reorder
      await page.waitForSelector('[data-testid="success-toast"]');
    });

    test('should provide keyboard shortcuts help', async ({ page }) => {
      await navigateToMenuManagement(page);
      
      // Press help key or click help button
      await page.keyboard.press('F1');
      
      // Help modal should appear with keyboard shortcuts
      await expect(page.locator('[data-testid="keyboard-help-modal"]')).toBeVisible();
      await expect(page.locator('text=Ctrl+↑/↓')).toBeVisible();
      await expect(page.locator('text=Ctrl+←/→')).toBeVisible(); // For nesting level
    });
  });

  test.describe('Batch Operations', () => {
    test('should select multiple items and perform batch operations', async ({ page }) => {
      await navigateToMenuManagement(page);
      await page.waitForSelector('[data-testid="menu-item-1"]');

      // Select multiple items using checkboxes
      await page.check('[data-testid="select-menu-item-1"]');
      await page.check('[data-testid="select-menu-item-2"]');
      
      // Batch operations toolbar should appear
      await expect(page.locator('[data-testid="batch-operations"]')).toBeVisible();
      
      // Test batch disable
      await page.click('[data-testid="batch-disable-button"]');
      
      // Confirmation dialog should appear
      await expect(page.locator('[data-testid="confirm-batch-disable"]')).toBeVisible();
      await page.click('[data-testid="confirm-button"]');
      
      // Success message should appear
      await page.waitForSelector('[data-testid="success-toast"]');
    });

    test('should handle batch delete with confirmation', async ({ page }) => {
      await navigateToMenuManagement(page);
      await page.waitForSelector('[data-testid="menu-item-1"]');

      // Select items
      await page.check('[data-testid="select-menu-item-3"]');
      await page.check('[data-testid="select-menu-item-4"]');
      
      // Batch delete
      await page.click('[data-testid="batch-delete-button"]');
      
      // Confirmation dialog with warning
      await expect(page.locator('[data-testid="confirm-batch-delete"]')).toBeVisible();
      await expect(page.locator('text=This action cannot be undone')).toBeVisible();
      
      await page.click('[data-testid="confirm-delete-button"]');
      
      await page.waitForSelector('[data-testid="success-toast"]');
    });
  });

  test.describe('Real-time Updates', () => {
    test('should show real-time updates when menu changes', async ({ page, context }) => {
      await navigateToMenuManagement(page);
      
      // Open second tab/page as another admin user
      const secondPage = await context.newPage();
      await loginAsAdmin(secondPage);
      await navigateToMenuManagement(secondPage);

      // Make change in first page
      await createMenuItemViaUI(page, testMenuItem);
      
      // Second page should reflect the change automatically
      await secondPage.waitForSelector(`text=${testMenuItem.label}`, { timeout: 5000 });
      expect(await secondPage.locator(`text=${testMenuItem.label}`).count()).toBe(1);
    });

    test('should handle concurrent modifications gracefully', async ({ page, context }) => {
      await navigateToMenuManagement(page);
      
      const secondPage = await context.newPage();
      await loginAsAdmin(secondPage);
      await navigateToMenuManagement(secondPage);

      // Both pages try to update the same item simultaneously
      const editPromise1 = page.click('[data-testid="edit-menu-item-1"]').then(() =>
        page.fill('[data-testid="label-input"]', 'Updated by User 1')
      ).then(() =>
        page.click('[data-testid="save-button"]')
      );

      const editPromise2 = secondPage.click('[data-testid="edit-menu-item-1"]').then(() =>
        secondPage.fill('[data-testid="label-input"]', 'Updated by User 2')
      ).then(() =>
        secondPage.click('[data-testid="save-button"]')
      );

      await Promise.all([editPromise1, editPromise2]);

      // One should succeed, one should show conflict error
      const errorToasts = await page.locator('[data-testid="error-toast"]').count() +
                         await secondPage.locator('[data-testid="error-toast"]').count();
      
      expect(errorToasts).toBeGreaterThan(0);
    });
  });

  test.describe('Performance and Loading', () => {
    test('should handle large menu hierarchies efficiently', async ({ page }) => {
      // Mock large dataset
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: `item-${i}`,
        label: `Menu Item ${i}`,
        href: `/item-${i}`,
        parent_id: i > 0 && i % 10 === 0 ? `item-${i - 10}` : null,
        order_index: i,
      }));

      await page.route('**/api/menu-items', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(largeDataset),
        });
      });

      const startTime = Date.now();
      await navigateToMenuManagement(page);
      
      // Wait for all items to render
      await page.waitForSelector('[data-testid="menu-item-item-99"]');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds

      // Test virtual scrolling is working
      const visibleItems = await page.locator('[data-testid^="menu-item-"]').count();
      expect(visibleItems).toBeLessThan(largeDataset.length); // Not all items should be rendered
    });

    test('should show loading states during operations', async ({ page }) => {
      // Mock slow API response
      await page.route('**/api/menu-items', (route) => {
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(testMenuItems),
          });
        }, 1000);
      });

      await navigateToMenuManagement(page);
      
      // Loading skeleton should be visible
      await expect(page.locator('[data-testid="menu-loading-skeleton"]')).toBeVisible();
      
      // Should disappear when loaded
      await page.waitForSelector('[data-testid="menu-item-1"]');
      await expect(page.locator('[data-testid="menu-loading-skeleton"]')).not.toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error
      await page.route('**/api/menu-items', (route) => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        });
      });

      await navigateToMenuManagement(page);
      
      // Error message should be displayed
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      await expect(page.locator('text=Failed to load menu items')).toBeVisible();
      
      // Retry button should be available
      await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test('should handle network failures during drag operations', async ({ page }) => {
      await navigateToMenuManagement(page);
      await page.waitForSelector('[data-testid="menu-item-1"]');

      // Mock network failure for reorder
      await page.route('**/api/menu-items/reorder', (route) => {
        route.abort('failed');
      });

      // Perform drag and drop
      const sourceItem = page.locator('[data-testid="menu-item-1"]');
      const targetItem = page.locator('[data-testid="menu-item-2"]');
      
      await sourceItem.dragTo(targetItem);
      
      // Error message should appear
      await expect(page.locator('[data-testid="error-toast"]')).toBeVisible();
      
      // Items should revert to original order
      await page.waitForTimeout(500);
      const order = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('[data-testid^="menu-item-"]'));
        return items.map(item => item.getAttribute('data-testid'));
      });
      
      expect(order).toEqual(['menu-item-1', 'menu-item-2', 'menu-item-3', 'menu-item-4']);
    });
  });
});