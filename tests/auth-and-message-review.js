import { chromium } from 'playwright';

async function reviewMessagesWithAuth() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Starting message alignment review...');
    
    // Navigate to the messages page
    console.log('📍 Navigating to messages page...');
    await page.goto('http://localhost:5555/messages', { waitUntil: 'networkidle' });
    
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    // If redirected to sign-in, try to authenticate
    if (currentUrl.includes('signin') || currentUrl.includes('auth')) {
      console.log('🔐 Need to authenticate first...');
      
      // Check if there are any existing sessions or demo data
      // Look for test credentials or demo login options
      const loginForm = await page.$('form');
      if (loginForm) {
        // Try to find email/username and password fields
        const emailField = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i]');
        const passwordField = await page.$('input[type="password"], input[name="password"]');
        
        if (emailField && passwordField) {
          console.log('🔑 Found login form, attempting test login...');
          // Try some common test credentials
          await emailField.fill('test@example.com');
          await passwordField.fill('password123');
          
          const submitBtn = await page.$('button[type="submit"], input[type="submit"], button:has-text("Sign")');
          if (submitBtn) {
            await submitBtn.click();
            await page.waitForTimeout(2000);
            
            // Check if login was successful
            const newUrl = page.url();
            if (!newUrl.includes('signin') && !newUrl.includes('auth')) {
              console.log('✅ Login successful!');
              // Navigate to messages page again
              await page.goto('http://localhost:5555/messages', { waitUntil: 'networkidle' });
            } else {
              console.log('❌ Login failed with test credentials');
            }
          }
        }
      }
      
      // If still on auth page, check for demo/test user options
      const demoButtons = await page.$$('button:has-text("Demo"), button:has-text("Test"), a:has-text("Demo"), a:has-text("Test")');
      if (demoButtons.length > 0) {
        console.log('🎭 Found demo/test user option...');
        await demoButtons[0].click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Final check - are we on the messages page?
    const finalUrl = page.url();
    if (finalUrl.includes('signin') || finalUrl.includes('auth')) {
      console.log('❌ Still on authentication page. Manual login may be required.');
      console.log('🎯 Keeping browser open for manual login...');
      await page.waitForTimeout(10000); // Give time for manual login
    }
    
    // Look for messages now
    console.log('🔍 Searching for message elements...');
    await page.waitForTimeout(3000);
    
    // More specific selectors for message elements
    const possibleMessageSelectors = [
      '[class*="flex items-end gap-2 mb-4"]',
      '[class*="message-bubble"]',
      '[class*="MessageBubble"]',
      '.flex.items-end.gap-2.mb-4',
      '[class*="px-4 py-2 rounded-2xl"]'
    ];
    
    let messageElements = [];
    for (const selector of possibleMessageSelectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        messageElements = elements;
        console.log(`✅ Found ${elements.length} messages using selector: ${selector}`);
        break;
      }
    }
    
    if (messageElements.length === 0) {
      console.log('🔍 No messages found with standard selectors, checking page content...');
      
      // Check if there's a "no messages" state or loading state
      const pageText = await page.textContent('body');
      if (pageText.includes('No messages') || pageText.includes('Start the conversation')) {
        console.log('💬 Page shows "no messages" state - this is normal for empty conversations');
      } else if (pageText.includes('loading') || pageText.includes('Loading')) {
        console.log('⏳ Page is still loading...');
        await page.waitForTimeout(3000);
      }
      
      // Take a screenshot to see what we're working with
      await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/messages-page-debug.png', fullPage: true });
      console.log('📷 Debug screenshot saved to tests/messages-page-debug.png');
      
      // Look for any element that might contain messages
      const allDivs = await page.$$('div');
      console.log(`🔍 Found ${allDivs.length} div elements total on the page`);
      
      // Check for conversation-related elements
      const conversationElements = await page.$$('[class*="conversation"], [class*="chat"], [class*="message"]');
      if (conversationElements.length > 0) {
        console.log(`💬 Found ${conversationElements.length} conversation-related elements`);
      }
      
      return;
    }
    
    console.log(`\n🎯 Found ${messageElements.length} message elements! Analyzing alignment...`);
    
    // Analyze each message
    for (let i = 0; i < Math.min(messageElements.length, 8); i++) {
      const messageEl = messageElements[i];
      const className = await messageEl.getAttribute('class');
      
      console.log(`\n--- 💬 Message ${i + 1} ---`);
      console.log('🎨 Classes:', className);
      
      // Check alignment
      const hasJustifyStart = className.includes('justify-start');
      const hasJustifyEnd = className.includes('justify-end');
      
      if (hasJustifyStart) {
        console.log('📍 Alignment: LEFT (justify-start)');
      } else if (hasJustifyEnd) {
        console.log('📍 Alignment: RIGHT (justify-end)');
      } else {
        console.log('❌ No justify alignment detected');
      }
      
      // Check message bubble color to determine message type
      const bubbleEl = await messageEl.$('[class*="px-4 py-2 rounded-2xl"], [class*="rounded"], [class*="bg-"]');
      if (bubbleEl) {
        const bubbleClass = await bubbleEl.getAttribute('class');
        console.log('🎨 Bubble classes:', bubbleClass);
        
        // Determine message type by background color
        if (bubbleClass.includes('bg-slate')) {
          console.log('👤 Type: Own message (slate/gray background)');
          if (!hasJustifyEnd) {
            console.log('❌ ISSUE: Own messages should use justify-end (right alignment)');
          } else {
            console.log('✅ Correctly aligned: Own message on right');
          }
        } else if (bubbleClass.includes('bg-purple') || bubbleClass.includes('bg-green') || 
                   bubbleClass.includes('bg-pink') || bubbleClass.includes('bg-blue') ||
                   bubbleClass.includes('bg-indigo') || bubbleClass.includes('bg-red') ||
                   bubbleClass.includes('bg-teal') || bubbleClass.includes('bg-yellow') ||
                   bubbleClass.includes('bg-orange')) {
          console.log('👥 Type: Other user message (colored background)');
          if (!hasJustifyStart) {
            console.log('❌ ISSUE: Other user messages should use justify-start (left alignment)');
          } else {
            console.log('✅ Correctly aligned: Other user message on left');
          }
        }
      }
      
      // Check avatar position
      const avatarImages = await messageEl.$$('img');
      const avatarDivs = await messageEl.$$('div[class*="rounded-full"]');
      const totalAvatars = avatarImages.length + avatarDivs.length;
      
      if (totalAvatars > 0) {
        console.log(`🎭 Found ${totalAvatars} avatar(s)`);
        
        // Check avatar position relative to message
        const messageRect = await messageEl.boundingBox();
        if (avatarImages.length > 0) {
          const avatarRect = await avatarImages[0].boundingBox();
          if (avatarRect && messageRect) {
            const avatarOnLeft = avatarRect.x < messageRect.x + messageRect.width / 2;
            console.log(`📍 Avatar position: ${avatarOnLeft ? 'LEFT' : 'RIGHT'} of message`);
          }
        }
      }
      
      // Get message content
      const messageText = await messageEl.textContent();
      const shortText = messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText;
      console.log(`💬 Content preview: "${shortText}"`);
    }
    
    // Take a final screenshot showing the current state
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/messages-alignment-analysis.png', fullPage: true });
    console.log('\n📷 Final screenshot saved to tests/messages-alignment-analysis.png');
    
    console.log('\n✅ Analysis complete! Check the screenshots and console output above.');
    console.log('🎯 Key findings:');
    console.log('   - Own messages (gray/slate) should be RIGHT aligned (justify-end)');
    console.log('   - Other user messages (colored) should be LEFT aligned (justify-start)');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/error-screenshot.png', fullPage: true });
    console.log('📷 Error screenshot saved to tests/error-screenshot.png');
  } finally {
    console.log('\n🔚 Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

reviewMessagesWithAuth();