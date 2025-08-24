import { chromium } from 'playwright';

async function inspectExistingConversation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Inspecting existing conversation messages...');
    
    // Step 1: Authenticate
    console.log('🔐 Authenticating...');
    await page.goto('http://localhost:5555/signin', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'gregg@smrt1.ca');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Step 2: Go to messages
    console.log('📱 Going to messages page...');
    await page.goto('http://localhost:5555/messages', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Step 3: Look for existing conversations and select one
    console.log('🔍 Looking for existing conversations...');
    
    // Look for conversation items that have timestamps or look like actual conversations
    const conversationSelectors = [
      '[class*="conversation"]:has(text)',
      'li:has([class*="timestamp"])',
      'div:has-text("8/22/2025")', // From the previous output
      'button:has-text("Conversation")',
      '[class*="cursor-pointer"]:not(:has-text("Start New"))',
    ];
    
    let selectedConversation = false;
    
    for (const selector of conversationSelectors) {
      const conversations = await page.$$(selector);
      console.log(`📋 Found ${conversations.length} items with selector: ${selector}`);
      
      for (let i = 0; i < Math.min(conversations.length, 3); i++) {
        try {
          const conv = conversations[i];
          const text = await conv.textContent();
          console.log(`💬 Conversation ${i + 1}: "${text?.trim().substring(0, 100)}"`);
          
          // Skip the "Start New" button and empty items
          if (text && 
              !text.includes('Start New') && 
              !text.includes('Choose from') &&
              text.trim().length > 10) {
            
            console.log(`🎯 Selecting conversation: "${text.substring(0, 50)}..."`);
            await conv.click();
            await page.waitForTimeout(3000);
            selectedConversation = true;
            break;
          }
        } catch (error) {
          console.log(`⚠️ Could not interact with conversation ${i + 1}: ${error.message}`);
        }
      }
      
      if (selectedConversation) break;
    }
    
    if (!selectedConversation) {
      console.log('❌ Could not select any existing conversation. Trying direct approach...');
      
      // Try clicking on any clickable element that might be a conversation
      const clickableElements = await page.$$('li, div[class*="cursor"], button');
      for (let i = 0; i < Math.min(clickableElements.length, 10); i++) {
        const element = clickableElements[i];
        const text = await element.textContent();
        
        if (text && 
            (text.includes('8/22/2025') || 
             text.includes('Direct Message') || 
             (text.includes('Conversation') && !text.includes('Start New')))) {
          
          console.log(`🎯 Trying to click: "${text.substring(0, 60)}"`);
          try {
            await element.click();
            await page.waitForTimeout(3000);
            selectedConversation = true;
            break;
          } catch (error) {
            console.log(`⚠️ Could not click element: ${error.message}`);
          }
        }
      }
    }
    
    // Step 4: Now look for messages in the selected conversation
    console.log('\n🔍 SEARCHING FOR MESSAGE ELEMENTS IN SELECTED CONVERSATION');
    console.log('═'.repeat(60));
    
    // Wait a bit more for messages to load
    await page.waitForTimeout(2000);
    
    // Take a screenshot of the current state
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/current-conversation.png', fullPage: true });
    console.log('📷 Current conversation screenshot saved');
    
    // Look for message elements using comprehensive selectors
    const messageSelectors = [
      // Expected structure from our MessageBubble component
      '[class*="flex items-end gap-2 mb-4"]',
      
      // Alignment classes
      '[class*="justify-start"]',
      '[class*="justify-end"]',
      
      // Message content
      '[class*="px-4 py-2 rounded"]',
      '[class*="rounded-2xl"]',
      
      // Avatar elements
      '[class*="rounded-full"]',
      
      // Any element with message-like classes
      '[class*="message"]',
      '[data-testid*="message"]',
      
      // Elements with background colors (message bubbles)
      '[class*="bg-slate"]',
      '[class*="bg-purple"]',
      '[class*="bg-green"]',
      '[class*="bg-blue"]',
    ];
    
    const foundElements = new Map();
    
    for (const selector of messageSelectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`🎯 Found ${elements.length} elements with: ${selector}`);
        foundElements.set(selector, elements);
      }
    }
    
    if (foundElements.size === 0) {
      console.log('❌ No message elements found with any selector.');
      console.log('📄 Current page content:');
      const pageText = await page.textContent('body');
      console.log(pageText.substring(0, 500) + '...');
      
      // Look for any text that might indicate why no messages are showing
      if (pageText.includes('No messages yet')) {
        console.log('💭 Page shows "No messages yet" - conversation is empty');
      } else if (pageText.includes('Select a conversation')) {
        console.log('💭 Still on conversation selection screen');
      }
      
      return;
    }
    
    // Step 5: Analyze found elements
    console.log('\n🎯 ANALYZING FOUND MESSAGE ELEMENTS');
    console.log('═'.repeat(50));
    
    // Focus on the most likely message containers first
    const prioritySelectors = [
      '[class*="flex items-end gap-2 mb-4"]',
      '[class*="justify-start"]', 
      '[class*="justify-end"]'
    ];
    
    let messageContainers = [];
    
    for (const selector of prioritySelectors) {
      if (foundElements.has(selector)) {
        const elements = foundElements.get(selector);
        console.log(`\n🔍 Analyzing elements from: ${selector}`);
        
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          try {
            const classes = await element.getAttribute('class');
            const text = await element.textContent();
            const tagName = await element.evaluate(node => node.tagName.toLowerCase());
            
            console.log(`\n--- Element ${i + 1} ---`);
            console.log(`🏷️  <${tagName}>`);
            console.log(`🎨 Classes: ${classes}`);
            console.log(`💬 Text preview: "${text?.substring(0, 100)}..."`);
            
            // Check for alignment
            if (classes?.includes('justify-start')) {
              console.log(`📍 ✅ Has justify-start (LEFT alignment)`);
            } else if (classes?.includes('justify-end')) {
              console.log(`📍 ❌ Has justify-end (RIGHT alignment)`);
            }
            
            // Check if this looks like a message container
            if (text && text.trim().length > 5 && 
                (classes?.includes('flex') || classes?.includes('gap'))) {
              messageContainers.push({element, classes, text, selector});
              console.log(`✅ Added to message containers for detailed analysis`);
            }
            
          } catch (error) {
            console.log(`❌ Error analyzing element: ${error.message}`);
          }
        }
      }
    }
    
    // Step 6: Detailed analysis of message containers
    if (messageContainers.length > 0) {
      console.log(`\n🎯 DETAILED ANALYSIS OF ${messageContainers.length} MESSAGE CONTAINERS`);
      console.log('═'.repeat(60));
      
      for (let i = 0; i < messageContainers.length; i++) {
        const {element, classes, text, selector} = messageContainers[i];
        
        console.log(`\n--- MESSAGE CONTAINER ${i + 1} (from ${selector}) ---`);
        console.log(`🎨 Container classes: ${classes}`);
        
        // Determine expected vs actual alignment
        const hasJustifyStart = classes?.includes('justify-start');
        const hasJustifyEnd = classes?.includes('justify-end');
        
        console.log(`📍 Container alignment: ${hasJustifyStart ? 'LEFT (justify-start)' : hasJustifyEnd ? 'RIGHT (justify-end)' : 'NONE'}`);
        
        // Look for message bubble inside
        const bubble = await element.$('[class*="bg-slate"], [class*="bg-purple"], [class*="bg-green"], [class*="bg-blue"]');
        if (bubble) {
          const bubbleClasses = await bubble.getAttribute('class');
          console.log(`🎨 Bubble classes: ${bubbleClasses}`);
          
          if (bubbleClasses?.includes('bg-slate')) {
            console.log(`👤 OWN MESSAGE (slate background)`);
            if (hasJustifyStart) {
              console.log(`✅ CORRECT: Own message with justify-start`);
            } else if (hasJustifyEnd) {
              console.log(`❌ INCORRECT: Own message with justify-end (should be justify-start)`);
            }
          } else {
            console.log(`👥 OTHER USER MESSAGE (colored background)`);
            if (hasJustifyEnd) {
              console.log(`✅ CORRECT: Other user message with justify-end`);
            } else if (hasJustifyStart) {
              console.log(`❌ INCORRECT: Other user message with justify-start (should be justify-end)`);
            }
          }
        }
        
        // Check avatar position
        const avatar = await element.$('[class*="rounded-full"]');
        if (avatar) {
          const containerBounds = await element.boundingBox();
          const avatarBounds = await avatar.boundingBox();
          
          if (containerBounds && avatarBounds) {
            const avatarOnLeft = avatarBounds.x < (containerBounds.x + containerBounds.width / 2);
            console.log(`🎭 Avatar position: ${avatarOnLeft ? 'LEFT' : 'RIGHT'} side`);
          }
        }
        
        console.log(`💬 Message text: "${text?.substring(0, 150)}"`);
      }
      
      // Step 7: Summary and recommendations
      console.log(`\n📊 SUMMARY AND DIAGNOSIS`);
      console.log('═'.repeat(40));
      console.log(`📱 Total message containers found: ${messageContainers.length}`);
      
      const ownMessages = messageContainers.filter(m => m.text?.toLowerCase().includes('test') || m.classes?.includes('bg-slate'));
      const otherMessages = messageContainers.filter(m => !m.classes?.includes('bg-slate') && m.classes?.match(/bg-(purple|green|blue)/));
      
      console.log(`👤 Own messages: ${ownMessages.length}`);
      console.log(`👥 Other messages: ${otherMessages.length}`);
      
      // Check if the issue is what user described
      const ownMessagesWithJustifyEnd = ownMessages.filter(m => m.classes?.includes('justify-end'));
      const otherMessagesWithJustifyEnd = otherMessages.filter(m => m.classes?.includes('justify-end'));
      
      if (ownMessagesWithJustifyEnd.length > 0 || otherMessagesWithJustifyEnd.length === otherMessages.length) {
        console.log(`\n⚠️  ISSUE CONFIRMED: "Both users appear on right side"`);
        console.log(`   - Own messages with justify-end: ${ownMessagesWithJustifyEnd.length}/${ownMessages.length}`);
        console.log(`   - Other messages with justify-end: ${otherMessagesWithJustifyEnd.length}/${otherMessages.length}`);
        
        console.log(`\n🔧 ROOT CAUSE ANALYSIS:`);
        if (ownMessages.every(m => m.classes?.includes('justify-end'))) {
          console.log(`   - ALL own messages have justify-end (should be justify-start)`);
          console.log(`   - This confirms the logic inversion in MessageBubble component`);
        }
      }
      
    } else {
      console.log('❌ No valid message containers found for analysis');
    }
    
    // Final screenshot
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/final-message-analysis.png', fullPage: true });
    console.log('\n📷 Final analysis screenshot saved');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/inspection-error.png', fullPage: true });
  } finally {
    console.log('\n🔚 Keeping browser open for 15 seconds for manual inspection...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

inspectExistingConversation();