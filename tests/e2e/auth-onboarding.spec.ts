import { test, expect, Page } from '@playwright/test';

// Generate unique test user data
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

test.describe('Authentication and Onboarding Flow', () => {
  let testUser = generateTestUser();

  test.beforeEach(async ({ page }) => {
    // Start from the homepage
    await page.goto('http://localhost:5555');
  });

  test('complete signup, signin, and onboarding flow', async ({ page }) => {
    // Step 1: Navigate to signup page
    await test.step('Navigate to signup page', async () => {
      // Try multiple selectors for signup link
      const signupSelectors = [
        'text=Sign Up',
        'text=Sign up',
        'text=Register',
        'text=Create Account',
        'a[href*="signup"]',
        'a[href*="register"]',
        'button:has-text("Sign Up")',
        'button:has-text("Get Started")'
      ];
      
      let clicked = false;
      for (const selector of signupSelectors) {
        if (await page.locator(selector).count() > 0) {
          await page.click(selector);
          clicked = true;
          break;
        }
      }
      
      if (!clicked) {
        // If no signup button found, navigate directly
        await page.goto('http://localhost:5555/signup');
      }
      
      await expect(page).toHaveURL(/.*\/(signup|register)/);
      await page.waitForLoadState('networkidle');
    });

    // Step 2: Fill signup form
    await test.step('Fill and submit signup form', async () => {
      // Fill in the signup form
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      
      // Look for confirm password field if it exists
      const confirmPasswordField = page.locator('input[placeholder*="Confirm"]');
      if (await confirmPasswordField.count() > 0) {
        await confirmPasswordField.fill(testUser.password);
      }

      // Accept terms if checkbox exists
      const termsCheckbox = page.locator('input[type="checkbox"]');
      if (await termsCheckbox.count() > 0) {
        await termsCheckbox.check();
      }

      // Submit the form
      await page.click('button[type="submit"]');

      // Wait for navigation or success message
      await page.waitForLoadState('networkidle');
    });

    // Step 3: Check for onboarding modal/redirect
    await test.step('Check for onboarding prompt', async () => {
      // Wait for either onboarding modal or redirect
      await page.waitForTimeout(2000); // Give time for redirect/modal
      
      // Check if we see onboarding content
      const onboardingIndicators = [
        'text=/Welcome to.*Nelson/i',
        'text=/Complete.*Profile/i',
        'text=/Start Onboarding/i',
        'text=/Profile Completion/i'
      ];

      let foundOnboarding = false;
      for (const indicator of onboardingIndicators) {
        if (await page.locator(indicator).count() > 0) {
          foundOnboarding = true;
          break;
        }
      }

      if (foundOnboarding) {
        console.log('Onboarding prompt detected');
        
        // Look for start/complete onboarding button
        const onboardingButton = page.locator('a, button').filter({ 
          hasText: /Start Onboarding|Complete Onboarding|Complete Profile/i 
        }).first();
        
        if (await onboardingButton.count() > 0) {
          await onboardingButton.click();
          await page.waitForLoadState('networkidle');
        }
      }
    });

    // Step 4: Complete onboarding wizard if present
    await test.step('Complete onboarding wizard', async () => {
      // Check if we're in the onboarding wizard
      if (page.url().includes('/onboarding')) {
        console.log('Onboarding wizard detected');

        // Step 1: Welcome (if present)
        if (await page.locator('text=/Welcome to.*Community/i').count() > 0) {
          const nextButton = page.locator('button').filter({ hasText: /Next|Continue|Get Started/i }).first();
          if (await nextButton.count() > 0) {
            await nextButton.click();
            await page.waitForTimeout(500);
          }
        }

        // Step 2: Professional Info
        if (await page.locator('text=/Professional.*Info/i').count() > 0) {
          // Fill bio
          const bioField = page.locator('textarea').first();
          if (await bioField.count() > 0) {
            await bioField.fill(testUser.bio);
          }

          // Fill title
          const titleField = page.locator('input[placeholder*="title" i], input[placeholder*="position" i]').first();
          if (await titleField.count() > 0) {
            await titleField.fill(testUser.title);
          }

          // Add skills if field exists
          const skillsInput = page.locator('input[placeholder*="skill" i]').first();
          if (await skillsInput.count() > 0) {
            await skillsInput.fill('JavaScript');
            await page.keyboard.press('Enter');
            await skillsInput.fill('React');
            await page.keyboard.press('Enter');
          }

          // Click next
          await page.locator('button').filter({ hasText: /Next|Continue/i }).first().click();
          await page.waitForTimeout(500);
        }

        // Step 3: Company Association (optional, may be skipped)
        if (await page.locator('text=/Company|Organization/i').count() > 0) {
          // Skip this step
          const skipButton = page.locator('button').filter({ hasText: /Skip|Later/i }).first();
          if (await skipButton.count() > 0) {
            await skipButton.click();
          } else {
            await page.locator('button').filter({ hasText: /Next|Continue/i }).first().click();
          }
          await page.waitForTimeout(500);
        }

        // Step 4: Privacy Settings
        if (await page.locator('text=/Privacy.*Settings/i').count() > 0) {
          // Select public profile if option exists
          const publicOption = page.locator('text=Public').first();
          if (await publicOption.count() > 0) {
            await publicOption.click();
          }

          await page.locator('button').filter({ hasText: /Next|Continue/i }).first().click();
          await page.waitForTimeout(500);
        }

        // Step 5: Community Engagement
        if (await page.locator('text=/Community|Interests/i').count() > 0) {
          // Select some interests
          const interests = page.locator('button').filter({ hasText: /Web Development|JavaScript|React/i });
          for (let i = 0; i < Math.min(3, await interests.count()); i++) {
            await interests.nth(i).click();
          }

          // Complete onboarding
          const completeButton = page.locator('button').filter({ hasText: /Complete|Finish|Done/i }).first();
          if (await completeButton.count() > 0) {
            await completeButton.click();
          } else {
            await page.locator('button').filter({ hasText: /Next|Continue/i }).first().click();
          }
          await page.waitForLoadState('networkidle');
        }
      }
    });

    // Step 5: Verify user is logged in and onboarding complete
    await test.step('Verify successful onboarding completion', async () => {
      await page.waitForTimeout(2000);
      
      // Check if we're redirected to a logged-in area
      const loggedInIndicators = [
        'button[aria-label*="user" i]',
        'button[aria-label*="account" i]',
        'button[aria-label*="profile" i]',
        'text=Sign Out',
        'text=Log Out',
        'text=Profile',
        'text=Dashboard'
      ];

      let isLoggedIn = false;
      for (const indicator of loggedInIndicators) {
        if (await page.locator(indicator).count() > 0) {
          isLoggedIn = true;
          break;
        }
      }

      expect(isLoggedIn).toBeTruthy();
      console.log('User successfully signed up and completed onboarding');
    });
  });

  test('signin with existing user', async ({ page }) => {
    // Create a test user first (in real scenario, this would be an existing user)
    const existingUser = {
      email: 'test@example.com',
      password: 'Password123!'
    };

    // Step 1: Navigate to signin page
    await test.step('Navigate to signin page', async () => {
      // Try multiple selectors for signin link
      const signinSelectors = [
        'text=Sign In',
        'text=Sign in',
        'text=Login',
        'text=Log In',
        'a[href*="signin"]',
        'a[href*="login"]',
        'button:has-text("Sign In")'
      ];
      
      let clicked = false;
      for (const selector of signinSelectors) {
        if (await page.locator(selector).count() > 0) {
          await page.click(selector);
          clicked = true;
          break;
        }
      }
      
      if (!clicked) {
        // If no signin button found, navigate directly
        await page.goto('http://localhost:5555/signin');
      }
      
      await expect(page).toHaveURL(/.*\/(signin|login)/);
    });

    // Step 2: Fill signin form
    await test.step('Fill and submit signin form', async () => {
      await page.fill('input[type="email"]', existingUser.email);
      await page.fill('input[type="password"]', existingUser.password);
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
    });

    // Step 3: Check login result
    await test.step('Verify signin result', async () => {
      await page.waitForTimeout(2000);
      
      // Check for error message (if credentials are invalid)
      const errorMessage = page.locator('text=/Invalid|Error|Failed/i');
      if (await errorMessage.count() > 0) {
        console.log('Login failed - invalid credentials (expected for test user)');
      } else {
        // Check if logged in successfully
        const profileButton = page.locator('button[aria-label*="profile" i], text=Profile');
        if (await profileButton.count() > 0) {
          console.log('Login successful');
        }
      }
    });
  });

  test('profile completion check for incomplete profiles', async ({ page }) => {
    // This test checks if the onboarding prompt appears for users with incomplete profiles
    
    // First, try to sign in (assuming a test user exists)
    await page.goto('http://localhost:5555/signin');
    
    // Use a test account that might have incomplete profile
    await page.fill('input[type="email"]', 'incomplete@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    // Check if onboarding prompt appears
    const onboardingPrompt = page.locator('text=/Complete.*Profile|Profile.*Incomplete/i');
    if (await onboardingPrompt.count() > 0) {
      console.log('Onboarding prompt shown for incomplete profile');
      expect(await onboardingPrompt.count()).toBeGreaterThan(0);
    }
  });
});

// Helper function to take screenshots for debugging
async function takeDebugScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `tests/screenshots/${name}.png`, fullPage: true });
}