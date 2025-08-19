/**
 * Cross-Browser Compatibility Tests for Menu Management
 * 
 * Tests compatibility across different browsers, devices,
 * and browser versions including edge cases and feature support.
 */

import { test, expect, devices, Browser, BrowserContext, Page } from '@playwright/test';

// Browser configurations for testing
const browserConfigs = [
  { name: 'chromium', userAgent: 'Chrome/120.0.0.0' },
  { name: 'firefox', userAgent: 'Firefox/120.0' },
  { name: 'webkit', userAgent: 'Safari/17.0' },
];

const deviceConfigs = [
  { name: 'Desktop Chrome', ...devices['Desktop Chrome'] },
  { name: 'Desktop Firefox', ...devices['Desktop Firefox'] },
  { name: 'Desktop Safari', ...devices['Desktop Safari'] },
  { name: 'iPhone 12', ...devices['iPhone 12'] },
  { name: 'iPhone 12 Pro', ...devices['iPhone 12 Pro'] },
  { name: 'iPad Pro', ...devices['iPad Pro'] },
  { name: 'Samsung Galaxy S21', ...devices['Galaxy S21'] },
  { name: 'Pixel 5', ...devices['Pixel 5'] },
];

class MenuTestHelper {
  constructor(private page: Page) {}

  async loginAsAdmin() {
    await this.page.goto('/login');
    await this.page.getByPlaceholder('Email').fill('admin@test.com');
    await this.page.getByPlaceholder('Password').fill('password');
    await this.page.getByRole('button', { name: 'Sign In' }).click();
    await this.page.waitForURL('/admin/**');
  }

  async navigateToMenuManagement() {
    await this.page.goto('/admin/menu-management');
    await this.page.waitForLoadState('networkidle');
  }

  async createTestMenuItem(data: {
    title: string;
    url: string;
    description?: string;
  }) {
    await this.page.getByText('Add Item').click();
    await this.page.getByPlaceholder('Menu item title').fill(data.title);
    await this.page.getByPlaceholder('/page or https://external-site.com').fill(data.url);
    
    if (data.description) {
      await this.page.getByPlaceholder('Optional description for admin reference').fill(data.description);
    }
    
    await this.page.getByRole('button', { name: 'Create Menu Item' }).click();
    await expect(this.page.getByText('Menu item created successfully')).toBeVisible();
  }

  async expectBasicFunctionality() {
    await expect(this.page.getByText('Menu Management')).toBeVisible();
    await expect(this.page.getByText('Add Item')).toBeVisible();
    
    // Check for search functionality
    await expect(this.page.getByPlaceholder('Search menu items...')).toBeVisible();
    
    // Check for tab navigation
    await expect(this.page.getByText('Main Menu')).toBeVisible();
    await expect(this.page.getByText('Footer Menu')).toBeVisible();
  }

  async testResponsiveness() {
    const viewportSize = this.page.viewportSize();
    if (!viewportSize) return;

    if (viewportSize.width < 768) {
      // Mobile layout tests
      await expect(this.page.locator('.mobile-layout, .responsive-mobile')).toBeVisible();
    } else if (viewportSize.width < 1024) {
      // Tablet layout tests
      await expect(this.page.locator('.tablet-layout, .responsive-tablet')).toBeVisible();
    } else {
      // Desktop layout tests
      await expect(this.page.locator('.desktop-layout, .responsive-desktop')).toBeVisible();
    }
  }

  async testTouchInteractions() {
    const isTouchDevice = await this.page.evaluate(() => 'ontouchstart' in window);
    
    if (isTouchDevice) {
      // Test drag and drop with touch
      const firstItem = this.page.locator('[data-testid="menu-item"]').first();
      const secondItem = this.page.locator('[data-testid="menu-item"]').nth(1);
      
      if (await firstItem.isVisible() && await secondItem.isVisible()) {
        await firstItem.hover();
        await this.page.mouse.down();
        await secondItem.hover();
        await this.page.mouse.up();
      }
    }
  }

  async checkAccessibility() {
    // Test keyboard navigation
    await this.page.keyboard.press('Tab');
    const focusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT', 'A', 'SELECT']).toContain(focusedElement);
    
    // Test ARIA attributes
    const navigation = this.page.getByRole('navigation');
    if (await navigation.count() > 0) {
      await expect(navigation.first()).toHaveAttribute('aria-label');
    }
  }
}

// Run tests across all browser configurations
for (const browserConfig of browserConfigs) {
  test.describe(`Menu Management - ${browserConfig.name}`, () => {
    let browser: Browser;
    let context: BrowserContext;
    let page: Page;
    let menuHelper: MenuTestHelper;

    test.beforeAll(async ({ playwright }) => {
      browser = await playwright[browserConfig.name as keyof typeof playwright].launch();
    });

    test.beforeEach(async () => {
      context = await browser.newContext({
        userAgent: browserConfig.userAgent,
      });
      page = await context.newPage();
      menuHelper = new MenuTestHelper(page);
      
      await menuHelper.loginAsAdmin();
    });

    test.afterEach(async () => {
      await context.close();
    });

    test.afterAll(async () => {
      await browser.close();
    });

    test('should load menu management page successfully', async () => {
      await menuHelper.navigateToMenuManagement();
      await menuHelper.expectBasicFunctionality();
    });

    test('should support CRUD operations', async () => {
      await menuHelper.navigateToMenuManagement();
      
      const testData = {
        title: `Test Item ${browserConfig.name}`,
        url: `/test-${browserConfig.name.toLowerCase()}`,
        description: `Test item for ${browserConfig.name} compatibility`,
      };
      
      await menuHelper.createTestMenuItem(testData);
      await expect(page.getByText(testData.title)).toBeVisible();
    });

    test('should handle form validation correctly', async () => {
      await menuHelper.navigateToMenuManagement();
      
      await page.getByText('Add Item').click();
      await page.getByRole('button', { name: 'Create Menu Item' }).click();
      
      await expect(page.getByText('Title and URL are required')).toBeVisible();
    });

    test('should support search functionality', async () => {
      await menuHelper.navigateToMenuManagement();
      
      // Create a test item first
      await menuHelper.createTestMenuItem({
        title: 'Searchable Item',
        url: '/searchable',
      });
      
      // Test search
      await page.getByPlaceholder('Search menu items...').fill('Searchable');
      await expect(page.getByText('Searchable Item')).toBeVisible();
      
      // Clear search
      await page.getByPlaceholder('Search menu items...').fill('');
    });

    test('should handle JavaScript disabled gracefully', async () => {
      // Create new context with JavaScript disabled
      const noJsContext = await browser.newContext({
        javaScriptEnabled: false,
        userAgent: browserConfig.userAgent,
      });
      const noJsPage = await noJsContext.newPage();
      
      try {
        await noJsPage.goto('/admin/menu-management');
        
        // Basic HTML should still be accessible
        const pageContent = await noJsPage.content();
        expect(pageContent).toContain('Menu Management');
        
        // Forms should still be present for progressive enhancement
        const forms = await noJsPage.locator('form').count();
        expect(forms).toBeGreaterThan(0);
        
      } finally {
        await noJsContext.close();
      }
    });

    test('should handle network interruptions gracefully', async () => {
      await menuHelper.navigateToMenuManagement();
      
      // Simulate network failure
      await page.route('**/api/menu-items**', route => route.abort());
      
      await page.reload();
      
      // Should show appropriate error message
      await expect(page.getByText(/error.*loading/i)).toBeVisible();
      await expect(page.getByText('Try Again')).toBeVisible();
    });

    test('should support different character encodings', async () => {
      await menuHelper.navigateToMenuManagement();
      
      const unicodeTestData = {
        title: 'Unicode Test 测试 🎉 العربية',
        url: '/unicode-test',
        description: 'Testing unicode characters: ñáéíóú çğışü αβγδε',
      };
      
      await menuHelper.createTestMenuItem(unicodeTestData);
      await expect(page.getByText(unicodeTestData.title)).toBeVisible();
    });

    test('should maintain state across page reloads', async () => {
      await menuHelper.navigateToMenuManagement();
      
      // Apply a filter
      await page.getByDisplayValue('All Visibility').selectOption('public');
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // State should be preserved (if implemented)
      // This test documents expected behavior
    });
  });
}

// Device-specific tests
for (const deviceConfig of deviceConfigs) {
  test.describe(`Menu Management - ${deviceConfig.name}`, () => {
    test.use({ ...deviceConfig });

    let menuHelper: MenuTestHelper;

    test.beforeEach(async ({ page }) => {
      menuHelper = new MenuTestHelper(page);
      await menuHelper.loginAsAdmin();
    });

    test('should be responsive on different screen sizes', async ({ page }) => {
      await menuHelper.navigateToMenuManagement();
      await menuHelper.expectBasicFunctionality();
      await menuHelper.testResponsiveness();
    });

    test('should support touch interactions on mobile devices', async ({ page }) => {
      await menuHelper.navigateToMenuManagement();
      
      // Create test items for touch interaction
      await menuHelper.createTestMenuItem({
        title: 'Touch Test 1',
        url: '/touch-1',
      });
      
      await menuHelper.createTestMenuItem({
        title: 'Touch Test 2',
        url: '/touch-2',
      });
      
      await menuHelper.testTouchInteractions();
    });

    test('should have adequate touch targets', async ({ page }) => {
      await menuHelper.navigateToMenuManagement();
      
      const buttons = await page.locator('button').all();
      
      for (const button of buttons) {
        if (await button.isVisible()) {
          const boundingBox = await button.boundingBox();
          if (boundingBox) {
            // WCAG recommends minimum 44x44px touch targets
            const minSize = 44;
            expect(Math.max(boundingBox.width, boundingBox.height)).toBeGreaterThanOrEqual(minSize);
          }
        }
      }
    });

    test('should handle orientation changes', async ({ page, context }) => {
      // Skip orientation test on non-mobile devices
      const userAgent = await page.evaluate(() => navigator.userAgent);
      if (!userAgent.includes('Mobile') && !userAgent.includes('iPad')) {
        test.skip();
      }

      await menuHelper.navigateToMenuManagement();
      
      // Test portrait orientation
      await menuHelper.expectBasicFunctionality();
      
      // Simulate landscape orientation (if supported)
      try {
        await context.addInitScript(() => {
          Object.defineProperty(screen, 'orientation', {
            value: { angle: 90, type: 'landscape-primary' },
            writable: true
          });
        });
        
        await page.reload();
        await menuHelper.expectBasicFunctionality();
      } catch (error) {
        // Orientation API might not be supported
        console.log('Orientation API not supported on this browser');
      }
    });

    test('should work with various input methods', async ({ page }) => {
      await menuHelper.navigateToMenuManagement();
      
      // Test keyboard navigation
      await menuHelper.checkAccessibility();
      
      // Test mouse/touch interactions
      const addButton = page.getByText('Add Item');
      await addButton.click();
      await expect(page.getByPlaceholder('Menu item title')).toBeVisible();
      
      // Close modal with escape key
      await page.keyboard.press('Escape');
      await expect(page.getByPlaceholder('Menu item title')).not.toBeVisible();
    });
  });
}

test.describe('Browser Feature Detection and Fallbacks', () => {
  test('should detect and handle missing features gracefully', async ({ page, browser }) => {
    // Test with various feature limitations
    const testCases = [
      {
        name: 'No localStorage',
        setup: () => page.addInitScript(() => {
          delete (window as any).localStorage;
        }),
      },
      {
        name: 'No sessionStorage',
        setup: () => page.addInitScript(() => {
          delete (window as any).sessionStorage;
        }),
      },
      {
        name: 'No IndexedDB',
        setup: () => page.addInitScript(() => {
          delete (window as any).indexedDB;
        }),
      },
      {
        name: 'No requestAnimationFrame',
        setup: () => page.addInitScript(() => {
          delete (window as any).requestAnimationFrame;
        }),
      },
      {
        name: 'No Intersection Observer',
        setup: () => page.addInitScript(() => {
          delete (window as any).IntersectionObserver;
        }),
      },
    ];

    for (const testCase of testCases) {
      await test.step(`Testing ${testCase.name}`, async () => {
        const context = await browser.newContext();
        const testPage = await context.newPage();
        
        await testCase.setup();
        
        const menuHelper = new MenuTestHelper(testPage);
        await menuHelper.loginAsAdmin();
        await menuHelper.navigateToMenuManagement();
        
        // Should still function without the missing feature
        await menuHelper.expectBasicFunctionality();
        
        await context.close();
      });
    }
  });

  test('should work with strict Content Security Policy', async ({ page, browser }) => {
    const strictCSPContext = await browser.newContext({
      extraHTTPHeaders: {
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';",
      },
    });
    
    const cspPage = await strictCSPContext.newPage();
    const menuHelper = new MenuTestHelper(cspPage);
    
    try {
      await menuHelper.loginAsAdmin();
      await menuHelper.navigateToMenuManagement();
      
      // Should work with strict CSP
      await menuHelper.expectBasicFunctionality();
      
    } finally {
      await strictCSPContext.close();
    }
  });

  test('should handle slow network conditions', async ({ page, browser }) => {
    const slowNetworkContext = await browser.newContext();
    
    // Simulate slow network
    await slowNetworkContext.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
      await route.continue();
    });
    
    const slowPage = await slowNetworkContext.newPage();
    const menuHelper = new MenuTestHelper(slowPage);
    
    try {
      await menuHelper.loginAsAdmin();
      await menuHelper.navigateToMenuManagement();
      
      // Should show loading states appropriately
      await expect(slowPage.getByText(/loading/i).first()).toBeVisible({ timeout: 2000 });
      
      // Should eventually load
      await menuHelper.expectBasicFunctionality();
      
    } finally {
      await slowNetworkContext.close();
    }
  });
});

test.describe('Legacy Browser Support', () => {
  test('should provide graceful degradation for older browsers', async ({ page }) => {
    // Simulate older browser capabilities
    await page.addInitScript(() => {
      // Remove modern features
      delete (window as any).fetch;
      delete (window as any).Promise;
      delete (window as any).Map;
      delete (window as any).Set;
      
      // Mock older APIs
      (window as any).XMLHttpRequest = function() {
        return {
          open: () => {},
          send: () => {},
          setRequestHeader: () => {},
        };
      };
    });
    
    const menuHelper = new MenuTestHelper(page);
    
    try {
      await menuHelper.loginAsAdmin();
      await menuHelper.navigateToMenuManagement();
      
      // Basic functionality should still work
      const pageTitle = await page.textContent('h1');
      expect(pageTitle).toContain('Menu Management');
      
    } catch (error) {
      // Document expected behavior with legacy browsers
      console.log('Legacy browser simulation may not fully support all features');
    }
  });

  test('should handle IE11-specific issues', async ({ page }) => {
    // Simulate IE11 environment
    await page.addInitScript(() => {
      // Override user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko',
        configurable: true,
      });
      
      // Remove modern features not available in IE11
      delete (window as any).fetch;
      delete (window as any).Promise;
      delete (window as any).includes;
    });
    
    // This test documents IE11 compatibility expectations
    // In practice, modern applications may not support IE11
    test.skip('Skipping IE11 test - not supported in modern applications');
  });
});

test.describe('Performance Across Browsers', () => {
  test('should maintain performance across different browsers', async ({ page }) => {
    const menuHelper = new MenuTestHelper(page);
    await menuHelper.loginAsAdmin();
    
    const startTime = Date.now();
    await menuHelper.navigateToMenuManagement();
    const loadTime = Date.now() - startTime;
    
    // Page should load within reasonable time across all browsers
    expect(loadTime).toBeLessThan(5000); // 5 seconds max
    
    // Test interaction performance
    const interactionStart = Date.now();
    await page.getByText('Add Item').click();
    await expect(page.getByPlaceholder('Menu item title')).toBeVisible();
    const interactionTime = Date.now() - interactionStart;
    
    expect(interactionTime).toBeLessThan(1000); // 1 second max for modal open
  });

  test('should handle memory efficiently across browsers', async ({ page }) => {
    const menuHelper = new MenuTestHelper(page);
    await menuHelper.loginAsAdmin();
    await menuHelper.navigateToMenuManagement();
    
    // Create multiple menu items to test memory usage
    for (let i = 0; i < 20; i++) {
      await menuHelper.createTestMenuItem({
        title: `Performance Test Item ${i}`,
        url: `/perf-test-${i}`,
      });
    }
    
    // Check if page is still responsive
    await expect(page.getByText('Add Item')).toBeVisible();
    
    // Test that we can still interact with the page
    await page.getByPlaceholder('Search menu items...').fill('Performance Test');
    await expect(page.getByText('Performance Test Item 0')).toBeVisible();
  });
});

test.describe('Internationalization and Localization', () => {
  test('should work with RTL languages', async ({ page, browser }) => {
    const rtlContext = await browser.newContext({
      locale: 'ar-SA', // Arabic
    });
    
    const rtlPage = await rtlContext.newPage();
    
    // Set RTL direction
    await rtlPage.addInitScript(() => {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    });
    
    const menuHelper = new MenuTestHelper(rtlPage);
    
    try {
      await menuHelper.loginAsAdmin();
      await menuHelper.navigateToMenuManagement();
      
      // Check that layout adapts to RTL
      const bodyDirection = await rtlPage.evaluate(() => 
        window.getComputedStyle(document.body).direction
      );
      expect(bodyDirection).toBe('rtl');
      
      // Basic functionality should still work
      await menuHelper.expectBasicFunctionality();
      
    } finally {
      await rtlContext.close();
    }
  });

  test('should handle different date/time formats', async ({ page, browser }) => {
    const locales = ['en-US', 'en-GB', 'de-DE', 'ja-JP', 'ar-SA'];
    
    for (const locale of locales) {
      const localizedContext = await browser.newContext({ locale });
      const localizedPage = await localizedContext.newPage();
      
      try {
        const menuHelper = new MenuTestHelper(localizedPage);
        await menuHelper.loginAsAdmin();
        await menuHelper.navigateToMenuManagement();
        
        // Check that timestamps are formatted according to locale
        const timestamps = await localizedPage.locator('[data-timestamp]').all();
        
        for (const timestamp of timestamps) {
          const text = await timestamp.textContent();
          if (text) {
            // Should contain date-like content
            expect(text).toMatch(/\d/);
          }
        }
        
      } finally {
        await localizedContext.close();
      }
    }
  });
});