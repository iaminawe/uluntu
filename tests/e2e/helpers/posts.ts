import { Page, expect } from '@playwright/test';

export interface TestPost {
  content: string;
  isAnnouncement?: boolean;
  attachments?: string[];
}

export const generateTestPost = (isAnnouncement = false): TestPost => {
  const timestamp = Date.now();
  return {
    content: `This is a test post created for automated testing purposes. Created at ${new Date().toISOString()}. Timestamp: ${timestamp}`,
    isAnnouncement,
  };
};

export const createPost = async (page: Page, post: TestPost): Promise<string | null> => {
  // Look for create post area
  const postInputSelectors = [
    'textarea[placeholder*="What\'s on your mind" i]',
    'textarea[placeholder*="Share something" i]',
    'textarea[placeholder*="Create a post" i]',
    'textarea[name="content"]',
    '[data-testid="post-input"]',
    '.post-composer textarea',
  ];
  
  let postInput = null;
  for (const selector of postInputSelectors) {
    const element = page.locator(selector);
    if (await element.count() > 0) {
      postInput = element;
      break;
    }
  }
  
  if (!postInput) {
    // Try clicking a "Create Post" button first
    const createPostButtons = [
      'button:has-text("Create Post")',
      'button:has-text("New Post")',
      'text=Create Post',
      '[data-testid="create-post-button"]',
    ];
    
    for (const selector of createPostButtons) {
      const button = page.locator(selector);
      if (await button.count() > 0) {
        await button.click();
        await page.waitForTimeout(500);
        break;
      }
    }
    
    // Try again to find post input
    for (const selector of postInputSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        postInput = element;
        break;
      }
    }
  }
  
  if (!postInput) {
    return null;
  }
  
  // Fill in post content
  await postInput.fill(post.content);
  
  // Handle announcement checkbox if this is an announcement
  if (post.isAnnouncement) {
    const announcementCheckbox = page.locator('input[type="checkbox"]:has-text("Announcement"), label:has-text("Announcement") input');
    if (await announcementCheckbox.count() > 0) {
      await announcementCheckbox.check();
    }
  }
  
  // Submit the post
  const submitButtons = [
    'button[type="submit"]',
    'button:has-text("Post")',
    'button:has-text("Share")',
    'button:has-text("Publish")',
    '[data-testid="submit-post"]',
  ];
  
  for (const selector of submitButtons) {
    const button = page.locator(selector);
    if (await button.count() > 0) {
      await button.click();
      break;
    }
  }
  
  await page.waitForLoadState('networkidle');
  
  // Check if post was created successfully
  const errorMessage = page.locator('text=/Error|Failed/i');
  if (await errorMessage.count() > 0) {
    return null;
  }
  
  // Try to find the newly created post and extract its ID
  await page.waitForTimeout(1000);
  const posts = page.locator('[data-testid="post"], .post-item, article').filter({ hasText: post.content.substring(0, 50) });
  if (await posts.count() > 0) {
    const postElement = posts.first();
    const postId = await postElement.getAttribute('data-post-id') || 
                   await postElement.getAttribute('id') ||
                   await postElement.locator('[data-post-id]').getAttribute('data-post-id');
    return postId;
  }
  
  return 'created'; // Fallback if we can't extract ID but post seems created
};

export const replyToPost = async (page: Page, postId: string, replyContent: string): Promise<boolean> => {
  // Find the post by ID or content
  const postSelectors = [
    `[data-post-id="${postId}"]`,
    `#post-${postId}`,
    `[id="${postId}"]`,
  ];
  
  let postElement = null;
  for (const selector of postSelectors) {
    const element = page.locator(selector);
    if (await element.count() > 0) {
      postElement = element;
      break;
    }
  }
  
  if (!postElement) {
    // Try to find post by partial content match
    postElement = page.locator('[data-testid="post"], .post-item, article').first();
  }
  
  if (!postElement) {
    return false;
  }
  
  // Look for reply button within the post
  const replyButtons = [
    'button:has-text("Reply")',
    'button[aria-label*="reply" i]',
    '[data-testid="reply-button"]',
    '.reply-button',
  ];
  
  for (const selector of replyButtons) {
    const replyButton = postElement.locator(selector);
    if (await replyButton.count() > 0) {
      await replyButton.click();
      await page.waitForTimeout(500);
      break;
    }
  }
  
  // Find reply input field
  const replyInputSelectors = [
    'textarea[placeholder*="reply" i]',
    'textarea[placeholder*="comment" i]',
    'input[placeholder*="reply" i]',
    '[data-testid="reply-input"]',
    '.reply-input textarea',
    '.reply-input input',
  ];
  
  let replyInput = null;
  for (const selector of replyInputSelectors) {
    const element = page.locator(selector);
    if (await element.count() > 0 && await element.isVisible()) {
      replyInput = element;
      break;
    }
  }
  
  if (!replyInput) {
    return false;
  }
  
  // Fill and submit reply
  await replyInput.fill(replyContent);
  
  const submitReplyButtons = [
    'button:has-text("Reply")',
    'button:has-text("Comment")',
    'button:has-text("Post")',
    'button[type="submit"]',
    '[data-testid="submit-reply"]',
  ];
  
  for (const selector of submitReplyButtons) {
    const button = page.locator(selector);
    if (await button.count() > 0 && await button.isVisible()) {
      await button.click();
      break;
    }
  }
  
  await page.waitForLoadState('networkidle');
  
  // Check if reply was successful
  const errorMessage = page.locator('text=/Error|Failed/i');
  return await errorMessage.count() === 0;
};

export const editPost = async (page: Page, postId: string, newContent: string): Promise<boolean> => {
  // Find the post
  const postSelectors = [
    `[data-post-id="${postId}"]`,
    `#post-${postId}`,
    `[id="${postId}"]`,
  ];
  
  let postElement = null;
  for (const selector of postSelectors) {
    const element = page.locator(selector);
    if (await element.count() > 0) {
      postElement = element;
      break;
    }
  }
  
  if (!postElement) {
    postElement = page.locator('[data-testid="post"], .post-item, article').first();
  }
  
  if (!postElement) {
    return false;
  }
  
  // Look for edit menu/button
  const menuButtons = [
    'button[aria-label*="menu" i]',
    'button[aria-label*="options" i]',
    'button:has-text("⋯")',
    '[data-testid="post-menu"]',
    '.post-menu-button',
  ];
  
  for (const selector of menuButtons) {
    const menuButton = postElement.locator(selector);
    if (await menuButton.count() > 0) {
      await menuButton.click();
      await page.waitForTimeout(500);
      break;
    }
  }
  
  // Click edit option
  const editButtons = [
    'button:has-text("Edit")',
    'text=Edit Post',
    '[data-testid="edit-post"]',
  ];
  
  for (const selector of editButtons) {
    const editButton = page.locator(selector);
    if (await editButton.count() > 0) {
      await editButton.click();
      await page.waitForTimeout(500);
      break;
    }
  }
  
  // Find edit input field
  const editInputSelectors = [
    'textarea[name="content"]',
    'textarea[placeholder*="edit" i]',
    '[data-testid="edit-post-input"]',
    '.edit-post-input textarea',
  ];
  
  let editInput = null;
  for (const selector of editInputSelectors) {
    const element = page.locator(selector);
    if (await element.count() > 0 && await element.isVisible()) {
      editInput = element;
      break;
    }
  }
  
  if (!editInput) {
    return false;
  }
  
  // Update content and save
  await editInput.fill(newContent);
  
  const saveButtons = [
    'button:has-text("Save")',
    'button:has-text("Update")',
    'button[type="submit"]',
    '[data-testid="save-edit"]',
  ];
  
  for (const selector of saveButtons) {
    const button = page.locator(selector);
    if (await button.count() > 0 && await button.isVisible()) {
      await button.click();
      break;
    }
  }
  
  await page.waitForLoadState('networkidle');
  
  // Check if edit was successful
  const errorMessage = page.locator('text=/Error|Failed/i');
  return await errorMessage.count() === 0;
};

export const deletePost = async (page: Page, postId: string): Promise<boolean> => {
  // Find the post
  const postSelectors = [
    `[data-post-id="${postId}"]`,
    `#post-${postId}`,
    `[id="${postId}"]`,
  ];
  
  let postElement = null;
  for (const selector of postSelectors) {
    const element = page.locator(selector);
    if (await element.count() > 0) {
      postElement = element;
      break;
    }
  }
  
  if (!postElement) {
    postElement = page.locator('[data-testid="post"], .post-item, article').first();
  }
  
  if (!postElement) {
    return false;
  }
  
  // Look for menu button
  const menuButtons = [
    'button[aria-label*="menu" i]',
    'button[aria-label*="options" i]',
    'button:has-text("⋯")',
    '[data-testid="post-menu"]',
  ];
  
  for (const selector of menuButtons) {
    const menuButton = postElement.locator(selector);
    if (await menuButton.count() > 0) {
      await menuButton.click();
      await page.waitForTimeout(500);
      break;
    }
  }
  
  // Click delete option
  const deleteButtons = [
    'button:has-text("Delete")',
    'text=Delete Post',
    '[data-testid="delete-post"]',
  ];
  
  for (const selector of deleteButtons) {
    const deleteButton = page.locator(selector);
    if (await deleteButton.count() > 0) {
      await deleteButton.click();
      await page.waitForTimeout(500);
      break;
    }
  }
  
  // Confirm deletion if confirmation dialog appears
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
  
  // Check if post was deleted (should no longer exist)
  await page.waitForTimeout(1000);
  const postStillExists = await postElement.count() > 0;
  return !postStillExists;
};

export const likePost = async (page: Page, postId: string): Promise<boolean> => {
  const postSelectors = [
    `[data-post-id="${postId}"]`,
    `#post-${postId}`,
    `[id="${postId}"]`,
  ];
  
  let postElement = null;
  for (const selector of postSelectors) {
    const element = page.locator(selector);
    if (await element.count() > 0) {
      postElement = element;
      break;
    }
  }
  
  if (!postElement) {
    postElement = page.locator('[data-testid="post"], .post-item, article').first();
  }
  
  if (!postElement) {
    return false;
  }
  
  // Look for like button
  const likeButtons = [
    'button:has-text("Like")',
    'button[aria-label*="like" i]',
    '[data-testid="like-button"]',
    '.like-button',
  ];
  
  for (const selector of likeButtons) {
    const likeButton = postElement.locator(selector);
    if (await likeButton.count() > 0) {
      await likeButton.click();
      await page.waitForTimeout(500);
      return true;
    }
  }
  
  return false;
};

export const checkPostPermissions = async (page: Page, postId: string): Promise<{ canEdit: boolean; canDelete: boolean }> => {
  const postSelectors = [
    `[data-post-id="${postId}"]`,
    `#post-${postId}`,
    `[id="${postId}"]`,
  ];
  
  let postElement = null;
  for (const selector of postSelectors) {
    const element = page.locator(selector);
    if (await element.count() > 0) {
      postElement = element;
      break;
    }
  }
  
  if (!postElement) {
    return { canEdit: false, canDelete: false };
  }
  
  // Check for menu button first
  const menuButton = postElement.locator('button[aria-label*="menu" i], button[aria-label*="options" i]');
  if (await menuButton.count() === 0) {
    return { canEdit: false, canDelete: false };
  }
  
  await menuButton.click();
  await page.waitForTimeout(500);
  
  const canEdit = await page.locator('button:has-text("Edit"), text=Edit Post').count() > 0;
  const canDelete = await page.locator('button:has-text("Delete"), text=Delete Post').count() > 0;
  
  // Close menu by clicking elsewhere
  await page.click('body');
  
  return { canEdit, canDelete };
};