import { chromium } from 'playwright';

async function findWorkingTestAccount() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Common test account patterns to try
  const testAccounts = [
    { email: 'test@example.com', password: 'password' },
    { email: 'test@example.com', password: 'password123' },
    { email: 'test@example.com', password: 'TestPassword123!' },
    { email: 'admin@example.com', password: 'password' },
    { email: 'admin@example.com', password: 'admin' },
    { email: 'demo@example.com', password: 'demo' },
    { email: 'demo@example.com', password: 'password' },
    { email: 'user@test.com', password: 'password' },
    { email: 'test@test.com', password: 'test' },
    { email: 'sarah@example.com', password: 'password' }, // From seed data
    { email: 'marcus@example.com', password: 'password' }, // From seed data
  ];

  try {
    for (const account of testAccounts) {
      console.log(`🔑 Trying account: ${account.email} / ${account.password}`);
      
      // Navigate to signin page
      await page.goto('http://localhost:5555/signin', { waitUntil: 'networkidle' });
      
      // Fill credentials
      await page.fill('input[type="email"]', account.email);
      await page.fill('input[type="password"]', account.password);
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log(`📍 After login attempt, URL: ${currentUrl}`);
      
      // Check if login was successful
      if (!currentUrl.includes('signin') && !currentUrl.includes('auth')) {
        console.log(`✅ SUCCESS! Working account found: ${account.email} / ${account.password}`);
        
        // Try to navigate to messages page to verify full access
        await page.goto('http://localhost:5555/messages');
        await page.waitForTimeout(2000);
        
        const messagesUrl = page.url();
        if (!messagesUrl.includes('signin') && !messagesUrl.includes('auth')) {
          console.log(`✅ Full access confirmed - can access messages page`);
          await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/working-account-messages.png', fullPage: true });
          
          // Now analyze the messages on this page
          await analyzeCurrentMessages(page);
          
          return account;
        } else {
          console.log(`⚠️ Limited access - redirected back to auth when accessing messages`);
        }
      } else {
        // Check for error messages
        const errorEl = await page.$('text=/invalid|error|failed/i');
        if (errorEl) {
          const errorText = await errorEl.textContent();
          console.log(`❌ Login failed: ${errorText}`);
        } else {
          console.log(`❌ Login failed - still on auth page`);
        }
      }
    }
    
    console.log(`❌ No working accounts found from common patterns`);
    
    // Try creating a simple account with email confirmation bypass
    console.log(`\n🔧 Attempting to create a new account...`);
    await createAndTestNewAccount(page);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/account-search-error.png', fullPage: true });
  } finally {
    console.log('\n🔚 Keeping browser open for manual inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
}

async function analyzeCurrentMessages(page) {
  console.log('\n🔍 Analyzing messages on current page...');
  
  const messageSelectors = [
    '[class*="flex items-end gap-2 mb-4"]',
    '[class*="justify-start"], [class*="justify-end"]',
    '[class*="px-4 py-2 rounded-2xl"]'
  ];
  
  for (const selector of messageSelectors) {
    const elements = await page.$$(selector);
    if (elements.length > 0) {
      console.log(`✅ Found ${elements.length} elements with selector: ${selector}`);
      
      // Quick analysis of first few messages
      for (let i = 0; i < Math.min(elements.length, 3); i++) {
        const el = elements[i];
        const className = await el.getAttribute('class');
        console.log(`📝 Element ${i + 1} classes:`, className);
        
        if (className.includes('justify-start')) {
          console.log(`   → LEFT aligned (justify-start)`);
        } else if (className.includes('justify-end')) {
          console.log(`   → RIGHT aligned (justify-end)`);
        }
        
        const bubbleEl = await el.$('[class*="bg-"]');
        if (bubbleEl) {
          const bubbleClass = await bubbleEl.getAttribute('class');
          if (bubbleClass.includes('bg-slate')) {
            console.log(`   → Own message (slate background)`);
          } else if (bubbleClass.includes('bg-')) {
            console.log(`   → Other user message (colored background)`);
          }
        }
      }
      break;
    }
  }
}

async function createAndTestNewAccount(page) {
  const timestamp = Date.now();
  const newAccount = {
    email: `test_${timestamp}@example.com`,
    password: 'TestPassword123!'
  };
  
  console.log(`🔧 Creating account: ${newAccount.email}`);
  
  // Navigate to signup
  await page.goto('http://localhost:5555/signup');
  
  // Fill form
  await page.fill('input[type="email"]', newAccount.email);
  await page.fill('input[type="password"]', newAccount.password);
  
  // Look for additional fields
  const confirmField = page.locator('input[placeholder*="confirm" i]');
  if (await confirmField.count() > 0) {
    await confirmField.fill(newAccount.password);
  }
  
  const termsCheckbox = page.locator('input[type="checkbox"]');
  if (await termsCheckbox.count() > 0) {
    await termsCheckbox.check();
  }
  
  // Submit form
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  const signupUrl = page.url();
  console.log(`📍 After signup, URL: ${signupUrl}`);
  
  if (signupUrl.includes('signin') || signupUrl.includes('confirm')) {
    console.log(`✅ Account creation appears successful (redirected to sign in or confirmation)`);
    
    // If redirected to confirmation, that might be the issue
    if (signupUrl.includes('confirm')) {
      console.log(`📧 Account requires email confirmation - this explains the login failures`);
    }
    
    return newAccount;
  } else {
    const errorEl = await page.$('text=/error|failed/i');
    if (errorEl) {
      const errorText = await errorEl.textContent();
      console.log(`❌ Account creation failed: ${errorText}`);
    }
  }
  
  return null;
}

findWorkingTestAccount();