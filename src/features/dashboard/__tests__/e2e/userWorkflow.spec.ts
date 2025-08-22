/**
 * User Dashboard E2E Tests
 * End-to-end tests for complete user workflow through dashboard
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration and setup
const TEST_USER = {
  email: 'test-user@example.com',
  password: 'TestPassword123!',
  fullName: 'Test User'
};

const DASHBOARD_URL = '/dashboard';
const LOGIN_URL = '/login';

// Helper functions
const loginUser = async (page: Page) => {
  await page.goto(LOGIN_URL);
  await page.fill('[name="email"]', TEST_USER.email);
  await page.fill('[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(DASHBOARD_URL);
};

const waitForDashboardLoad = async (page: Page) => {
  await page.waitForSelector('[data-testid="dashboard-overview"]');
  await page.waitForLoadState('networkidle');
};

test.describe('User Dashboard E2E Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test.describe('Dashboard Access and Navigation', () => {
    test('user can access dashboard after login', async ({ page }) => {
      await waitForDashboardLoad(page);
      
      // Verify dashboard elements are present
      await expect(page.getByText('Welcome back, Test User!')).toBeVisible();
      await expect(page.getByRole('tab', { name: /overview/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /content/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /analytics/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /activity/i })).toBeVisible();
    });

    test('user can navigate between dashboard sections', async ({ page }) => {
      await waitForDashboardLoad(page);

      // Navigate to Content tab
      await page.click('[role="tab"][name*="content"]');
      await expect(page.getByText('Content Management')).toBeVisible();
      
      // Navigate to Analytics tab
      await page.click('[role="tab"][name*="analytics"]');
      await expect(page.getByText('Analytics Dashboard')).toBeVisible();
      
      // Navigate to Activity tab
      await page.click('[role="tab"][name*="activity"]');
      await expect(page.getByText('Recent Activity')).toBeVisible();
      
      // Return to Overview
      await page.click('[role="tab"][name*="overview"]');
      await expect(page.getByText('Content Overview')).toBeVisible();
    });

    test('dashboard maintains state during page refresh', async ({ page }) => {
      await waitForDashboardLoad(page);
      
      // Navigate to analytics tab
      await page.click('[role="tab"][name*="analytics"]');
      await expect(page.getByText('Analytics Dashboard')).toBeVisible();
      
      // Refresh page
      await page.reload();
      await waitForDashboardLoad(page);
      
      // Should still be on analytics tab
      await expect(page.getByText('Analytics Dashboard')).toBeVisible();
      const analyticsTab = page.getByRole('tab', { name: /analytics/i });
      await expect(analyticsTab).toHaveAttribute('aria-selected', 'true');
    });

    test('dashboard is responsive on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await waitForDashboardLoad(page);
      
      // Sidebar should be collapsed on mobile
      const sidebar = page.getByTestId('dashboard-sidebar');
      await expect(sidebar).toHaveClass(/collapsed/);
      
      // Menu toggle should be visible
      const menuToggle = page.getByRole('button', { name: /toggle menu/i });
      await expect(menuToggle).toBeVisible();
      
      // Click menu toggle to expand sidebar
      await menuToggle.click();
      await expect(sidebar).not.toHaveClass(/collapsed/);
    });
  });

  test.describe('Content Management Workflow', () => {
    test('user can create new content', async ({ page }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="content"]');
      
      // Click create new post button
      await page.click('button:has-text("Create New Post")');
      
      // Fill out post form
      await page.fill('[name="title"]', 'My New Blog Post');
      await page.fill('[name="content"]', 'This is the content of my new blog post.');
      await page.selectOption('[name="status"]', 'published');
      
      // Add tags
      await page.fill('[name="tags"]', 'test, blog, dashboard');
      
      // Save post
      await page.click('button:has-text("Publish Post")');
      
      // Verify success message
      await expect(page.getByText('Post published successfully')).toBeVisible();
      
      // Verify post appears in content list
      await expect(page.getByText('My New Blog Post')).toBeVisible();
    });

    test('user can edit existing content', async ({ page }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="content"]');
      
      // Find and edit first post
      const firstPost = page.locator('[data-testid="content-item"]').first();
      await firstPost.getByRole('button', { name: /edit/i }).click();
      
      // Modify content
      await page.fill('[name="title"]', 'Updated Post Title');
      await page.fill('[name="content"]', 'This content has been updated.');
      
      // Save changes
      await page.click('button:has-text("Save Changes")');
      
      // Verify update success
      await expect(page.getByText('Post updated successfully')).toBeVisible();
      await expect(page.getByText('Updated Post Title')).toBeVisible();
    });

    test('user can filter and sort content', async ({ page }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="content"]');
      
      // Filter by status
      await page.selectOption('[name="statusFilter"]', 'published');
      await page.waitForTimeout(500); // Wait for filter to apply
      
      // Verify only published posts are shown
      const publishedPosts = page.locator('[data-testid="content-item"][data-status="published"]');
      const draftPosts = page.locator('[data-testid="content-item"][data-status="draft"]');
      
      await expect(publishedPosts.first()).toBeVisible();
      await expect(draftPosts.first()).not.toBeVisible();
      
      // Sort by views (descending)
      await page.selectOption('[name="sortBy"]', 'views');
      await page.waitForTimeout(500);
      
      // Verify sorting (first item should have most views)
      const firstItem = page.locator('[data-testid="content-item"]').first();
      const firstItemViews = await firstItem.getByTestId('view-count').textContent();
      
      const secondItem = page.locator('[data-testid="content-item"]').nth(1);
      const secondItemViews = await secondItem.getByTestId('view-count').textContent();
      
      expect(parseInt(firstItemViews || '0')).toBeGreaterThanOrEqual(parseInt(secondItemViews || '0'));
    });

    test('user can delete content with confirmation', async ({ page }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="content"]');
      
      // Get the title of the first post to verify deletion
      const firstPost = page.locator('[data-testid="content-item"]').first();
      const postTitle = await firstPost.getByTestId('content-title').textContent();
      
      // Click delete button
      await firstPost.getByRole('button', { name: /delete/i }).click();
      
      // Confirm deletion in modal
      await expect(page.getByText('Are you sure you want to delete')).toBeVisible();
      await page.click('button:has-text("Delete")');
      
      // Verify deletion success
      await expect(page.getByText('Post deleted successfully')).toBeVisible();
      
      // Verify post is no longer in the list
      await expect(page.getByText(postTitle || '')).not.toBeVisible();
    });
  });

  test.describe('Analytics Dashboard Workflow', () => {
    test('user can view analytics overview', async ({ page }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="analytics"]');
      
      // Verify analytics metrics are displayed
      await expect(page.getByText('Total Views')).toBeVisible();
      await expect(page.getByText('Total Likes')).toBeVisible();
      await expect(page.getByText('Total Comments')).toBeVisible();
      await expect(page.getByText('Followers')).toBeVisible();
      
      // Verify charts are rendered
      await expect(page.getByTestId('views-chart')).toBeVisible();
      await expect(page.getByTestId('engagement-chart')).toBeVisible();
    });

    test('user can change analytics time range', async ({ page }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="analytics"]');
      
      // Change time range to 30 days
      await page.selectOption('[name="timeRange"]', '30d');
      
      // Wait for data to update
      await page.waitForLoadState('networkidle');
      
      // Verify the time range label updated
      await expect(page.getByText('Past 30 Days')).toBeVisible();
      
      // Change to weekly view
      await page.selectOption('[name="timeRange"]', '7d');
      await page.waitForLoadState('networkidle');
      
      await expect(page.getByText('Past Week')).toBeVisible();
    });

    test('user can view top performing content', async ({ page }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="analytics"]');
      
      // Scroll to top content section
      await page.getByText('Top Performing Content').scrollIntoViewIfNeeded();
      
      // Verify top content items are displayed
      const topContentItems = page.locator('[data-testid="top-content-item"]');
      await expect(topContentItems.first()).toBeVisible();
      
      // Verify each item has metrics
      const firstItem = topContentItems.first();
      await expect(firstItem.getByTestId('content-views')).toBeVisible();
      await expect(firstItem.getByTestId('engagement-rate')).toBeVisible();
    });

    test('user can export analytics data', async ({ page }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="analytics"]');
      
      // Click export button
      const downloadPromise = page.waitForEvent('download');
      await page.click('button:has-text("Export Data")');
      
      // Verify download started
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('analytics');
      expect(download.suggestedFilename()).toContain('.csv');
    });
  });

  test.describe('Activity Stream Workflow', () => {
    test('user can view recent activity', async ({ page }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="activity"]');
      
      // Verify activity items are displayed
      const activityItems = page.locator('[data-testid="activity-item"]');
      await expect(activityItems.first()).toBeVisible();
      
      // Verify activity types
      await expect(page.getByText('liked your post')).toBeVisible();
      await expect(page.getByText('commented on')).toBeVisible();
      await expect(page.getByText('started following')).toBeVisible();
    });

    test('user can filter activity by type', async ({ page }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="activity"]');
      
      // Filter to only show likes
      await page.click('button:has-text("Likes")');
      
      // Verify only like activities are shown
      const likeActivities = page.locator('[data-testid="activity-item"][data-type="like"]');
      const commentActivities = page.locator('[data-testid="activity-item"][data-type="comment"]');
      
      await expect(likeActivities.first()).toBeVisible();
      await expect(commentActivities.first()).not.toBeVisible();
    });

    test('user can view and manage notifications', async ({ page }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="activity"]');
      
      // Click on notifications tab
      await page.click('button:has-text("Notifications")');
      
      // Verify notifications are displayed
      const notifications = page.locator('[data-testid="notification-item"]');
      await expect(notifications.first()).toBeVisible();
      
      // Mark notification as read
      const unreadNotification = page.locator('[data-testid="unread-notification"]').first();
      await unreadNotification.click();
      
      // Verify notification is marked as read
      await expect(unreadNotification).not.toHaveClass(/unread/);
    });

    test('user can load more activity items', async ({ page }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="activity"]');
      
      // Count initial activity items
      const initialCount = await page.locator('[data-testid="activity-item"]').count();
      
      // Click load more button
      await page.click('button:has-text("Load More")');
      
      // Wait for new items to load
      await page.waitForLoadState('networkidle');
      
      // Verify more items were loaded
      const newCount = await page.locator('[data-testid="activity-item"]').count();
      expect(newCount).toBeGreaterThan(initialCount);
    });
  });

  test.describe('Photo Gallery Integration', () => {
    test('user can view photo gallery in dashboard', async ({ page }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="content"]');
      
      // Switch to photos tab
      await page.click('button:has-text("Photos")');
      
      // Verify photos are displayed
      const photoItems = page.locator('[data-testid="photo-item"]');
      await expect(photoItems.first()).toBeVisible();
    });

    test('user can upload new photos', async ({ page }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="content"]');
      await page.click('button:has-text("Photos")');
      
      // Click upload button
      await page.click('button:has-text("Upload Photos")');
      
      // Upload test image file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles({
        name: 'test-photo.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      });
      
      // Add photo details
      await page.fill('[name="photoTitle"]', 'Test Photo Upload');
      await page.fill('[name="photoDescription"]', 'This is a test photo uploaded via dashboard.');
      
      // Submit upload
      await page.click('button:has-text("Upload")');
      
      // Verify upload success
      await expect(page.getByText('Photo uploaded successfully')).toBeVisible();
      await expect(page.getByText('Test Photo Upload')).toBeVisible();
    });

    test('user can organize photos in collections', async ({ page }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="content"]');
      await page.click('button:has-text("Photos")');
      
      // Create new collection
      await page.click('button:has-text("Create Collection")');
      await page.fill('[name="collectionName"]', 'Nature Photography');
      await page.fill('[name="collectionDescription"]', 'My favorite nature shots');
      await page.click('button:has-text("Create")');
      
      // Add photos to collection
      const firstPhoto = page.locator('[data-testid="photo-item"]').first();
      await firstPhoto.hover();
      await firstPhoto.getByRole('button', { name: /add to collection/i }).click();
      
      // Select the collection
      await page.selectOption('[name="collection"]', 'Nature Photography');
      await page.click('button:has-text("Add to Collection")');
      
      // Verify photo was added
      await expect(page.getByText('Photo added to collection')).toBeVisible();
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('dashboard loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(DASHBOARD_URL);
      await waitForDashboardLoad(page);
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('dashboard is keyboard accessible', async ({ page }) => {
      await waitForDashboardLoad(page);
      
      // Tab through navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Current focused element should be a tab
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toHaveAttribute('role', 'tab');
      
      // Navigate with arrow keys
      await page.keyboard.press('ArrowRight');
      
      // Should move to next tab
      const newFocusedElement = await page.locator(':focus');
      await expect(newFocusedElement).toHaveAttribute('role', 'tab');
      
      // Activate tab with Enter
      await page.keyboard.press('Enter');
      
      // Tab content should change
      await expect(newFocusedElement).toHaveAttribute('aria-selected', 'true');
    });

    test('dashboard has proper ARIA labels', async ({ page }) => {
      await waitForDashboardLoad(page);
      
      // Verify main landmarks
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('navigation', { name: /dashboard navigation/i })).toBeVisible();
      
      // Verify tab structure
      const tabList = page.getByRole('tablist');
      await expect(tabList).toHaveAttribute('aria-label', 'Dashboard sections');
      
      // Verify tabs have proper attributes
      const tabs = page.getByRole('tab');
      const firstTab = tabs.first();
      
      await expect(firstTab).toHaveAttribute('aria-controls');
      await expect(firstTab).toHaveAttribute('aria-selected');
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('dashboard handles network errors gracefully', async ({ page }) => {
      // Intercept and fail API requests
      await page.route('/api/dashboard/**', route => {
        route.abort('failed');
      });
      
      await page.goto(DASHBOARD_URL);
      
      // Should show error state
      await expect(page.getByText('Unable to load dashboard data')).toBeVisible();
      await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
      
      // Restore network and retry
      await page.unroute('/api/dashboard/**');
      await page.click('button:has-text("Try Again")');
      
      // Should load successfully
      await waitForDashboardLoad(page);
      await expect(page.getByText('Welcome back, Test User!')).toBeVisible();
    });

    test('dashboard handles empty states', async ({ page }) => {
      // Mock empty data responses
      await page.route('/api/dashboard/content', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ posts: [], photos: [], events: [] })
        });
      });
      
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="content"]');
      
      // Should show empty state
      await expect(page.getByText('No content found')).toBeVisible();
      await expect(page.getByText('Create your first post')).toBeVisible();
      await expect(page.getByRole('button', { name: /create new post/i })).toBeVisible();
    });

    test('dashboard handles session expiry', async ({ page, context }) => {
      await waitForDashboardLoad(page);
      
      // Clear all cookies to simulate session expiry
      await context.clearCookies();
      
      // Try to navigate to another tab
      await page.click('[role="tab"][name*="analytics"]');
      
      // Should redirect to login
      await page.waitForURL(LOGIN_URL);
      await expect(page.getByText('Your session has expired')).toBeVisible();
    });

    test('dashboard handles browser back/forward navigation', async ({ page }) => {
      await waitForDashboardLoad(page);
      
      // Navigate to analytics
      await page.click('[role="tab"][name*="analytics"]');
      await expect(page.getByText('Analytics Dashboard')).toBeVisible();
      
      // Use browser back
      await page.goBack();
      await expect(page.getByText('Content Overview')).toBeVisible();
      
      // Use browser forward
      await page.goForward();
      await expect(page.getByText('Analytics Dashboard')).toBeVisible();
    });
  });

  test.describe('Data Persistence and Sync', () => {
    test('dashboard data persists across sessions', async ({ page, context }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="content"]');
      
      // Create a new post
      await page.click('button:has-text("Create New Post")');
      await page.fill('[name="title"]', 'Persistent Test Post');
      await page.fill('[name="content"]', 'This post should persist across sessions.');
      await page.click('button:has-text("Publish Post")');
      
      // Close and reopen browser
      await page.close();
      const newPage = await context.newPage();
      
      // Login again
      await loginUser(newPage);
      await waitForDashboardLoad(newPage);
      await newPage.click('[role="tab"][name*="content"]');
      
      // Verify post still exists
      await expect(newPage.getByText('Persistent Test Post')).toBeVisible();
    });

    test('dashboard reflects real-time updates', async ({ page, context }) => {
      await waitForDashboardLoad(page);
      await page.click('[role="tab"][name*="activity"]');
      
      // Open a second browser tab
      const secondPage = await context.newPage();
      await loginUser(secondPage);
      await waitForDashboardLoad(secondPage);
      
      // Create activity in second tab
      await secondPage.click('[role="tab"][name*="content"]');
      const firstPost = secondPage.locator('[data-testid="content-item"]').first();
      await firstPost.getByRole('button', { name: /like/i }).click();
      
      // Check if activity appears in first tab (real-time update)
      await page.waitForTimeout(2000); // Wait for real-time update
      await expect(page.getByText('You liked')).toBeVisible({ timeout: 5000 });
    });
  });
});