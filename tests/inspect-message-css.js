import { chromium } from 'playwright';

async function inspectMessageCSS() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 Direct CSS inspection of MessageBubble component...');
    
    // Navigate to a page where we can inspect the component
    await page.goto('http://localhost:5555', { waitUntil: 'networkidle' });
    
    // Take a screenshot of the homepage
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/homepage.png', fullPage: true });
    
    console.log('🧪 Injecting test message elements to analyze CSS...');
    
    // Inject test message elements directly into the page to see how they would render
    await page.evaluate(() => {
      // Create a test container
      const testContainer = document.createElement('div');
      testContainer.style.cssText = 'padding: 20px; background: white; margin: 20px;';
      testContainer.innerHTML = `
        <h3>Message Alignment Test</h3>
        
        <!-- Own Message Test (should be right-aligned) -->
        <div style="margin: 20px 0; border: 2px solid blue; padding: 10px;">
          <h4>Own Message (isOwn=true) - Should be RIGHT aligned with justify-end</h4>
          <div class="flex items-end gap-2 mb-4 justify-end">
            <!-- Avatar for other users (left side) -->
            <div class="flex flex-col max-w-[70%] items-end">
              <div class="flex items-center gap-2 flex-row-reverse">
                <!-- Message bubble -->
                <div class="relative px-4 py-2 rounded-2xl shadow-sm rounded-br-sm border border-slate-200 bg-slate-200 text-slate-900">
                  <div class="break-words whitespace-pre-wrap">
                    Hello! This is my own message that should appear on the RIGHT side.
                  </div>
                </div>
              </div>
              <span class="text-xs mt-1 text-slate-400 mr-3">
                3:21 PM
              </span>
            </div>
            <!-- Avatar for current user (right side) -->
            <div class="flex-shrink-0 mb-1">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-slate-200 bg-slate-500">
                ME
              </div>
            </div>
          </div>
        </div>
        
        <!-- Other User Message Test (should be left-aligned) -->
        <div style="margin: 20px 0; border: 2px solid green; padding: 10px;">
          <h4>Other User Message (isOwn=false) - Should be LEFT aligned with justify-start</h4>
          <div class="flex items-end gap-2 mb-4 justify-start">
            <!-- Avatar for other users (left side) -->
            <div class="flex-shrink-0 mb-1">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-slate-200 bg-purple-500">
                TU
              </div>
            </div>
            <div class="flex flex-col max-w-[70%] items-start">
              <span class="text-xs text-slate-500 mb-1 ml-3">
                Test User
              </span>
              <div class="flex items-center gap-2 flex-row">
                <!-- Message bubble -->
                <div class="relative px-4 py-2 rounded-2xl shadow-sm rounded-bl-sm bg-purple-500 text-white">
                  <div class="break-words whitespace-pre-wrap">
                    Hi there! This is another user's message that should appear on the LEFT side.
                  </div>
                </div>
              </div>
              <span class="text-xs mt-1 text-slate-500 ml-3">
                3:20 PM
              </span>
            </div>
          </div>
        </div>
        
        <!-- Current Implementation Analysis -->
        <div style="margin: 20px 0; border: 2px solid red; padding: 10px;">
          <h4>Your Current Screenshot Shows (INCORRECT)</h4>
          <div class="flex items-end gap-2 mb-4 justify-end">
            <div class="flex flex-col max-w-[70%] items-start">
              <div class="flex items-center gap-2 flex-row">
                <div class="relative px-4 py-2 rounded-2xl shadow-sm rounded-bl-sm bg-green-500 text-white">
                  <div class="break-words whitespace-pre-wrap">
                    This looks like what your screenshot shows - justify-end container but items-start content and left avatar
                  </div>
                </div>
              </div>
              <span class="text-xs mt-1 text-slate-500 ml-3">
                Current State
              </span>
            </div>
            <div class="flex-shrink-0 mb-1">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-slate-200 bg-green-500">
                CS
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(testContainer);
    });
    
    // Wait for the test elements to render
    await page.waitForTimeout(2000);
    
    // Take a screenshot showing the test
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/css-alignment-test.png', fullPage: true });
    console.log('📷 CSS alignment test screenshot saved to tests/css-alignment-test.png');
    
    // Now analyze the classes being used
    console.log('\n🔍 Analyzing CSS classes used in test elements...');
    
    const alignmentInfo = await page.evaluate(() => {
      const containers = document.querySelectorAll('.flex.items-end.gap-2.mb-4');
      const results = [];
      
      containers.forEach((container, index) => {
        const classes = container.className;
        const hasJustifyStart = classes.includes('justify-start');
        const hasJustifyEnd = classes.includes('justify-end');
        
        const messageContent = container.querySelector('.px-4.py-2.rounded-2xl');
        const bgColor = messageContent ? messageContent.className.match(/bg-\\w+-\\d+/)?.[0] || 'no-bg-found' : 'no-message-found';
        
        const avatar = container.querySelector('.rounded-full');
        const avatarText = avatar ? avatar.textContent.trim() : 'no-avatar';
        
        results.push({
          index: index + 1,
          classes: classes,
          alignment: hasJustifyStart ? 'LEFT (justify-start)' : hasJustifyEnd ? 'RIGHT (justify-end)' : 'NO ALIGNMENT',
          messageColor: bgColor,
          avatarText: avatarText
        });
      });
      
      return results;
    });
    
    console.log('\n📊 Test Element Analysis:');
    alignmentInfo.forEach(info => {
      console.log(`\n--- Message Container ${info.index} ---`);
      console.log(`🎨 Classes: ${info.classes}`);
      console.log(`📍 Alignment: ${info.alignment}`);
      console.log(`🎨 Message Color: ${info.messageColor}`);
      console.log(`👤 Avatar: ${info.avatarText}`);
    });
    
    console.log('\n✅ Analysis complete! Check the screenshot to see the visual differences.');
    console.log('🎯 Key takeaways:');
    console.log('   - Own messages should use justify-end for right alignment');
    console.log('   - Other user messages should use justify-start for left alignment');
    console.log('   - Avatar positioning should match the alignment (own: right, others: left)');
    console.log('   - Content alignment (items-end vs items-start) should match the container alignment');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: '/Users/iaminawe/Sites/nelson-tech/tests/css-error.png', fullPage: true });
  } finally {
    console.log('\n🔚 Keeping browser open to view test results...');
    await page.waitForTimeout(15000);
    await browser.close();
  }
}

inspectMessageCSS();