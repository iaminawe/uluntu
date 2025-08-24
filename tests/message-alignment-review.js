import { chromium } from 'playwright';

async function reviewMessagesPage() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to messages page...');
    await page.goto('http://localhost:5555/messages');
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // Check if we're redirected to login or if messages are visible
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      console.log('❌ Redirected to login page - need to authenticate first');
      return;
    }
    
    // Look for message elements
    const messageElements = await page.$$('[class*="flex items-end gap-2 mb-4"]');
    console.log(`Found ${messageElements.length} message elements`);
    
    if (messageElements.length === 0) {
      console.log('❌ No messages found on the page');
      // Check for any error messages or loading states
      const errorText = await page.textContent('body').catch(() => null);
      console.log('Page content preview:', errorText?.substring(0, 500));
      return;
    }
    
    // Analyze each message element
    for (let i = 0; i < Math.min(messageElements.length, 5); i++) {
      const messageEl = messageElements[i];
      const className = await messageEl.getAttribute('class');
      const innerHTML = await messageEl.innerHTML();
      
      console.log(`\n--- Message ${i + 1} ---`);
      console.log('Classes:', className);
      
      // Check alignment
      if (className.includes('justify-start')) {
        console.log('✓ Alignment: LEFT (justify-start)');
      } else if (className.includes('justify-end')) {
        console.log('✓ Alignment: RIGHT (justify-end)');
      } else {
        console.log('❌ No justify alignment found');
      }
      
      // Check for avatar position
      const avatars = await messageEl.$$('img, div[class*="rounded-full"]');
      console.log(`Found ${avatars.length} avatar(s)`);
      
      // Check message bubble color to identify user type
      const bubbleEl = await messageEl.$('[class*="px-4 py-2 rounded-2xl"]');
      if (bubbleEl) {
        const bubbleClass = await bubbleEl.getAttribute('class');
        if (bubbleClass.includes('bg-slate')) {
          console.log('Message type: Own message (slate background)');
        } else if (bubbleClass.includes('bg-purple') || bubbleClass.includes('bg-green') || bubbleClass.includes('bg-pink')) {
          console.log('Message type: Other user message (colored background)');
        }
        console.log('Bubble classes:', bubbleClass);
      }
    }
    
    // Take a screenshot for visual reference
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/messages-page-screenshot.png', fullPage: true });
    console.log('\n📷 Screenshot saved to tests/messages-page-screenshot.png');
    
    // Check the current user info if available
    const userInfo = await page.evaluate(() => {
      // Try to find user info in localStorage or sessionStorage
      const sessionData = localStorage.getItem('session') || sessionStorage.getItem('session');
      return sessionData ? JSON.parse(sessionData) : null;
    }).catch(() => null);
    
    if (userInfo) {
      console.log('\n👤 Current user info:', userInfo);
    }
    
    console.log('\n✅ Review completed');
    
  } catch (error) {
    console.error('❌ Error during review:', error.message);
  } finally {
    await browser.close();
  }
}

reviewMessagesPage();