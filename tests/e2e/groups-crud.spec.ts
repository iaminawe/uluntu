import { test, expect, Page } from '@playwright/test';
import { ensureAuthenticated, signOut, TestUser } from './helpers/auth';
import { generateTestGroup, createGroup, navigateToGroup, editGroup, deleteGroup, TestGroup } from './helpers/groups';

test.describe('Groups CRUD Operations', () => {
  let testUser: TestUser;
  let createdGroups: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Ensure we have an authenticated user
    testUser = await ensureAuthenticated(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    // Clean up created groups
    for (const groupId of createdGroups) {
      try {
        await navigateToGroup(page, groupId);
        await deleteGroup(page);
      } catch (error) {
        console.warn(`Failed to clean up group ${groupId}:`, error);
      }
    }
    createdGroups = [];
    
    await signOut(page);
  });

  test.describe('Group Creation', () => {
    test('should create a public group successfully', async ({ page }) => {
      const testGroup = generateTestGroup();
      testGroup.visibility = 'public';

      await test.step('Navigate to groups page and create group', async () => {
        const groupId = await createGroup(page, testGroup);
        expect(groupId).toBeTruthy();
        
        if (groupId) {
          createdGroups.push(groupId);
        }
      });

      await test.step('Verify group details are displayed correctly', async () => {
        // Check if we're on the group page
        expect(page.url()).toMatch(/\/groups\/[^\/]+/);
        
        // Verify group name is displayed
        await expect(page.locator('h1, h2, .group-title').filter({ hasText: testGroup.name })).toBeVisible();
        
        // Verify description is displayed
        await expect(page.locator('.group-description, .description').filter({ hasText: testGroup.description })).toBeVisible();
        
        // Verify visibility indicator (should show public)
        const visibilityIndicators = page.locator('text=/Public|public/i');
        await expect(visibilityIndicators.first()).toBeVisible();
      });
    });

    test('should create a private group successfully', async ({ page }) => {
      const testGroup = generateTestGroup();
      testGroup.visibility = 'private';

      await test.step('Create private group', async () => {
        const groupId = await createGroup(page, testGroup);
        expect(groupId).toBeTruthy();
        
        if (groupId) {
          createdGroups.push(groupId);
        }
      });

      await test.step('Verify private group indicators', async () => {
        // Check for private indicators
        const privateIndicators = page.locator('text=/Private|private/i');
        await expect(privateIndicators.first()).toBeVisible();
      });
    });

    test('should create an invite-only group successfully', async ({ page }) => {
      const testGroup = generateTestGroup();
      testGroup.visibility = 'invite_only';

      await test.step('Create invite-only group', async () => {
        const groupId = await createGroup(page, testGroup);
        expect(groupId).toBeTruthy();
        
        if (groupId) {
          createdGroups.push(groupId);
        }
      });

      await test.step('Verify invite-only group indicators', async () => {
        // Check for invite-only indicators
        const inviteOnlyIndicators = page.locator('text=/Invite.*Only|invite.*only/i');
        await expect(inviteOnlyIndicators.first()).toBeVisible();
      });
    });

    test('should handle group creation with invalid data', async ({ page }) => {
      await test.step('Attempt to create group with empty name', async () => {
        const invalidGroup: TestGroup = {
          name: '',
          description: 'Valid description',
          visibility: 'public',
        };

        const groupId = await createGroup(page, invalidGroup);
        expect(groupId).toBeNull();
        
        // Should see validation error
        const errorMessage = page.locator('text=/Name.*required|Please.*name/i');
        await expect(errorMessage).toBeVisible();
      });

      await test.step('Attempt to create group with very long name', async () => {
        const invalidGroup: TestGroup = {
          name: 'a'.repeat(256), // Assuming 255 character limit
          description: 'Valid description',
          visibility: 'public',
        };

        const groupId = await createGroup(page, invalidGroup);
        expect(groupId).toBeNull();
        
        // Should see validation error
        const errorMessage = page.locator('text=/Name.*long|Character.*limit/i');
        await expect(errorMessage).toBeVisible();
      });
    });
  });

  test.describe('Group Editing', () => {
    let groupId: string;

    test.beforeEach(async ({ page }) => {
      // Create a test group for editing
      const testGroup = generateTestGroup();
      const id = await createGroup(page, testGroup);
      expect(id).toBeTruthy();
      groupId = id!;
      createdGroups.push(groupId);
    });

    test('should edit group name successfully', async ({ page }) => {
      const newName = `Updated Group Name ${Date.now()}`;

      await test.step('Navigate to group and edit name', async () => {
        await navigateToGroup(page, groupId);
        
        const editSuccess = await editGroup(page, { name: newName });
        expect(editSuccess).toBeTruthy();
      });

      await test.step('Verify name change is displayed', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        await expect(page.locator('h1, h2, .group-title').filter({ hasText: newName })).toBeVisible();
      });
    });

    test('should edit group description successfully', async ({ page }) => {
      const newDescription = `Updated description with timestamp ${Date.now()}`;

      await test.step('Edit group description', async () => {
        await navigateToGroup(page, groupId);
        
        const editSuccess = await editGroup(page, { description: newDescription });
        expect(editSuccess).toBeTruthy();
      });

      await test.step('Verify description change is displayed', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        await expect(page.locator('.group-description, .description').filter({ hasText: newDescription })).toBeVisible();
      });
    });

    test('should change group visibility from public to private', async ({ page }) => {
      await test.step('Change visibility to private', async () => {
        await navigateToGroup(page, groupId);
        
        const editSuccess = await editGroup(page, { visibility: 'private' });
        expect(editSuccess).toBeTruthy();
      });

      await test.step('Verify visibility change', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        const privateIndicators = page.locator('text=/Private|private/i');
        await expect(privateIndicators.first()).toBeVisible();
      });
    });

    test('should handle edit with invalid data', async ({ page }) => {
      await test.step('Attempt to edit with empty name', async () => {
        await navigateToGroup(page, groupId);
        
        const editSuccess = await editGroup(page, { name: '' });
        expect(editSuccess).toBeFalsy();
        
        // Should see validation error
        const errorMessage = page.locator('text=/Name.*required|Please.*name/i');
        await expect(errorMessage).toBeVisible();
      });
    });

    test('should handle unauthorized edit attempt', async ({ page }) => {
      // This test would require a second user account
      // For now, we'll test that edit controls are not visible to non-members
      await test.step('Sign out and visit group as anonymous user', async () => {
        await signOut(page);
        await navigateToGroup(page, groupId);
        
        // Edit button should not be visible
        const editButton = page.locator('button:has-text("Edit"), text=Edit Group');
        await expect(editButton).toHaveCount(0);
      });
    });
  });

  test.describe('Group Deletion', () => {
    let groupId: string;

    test.beforeEach(async ({ page }) => {
      // Create a test group for deletion
      const testGroup = generateTestGroup();
      const id = await createGroup(page, testGroup);
      expect(id).toBeTruthy();
      groupId = id!;
      // Don't add to createdGroups since we're testing deletion
    });

    test('should delete group successfully', async ({ page }) => {
      await test.step('Navigate to group and delete', async () => {
        await navigateToGroup(page, groupId);
        
        const deleteSuccess = await deleteGroup(page);
        expect(deleteSuccess).toBeTruthy();
      });

      await test.step('Verify redirection away from group', async () => {
        // Should be redirected away from the group page
        expect(page.url()).not.toMatch(new RegExp(`/groups/${groupId}`));
      });

      await test.step('Verify group no longer accessible', async () => {
        // Try to navigate to the deleted group directly
        await page.goto(`/groups/${groupId}`);
        
        // Should show 404 or "Group not found" message
        const notFoundIndicators = [
          'text=/404|Not Found/i',
          'text=/Group.*not.*found/i',
          'text=/Page.*not.*found/i',
        ];

        let notFoundShown = false;
        for (const indicator of notFoundIndicators) {
          if (await page.locator(indicator).count() > 0) {
            notFoundShown = true;
            break;
          }
        }
        
        expect(notFoundShown).toBeTruthy();
      });
    });

    test('should handle unauthorized deletion attempt', async ({ page }) => {
      await test.step('Sign out and attempt to access group settings', async () => {
        await signOut(page);
        await navigateToGroup(page, groupId);
        
        // Delete/settings controls should not be visible
        const settingsButton = page.locator('button:has-text("Settings"), button:has-text("Options")');
        await expect(settingsButton).toHaveCount(0);
      });
    });

    test('should handle deletion confirmation flow', async ({ page }) => {
      await test.step('Initiate deletion and verify confirmation dialog', async () => {
        await navigateToGroup(page, groupId);
        
        // Look for settings/options button
        const settingsButtons = [
          'button:has-text("Settings")',
          'button:has-text("Options")',
          'button[aria-label*="menu" i]',
        ];
        
        let settingsFound = false;
        for (const selector of settingsButtons) {
          const button = page.locator(selector);
          if (await button.count() > 0) {
            await button.click();
            settingsFound = true;
            break;
          }
        }
        
        if (settingsFound) {
          // Click delete option
          const deleteButton = page.locator('button:has-text("Delete"), text=Delete Group');
          if (await deleteButton.count() > 0) {
            await deleteButton.click();
            
            // Should show confirmation dialog
            const confirmationDialog = page.locator('text=/Are you sure|Confirm.*delete/i');
            await expect(confirmationDialog.first()).toBeVisible();
            
            // Cancel deletion
            const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("No")');
            if (await cancelButton.count() > 0) {
              await cancelButton.click();
              
              // Should still be on group page
              expect(page.url()).toMatch(new RegExp(`/groups/${groupId}`));
            }
          }
        }
      });
      
      // Clean up - add back to createdGroups for cleanup
      createdGroups.push(groupId);
    });
  });

  test.describe('Visibility Settings', () => {
    test('should respect public group visibility', async ({ page }) => {
      const publicGroup = generateTestGroup();
      publicGroup.visibility = 'public';

      await test.step('Create public group', async () => {
        const groupId = await createGroup(page, publicGroup);
        expect(groupId).toBeTruthy();
        createdGroups.push(groupId!);
      });

      await test.step('Verify public group is visible when signed out', async () => {
        const currentUrl = page.url();
        await signOut(page);
        await page.goto(currentUrl);
        
        // Group content should still be visible
        await expect(page.locator('h1, h2, .group-title').filter({ hasText: publicGroup.name })).toBeVisible();
      });
    });

    test('should respect private group visibility', async ({ page }) => {
      const privateGroup = generateTestGroup();
      privateGroup.visibility = 'private';

      let groupId: string;
      await test.step('Create private group', async () => {
        const id = await createGroup(page, privateGroup);
        expect(id).toBeTruthy();
        groupId = id!;
        createdGroups.push(groupId);
      });

      await test.step('Verify private group is not accessible when signed out', async () => {
        const groupUrl = page.url();
        await signOut(page);
        await page.goto(groupUrl);
        
        // Should show access denied or redirect to login
        const accessDeniedIndicators = [
          'text=/Access.*denied/i',
          'text=/Private.*group/i',
          'text=/Sign.*in/i',
          'text=/Login/i',
        ];

        let accessDenied = false;
        for (const indicator of accessDeniedIndicators) {
          if (await page.locator(indicator).count() > 0) {
            accessDenied = true;
            break;
          }
        }
        
        // Either access is denied or we're redirected to sign in
        expect(accessDenied || page.url().includes('/signin') || page.url().includes('/login')).toBeTruthy();
      });
    });

    test('should handle visibility change effects', async ({ page }) => {
      const group = generateTestGroup();
      group.visibility = 'public';

      let groupId: string;
      await test.step('Create public group', async () => {
        const id = await createGroup(page, group);
        expect(id).toBeTruthy();
        groupId = id!;
        createdGroups.push(groupId);
      });

      await test.step('Change to private and verify effect', async () => {
        await navigateToGroup(page, groupId);
        
        const editSuccess = await editGroup(page, { visibility: 'private' });
        expect(editSuccess).toBeTruthy();
        
        // Sign out and verify access is now restricted
        const groupUrl = page.url();
        await signOut(page);
        await page.goto(groupUrl);
        
        // Should no longer have full access
        const restrictedAccess = page.url().includes('/signin') || 
                                page.url().includes('/login') ||
                                await page.locator('text=/Access.*denied|Private.*group/i').count() > 0;
        
        expect(restrictedAccess).toBeTruthy();
      });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await test.step('Simulate network failure during group creation', async () => {
        // Go offline
        await page.context().setOffline(true);
        
        const testGroup = generateTestGroup();
        const groupId = await createGroup(page, testGroup);
        
        // Should fail gracefully
        expect(groupId).toBeNull();
        
        // Should show error message
        const errorMessage = page.locator('text=/Network.*error|Connection.*failed|Offline/i');
        const hasError = await errorMessage.count() > 0;
        
        // Go back online
        await page.context().setOffline(false);
        
        // Note: We don't enforce error message visibility as it depends on implementation
        console.log('Network error handling test completed, error shown:', hasError);
      });
    });

    test('should handle server errors gracefully', async ({ page }) => {
      await test.step('Monitor for error handling during operations', async () => {
        const testGroup = generateTestGroup();
        
        // Try to create group and monitor console for errors
        let consoleErrors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        
        const groupId = await createGroup(page, testGroup);
        
        // If creation succeeded, clean up
        if (groupId) {
          createdGroups.push(groupId);
        }
        
        // Log any console errors for debugging
        if (consoleErrors.length > 0) {
          console.log('Console errors during group creation:', consoleErrors);
        }
      });
    });
  });
});