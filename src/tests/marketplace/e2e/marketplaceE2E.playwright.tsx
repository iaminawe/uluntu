import { test, expect } from '@playwright/test';

// E2E tests for complete marketplace workflows
// These tests would run against a real or test instance of the application

test.describe.skip('Marketplace E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the marketplace
    await page.goto('/marketplace');
  });

  test('Complete listing creation workflow', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to marketplace
    await page.waitForURL('/marketplace');
    
    // Click create listing button
    await page.click('text=Create Listing');
    
    // Fill in listing form
    await page.fill('input[name="title"]', 'E2E Test Product');
    await page.fill('textarea[name="description"]', 'This is a test product created by E2E test');
    await page.fill('input[name="price"]', '99.99');
    await page.selectOption('select[name="type"]', 'product');
    await page.selectOption('select[name="condition"]', 'new');
    await page.fill('input[name="location"]', 'Test City');
    
    // Add tags
    await page.fill('input[name="tags"]', 'test, e2e, product');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify redirect to new listing
    await expect(page).toHaveURL(/\/marketplace\/[\w-]+/);
    
    // Verify listing details are displayed
    await expect(page.locator('h1')).toContainText('E2E Test Product');
    await expect(page.locator('text=$99.99')).toBeVisible();
    await expect(page.locator('text=This is a test product created by E2E test')).toBeVisible();
  });

  test('Search and filter listings', async ({ page }) => {
    // Search for specific term
    await page.fill('input[placeholder*="Search"]', 'wooden');
    await page.press('input[placeholder*="Search"]', 'Enter');
    
    // Wait for results to update
    await page.waitForTimeout(1000);
    
    // Verify search results
    const listings = page.locator('[data-testid="listing-card"]');
    const count = await listings.count();
    
    for (let i = 0; i < count; i++) {
      const text = await listings.nth(i).textContent();
      expect(text?.toLowerCase()).toContain('wooden');
    }
    
    // Apply type filter
    await page.selectOption('select[name="type"]', 'product');
    await page.waitForTimeout(500);
    
    // Apply price range filter
    await page.fill('input[name="minPrice"]', '10');
    await page.fill('input[name="maxPrice"]', '100');
    await page.waitForTimeout(500);
    
    // Clear filters
    await page.click('button:has-text("Clear Filters")');
    await page.waitForTimeout(500);
    
    // Verify filters are cleared
    await expect(page.locator('input[placeholder*="Search"]')).toHaveValue('');
    await expect(page.locator('select[name="type"]')).toHaveValue('');
  });

  test('Contact seller workflow', async ({ page }) => {
    // Click on first listing
    await page.click('[data-testid="listing-card"]:first-child');
    
    // Wait for detail page to load
    await page.waitForSelector('button:has-text("Contact Seller")');
    
    // Click contact seller button
    await page.click('button:has-text("Contact Seller")');
    
    // Fill in contact form
    await page.fill('textarea[name="message"]', 'I am interested in this item. Is it still available?');
    
    // Send message
    await page.click('button:has-text("Send Message")');
    
    // Verify success message
    await expect(page.locator('text=Message sent successfully')).toBeVisible();
  });

  test('Edit own listing', async ({ page }) => {
    // Login as seller
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'sellerpassword');
    await page.click('button[type="submit"]');
    
    // Navigate to own listings
    await page.goto('/marketplace/my-listings');
    
    // Click edit on first listing
    await page.click('[data-testid="edit-listing"]:first-child');
    
    // Update listing details
    await page.fill('input[name="price"]', '75.00');
    await page.fill('textarea[name="description"]', 'Updated description with new details');
    
    // Save changes
    await page.click('button:has-text("Update Listing")');
    
    // Verify update success
    await expect(page.locator('text=Listing updated successfully')).toBeVisible();
    
    // Verify updated details
    await expect(page.locator('text=$75.00')).toBeVisible();
    await expect(page.locator('text=Updated description with new details')).toBeVisible();
  });

  test('Delete listing workflow', async ({ page }) => {
    // Login as seller
    await page.goto('/login');
    await page.fill('input[name="email"]', 'seller@example.com');
    await page.fill('input[name="password"]', 'sellerpassword');
    await page.click('button[type="submit"]');
    
    // Navigate to a listing detail page
    await page.goto('/marketplace/test-listing-id');
    
    // Click delete button
    await page.click('button:has-text("Delete Listing")');
    
    // Confirm deletion in dialog
    await page.click('button:has-text("Confirm Delete")');
    
    // Verify redirect to marketplace
    await expect(page).toHaveURL('/marketplace');
    
    // Verify success message
    await expect(page.locator('text=Listing deleted successfully')).toBeVisible();
  });

  test('Guest user browsing', async ({ page }) => {
    // Verify guest can view listings
    await expect(page.locator('[data-testid="listing-card"]')).toHaveCount(12); // Default pagination
    
    // Verify guest can search
    await page.fill('input[placeholder*="Search"]', 'service');
    await page.press('input[placeholder*="Search"]', 'Enter');
    await page.waitForTimeout(500);
    
    // Click on a listing to view details
    await page.click('[data-testid="listing-card"]:first-child');
    
    // Verify guest sees login prompt for contact
    await page.click('button:has-text("Contact Seller")');
    await expect(page.locator('text=Please login to contact sellers')).toBeVisible();
  });

  test('Pagination workflow', async ({ page }) => {
    // Verify initial page
    await expect(page.locator('button:has-text("Previous")')).toBeDisabled();
    
    // Go to next page
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    
    // Verify page changed
    await expect(page.locator('button:has-text("Previous")')).toBeEnabled();
    
    // Go to specific page
    await page.click('button:has-text("3")');
    await page.waitForTimeout(500);
    
    // Verify current page indicator
    await expect(page.locator('button[aria-current="page"]')).toHaveText('3');
  });

  test('Mobile responsive view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify mobile menu toggle
    await page.click('[data-testid="mobile-menu-toggle"]');
    
    // Verify filters are in mobile drawer
    await expect(page.locator('[data-testid="mobile-filters"]')).toBeVisible();
    
    // Verify listing cards stack vertically
    const cards = await page.locator('[data-testid="listing-card"]').boundingBox();
    expect(cards?.width).toBeLessThan(375);
  });
});

test.describe('Marketplace Error Handling E2E', () => {
  test('Handle network errors gracefully', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true);
    
    await page.goto('/marketplace');
    
    // Verify error message
    await expect(page.locator('text=Unable to load listings. Please check your connection.')).toBeVisible();
    
    // Verify retry button
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();
  });

  test('Handle invalid listing ID', async ({ page }) => {
    // Navigate to non-existent listing
    await page.goto('/marketplace/invalid-id-12345');
    
    // Verify error handling
    await expect(page.locator('text=Listing not found')).toBeVisible();
    
    // Verify back to marketplace link
    await page.click('a:has-text("Back to Marketplace")');
    await expect(page).toHaveURL('/marketplace');
  });

  test('Handle form validation errors', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Go to create listing
    await page.goto('/marketplace/create');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Verify validation messages
    await expect(page.locator('text=Title is required')).toBeVisible();
    await expect(page.locator('text=Description is required')).toBeVisible();
    await expect(page.locator('text=Price is required')).toBeVisible();
    
    // Fill in invalid price
    await page.fill('input[name="price"]', '-10');
    await page.click('button[type="submit"]');
    
    // Verify price validation
    await expect(page.locator('text=Price must be greater than 0')).toBeVisible();
  });
});