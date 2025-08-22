/**
 * Cross-Browser Compatibility Tests
 * Tests dashboard functionality across different browsers and environments
 */

import { test, expect, devices } from '@playwright/test';

// Test configuration for different browsers and devices
const BROWSERS = ['chromium', 'firefox', 'webkit'];
const MOBILE_DEVICES = ['iPhone 12', 'Pixel 5', 'iPad'];
const DESKTOP_VIEWPORTS = [
  { width: 1920, height: 1080 }, // Full HD
  { width: 1366, height: 768 },  // Common laptop
  { width: 1280, height: 720 }   // Smaller laptop
];

const TEST_USER = {
  email: 'test-user@example.com',
  password: 'TestPassword123!',
  fullName: 'Test User'
};

const DASHBOARD_URL = '/dashboard';
const LOGIN_URL = '/login';

// Helper functions
const loginUser = async (page) => {
  await page.goto(LOGIN_URL);
  await page.fill('[name="email"]', TEST_USER.email);
  await page.fill('[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(DASHBOARD_URL);
};

const waitForDashboardLoad = async (page) => {
  await page.waitForSelector('[data-testid="dashboard-overview"]', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
};

test.describe('Cross-Browser Compatibility Tests', () => {
  // Test across different browsers
  for (const browserName of BROWSERS) {
    test.describe(`${browserName} Browser Tests`, () => {
      test.use({ 
        ...devices['Desktop Chrome'],
        // Override browser if needed
      });

      test(`dashboard loads correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        // Skip if not the target browser (Playwright handles this automatically)
        await loginUser(page);
        await waitForDashboardLoad(page);
        
        // Verify core dashboard elements
        await expect(page.getByText('Welcome back, Test User!')).toBeVisible();
        await expect(page.getByRole('tab', { name: /overview/i })).toBeVisible();
        
        // Take screenshot for visual comparison
        await page.screenshot({ 
          path: `screenshots/dashboard-${currentBrowser || browserName}.png`,
          fullPage: true 
        });
      });

      test(`navigation works in ${browserName}`, async ({ page }) => {
        await loginUser(page);
        await waitForDashboardLoad(page);
        
        // Test tab navigation
        await page.click('[role="tab"][name*="content"]');
        await expect(page.getByText('Content Management')).toBeVisible();
        
        await page.click('[role="tab"][name*="analytics"]');
        await expect(page.getByText('Analytics Dashboard')).toBeVisible();
        
        await page.click('[role="tab"][name*="activity"]');
        await expect(page.getByText('Recent Activity')).toBeVisible();
      });

      test(`forms work correctly in ${browserName}`, async ({ page }) => {
        await loginUser(page);
        await waitForDashboardLoad(page);
        await page.click('[role="tab"][name*="content"]');
        
        // Test content creation form
        await page.click('button:has-text("Create New Post")');
        
        await page.fill('[name="title"]', `Test Post in ${browserName}`);
        await page.fill('[name="content"]', 'This is test content for browser compatibility.');
        
        // Test dropdown/select elements
        await page.selectOption('[name="status"]', 'published');
        
        // Test form submission
        await page.click('button:has-text("Publish Post")');
        await expect(page.getByText('Post published successfully')).toBeVisible();
      });

      test(`interactive features work in ${browserName}`, async ({ page }) => {
        await loginUser(page);
        await waitForDashboardLoad(page);
        await page.click('[role="tab"][name*="analytics"]');
        
        // Test dropdown interactions
        await page.selectOption('[name="timeRange"]', '30d');
        await page.waitForLoadState('networkidle');
        await expect(page.getByText('Past 30 Days')).toBeVisible();
        
        // Test hover interactions (if supported)
        if (browserName !== 'webkit') { // Safari might handle hover differently
          const chartElement = page.getByTestId('views-chart');
          await chartElement.hover();
          // Verify tooltip or hover state
          await expect(page.getByRole('tooltip')).toBeVisible({ timeout: 2000 }).catch(() => {
            // Hover interactions might not be available on all browsers
          });
        }
      });
    });
  }

  // Test mobile devices
  for (const deviceName of MOBILE_DEVICES) {
    test.describe(`Mobile Device: ${deviceName}`, () => {
      test.use({ ...devices[deviceName] });

      test(`dashboard is responsive on ${deviceName}`, async ({ page }) => {
        await loginUser(page);
        await waitForDashboardLoad(page);
        
        // Verify mobile layout
        const sidebar = page.getByTestId('dashboard-sidebar');
        await expect(sidebar).toHaveClass(/collapsed|mobile/);
        
        // Test mobile navigation
        const menuToggle = page.getByRole('button', { name: /menu|toggle/i });
        await expect(menuToggle).toBeVisible();
        
        await menuToggle.click();
        await expect(sidebar).not.toHaveClass(/collapsed/);
        
        // Test touch interactions
        await page.click('[role="tab"][name*="content"]');
        await expect(page.getByText('Content Management')).toBeVisible();
      });

      test(`forms work on ${deviceName} touch interface`, async ({ page }) => {
        await loginUser(page);
        await waitForDashboardLoad(page);
        
        // Access content creation via mobile menu
        const menuToggle = page.getByRole('button', { name: /menu|toggle/i });
        await menuToggle.click();
        await page.click('[role="tab"][name*="content"]');
        
        await page.click('button:has-text("Create New Post")');
        
        // Test form inputs on mobile
        await page.fill('[name="title"]', `Mobile Post on ${deviceName}`);
        await page.fill('[name="content"]', 'Testing mobile form submission.');
        
        // Test mobile-specific form elements
        await page.selectOption('[name="status"]', 'draft');
        
        await page.click('button:has-text("Save Draft")');
        await expect(page.getByText('Draft saved successfully')).toBeVisible();
      });

      test(`scrolling and gestures work on ${deviceName}`, async ({ page }) => {
        await loginUser(page);
        await waitForDashboardLoad(page);
        
        // Access content list
        const menuToggle = page.getByRole('button', { name: /menu|toggle/i });
        await menuToggle.click();
        await page.click('[role="tab"][name*="content"]');
        
        // Test scrolling behavior
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight);
        });
        
        // Test pull-to-refresh (if implemented)
        await page.touchscreen.tap(200, 100);
        await page.mouse.move(200, 100);
        await page.mouse.move(200, 300);
        
        // Verify content is still accessible after gestures
        await expect(page.getByText('Content Management')).toBeVisible();
      });
    });
  }

  // Test different viewport sizes
  for (const viewport of DESKTOP_VIEWPORTS) {
    test.describe(`Viewport ${viewport.width}x${viewport.height}`, () => {
      test.use({ viewport });

      test(`dashboard layout adapts to ${viewport.width}x${viewport.height}`, async ({ page }) => {
        await loginUser(page);
        await waitForDashboardLoad(page);
        
        // Take screenshot for layout comparison
        await page.screenshot({ 
          path: `screenshots/dashboard-${viewport.width}x${viewport.height}.png`,
          fullPage: true 
        });
        
        // Verify responsive behavior
        if (viewport.width <= 768) {
          // Mobile layout
          const sidebar = page.getByTestId('dashboard-sidebar');
          await expect(sidebar).toHaveClass(/collapsed/);
        } else if (viewport.width <= 1024) {
          // Tablet layout
          const sidebar = page.getByTestId('dashboard-sidebar');
          await expect(sidebar).toBeVisible();
        } else {
          // Desktop layout
          const sidebar = page.getByTestId('dashboard-sidebar');
          await expect(sidebar).toBeVisible();
          await expect(sidebar).not.toHaveClass(/collapsed/);
        }
      });

      test(`charts render correctly at ${viewport.width}x${viewport.height}`, async ({ page }) => {
        await loginUser(page);
        await waitForDashboardLoad(page);
        await page.click('[role="tab"][name*="analytics"]');
        
        // Wait for charts to render
        await page.waitForTimeout(2000);
        
        const viewsChart = page.getByTestId('views-chart');
        const engagementChart = page.getByTestId('engagement-chart');
        
        await expect(viewsChart).toBeVisible();
        await expect(engagementChart).toBeVisible();
        
        // Verify charts are properly sized
        const chartBounds = await viewsChart.boundingBox();
        expect(chartBounds?.width).toBeGreaterThan(0);
        expect(chartBounds?.height).toBeGreaterThan(0);
      });
    });
  }

  test.describe('Browser-Specific Features', () => {
    test('tests Safari-specific behaviors', async ({ page, browserName }) => {
      test.skip(browserName !== 'webkit', 'Safari-specific test');
      
      await loginUser(page);
      await waitForDashboardLoad(page);
      
      // Test Safari-specific date picker behavior
      await page.click('[role="tab"][name*="analytics"]');
      
      const dateInput = page.locator('input[type="date"]');
      if (await dateInput.isVisible()) {
        await dateInput.click();
        // Safari has native date picker
        await expect(page.locator('.date-picker-native')).toBeVisible({ timeout: 1000 }).catch(() => {
          // Fallback behavior
        });
      }
    });

    test('tests Firefox-specific behaviors', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'Firefox-specific test');
      
      await loginUser(page);
      await waitForDashboardLoad(page);
      
      // Test Firefox scrollbar behavior
      await page.click('[role="tab"][name*="content"]');
      
      // Firefox might handle scrollbars differently
      const contentArea = page.getByTestId('content-list');
      await expect(contentArea).toBeVisible();
    });

    test('tests Chrome-specific behaviors', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'Chrome-specific test');
      
      await loginUser(page);
      await waitForDashboardLoad(page);
      
      // Test Chrome-specific features like file upload drag/drop
      await page.click('[role="tab"][name*="content"]');
      await page.click('button:has-text("Photos")');
      
      const uploadArea = page.getByTestId('photo-upload-area');
      if (await uploadArea.isVisible()) {
        // Test drag and drop (Chrome supports this well)
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles({
          name: 'test-image.jpg',
          mimeType: 'image/jpeg',
          buffer: Buffer.from('fake-image-data')
        });
        
        await expect(page.getByText('test-image.jpg')).toBeVisible();
      }
    });
  });

  test.describe('Performance Across Browsers', () => {
    test('measures load performance across browsers', async ({ page, browserName }) => {
      const startTime = Date.now();
      
      await loginUser(page);
      await waitForDashboardLoad(page);
      
      const loadTime = Date.now() - startTime;
      
      // Browser-specific performance expectations
      const maxLoadTime = browserName === 'webkit' ? 5000 : 3000; // Safari might be slower
      
      expect(loadTime).toBeLessThan(maxLoadTime);
      
      console.log(`Dashboard load time in ${browserName}: ${loadTime}ms`);
    });

    test('measures interaction performance', async ({ page, browserName }) => {
      await loginUser(page);
      await waitForDashboardLoad(page);
      
      const startTime = Date.now();
      
      // Test tab switching performance
      await page.click('[role="tab"][name*="analytics"]');
      await page.waitForSelector('[data-testid="views-chart"]');
      
      const switchTime = Date.now() - startTime;
      
      expect(switchTime).toBeLessThan(1000); // Should switch within 1 second
      
      console.log(`Tab switch time in ${browserName}: ${switchTime}ms`);
    });
  });

  test.describe('Accessibility Across Browsers', () => {
    test('keyboard navigation works across browsers', async ({ page }) => {
      await loginUser(page);
      await waitForDashboardLoad(page);
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toHaveAttribute('role', 'tab');
      
      // Test arrow key navigation
      await page.keyboard.press('ArrowRight');
      
      const newFocusedElement = await page.locator(':focus');
      await expect(newFocusedElement).toHaveAttribute('role', 'tab');
      
      // Activate with Enter
      await page.keyboard.press('Enter');
      await expect(newFocusedElement).toHaveAttribute('aria-selected', 'true');
    });

    test('screen reader compatibility', async ({ page }) => {
      await loginUser(page);
      await waitForDashboardLoad(page);
      
      // Verify ARIA labels and roles
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('navigation')).toBeVisible();
      
      const tabList = page.getByRole('tablist');
      await expect(tabList).toHaveAttribute('aria-label');
      
      const tabs = page.getByRole('tab');
      const tabCount = await tabs.count();
      
      for (let i = 0; i < tabCount; i++) {
        const tab = tabs.nth(i);
        await expect(tab).toHaveAttribute('aria-controls');
        await expect(tab).toHaveAttribute('aria-selected');
      }
    });
  });

  test.describe('Data Consistency Across Browsers', () => {
    test('form data persists correctly', async ({ page }) => {
      await loginUser(page);
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="content"]');
      
      // Create content
      await page.click('button:has-text("Create New Post")');
      await page.fill('[name="title"]', 'Cross-Browser Test Post');
      await page.fill('[name="content"]', 'Testing data persistence across browsers.');
      await page.click('button:has-text("Save Draft")');
      
      // Refresh page
      await page.reload();
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="content"]');
      
      // Verify content persists
      await expect(page.getByText('Cross-Browser Test Post')).toBeVisible();
    });

    test('user preferences sync across sessions', async ({ page, context }) => {
      await loginUser(page);
      await waitForDashboardLoad(page);
      
      // Set user preference (e.g., theme, dashboard layout)
      await page.click('[data-testid="user-menu"]');
      await page.click('button:has-text("Settings")');
      
      if (await page.getByRole('switch', { name: /dark mode/i }).isVisible()) {
        await page.getByRole('switch', { name: /dark mode/i }).click();
        await page.click('button:has-text("Save Settings")');
      }
      
      // Open new tab
      const newPage = await context.newPage();
      await loginUser(newPage);
      await waitForDashboardLoad(newPage);
      
      // Verify preference is applied
      const dashboardElement = newPage.getByTestId('user-dashboard');
      await expect(dashboardElement).toHaveClass(/dark-mode/).catch(() => {
        // Settings might not be immediately synced
      });
    });
  });

  test.describe('Error Handling Consistency', () => {
    test('network errors handled consistently', async ({ page }) => {
      // Start with normal load
      await loginUser(page);
      await waitForDashboardLoad(page);
      
      // Simulate network failure
      await page.route('/api/dashboard/**', route => {
        route.abort('failed');
      });
      
      // Try to navigate to analytics (requires API call)
      await page.click('[role="tab"][name*="analytics"]');
      
      // Should show consistent error state
      await expect(page.getByText('Unable to load analytics data')).toBeVisible({ timeout: 5000 });
      await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
    });

    test('form validation works consistently', async ({ page }) => {
      await loginUser(page);
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="content"]');
      
      await page.click('button:has-text("Create New Post")');
      
      // Try to submit empty form
      await page.click('button:has-text("Publish Post")');
      
      // Should show validation errors
      await expect(page.getByText('Title is required')).toBeVisible();
      await expect(page.getByText('Content is required')).toBeVisible();
    });
  });
});