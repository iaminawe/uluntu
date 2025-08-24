import { chromium } from 'playwright';

const testCredentials = [
  { email: 'gregg@smrt1.ca', password: 'test123' },
  { email: 'gregg@smrt1.ca', password: 'password' },
  { email: 'gregg@smrt1.ca', password: 'password123' },
  { email: 'gregg@smrt1.ca', password: 'TestPassword123!' },
];

async function tryAuthentication(page, credentials) {
  for (const cred of credentials) {
    console.log(`🔑 Trying: ${cred.email} / ${cred.password}`);
    
    await page.goto('http://localhost:5555/signin', { waitUntil: 'networkidle' });
    
    // Clear and fill form
    await page.fill('input[type="email"]', cred.email);
    await page.fill('input[type="password"]', cred.password);
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`📍 URL after attempt: ${currentUrl}`);
    
    // Check if we're still on signin page
    if (!currentUrl.includes('signin') && !currentUrl.includes('auth')) {
      console.log(`✅ SUCCESS! Authenticated with: ${cred.email}`);
      return cred;
    } else {
      const errorEl = await page.$('text=/invalid|error|failed/i');
      if (errorEl) {
        const errorText = await errorEl.textContent();
        console.log(`❌ Failed: ${errorText}`);
      } else {
        console.log(`❌ Failed: Still on auth page`);
      }
    }
  }
  
  return null;
}

async function analyzeMessageMarkup(page) {
  console.log('\n🔍 ANALYZING ACTUAL MESSAGE MARKUP');
  console.log('═'.repeat(60));
  
  await page.goto('http://localhost:5555/messages', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  const currentUrl = page.url();
  if (currentUrl.includes('signin') || currentUrl.includes('auth')) {
    console.log('❌ Redirected back to auth - authentication failed for messages page');
    return;
  }
  
  console.log('✅ Successfully accessed messages page!');
  
  // First, check if there are any existing conversations/messages
  const messageElements = await page.$$('[class*="flex items-end gap-2 mb-4"], [class*="justify-"], [class*="px-4 py-2 rounded"]');
  console.log(`📱 Found ${messageElements.length} potential message elements`);
  
  if (messageElements.length === 0) {
    console.log('💬 No existing messages found. Let me check the page structure...');
    
    // Look for conversation list or message input
    const conversationElements = await page.$$('[class*="conversation"], button:has-text("New"), [href*="conversation"]');
    console.log(`💬 Found ${conversationElements.length} conversation-related elements`);
    
    // Look for message input to send test messages
    const messageInputs = await page.$$('textarea[placeholder*="message" i], input[placeholder*="message" i], textarea[placeholder*="type" i]');
    console.log(`✏️ Found ${messageInputs.length} message input fields`);
    
    if (messageInputs.length > 0) {
      console.log('📝 Attempting to send test messages...');
      
      const testMessages = [
        'Test message from logged-in user - should be LEFT aligned (justify-start)',
        'Another test message to see the alignment pattern',
        'Third message for good measure'
      ];
      
      for (const msg of testMessages) {
        try {
          await messageInputs[0].fill(msg);
          await page.keyboard.press('Enter');
          await page.waitForTimeout(1500);
          console.log(`✅ Sent: "${msg.substring(0, 30)}..."`);
        } catch (error) {
          console.log(`❌ Failed to send message: ${error.message}`);
        }
      }
      
      // Wait for messages to appear
      await page.waitForTimeout(3000);
      
      // Try to find messages again
      const newMessageElements = await page.$$('[class*="flex items-end gap-2 mb-4"], [class*="justify-"], [class*="px-4 py-2 rounded"]');
      console.log(`📱 After sending messages, found ${newMessageElements.length} message elements`);
    }
  }
  
  // Now analyze all message elements we can find
  const allMessageContainers = await page.$$('[class*="flex items-end gap-2 mb-4"]');
  console.log(`\n🎯 ANALYZING ${allMessageContainers.length} MESSAGE CONTAINERS`);
  
  if (allMessageContainers.length === 0) {
    console.log('❌ No message containers found with expected structure');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/no-messages-debug.png', fullPage: true });
    console.log('📷 Debug screenshot saved to tests/no-messages-debug.png');
    
    // Try to find ANY elements with justify classes
    const justifyElements = await page.$$('[class*="justify-"]');
    console.log(`🔍 Found ${justifyElements.length} elements with justify classes`);
    
    for (let i = 0; i < Math.min(justifyElements.length, 5); i++) {
      const el = justifyElements[i];
      const className = await el.getAttribute('class');
      const tagName = await el.evaluate(node => node.tagName.toLowerCase());
      console.log(`   ${i + 1}. <${tagName}> classes: ${className}`);
    }
    
    return;
  }
  
  // Detailed analysis of each message container
  let ownMessagesCount = 0;
  let otherMessagesCount = 0;
  let correctlyAlignedCount = 0;
  let incorrectlyAlignedCount = 0;
  
  for (let i = 0; i < allMessageContainers.length; i++) {
    const container = allMessageContainers[i];
    console.log(`\n--- MESSAGE CONTAINER ${i + 1} ---`);
    
    // Get container classes
    const containerClasses = await container.getAttribute('class');
    console.log(`🎨 Container classes: ${containerClasses}`);
    
    // Check alignment
    const hasJustifyStart = containerClasses.includes('justify-start');
    const hasJustifyEnd = containerClasses.includes('justify-end');
    
    let alignment = 'NONE';
    if (hasJustifyStart) alignment = 'LEFT (justify-start)';
    if (hasJustifyEnd) alignment = 'RIGHT (justify-end)';
    console.log(`📍 Alignment: ${alignment}`);
    
    // Find message bubble to determine message type
    const messageBubble = await container.$('[class*="px-4 py-2 rounded"], [class*="bg-slate"], [class*="bg-purple"], [class*="bg-green"], [class*="bg-blue"]');
    let messageType = 'unknown';
    
    if (messageBubble) {
      const bubbleClasses = await messageBubble.getAttribute('class');
      console.log(`🎨 Bubble classes: ${bubbleClasses}`);
      
      // Determine message type by background color
      if (bubbleClasses.includes('bg-slate') || bubbleClasses.includes('border border-slate')) {
        messageType = 'own';
        ownMessagesCount++;
        console.log(`👤 Message type: OWN MESSAGE (logged-in user)`);
        
        // Check if alignment is correct for own messages (should be LEFT/justify-start)
        if (hasJustifyStart) {
          console.log(`✅ CORRECT: Own message has justify-start (LEFT alignment)`);
          correctlyAlignedCount++;
        } else {
          console.log(`❌ INCORRECT: Own message should have justify-start, but has ${alignment}`);
          incorrectlyAlignedCount++;
        }
      } else if (bubbleClasses.match(/bg-(purple|green|blue|pink|indigo|red|teal|yellow|orange)-\d+/)) {
        messageType = 'other';
        otherMessagesCount++;
        console.log(`👥 Message type: OTHER USER MESSAGE (colored background)`);
        
        // Check if alignment is correct for other messages (should be RIGHT/justify-end)
        if (hasJustifyEnd) {
          console.log(`✅ CORRECT: Other user message has justify-end (RIGHT alignment)`);
          correctlyAlignedCount++;
        } else {
          console.log(`❌ INCORRECT: Other user message should have justify-end, but has ${alignment}`);
          incorrectlyAlignedCount++;
        }
      }
    }
    
    // Check avatar positioning
    const avatarElements = await container.$$('img[class*="rounded-full"], div[class*="rounded-full"]');
    if (avatarElements.length > 0) {
      console.log(`🎭 Found ${avatarElements.length} avatar(s)`);
      
      const containerBounds = await container.boundingBox();
      const avatarBounds = await avatarElements[0].boundingBox();
      
      if (containerBounds && avatarBounds) {
        const avatarOnLeft = avatarBounds.x < (containerBounds.x + containerBounds.width / 2);
        console.log(`📍 Avatar position: ${avatarOnLeft ? 'LEFT' : 'RIGHT'} of container`);
        
        // Validate avatar position
        if (messageType === 'own' && avatarOnLeft) {
          console.log(`✅ CORRECT: Own message avatar on LEFT matches justify-start`);
        } else if (messageType === 'own' && !avatarOnLeft) {
          console.log(`❌ INCORRECT: Own message avatar on RIGHT doesn't match justify-start`);
        } else if (messageType === 'other' && !avatarOnLeft) {
          console.log(`✅ CORRECT: Other user avatar on RIGHT matches justify-end`);
        } else if (messageType === 'other' && avatarOnLeft) {
          console.log(`❌ INCORRECT: Other user avatar on LEFT doesn't match justify-end`);
        }
      }
    }
    
    // Get message content preview
    const messageText = await container.textContent();
    const cleanText = messageText.replace(/\\s+/g, ' ').trim();
    const preview = cleanText.length > 60 ? cleanText.substring(0, 60) + '...' : cleanText;
    console.log(`💬 Content: "${preview}"`);
    
    // Get the computed style to see what's actually being applied
    const computedStyle = await page.evaluate((element) => {
      const styles = window.getComputedStyle(element);
      return {
        justifyContent: styles.justifyContent,
        flexDirection: styles.flexDirection,
        display: styles.display
      };
    }, container);
    console.log(`🔧 Computed styles:`, computedStyle);
  }
  
  // Summary report
  console.log(`\n📊 COMPREHENSIVE ANALYSIS SUMMARY`);
  console.log('═'.repeat(60));
  console.log(`📱 Total message containers analyzed: ${allMessageContainers.length}`);
  console.log(`👤 Own messages (logged-in user): ${ownMessagesCount}`);
  console.log(`👥 Other user messages: ${otherMessagesCount}`);
  console.log(`✅ Correctly aligned: ${correctlyAlignedCount}`);
  console.log(`❌ Incorrectly aligned: ${incorrectlyAlignedCount}`);
  
  if (allMessageContainers.length > 0) {
    const accuracy = ((correctlyAlignedCount / allMessageContainers.length) * 100).toFixed(1);
    console.log(`🎯 Alignment accuracy: ${accuracy}%`);
  }
  
  console.log(`\n🎯 EXPECTED BEHAVIOR:`);
  console.log(`   - Logged-in user messages: justify-start (LEFT alignment)`);  
  console.log(`   - Other user messages: justify-end (RIGHT alignment)`);
  console.log(`   - Avatars should match the alignment side`);
  
  if (incorrectlyAlignedCount > 0) {
    console.log(`\n⚠️ ISSUES DETECTED:`);
    if (ownMessagesCount > 0 && ownMessagesCount === incorrectlyAlignedCount) {
      console.log(`   - All own messages are incorrectly aligned`);
    }
    if (otherMessagesCount > 0) {
      console.log(`   - Some other user messages may be incorrectly aligned`);
    }
  }
  
  // Take final screenshot
  await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/comprehensive-analysis.png', fullPage: true });
  console.log(`\n📷 Complete analysis screenshot saved to tests/comprehensive-analysis.png`);
}

async function comprehensiveAnalysis() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Starting comprehensive message alignment analysis...');
    console.log('🎯 Goal: Verify logged-in users get justify-start, others get justify-end');
    
    // Step 1: Try to authenticate
    console.log('\n🔐 Step 1: Authentication');
    const workingCredentials = await tryAuthentication(page, testCredentials);
    
    if (!workingCredentials) {
      console.log('\n❌ Could not authenticate with test credentials.');
      console.log('🔧 Trying to access test-conversations page directly...');
      
      await page.goto('http://localhost:5555/test-conversations');
      await page.waitForTimeout(3000);
      
      const testUrl = page.url();
      if (testUrl.includes('signin')) {
        console.log('❌ Test conversations page also requires authentication.');
        console.log('🎯 Manual authentication may be required.');
        
        // Keep browser open for manual authentication
        console.log('\n👋 Keeping browser open for manual authentication...');
        console.log('   1. Sign in manually in the browser');  
        console.log('   2. Navigate to /messages');
        console.log('   3. Inspect the message alignment');
        
        await page.waitForTimeout(30000); // 30 seconds for manual auth
      }
    }
    
    // Step 2: Analyze messages
    console.log('\n📊 Step 2: Message Markup Analysis'); 
    await analyzeMessageMarkup(page);
    
    console.log('\n✅ Analysis complete!');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/analysis-error.png', fullPage: true });
  } finally {
    console.log('\n🔚 Keeping browser open for manual inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

comprehensiveAnalysis();