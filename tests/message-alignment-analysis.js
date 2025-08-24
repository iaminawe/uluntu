import { chromium } from 'playwright';

// Auth helper functions (adapted from the TypeScript version)
const generateTestUser = () => {
  const timestamp = Date.now();
  return {
    email: `test_${timestamp}@example.com`,
    password: 'TestPassword123!',
    name: `Test User ${timestamp}`,
    bio: 'This is a test bio for automated testing purposes.',
    title: 'Software Engineer',
  };
};

const createTestAccount = async (page, user) => {
  console.log('🔧 Creating test account with email:', user.email);
  await page.goto('http://localhost:5555/signup');
  
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  
  // Look for confirm password field if it exists
  const confirmPasswordField = page.locator('input[placeholder*="Confirm"]');
  if (await confirmPasswordField.count() > 0) {
    await confirmPasswordField.fill(user.password);
  }

  // Accept terms if checkbox exists
  const termsCheckbox = page.locator('input[type="checkbox"]');
  if (await termsCheckbox.count() > 0) {
    await termsCheckbox.check();
  }

  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  
  // Check if account creation was successful
  const errorMessage = page.locator('text=/Error|Failed|Invalid/i');
  const hasError = await errorMessage.count() > 0;
  
  if (hasError) {
    const errorText = await errorMessage.textContent();
    console.log('❌ Account creation failed:', errorText);
    return false;
  }
  
  console.log('✅ Account created successfully!');
  return true;
};

const signIn = async (page, email, password) => {
  console.log('🔑 Signing in with email:', email);
  await page.goto('http://localhost:5555/signin');
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  await page.waitForLoadState('networkidle');
  
  // Check if login was successful
  const errorMessage = page.locator('text=/Invalid|Error|Failed/i');
  if (await errorMessage.count() > 0) {
    const errorText = await errorMessage.textContent();
    console.log('❌ Sign in failed:', errorText);
    return false;
  }
  
  // Check for logged-in indicators
  const loggedInIndicators = [
    'button[aria-label*="user" i]',
    'button[aria-label*="account" i]', 
    'button[aria-label*="profile" i]',
    'text=Sign Out',
    'text=Log Out',
    '[data-testid="user-menu"]',
    'nav a[href*="profile"]'
  ];

  for (const indicator of loggedInIndicators) {
    if (await page.locator(indicator).count() > 0) {
      console.log('✅ Sign in successful!');
      return true;
    }
  }
  
  console.log('❌ Sign in failed - no logged in indicators found');
  return false;
};

const ensureAuthenticated = async (page, user) => {
  const testUser = user || generateTestUser();
  
  console.log('👤 Ensuring authentication for user:', testUser.email);
  
  // Check if already authenticated
  const loggedInIndicators = [
    'button[aria-label*="user" i]',
    'button[aria-label*="account" i]',
    'text=Sign Out',
    '[data-testid="user-menu"]'
  ];

  for (const indicator of loggedInIndicators) {
    if (await page.locator(indicator).count() > 0) {
      console.log('✅ Already authenticated');
      return testUser;
    }
  }
  
  // Try to sign in first
  const signInSuccess = await signIn(page, testUser.email, testUser.password);
  if (signInSuccess) {
    return testUser;
  }
  
  // If sign in fails, create new account
  console.log('🔧 Sign in failed, creating new account...');
  const createSuccess = await createTestAccount(page, testUser);
  if (!createSuccess) {
    throw new Error('Failed to create test account');
  }
  
  // Try signing in after account creation
  await page.waitForTimeout(2000);
  const finalSignIn = await signIn(page, testUser.email, testUser.password);
  if (!finalSignIn) {
    throw new Error('Failed to sign in after account creation');
  }
  
  return testUser;
};

async function analyzeMessageAlignment() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Starting comprehensive message alignment analysis...');
    
    // Ensure we have an authenticated user
    const testUser = await ensureAuthenticated(page);
    console.log('👤 Test user authenticated:', testUser.email);
    
    // Now navigate to messages page
    console.log('📍 Navigating to messages page...');
    await page.goto('http://localhost:5555/messages', { waitUntil: 'networkidle' });
    
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    if (currentUrl.includes('signin') || currentUrl.includes('auth')) {
      throw new Error('Still on authentication page after successful login');
    }
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Look for messages with multiple selector strategies
    console.log('🔍 Searching for message elements...');
    
    const messageSelectors = [
      '[class*="flex items-end gap-2 mb-4"]',
      '[class*="MessageBubble"]',
      '[class*="message-bubble"]', 
      '.flex.items-end.gap-2.mb-4',
      '[class*="px-4 py-2 rounded-2xl"]',
      '[class*="justify-start"], [class*="justify-end"]'
    ];
    
    let messageElements = [];
    let usedSelector = '';
    
    for (const selector of messageSelectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        messageElements = elements;
        usedSelector = selector;
        console.log(`✅ Found ${elements.length} message elements using: ${selector}`);
        break;
      }
    }
    
    if (messageElements.length === 0) {
      console.log('💭 No messages found. Checking page state...');
      
      // Check for conversation list or empty state
      const conversationElements = await page.$$('[class*="conversation"], [class*="chat"]');
      if (conversationElements.length > 0) {
        console.log(`📱 Found ${conversationElements.length} conversations. Trying to open one...`);
        await conversationElements[0].click();
        await page.waitForTimeout(2000);
        
        // Try finding messages again
        for (const selector of messageSelectors) {
          const elements = await page.$$(selector);
          if (elements.length > 0) {
            messageElements = elements;
            usedSelector = selector;
            console.log(`✅ Found ${elements.length} messages after opening conversation`);
            break;
          }
        }
      }
      
      // If still no messages, check if we need to send some test messages
      if (messageElements.length === 0) {
        console.log('💬 No existing messages found. Looking for message input to send test messages...');
        
        const messageInput = await page.$('textarea[placeholder*="message" i], input[placeholder*="message" i]');
        if (messageInput) {
          console.log('✏️ Found message input, sending test messages...');
          
          // Send a few test messages
          const testMessages = [
            'Hello, this is a test message from the logged-in user!',
            'This should appear on the right side with proper alignment.',
            'Testing message bubble alignment and avatar positioning.'
          ];
          
          for (const msg of testMessages) {
            await messageInput.fill(msg);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
          }
          
          // Wait for messages to appear and try finding them again
          await page.waitForTimeout(2000);
          for (const selector of messageSelectors) {
            const elements = await page.$$(selector);
            if (elements.length > 0) {
              messageElements = elements;
              usedSelector = selector;
              console.log(`✅ Found ${elements.length} messages after sending test messages`);
              break;
            }
          }
        }
      }
    }
    
    if (messageElements.length === 0) {
      console.log('❌ No messages found after all attempts. Taking debug screenshot...');
      await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/no-messages-debug.png', fullPage: true });
      console.log('📷 Debug screenshot saved to tests/no-messages-debug.png');
      return;
    }
    
    console.log(`\n🎯 Analyzing ${messageElements.length} message elements...`);
    console.log(`📊 Using selector: ${usedSelector}`);
    
    let ownMessagesCorrect = 0;
    let ownMessagesIncorrect = 0;
    let otherMessagesCorrect = 0;
    let otherMessagesIncorrect = 0;
    
    // Analyze each message
    for (let i = 0; i < Math.min(messageElements.length, 10); i++) {
      const messageEl = messageElements[i];
      const className = await messageEl.getAttribute('class');
      
      console.log(`\n--- 💬 Message ${i + 1} ---`);
      console.log('🎨 Container classes:', className);
      
      // Check alignment classes
      const hasJustifyStart = className.includes('justify-start');
      const hasJustifyEnd = className.includes('justify-end');
      
      if (hasJustifyStart) {
        console.log('📍 Container alignment: LEFT (justify-start)');
      } else if (hasJustifyEnd) {
        console.log('📍 Container alignment: RIGHT (justify-end)');
      } else {
        console.log('⚠️ No justify alignment found in container');
      }
      
      // Find and analyze message bubble
      const bubbleEl = await messageEl.$('[class*="px-4 py-2 rounded-2xl"], [class*="rounded"], [class*="bg-"]');
      let messageType = 'unknown';
      
      if (bubbleEl) {
        const bubbleClass = await bubbleEl.getAttribute('class');
        console.log('🎨 Bubble classes:', bubbleClass);
        
        // Determine message type by background color
        if (bubbleClass.includes('bg-slate') || bubbleClass.includes('border border-slate')) {
          messageType = 'own';
          console.log('👤 Message type: OWN MESSAGE (slate/gray background)');
          
          if (hasJustifyEnd) {
            console.log('✅ CORRECT: Own message uses justify-end (right alignment)');
            ownMessagesCorrect++;
          } else {
            console.log('❌ INCORRECT: Own message should use justify-end (right alignment)');
            ownMessagesIncorrect++;
          }
        } else if (bubbleClass.includes('bg-purple') || bubbleClass.includes('bg-green') || 
                   bubbleClass.includes('bg-pink') || bubbleClass.includes('bg-blue') ||
                   bubbleClass.includes('bg-indigo') || bubbleClass.includes('bg-red') ||
                   bubbleClass.includes('bg-teal') || bubbleClass.includes('bg-yellow') ||
                   bubbleClass.includes('bg-orange')) {
          messageType = 'other';
          console.log('👥 Message type: OTHER USER MESSAGE (colored background)');
          
          if (hasJustifyStart) {
            console.log('✅ CORRECT: Other user message uses justify-start (left alignment)');
            otherMessagesCorrect++;
          } else {
            console.log('❌ INCORRECT: Other user message should use justify-start (left alignment)');
            otherMessagesIncorrect++;
          }
        }
      }
      
      // Check avatar positioning
      const avatarImgs = await messageEl.$$('img[class*="rounded-full"]');
      const avatarDivs = await messageEl.$$('div[class*="rounded-full"]');
      const totalAvatars = avatarImgs.length + avatarDivs.length;
      
      if (totalAvatars > 0) {
        console.log(`🎭 Found ${totalAvatars} avatar(s)`);
        
        // Determine avatar position relative to message content
        const messageRect = await messageEl.boundingBox();
        let avatarElement = avatarImgs.length > 0 ? avatarImgs[0] : avatarDivs[0];
        const avatarRect = await avatarElement.boundingBox();
        
        if (avatarRect && messageRect) {
          const avatarOnLeft = avatarRect.x < (messageRect.x + messageRect.width / 2);
          console.log(`📍 Avatar position: ${avatarOnLeft ? 'LEFT' : 'RIGHT'} of message`);
          
          // Validate avatar position based on message type
          if (messageType === 'own' && !avatarOnLeft) {
            console.log('✅ CORRECT: Own message avatar on right');
          } else if (messageType === 'own' && avatarOnLeft) {
            console.log('❌ INCORRECT: Own message avatar should be on right');
          } else if (messageType === 'other' && avatarOnLeft) {
            console.log('✅ CORRECT: Other user avatar on left');
          } else if (messageType === 'other' && !avatarOnLeft) {
            console.log('❌ INCORRECT: Other user avatar should be on left');
          }
        }
      }
      
      // Get message content preview
      const messageText = await messageEl.textContent();
      const cleanText = messageText.replace(/\\s+/g, ' ').trim();
      const shortText = cleanText.length > 60 ? cleanText.substring(0, 60) + '...' : cleanText;
      console.log(`💬 Content: "${shortText}"`);
    }
    
    // Summary report
    console.log(`\n📊 ALIGNMENT ANALYSIS SUMMARY`);
    console.log('═'.repeat(50));
    console.log(`✅ Own messages correctly aligned: ${ownMessagesCorrect}`);
    console.log(`❌ Own messages incorrectly aligned: ${ownMessagesIncorrect}`);
    console.log(`✅ Other messages correctly aligned: ${otherMessagesCorrect}`);
    console.log(`❌ Other messages incorrectly aligned: ${otherMessagesIncorrect}`);
    
    const totalCorrect = ownMessagesCorrect + otherMessagesCorrect;
    const totalIncorrect = ownMessagesIncorrect + otherMessagesIncorrect;
    const totalMessages = totalCorrect + totalIncorrect;
    
    if (totalMessages > 0) {
      const accuracy = ((totalCorrect / totalMessages) * 100).toFixed(1);
      console.log(`\n🎯 Overall alignment accuracy: ${accuracy}% (${totalCorrect}/${totalMessages})`);
      
      if (totalIncorrect > 0) {
        console.log(`\n⚠️ ISSUES FOUND:`);
        console.log('  - Own messages (logged-in user) should use justify-end (right alignment)');
        console.log('  - Other user messages should use justify-start (left alignment)');
        console.log('  - Own message avatars should be on the right side');
        console.log('  - Other user avatars should be on the left side');
      } else {
        console.log(`\n🎉 All messages are correctly aligned!`);
      }
    }
    
    // Take final screenshot
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/message-alignment-final.png', fullPage: true });
    console.log('\n📷 Final screenshot saved to tests/message-alignment-final.png');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    console.error('Stack trace:', error.stack);
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/error-analysis.png', fullPage: true });
    console.log('📷 Error screenshot saved to tests/error-analysis.png');
  } finally {
    console.log('\n🔚 Keeping browser open for 5 seconds for manual inspection...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

analyzeMessageAlignment();