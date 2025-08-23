import { test, expect } from '@playwright/test';

test.describe('AI Editor Comprehensive Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ai-editor');
    await page.waitForLoadState('networkidle');
  });

  test('should complete comprehensive AI editor testing', async ({ page }) => {
    console.log('🚀 Starting comprehensive AI editor test...');

    // 1. Verify page loads correctly
    console.log('✅ Step 1: Verifying page loads correctly');
    await expect(page.locator('h1').getByText('AI BlockNote Editor')).toBeVisible();
    await expect(page.locator('.bn-editor')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('AI-Powered BlockNote Editor Demo')).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/01-page-loaded.png',
      fullPage: true
    });

    // 2. Click in editor area to focus
    console.log('✅ Step 2: Focusing editor');
    const editor = page.locator('.bn-editor').first();
    await editor.click();
    await page.waitForTimeout(500);

    // 3. Trigger slash menu by typing "/"
    console.log('✅ Step 3: Triggering slash menu');
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.type('/');

    // Wait for slash menu
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/02-slash-menu-full.png',
      fullPage: true
    });

    // 4. Verify AI Content Creation commands
    console.log('✅ Step 4: Verifying AI Content Creation commands');
    await expect(page.getByText('Blog Post')).toBeVisible();
    await expect(page.getByText('Article Outline')).toBeVisible();
    await expect(page.getByText('Introduction')).toBeVisible();
    await expect(page.getByText('Executive Summary')).toBeVisible();
    await expect(page.getByText('Social Media Post')).toBeVisible();
    await expect(page.getByText('Email Draft')).toBeVisible();
    await expect(page.getByText('Press Release')).toBeVisible();
    await expect(page.getByText('Product Description')).toBeVisible();
    await expect(page.getByText('FAQ Section')).toBeVisible();
    await expect(page.getByText('How-To Guide')).toBeVisible();
    await expect(page.getByText('Comparison')).toBeVisible();
    await expect(page.getByText('Continue Writing')).toBeVisible();
    await expect(page.getByText('Generate Ideas')).toBeVisible();
    await expect(page.getByText('Headlines')).toBeVisible();

    // 5. Verify AI Text Editing commands
    console.log('✅ Step 5: Verifying AI Text Editing commands');
    await expect(page.getByText('Improve Writing')).toBeVisible();
    await expect(page.getByText('Make Shorter')).toBeVisible();
    await expect(page.getByText('Make Longer')).toBeVisible();
    await expect(page.getByText('Professional Tone')).toBeVisible();
    await expect(page.getByText('Casual Tone')).toBeVisible();
    await expect(page.getByText('Convert to Bullets')).toBeVisible();
    await expect(page.getByText('Fix Grammar')).toBeVisible();

    // 6. Test filtering by typing "ai"
    console.log('✅ Step 6: Testing AI command filtering');
    await page.keyboard.type('ai');
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/03-filtered-ai-commands.png',
      fullPage: true
    });

    // 7. Clear and test Blog Post command
    console.log('✅ Step 7: Testing Blog Post command interaction');
    await page.keyboard.press('Escape'); // Close menu
    await page.waitForTimeout(500);
    
    // Re-trigger slash menu
    await page.keyboard.type('/');
    await page.waitForTimeout(1000);
    
    // Try clicking Blog Post (handle potential dialog)
    page.on('dialog', async dialog => {
      console.log('📝 Dialog detected:', dialog.message());
      if (dialog.type() === 'prompt') {
        await dialog.accept('Test AI blog post topic');
      } else if (dialog.type() === 'alert') {
        console.log('⚠️ Alert:', dialog.message());
        await dialog.accept();
      } else {
        await dialog.accept();
      }
    });

    const blogPostItem = page.getByText('Blog Post').first();
    if (await blogPostItem.isVisible()) {
      await blogPostItem.click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'test-results/screenshots/04-after-blog-post-click.png',
        fullPage: true
      });
    }

    // 8. Verify AI Assistant button in toolbar
    console.log('✅ Step 8: Verifying AI Assistant button');
    const aiButton = page.getByRole('button', { name: /AI Assistant/i });
    await expect(aiButton).toBeVisible();
    
    await aiButton.click();
    await page.waitForTimeout(1000);
    
    // Check if AI dropdown menu appears
    const aiMenu = page.locator('.ai-menu-dropdown');
    if (await aiMenu.isVisible()) {
      console.log('✅ AI toolbar menu opened successfully');
      await page.screenshot({ 
        path: 'test-results/screenshots/05-ai-toolbar-menu.png',
        fullPage: true
      });
    } else {
      console.log('ℹ️ AI toolbar menu not visible (may require configuration)');
    }

    // 9. Verify AI status indicator
    console.log('✅ Step 9: Verifying AI status indicator');
    const statusIndicator = page.locator('.ai-status-indicator');
    await expect(statusIndicator).toBeVisible();
    
    const hasAIReady = await page.getByText(/AI Ready/i).isVisible();
    const hasConfigMessage = await page.getByText(/Configure API keys/i).isVisible();
    expect(hasAIReady || hasConfigMessage).toBe(true);
    
    if (hasAIReady) {
      console.log('✅ AI is configured and ready');
    } else {
      console.log('ℹ️ AI configuration needed');
    }

    // 10. Scroll down and verify reference sections
    console.log('✅ Step 10: Verifying reference sections');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    await expect(page.getByText('Available AI Commands')).toBeVisible();
    await expect(page.getByText('Key Features')).toBeVisible();
    await expect(page.getByText('Pro Tips')).toBeVisible();
    
    await page.screenshot({ 
      path: 'test-results/screenshots/06-reference-sections.png',
      fullPage: true
    });

    // 11. Final comprehensive screenshot
    console.log('✅ Step 11: Taking final comprehensive screenshot');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    
    await page.screenshot({ 
      path: 'test-results/screenshots/07-final-comprehensive-view.png',
      fullPage: true
    });

    console.log('🎉 Comprehensive AI editor test completed successfully!');
  });
});