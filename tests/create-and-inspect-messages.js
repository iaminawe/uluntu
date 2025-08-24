import { chromium } from 'playwright';

async function createAndInspectMessages() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Creating and inspecting message alignment...');
    
    // Step 1: Authenticate
    console.log('🔐 Authenticating with test account...');
    await page.goto('http://localhost:5555/signin', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'gregg@smrt1.ca');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Step 2: Go to messages page
    console.log('📱 Navigating to messages page...');
    await page.goto('http://localhost:5555/messages', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Step 3: Look for conversation list or create new conversation
    console.log('💬 Looking for conversations or creating new one...');
    
    // Check if we have conversations in the sidebar
    const conversationItems = await page.$$('[class*="conversation"], button:has-text("Start"), [href*="conversation"], li');
    console.log(`📋 Found ${conversationItems.length} potential conversation items`);
    
    // Try to click on a conversation if available
    let conversationFound = false;
    for (let i = 0; i < Math.min(conversationItems.length, 5); i++) {
      try {
        const item = conversationItems[i];
        const text = await item.textContent();
        console.log(`🔍 Conversation item ${i + 1}: "${text?.trim().substring(0, 50)}"`);
        
        // Skip if it's just navigation elements
        if (text && !text.toLowerCase().includes('home') && !text.toLowerCase().includes('profile') && text.trim().length > 5) {
          console.log(`🎯 Clicking on conversation item ${i + 1}...`);
          await item.click();
          await page.waitForTimeout(2000);
          conversationFound = true;
          break;
        }
      } catch (error) {
        console.log(`⚠️ Could not click item ${i + 1}: ${error.message}`);
      }
    }
    
    if (!conversationFound) {
      console.log('📝 No existing conversations found, looking for way to start new conversation...');
      
      // Look for "New Conversation", "Start Chat", or similar buttons
      const newChatButtons = await page.$$('button:has-text("New"), button:has-text("Start"), button:has-text("Chat"), a[href*="new"]');
      if (newChatButtons.length > 0) {
        console.log(`🆕 Found ${newChatButtons.length} new conversation buttons, clicking first one...`);
        await newChatButtons[0].click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Step 4: Look for message input and send test messages
    console.log('✏️ Looking for message input field...');
    
    const messageInputs = await page.$$('textarea, input[placeholder*="message" i], input[placeholder*="type" i], [contenteditable="true"]');
    console.log(`📝 Found ${messageInputs.length} potential message input fields`);
    
    if (messageInputs.length === 0) {
      console.log('❌ No message input fields found. Taking screenshot for debugging...');
      await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/no-input-debug.png', fullPage: true });
      
      // Check the page structure
      const pageText = await page.textContent('body');
      console.log(`📄 Page content preview: ${pageText.substring(0, 300)}...`);
      
      return;
    }
    
    // Send test messages
    const testMessages = [
      'Test message #1 from logged-in user (gregg@smrt1.ca) - this should be LEFT aligned with justify-start',
      'Test message #2 - checking if all my messages are incorrectly appearing on the right side',
      'Test message #3 - final test to confirm the alignment pattern'
    ];
    
    console.log('📤 Sending test messages...');
    for (let i = 0; i < testMessages.length; i++) {
      try {
        console.log(`📝 Sending message ${i + 1}...`);
        await messageInputs[0].fill(testMessages[i]);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        console.log(`✅ Sent message ${i + 1}`);
      } catch (error) {
        console.log(`❌ Failed to send message ${i + 1}: ${error.message}`);
      }
    }
    
    // Wait for messages to render
    await page.waitForTimeout(3000);
    
    // Step 5: Inspect the actual message DOM structure
    console.log('\n🔍 INSPECTING ACTUAL MESSAGE DOM STRUCTURE');
    console.log('═'.repeat(60));
    
    // Find message containers using multiple selectors
    const possibleMessageSelectors = [
      '[class*="flex items-end gap-2 mb-4"]',
      '[class*="justify-start"], [class*="justify-end"]',
      '[data-testid*="message"], [class*="message"]',
      '[class*="px-4 py-2 rounded"]',
      'div:has([class*="rounded-full"])', // Elements with avatars
    ];
    
    let allMessages = [];
    for (const selector of possibleMessageSelectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`🎯 Found ${elements.length} elements with selector: ${selector}`);
        
        // Check if these look like message containers
        for (let i = 0; i < Math.min(elements.length, 3); i++) {
          const el = elements[i];
          const classes = await el.getAttribute('class');
          const text = await el.textContent();
          
          // Check if this contains our test messages
          if (text && testMessages.some(msg => text.includes(msg.substring(0, 20)))) {
            console.log(`✅ Found our test message in element with classes: ${classes}`);
            if (!allMessages.includes(el)) {
              allMessages.push(el);
            }
          }
        }
      }
    }
    
    if (allMessages.length === 0) {
      console.log('❌ Could not find our test messages in DOM. Trying broader search...');
      
      // Search for any element containing our test message text
      const textElements = await page.$$('*');
      for (const element of textElements.slice(0, 100)) { // Limit to first 100 elements
        try {
          const text = await element.textContent();
          if (text && text.includes('Test message #1')) {
            const classes = await element.getAttribute('class');
            const tagName = await element.evaluate(node => node.tagName.toLowerCase());
            console.log(`🎯 Found test message in <${tagName}> with classes: ${classes}`);
            allMessages.push(element);
            break;
          }
        } catch (e) {
          // Skip elements we can't inspect
        }
      }
    }
    
    if (allMessages.length === 0) {
      console.log('❌ Still no messages found. Taking screenshot and showing page structure...');
      await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/messages-not-found.png', fullPage: true });
      
      // Show current URL and basic page info
      console.log(`📍 Current URL: ${page.url()}`);
      const title = await page.title();
      console.log(`📄 Page title: ${title}`);
      
      return;
    }
    
    // Step 6: Detailed analysis of found messages
    console.log(`\n🎯 ANALYZING ${allMessages.length} MESSAGE ELEMENTS`);
    
    for (let i = 0; i < allMessages.length; i++) {
      const message = allMessages[i];
      console.log(`\n--- MESSAGE ELEMENT ${i + 1} ---`);
      
      try {
        // Get all relevant attributes
        const tagName = await message.evaluate(node => node.tagName.toLowerCase());
        const classes = await message.getAttribute('class') || 'no-classes';
        const id = await message.getAttribute('id') || 'no-id';
        
        console.log(`🏷️  Tag: <${tagName}> ID: ${id}`);
        console.log(`🎨 Classes: ${classes}`);
        
        // Check for alignment classes
        if (classes.includes('justify-start')) {
          console.log(`📍 ✅ CORRECT: Has justify-start (LEFT alignment for logged-in user)`);
        } else if (classes.includes('justify-end')) {
          console.log(`📍 ❌ INCORRECT: Has justify-end (should be justify-start for logged-in user)`);
        } else {
          console.log(`📍 ⚠️  NO justify alignment class found`);
        }
        
        // Find parent containers
        const parent = await message.evaluateHandle(node => node.parentElement);
        if (parent) {
          const parentClasses = await parent.evaluate(node => node.className);
          const parentTag = await parent.evaluate(node => node.tagName.toLowerCase());
          console.log(`👆 Parent <${parentTag}>: ${parentClasses}`);
          
          if (parentClasses.includes('justify-start')) {
            console.log(`📍 ✅ Parent has justify-start`);
          } else if (parentClasses.includes('justify-end')) {
            console.log(`📍 ❌ Parent has justify-end`);
          }
        }
        
        // Check for message bubble inside
        const bubble = await message.$('[class*="px-4 py-2"], [class*="rounded"], [class*="bg-"]');
        if (bubble) {
          const bubbleClasses = await bubble.getAttribute('class');
          console.log(`🎨 Bubble classes: ${bubbleClasses}`);
          
          if (bubbleClasses.includes('bg-slate')) {
            console.log(`👤 ✅ Own message (slate background) - should have justify-start container`);
          } else if (bubbleClasses.match(/bg-(purple|green|blue|pink|indigo|red|teal|yellow|orange)-/)) {
            console.log(`👥 Other user message (colored background) - should have justify-end container`);
          }
        }
        
        // Get text content preview
        const text = await message.textContent();
        const preview = text?.substring(0, 80) + (text && text.length > 80 ? '...' : '');
        console.log(`💬 Content: "${preview}"`);
        
        // Get computed styles
        const computedStyle = await page.evaluate((element) => {
          const styles = window.getComputedStyle(element);
          return {
            display: styles.display,
            justifyContent: styles.justifyContent,
            flexDirection: styles.flexDirection,
            alignItems: styles.alignItems,
          };
        }, message);
        console.log(`🔧 Computed styles:`, computedStyle);
        
      } catch (error) {
        console.log(`❌ Error analyzing message ${i + 1}: ${error.message}`);
      }
    }
    
    // Step 7: Take final screenshot
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/message-analysis-final.png', fullPage: true });
    console.log(`\n📷 Final analysis screenshot saved to tests/message-analysis-final.png`);
    
    // Summary
    console.log(`\n📊 ANALYSIS SUMMARY`);
    console.log('═'.repeat(40));
    console.log(`📱 Total message elements found: ${allMessages.length}`);
    console.log(`🎯 Expected: All messages from gregg@smrt1.ca should have justify-start (LEFT alignment)`);
    console.log(`⚠️ Issue: If both users appear on right, likely justify-end is being applied incorrectly`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/error-analysis.png', fullPage: true });
  } finally {
    console.log('\n🔚 Keeping browser open for 15 seconds for manual inspection...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

createAndInspectMessages();