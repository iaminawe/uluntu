import { Page, expect } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  name: string;
  bio?: string;
  title?: string;
}

export const generateTestUser = (): TestUser => {
  const timestamp = Date.now();
  return {
    email: `test_${timestamp}@example.com`,
    password: 'TestPassword123!',
    name: `Test User ${timestamp}`,
    bio: 'This is a test bio for automated testing purposes.',
    title: 'Software Engineer',
  };
};

export const signIn = async (page: Page, email: string, password: string): Promise<boolean> => {
  await page.goto('/signin');
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  await page.waitForLoadState('networkidle');
  
  // Check if login was successful
  const errorMessage = page.locator('text=/Invalid|Error|Failed/i');
  if (await errorMessage.count() > 0) {
    return false;
  }
  
  // Check for logged-in indicators
  const loggedInIndicators = [
    'button[aria-label*="user" i]',
    'button[aria-label*="account" i]',
    'button[aria-label*="profile" i]',
    'text=Sign Out',
    'text=Log Out',
  ];

  for (const indicator of loggedInIndicators) {
    if (await page.locator(indicator).count() > 0) {
      return true;
    }
  }
  
  return false;
};

export const signOut = async (page: Page): Promise<void> => {
  // Look for sign out options
  const signOutSelectors = [
    'text=Sign Out',
    'text=Log Out',
    'button:has-text("Sign Out")',
    'button:has-text("Log Out")',
  ];

  for (const selector of signOutSelectors) {
    const element = page.locator(selector);
    if (await element.count() > 0) {
      await element.click();
      await page.waitForLoadState('networkidle');
      return;
    }
  }

  // If no direct sign out button, try user menu
  const userMenuButton = page.locator('button[aria-label*="user" i], button[aria-label*="account" i]');
  if (await userMenuButton.count() > 0) {
    await userMenuButton.click();
    await page.waitForTimeout(500);
    
    for (const selector of signOutSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        await element.click();
        await page.waitForLoadState('networkidle');
        return;
      }
    }
  }
};

export const createTestAccount = async (page: Page, user: TestUser): Promise<boolean> => {
  await page.goto('/signup');
  
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  
  // Look for confirm password field if it exists
  const confirmPasswordField = page.locator('input[placeholder*="Confirm"]');
  if (await confirmPasswordField.count() > 0) {
    await confirmPasswordField.fill(user.password);
  }

  // Accept terms if checkbox exists
  const termsCheckbox = page.locator('input[type="checkbox"]');
  if (await termsCheckbox.count() > 0) {
    await termsCheckbox.check();
  }

  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  
  // Check if account creation was successful
  const errorMessage = page.locator('text=/Error|Failed|Invalid/i');
  return await errorMessage.count() === 0;
};

export const ensureAuthenticated = async (page: Page, user?: TestUser): Promise<TestUser> => {
  const testUser = user || generateTestUser();
  
  // Check if already authenticated
  const loggedInIndicators = [
    'button[aria-label*="user" i]',
    'button[aria-label*="account" i]',
    'text=Sign Out',
  ];

  for (const indicator of loggedInIndicators) {
    if (await page.locator(indicator).count() > 0) {
      return testUser;
    }
  }
  
  // Try to sign in first
  const signInSuccess = await signIn(page, testUser.email, testUser.password);
  if (signInSuccess) {
    return testUser;
  }
  
  // If sign in fails, create new account
  const createSuccess = await createTestAccount(page, testUser);
  if (!createSuccess) {
    throw new Error('Failed to create test account');
  }
  
  return testUser;
};

export const waitForElement = async (page: Page, selector: string, timeout = 5000): Promise<boolean> => {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
};

export const clickElementSafely = async (page: Page, selectors: string[]): Promise<boolean> => {
  for (const selector of selectors) {
    const element = page.locator(selector);
    if (await element.count() > 0) {
      await element.click();
      return true;
    }
  }
  return false;
};