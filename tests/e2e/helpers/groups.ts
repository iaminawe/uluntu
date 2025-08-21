import { Page, expect } from '@playwright/test';

export interface TestGroup {
  name: string;
  description: string;
  visibility: 'public' | 'private' | 'invite_only';
  tags?: string[];
}

export const generateTestGroup = (): TestGroup => {
  const timestamp = Date.now();
  return {
    name: `Test Group ${timestamp}`,
    description: `This is a test group created for automated testing purposes. Created at ${new Date().toISOString()}`,
    visibility: 'public',
    tags: ['testing', 'automation'],
  };
};

export const createGroup = async (page: Page, group: TestGroup): Promise<string | null> => {
  // Navigate to groups page
  await page.goto('/groups');
  await page.waitForLoadState('networkidle');
  
  // Look for create group button
  const createButtons = [
    'text=Create Group',
    'text=New Group',
    'button:has-text("Create")',
    'a:has-text("Create Group")',
    '[data-testid="create-group-button"]',
  ];
  
  let createButtonFound = false;
  for (const selector of createButtons) {
    const button = page.locator(selector);
    if (await button.count() > 0) {
      await button.click();
      createButtonFound = true;
      break;
    }
  }
  
  if (!createButtonFound) {
    // Try navigating directly to create group page
    await page.goto('/groups/create');
  }
  
  await page.waitForLoadState('networkidle');
  
  // Fill in group details
  await page.fill('input[name="name"], input[placeholder*="name" i]', group.name);
  await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', group.description);
  
  // Set visibility
  const visibilitySelectors = {
    public: ['text=Public', 'input[value="public"]', '[data-value="public"]'],
    private: ['text=Private', 'input[value="private"]', '[data-value="private"]'],
    invite_only: ['text=Invite Only', 'text=Invite-Only', 'input[value="invite_only"]', '[data-value="invite_only"]'],
  };
  
  const selectors = visibilitySelectors[group.visibility];
  for (const selector of selectors) {
    const element = page.locator(selector);
    if (await element.count() > 0) {
      await element.click();
      break;
    }
  }
  
  // Add tags if provided
  if (group.tags) {
    const tagInput = page.locator('input[placeholder*="tag" i]');
    if (await tagInput.count() > 0) {
      for (const tag of group.tags) {
        await tagInput.fill(tag);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(200);
      }
    }
  }
  
  // Submit form
  const submitButtons = [
    'button[type="submit"]',
    'button:has-text("Create")',
    'button:has-text("Save")',
    '[data-testid="create-group-submit"]',
  ];
  
  for (const selector of submitButtons) {
    const button = page.locator(selector);
    if (await button.count() > 0) {
      await button.click();
      break;
    }
  }
  
  await page.waitForLoadState('networkidle');
  
  // Check if group was created successfully
  const errorMessage = page.locator('text=/Error|Failed|Invalid/i');
  if (await errorMessage.count() > 0) {
    return null;
  }
  
  // Try to get group ID from URL
  const url = page.url();
  const groupIdMatch = url.match(/\/groups\/([^\/]+)/);
  return groupIdMatch ? groupIdMatch[1] : null;
};

export const navigateToGroup = async (page: Page, groupId: string): Promise<void> => {
  await page.goto(`/groups/${groupId}`);
  await page.waitForLoadState('networkidle');
};

export const editGroup = async (page: Page, updates: Partial<TestGroup>): Promise<boolean> => {
  // Look for edit button
  const editButtons = [
    'text=Edit',
    'text=Edit Group',
    'button:has-text("Edit")',
    '[data-testid="edit-group-button"]',
    'button[aria-label*="edit" i]',
  ];
  
  let editButtonFound = false;
  for (const selector of editButtons) {
    const button = page.locator(selector);
    if (await button.count() > 0) {
      await button.click();
      editButtonFound = true;
      break;
    }
  }
  
  if (!editButtonFound) {
    return false;
  }
  
  await page.waitForLoadState('networkidle');
  
  // Update fields if provided
  if (updates.name) {
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
    await nameInput.fill(updates.name);
  }
  
  if (updates.description) {
    const descInput = page.locator('textarea[name="description"], textarea[placeholder*="description" i]');
    await descInput.fill(updates.description);
  }
  
  if (updates.visibility) {
    const visibilitySelectors = {
      public: ['text=Public', 'input[value="public"]'],
      private: ['text=Private', 'input[value="private"]'],
      invite_only: ['text=Invite Only', 'input[value="invite_only"]'],
    };
    
    const selectors = visibilitySelectors[updates.visibility];
    for (const selector of selectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        await element.click();
        break;
      }
    }
  }
  
  // Save changes
  const saveButtons = [
    'button[type="submit"]',
    'button:has-text("Save")',
    'button:has-text("Update")',
    '[data-testid="save-group-button"]',
  ];
  
  for (const selector of saveButtons) {
    const button = page.locator(selector);
    if (await button.count() > 0) {
      await button.click();
      break;
    }
  }
  
  await page.waitForLoadState('networkidle');
  
  // Check for success
  const errorMessage = page.locator('text=/Error|Failed/i');
  return await errorMessage.count() === 0;
};

export const deleteGroup = async (page: Page): Promise<boolean> => {
  // Look for delete/settings button
  const settingsButtons = [
    'button:has-text("Settings")',
    'button:has-text("Options")',
    'button[aria-label*="menu" i]',
    'button[aria-label*="options" i]',
    '[data-testid="group-menu-button"]',
  ];
  
  for (const selector of settingsButtons) {
    const button = page.locator(selector);
    if (await button.count() > 0) {
      await button.click();
      await page.waitForTimeout(500);
      break;
    }
  }
  
  // Look for delete option
  const deleteButtons = [
    'text=Delete',
    'text=Delete Group',
    'button:has-text("Delete")',
    '[data-testid="delete-group-button"]',
  ];
  
  let deleteButtonFound = false;
  for (const selector of deleteButtons) {
    const button = page.locator(selector);
    if (await button.count() > 0) {
      await button.click();
      deleteButtonFound = true;
      break;
    }
  }
  
  if (!deleteButtonFound) {
    return false;
  }
  
  // Confirm deletion if confirmation dialog appears
  await page.waitForTimeout(500);
  const confirmButtons = [
    'button:has-text("Confirm")',
    'button:has-text("Delete")',
    'button:has-text("Yes")',
    '[data-testid="confirm-delete"]',
  ];
  
  for (const selector of confirmButtons) {
    const button = page.locator(selector);
    if (await button.count() > 0) {
      await button.click();
      break;
    }
  }
  
  await page.waitForLoadState('networkidle');
  
  // Check if redirected away from group page
  return !page.url().includes('/groups/') || page.url().includes('/groups') && !page.url().match(/\/groups\/[^\/]+/);
};

export const joinGroup = async (page: Page): Promise<boolean> => {
  const joinButtons = [
    'button:has-text("Join")',
    'button:has-text("Join Group")',
    '[data-testid="join-group-button"]',
    'text=Join Group',
  ];
  
  for (const selector of joinButtons) {
    const button = page.locator(selector);
    if (await button.count() > 0) {
      await button.click();
      await page.waitForLoadState('networkidle');
      
      // Check if join was successful (button should change to "Leave" or disappear)
      const leaveButton = page.locator('button:has-text("Leave")');
      return await leaveButton.count() > 0 || await button.count() === 0;
    }
  }
  
  return false;
};

export const leaveGroup = async (page: Page): Promise<boolean> => {
  const leaveButtons = [
    'button:has-text("Leave")',
    'button:has-text("Leave Group")',
    '[data-testid="leave-group-button"]',
  ];
  
  for (const selector of leaveButtons) {
    const button = page.locator(selector);
    if (await button.count() > 0) {
      await button.click();
      
      // Handle confirmation if present
      await page.waitForTimeout(500);
      const confirmButtons = [
        'button:has-text("Confirm")',
        'button:has-text("Leave")',
        'button:has-text("Yes")',
      ];
      
      for (const confirmSelector of confirmButtons) {
        const confirmButton = page.locator(confirmSelector);
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
          break;
        }
      }
      
      await page.waitForLoadState('networkidle');
      
      // Check if leave was successful (button should change to "Join")
      const joinButton = page.locator('button:has-text("Join")');
      return await joinButton.count() > 0;
    }
  }
  
  return false;
};

export const searchGroups = async (page: Page, query: string): Promise<void> => {
  await page.goto('/groups');
  await page.waitForLoadState('networkidle');
  
  const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]');
  if (await searchInput.count() > 0) {
    await searchInput.fill(query);
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');
  }
};