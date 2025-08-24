import { chromium } from 'playwright';

async function verifyAvatarPositioning() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Verifying avatar positioning fix...');
    
    // Step 1: Authenticate
    console.log('🔐 Authenticating...');
    await page.goto('http://localhost:5555/signin', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'gregg@smrt1.ca');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Step 2: Go to messages and find/create conversation
    console.log('📱 Going to messages...');
    await page.goto('http://localhost:5555/messages', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Try to select an existing conversation
    const conversations = await page.$$('li, div[class*="cursor"], button');
    let conversationSelected = false;
    
    for (const conv of conversations.slice(0, 5)) {
      try {
        const text = await conv.textContent();
        if (text && text.includes('Conversation') && !text.includes('Start New')) {
          console.log('🎯 Selecting existing conversation...');
          await conv.click();
          await page.waitForTimeout(2000);
          conversationSelected = true;
          break;
        }
      } catch (e) { /* skip */ }
    }
    
    if (!conversationSelected) {
      // Try to start new conversation
      const startButtons = await page.$$('button:has-text("Start"), button:has-text("New")');
      if (startButtons.length > 0) {
        console.log('🆕 Starting new conversation...');
        await startButtons[0].click();
        await page.waitForTimeout(2000);
      }
    }
    
    // Step 3: Send test message
    const messageInputs = await page.$$('textarea, input[placeholder*="message" i]');
    if (messageInputs.length > 0) {
      console.log('📤 Sending test message...');
      await messageInputs[0].fill('AVATAR TEST: Checking avatar positioning after fix');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
    }
    
    // Step 4: Analyze message containers and avatar positions
    console.log('\n🔍 ANALYZING MESSAGE AND AVATAR POSITIONING');
    console.log('═'.repeat(60));
    
    const messageContainers = await page.$$('[class*="flex items-end gap-2 mb-4"]');
    console.log(`📱 Found ${messageContainers.length} message containers`);
    
    if (messageContainers.length === 0) {
      console.log('❌ No message containers found');
      await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/no-messages-avatar-test.png', fullPage: true });
      return;
    }
    
    let correctCount = 0;
    let incorrectCount = 0;
    
    for (let i = 0; i < messageContainers.length; i++) {
      const container = messageContainers[i];
      console.log(`\n--- MESSAGE ${i + 1} ---`);
      
      try {
        // Get container alignment
        const containerClasses = await container.getAttribute('class');
        const hasJustifyStart = containerClasses?.includes('justify-start');
        const hasJustifyEnd = containerClasses?.includes('justify-end');
        
        console.log(`🎨 Container classes: ${containerClasses}`);
        console.log(`📍 Container alignment: ${hasJustifyStart ? 'LEFT (justify-start)' : hasJustifyEnd ? 'RIGHT (justify-end)' : 'NONE'}`);
        
        // Check message type
        const messageBubble = await container.$('[class*="bg-slate"], [class*="bg-purple"], [class*="bg-green"], [class*="bg-blue"]');
        let isOwnMessage = false;
        
        if (messageBubble) {
          const bubbleClasses = await messageBubble.getAttribute('class');
          isOwnMessage = bubbleClasses?.includes('bg-slate') || bubbleClasses?.includes('border border-slate');
          console.log(`👤 Message type: ${isOwnMessage ? 'LOGGED-IN USER (own)' : 'OTHER USER'}`);
          console.log(`🎨 Bubble classes: ${bubbleClasses}`);
        }
        
        // Find avatar and check its position
        const avatar = await container.$('[class*="rounded-full"]');
        if (avatar) {
          const containerBounds = await container.boundingBox();
          const avatarBounds = await avatar.boundingBox();
          
          if (containerBounds && avatarBounds) {
            const avatarOnLeft = avatarBounds.x < (containerBounds.x + containerBounds.width / 2);
            const avatarOnRight = avatarBounds.x > (containerBounds.x + containerBounds.width / 2);
            
            console.log(`🎭 Avatar position: ${avatarOnLeft ? 'LEFT' : avatarOnRight ? 'RIGHT' : 'CENTER'} of container`);
            
            // Check if positioning is correct according to new requirements
            if (isOwnMessage) {
              // Logged-in user: should be LEFT aligned with avatar on LEFT
              if (hasJustifyStart && avatarOnLeft) {
                console.log(`✅ CORRECT: Own message - LEFT aligned with avatar on LEFT`);
                correctCount++;
              } else {
                console.log(`❌ INCORRECT: Own message should be LEFT aligned with avatar on LEFT`);
                console.log(`   Current: align=${hasJustifyStart ? 'LEFT' : 'RIGHT'}, avatar=${avatarOnLeft ? 'LEFT' : 'RIGHT'}`);
                incorrectCount++;
              }
            } else {
              // Other user: should be RIGHT aligned with avatar on RIGHT  
              if (hasJustifyEnd && avatarOnRight) {
                console.log(`✅ CORRECT: Other user message - RIGHT aligned with avatar on RIGHT`);
                correctCount++;
              } else {
                console.log(`❌ INCORRECT: Other user message should be RIGHT aligned with avatar on RIGHT`);
                console.log(`   Current: align=${hasJustifyStart ? 'LEFT' : 'RIGHT'}, avatar=${avatarOnLeft ? 'LEFT' : 'RIGHT'}`);
                incorrectCount++;
              }
            }
            
            // Check avatar styling
            const avatarClasses = await avatar.getAttribute('class');
            console.log(`🎨 Avatar classes: ${avatarClasses}`);
            
            if (isOwnMessage && avatarClasses?.includes('bg-slate')) {
              console.log(`✅ CORRECT: Own message avatar uses slate/gray background`);
            } else if (!isOwnMessage && avatarClasses?.match(/bg-(purple|green|blue|pink|indigo|red|teal|yellow|orange)/)) {
              console.log(`✅ CORRECT: Other user avatar uses colored background`);
            }
            
          }
        } else {
          console.log(`⚠️ No avatar found in this message container`);
        }
        
        // Get message content preview
        const text = await container.textContent();
        const preview = text?.substring(0, 60) + (text && text.length > 60 ? '...' : '');
        console.log(`💬 Content: "${preview}"`);
        
      } catch (error) {
        console.log(`❌ Error analyzing message ${i + 1}: ${error.message}`);
      }
    }
    
    // Step 5: Summary
    console.log(`\n📊 AVATAR POSITIONING VERIFICATION SUMMARY`);
    console.log('═'.repeat(50));
    console.log(`📱 Total messages analyzed: ${messageContainers.length}`);
    console.log(`✅ Correctly positioned: ${correctCount}`);
    console.log(`❌ Incorrectly positioned: ${incorrectCount}`);
    
    const accuracy = messageContainers.length > 0 ? ((correctCount / messageContainers.length) * 100).toFixed(1) : '0';
    console.log(`🎯 Positioning accuracy: ${accuracy}%`);
    
    console.log(`\n🎯 EXPECTED BEHAVIOR:`);
    console.log(`   - Logged-in user: LEFT aligned (justify-start) with avatar on LEFT`);
    console.log(`   - Other users: RIGHT aligned (justify-end) with avatar on RIGHT`);
    console.log(`   - Own message avatars: gray/slate background`);
    console.log(`   - Other user avatars: colored backgrounds`);
    
    if (correctCount === messageContainers.length && messageContainers.length > 0) {
      console.log(`\n🎉 SUCCESS! All avatar positioning is correct!`);
    } else if (correctCount > 0) {
      console.log(`\n⚠️ PARTIAL SUCCESS: Some messages have correct positioning`);
    } else {
      console.log(`\n❌ ISSUE: No messages have correct positioning`);
    }
    
    // Take final screenshot
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/avatar-positioning-verification.png', fullPage: true });
    console.log(`\n📷 Verification screenshot saved`);
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/avatar-verification-error.png', fullPage: true });
  } finally {
    console.log('\n🔚 Keeping browser open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

verifyAvatarPositioning();