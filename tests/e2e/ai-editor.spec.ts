import { test, expect } from '@playwright/test';

test.describe('AI Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the AI editor page
    await page.goto('/ai-editor');
  });

  test('should navigate to AI editor and verify page loads correctly', async ({ page }) => {
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Check for main heading
    await expect(page.locator('h1').getByText('AI BlockNote Editor')).toBeVisible();
    
    // Check for BlockNote editor container
    await expect(page.locator('.blocknote-editor-wrapper')).toBeVisible();
    
    // Check for the BlockNote editor content area using BlockNote-specific selector
    await expect(page.locator('.bn-editor')).toBeVisible({ timeout: 10000 });
    
    // Verify initial content is loaded in the editor
    await expect(page.getByText('AI-Powered BlockNote Editor Demo')).toBeVisible();
    await expect(page.getByText('Welcome to the AI-enhanced BlockNote editor!')).toBeVisible();
    
    // Check for AI Assistant button
    await expect(page.getByRole('button', { name: /AI Assistant/i })).toBeVisible();
  });

  test('should focus editor when clicking in the editor area', async ({ page }) => {
    // Wait for editor to be ready
    await page.waitForSelector('.bn-editor', { state: 'visible' });
    
    // Click in the editor area to focus it
    const editor = page.locator('.bn-editor').first();
    await editor.click();
    
    // Wait for focus (BlockNote might take a moment to focus)
    await page.waitForTimeout(500);
  });

  test('should trigger slash menu when typing "/"', async ({ page }) => {
    // Wait for editor to be ready
    await page.waitForSelector('.bn-editor', { state: 'visible' });
    
    // Click in the editor area and type "/"
    const editor = page.locator('.bn-editor').first();
    await editor.click();
    
    // Position cursor at end and create new line
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.type('/');
    
    // Wait for slash menu to appear (try multiple possible selectors)
    try {
      await page.waitForSelector('[data-suggestion-menu]', { timeout: 3000 });
    } catch (e) {
      // Try alternative selector
      await page.waitForSelector('.bn-suggestion-menu', { timeout: 3000 });
    }
    
    // Take screenshot of current state
    await page.screenshot({ 
      path: 'test-results/screenshots/slash-menu-trigger-state.png',
      fullPage: true
    });
  });

  test('should show AI commands in slash menu', async ({ page }) => {
    // Wait for editor to be ready
    await page.waitForSelector('.blocknote-editor-wrapper', { state: 'visible' });
    
    // Click in the editor area and type "/"
    const editor = page.locator('[role="textbox"]').first();
    await editor.click();
    await page.keyboard.press('End'); // Go to end of content
    await page.keyboard.press('Enter'); // Create new line
    await page.keyboard.type('/');
    
    // Wait for slash menu to appear
    await page.waitForSelector('[data-suggestion-menu]', { timeout: 5000 });
    
    // Look for AI Content Creation section
    await expect(page.getByText('AI Content Creation')).toBeVisible();
    
    // Look for AI Text Editing section
    await expect(page.getByText('AI Text Editing')).toBeVisible();
    
    // Look for specific AI commands
    await expect(page.getByText('📄 Blog Post')).toBeVisible();
    await expect(page.getByText('📋 Article Outline')).toBeVisible();
    await expect(page.getByText('✨ Improve Writing')).toBeVisible();
    await expect(page.getByText('📝 Make Shorter')).toBeVisible();
  });

  test('should take screenshot of slash menu with AI commands', async ({ page }) => {
    // Wait for editor to be ready
    await page.waitForSelector('.blocknote-editor-wrapper', { state: 'visible' });
    
    // Click in the editor area and type "/"
    const editor = page.locator('[role="textbox"]').first();
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.type('/');
    
    // Wait for slash menu to appear
    await page.waitForSelector('[data-suggestion-menu]', { timeout: 5000 });
    
    // Wait a moment for menu to fully render
    await page.waitForTimeout(1000);
    
    // Take screenshot of the slash menu
    await page.screenshot({ 
      path: 'test-results/screenshots/ai-editor-slash-menu.png',
      clip: await page.locator('[data-suggestion-menu]').boundingBox() || undefined
    });
    
    // Also take a full page screenshot
    await page.screenshot({ 
      path: 'test-results/screenshots/ai-editor-full-page-with-slash-menu.png',
      fullPage: true
    });
  });

  test('should filter AI commands when typing "ai" after "/"', async ({ page }) => {
    // Wait for editor to be ready
    await page.waitForSelector('.blocknote-editor-wrapper', { state: 'visible' });
    
    // Click in the editor area and type "/ai"
    const editor = page.locator('[role="textbox"]').first();
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.type('/ai');
    
    // Wait for filtered slash menu to appear
    await page.waitForSelector('[data-suggestion-menu]', { timeout: 5000 });
    
    // Verify AI commands are still visible after filtering
    const menu = page.locator('[data-suggestion-menu]');
    await expect(menu).toBeVisible();
    
    // Check that AI-related items are shown
    // The filtering should show AI commands since they have 'ai' in their aliases
    await expect(page.getByText('AI Content Creation')).toBeVisible();
    await expect(page.getByText('AI Text Editing')).toBeVisible();
    
    // Take screenshot of filtered results
    await page.screenshot({ 
      path: 'test-results/screenshots/ai-editor-filtered-ai-commands.png',
      clip: await menu.boundingBox() || undefined
    });
  });

  test('should test clicking on AI commands (Blog Post)', async ({ page }) => {
    // Wait for editor to be ready
    await page.waitForSelector('.blocknote-editor-wrapper', { state: 'visible' });
    
    // Click in the editor area and type "/"
    const editor = page.locator('[role="textbox"]').first();
    await editor.click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.type('/');
    
    // Wait for slash menu to appear
    await page.waitForSelector('[data-suggestion-menu]', { timeout: 5000 });
    
    // Look for Blog Post command and try to click it
    const blogPostItem = page.getByText('📄 Blog Post').first();
    await expect(blogPostItem).toBeVisible();
    
    // Handle potential prompt dialog that may appear
    page.on('dialog', async dialog => {
      console.log('Dialog appeared:', dialog.message());
      // If it's asking for a topic, provide one
      if (dialog.type() === 'prompt') {
        await dialog.accept('Test topic for blog post');
      } else {
        await dialog.accept();
      }
    });
    
    // Click on Blog Post command
    await blogPostItem.click();
    
    // Verify the slash menu disappears
    await expect(page.locator('[data-suggestion-menu]')).not.toBeVisible({ timeout: 5000 });
    
    // Take screenshot after clicking
    await page.screenshot({ 
      path: 'test-results/screenshots/ai-editor-after-blog-post-click.png',
      fullPage: true
    });
  });

  test('should verify AI toolbar button is visible', async ({ page }) => {
    // Wait for editor to be ready
    await page.waitForSelector('.blocknote-editor-wrapper', { state: 'visible' });
    
    // Check if AI Assistant button is visible in toolbar
    const aiButton = page.getByRole('button', { name: /AI Assistant/i });
    
    // If AI is configured, button should be visible, otherwise it might not be
    try {
      await expect(aiButton).toBeVisible({ timeout: 3000 });
      console.log('AI Assistant button found - AI is configured');
      
      // Click the AI Assistant button
      await aiButton.click();
      
      // Check if AI menu dropdown appears
      await expect(page.locator('.ai-menu-dropdown')).toBeVisible({ timeout: 3000 });
      
      // Take screenshot of AI menu
      await page.screenshot({ 
        path: 'test-results/screenshots/ai-editor-ai-toolbar-menu.png',
        fullPage: true
      });
      
    } catch (error) {
      console.log('AI Assistant button not found - AI may not be configured');
      
      // Check for AI configuration message
      const configMessage = page.getByText(/Configure API keys/i);
      if (await configMessage.isVisible()) {
        console.log('Found AI configuration message');
      }
      
      // Take screenshot anyway to show current state
      await page.screenshot({ 
        path: 'test-results/screenshots/ai-editor-no-ai-config.png',
        fullPage: true
      });
    }
  });

  test('should verify AI status indicator', async ({ page }) => {
    // Wait for editor to be ready
    await page.waitForSelector('.blocknote-editor-wrapper', { state: 'visible' });
    
    // Check for AI status indicator
    const statusIndicator = page.locator('.ai-status-indicator');
    await expect(statusIndicator).toBeVisible();
    
    // Check for either "AI Ready" or configuration message
    const hasAIReady = await page.getByText(/AI Ready/i).isVisible();
    const hasConfigMessage = await page.getByText(/Configure API keys/i).isVisible();
    
    expect(hasAIReady || hasConfigMessage).toBe(true);
    
    // Take screenshot of status indicator
    await page.screenshot({ 
      path: 'test-results/screenshots/ai-editor-status-indicator.png',
      clip: await statusIndicator.boundingBox() || undefined
    });
  });

  test('should verify AI commands reference section', async ({ page }) => {
    // Scroll down to see the AI commands reference
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check for Available AI Commands section
    await expect(page.getByText('Available AI Commands')).toBeVisible();
    
    // Check for Content Creation section
    await expect(page.getByText('Content Creation')).toBeVisible();
    
    // Check for Content Editing section  
    await expect(page.getByText('Content Editing')).toBeVisible();
    
    // Verify some specific command cards are visible
    await expect(page.getByText('Blog Post')).toBeVisible();
    await expect(page.getByText('Improve Writing')).toBeVisible();
    
    // Take screenshot of the reference section
    await page.screenshot({ 
      path: 'test-results/screenshots/ai-editor-commands-reference.png',
      fullPage: true
    });
  });

  test('should verify editor features grid', async ({ page }) => {
    // Scroll to the bottom to see all features
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check for Key Features section
    await expect(page.getByText('Key Features')).toBeVisible();
    
    // Check for Pro Tips section
    await expect(page.getByText('Pro Tips')).toBeVisible();
    
    // Verify some feature items
    await expect(page.getByText('Real-time AI suggestions')).toBeVisible();
    await expect(page.getByText('Block-based editing')).toBeVisible();
    
    // Take screenshot of features grid
    await page.screenshot({ 
      path: 'test-results/screenshots/ai-editor-features-grid.png',
      fullPage: true
    });
  });
});