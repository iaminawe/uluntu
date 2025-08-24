import { chromium } from 'playwright';

async function verifyAlignmentFix() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Verifying message alignment fix...');
    
    // Step 1: Authenticate
    console.log('🔐 Authenticating with test account...');
    await page.goto('http://localhost:5555/signin', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'gregg@smrt1.ca');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Step 2: Go to messages and select existing conversation
    console.log('📱 Going to messages and selecting conversation...');
    await page.goto('http://localhost:5555/messages', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Click on existing conversation
    const conversations = await page.$$('div:has-text("Direct Message")');
    if (conversations.length > 0) {
      console.log('🎯 Selecting existing conversation...');
      await conversations[0].click();
      await page.waitForTimeout(3000);
    }
    
    // Step 3: Check current message alignment
    console.log('\n🔍 CHECKING MESSAGE ALIGNMENT AFTER FIX');
    console.log('═'.repeat(50));
    
    const messageContainers = await page.$$('[class*="flex items-end gap-2 mb-4"]');
    console.log(`📱 Found ${messageContainers.length} message containers`);
    
    if (messageContainers.length === 0) {
      console.log('❌ No message containers found. The conversation might be empty.');
      
      // Try to send a test message to verify the fix
      const messageInputs = await page.$$('textarea, input[placeholder*="message" i]');
      if (messageInputs.length > 0) {
        console.log('✏️ Sending test message to verify alignment...');
        await messageInputs[0].fill('Test message after alignment fix - should be LEFT aligned (justify-start)');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
        
        // Check messages again
        const newMessageContainers = await page.$$('[class*="flex items-end gap-2 mb-4"]');
        console.log(`📱 After sending test message, found ${newMessageContainers.length} containers`);
      }
    }
    
    // Step 4: Analyze alignment
    const allContainers = await page.$$('[class*="flex items-end gap-2 mb-4"]');
    
    let correctCount = 0;
    let incorrectCount = 0;
    
    for (let i = 0; i < allContainers.length; i++) {
      const container = allContainers[i];
      const classes = await container.getAttribute('class');
      const text = await container.textContent();
      
      console.log(`\n--- MESSAGE ${i + 1} ---`);
      console.log(`🎨 Classes: ${classes}`);
      console.log(`💬 Text: "${text?.substring(0, 50)}..."`);
      
      // Check alignment
      if (classes?.includes('justify-start')) {
        console.log(`✅ CORRECT: Has justify-start (LEFT alignment for logged-in user)`);
        correctCount++;
      } else if (classes?.includes('justify-end')) {
        console.log(`❌ STILL INCORRECT: Has justify-end (should be justify-start for logged-in user)`);
        incorrectCount++;
      } else {
        console.log(`⚠️ No justify alignment class found`);
      }
      
      // Check for message bubble to confirm it's from logged-in user
      const bubble = await container.$('[class*="bg-slate"], [class*="border border-slate"]');
      if (bubble) {
        const bubbleClasses = await bubble.getAttribute('class');
        if (bubbleClasses?.includes('bg-slate') || bubbleClasses?.includes('border border-slate')) {
          console.log(`👤 Confirmed: Own message (slate background)`);
        }
      }
    }
    
    // Step 5: Final verdict
    console.log(`\n📊 ALIGNMENT FIX VERIFICATION RESULTS`);
    console.log('═'.repeat(50));
    console.log(`📱 Total messages analyzed: ${allContainers.length}`);
    console.log(`✅ Correctly aligned (justify-start): ${correctCount}`);
    console.log(`❌ Still incorrect (justify-end): ${incorrectCount}`);
    
    if (correctCount > 0 && incorrectCount === 0) {
      console.log(`\n🎉 SUCCESS! Alignment fix is working correctly!`);
      console.log(`   - All logged-in user messages now have justify-start (LEFT alignment)`);
      console.log(`   - This matches the user's requirement`);
    } else if (incorrectCount > 0) {
      console.log(`\n⚠️ PARTIAL SUCCESS: Some messages still have incorrect alignment`);
      console.log(`   - This might indicate the fix needs more work`);
      console.log(`   - Or there might be cached data/components`);
    } else if (correctCount === 0) {
      console.log(`\n❌ FIX NOT WORKING: No messages have the correct alignment`);
      console.log(`   - The isOwn logic might still be incorrect`);
      console.log(`   - Or the member ID mapping is not working`);
    }
    
    // Take screenshot for verification
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/alignment-fix-verification.png', fullPage: true });
    console.log(`\n📷 Verification screenshot saved`);
    
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/verification-error.png', fullPage: true });
  } finally {
    console.log('\n🔚 Keeping browser open for manual inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

verifyAlignmentFix();