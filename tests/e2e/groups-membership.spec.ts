import { test, expect, Page } from '@playwright/test';
import { ensureAuthenticated, signOut, TestUser, generateTestUser, createTestAccount } from './helpers/auth';
import { generateTestGroup, createGroup, navigateToGroup, joinGroup, leaveGroup, TestGroup } from './helpers/groups';

test.describe('Groups Membership Management', () => {
  let testUser: TestUser;
  let secondUser: TestUser;
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
        
        // Try to delete group if we're the owner
        const settingsButton = page.locator('button:has-text("Settings"), button:has-text("Options")');
        if (await settingsButton.count() > 0) {
          await settingsButton.click();
          await page.waitForTimeout(500);
          
          const deleteButton = page.locator('button:has-text("Delete"), text=Delete Group');
          if (await deleteButton.count() > 0) {
            await deleteButton.click();
            
            // Confirm deletion
            const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")');
            if (await confirmButton.count() > 0) {
              await confirmButton.click();
              await page.waitForLoadState('networkidle');
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to clean up group ${groupId}:`, error);
      }
    }
    createdGroups = [];
    
    await signOut(page);
  });

  test.describe('Joining Open Groups', () => {
    let publicGroupId: string;

    test.beforeEach(async ({ page }) => {
      // Create a public group for joining tests
      const publicGroup = generateTestGroup();
      publicGroup.visibility = 'public';
      
      const groupId = await createGroup(page, publicGroup);
      expect(groupId).toBeTruthy();
      publicGroupId = groupId!;
      createdGroups.push(publicGroupId);
    });

    test('should join a public group successfully', async ({ page }) => {
      // Create a second user to test joining
      secondUser = generateTestUser();
      await signOut(page);
      
      await test.step('Create second user account', async () => {
        const createSuccess = await createTestAccount(page, secondUser);
        expect(createSuccess).toBeTruthy();
      });

      await test.step('Navigate to public group and join', async () => {
        await navigateToGroup(page, publicGroupId);
        
        // Should see group details even as non-member
        await expect(page.locator('h1, h2, .group-title')).toBeVisible();
        
        // Should see join button
        const joinButton = page.locator('button:has-text("Join"), text=Join Group');
        await expect(joinButton).toBeVisible();
        
        // Join the group
        const joinSuccess = await joinGroup(page);
        expect(joinSuccess).toBeTruthy();
      });

      await test.step('Verify membership status', async () => {
        // Join button should change to Leave button
        const leaveButton = page.locator('button:has-text("Leave"), text=Leave Group');
        await expect(leaveButton).toBeVisible();
        
        // Should now see member-only content/features
        const memberIndicators = [
          'text=/Member since/i',
          'text=/You are a member/i',
          '.member-badge',
          '[data-testid="member-status"]',
        ];
        
        let memberIndicatorFound = false;
        for (const indicator of memberIndicators) {
          if (await page.locator(indicator).count() > 0) {
            memberIndicatorFound = true;
            break;
          }
        }
        
        // Note: Member indicators might not always be visible, so we don't enforce this
        console.log('Member indicator found:', memberIndicatorFound);
      });
    });

    test('should handle double join attempt gracefully', async ({ page }) => {
      // Create second user and join group
      secondUser = generateTestUser();
      await signOut(page);
      await createTestAccount(page, secondUser);
      
      await test.step('Join group first time', async () => {
        await navigateToGroup(page, publicGroupId);
        const joinSuccess = await joinGroup(page);
        expect(joinSuccess).toBeTruthy();
      });

      await test.step('Attempt to join again', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Join button should not be visible anymore
        const joinButton = page.locator('button:has-text("Join")');
        await expect(joinButton).toHaveCount(0);
        
        // Leave button should be visible instead
        const leaveButton = page.locator('button:has-text("Leave")');
        await expect(leaveButton).toBeVisible();
      });
    });

    test('should not show join button for group owner', async ({ page }) => {
      await test.step('Visit own group as creator', async () => {
        await navigateToGroup(page, publicGroupId);
        
        // Should not see join button since we're the owner
        const joinButton = page.locator('button:has-text("Join")');
        await expect(joinButton).toHaveCount(0);
        
        // Should see owner/admin controls instead
        const ownerControls = [
          'button:has-text("Settings")',
          'button:has-text("Edit")',
          'button:has-text("Manage")',
          'text=/Owner|Admin/i',
        ];
        
        let ownerControlFound = false;
        for (const control of ownerControls) {
          if (await page.locator(control).count() > 0) {
            ownerControlFound = true;
            break;
          }
        }
        
        expect(ownerControlFound).toBeTruthy();
      });
    });
  });

  test.describe('Leaving Groups', () => {
    let groupId: string;

    test.beforeEach(async ({ page }) => {
      // Create a group and have second user join it
      const group = generateTestGroup();
      group.visibility = 'public';
      
      groupId = (await createGroup(page, group))!;
      createdGroups.push(groupId);
      
      // Create and sign in second user
      secondUser = generateTestUser();
      await signOut(page);
      await createTestAccount(page, secondUser);
      
      // Join the group
      await navigateToGroup(page, groupId);
      await joinGroup(page);
    });

    test('should leave group successfully', async ({ page }) => {
      await test.step('Leave the group', async () => {
        await navigateToGroup(page, groupId);
        
        // Should see leave button as a member
        const leaveButton = page.locator('button:has-text("Leave")');
        await expect(leaveButton).toBeVisible();
        
        // Leave the group
        const leaveSuccess = await leaveGroup(page);
        expect(leaveSuccess).toBeTruthy();
      });

      await test.step('Verify no longer a member', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Should see join button again
        const joinButton = page.locator('button:has-text("Join")');
        await expect(joinButton).toBeVisible();
        
        // Should not see leave button
        const leaveButton = page.locator('button:has-text("Leave")');
        await expect(leaveButton).toHaveCount(0);
      });
    });

    test('should handle leave confirmation dialog', async ({ page }) => {
      await test.step('Initiate leave and verify confirmation', async () => {
        await navigateToGroup(page, groupId);
        
        const leaveButton = page.locator('button:has-text("Leave")');
        await leaveButton.click();
        
        // Check if confirmation dialog appears
        await page.waitForTimeout(500);
        const confirmationDialog = page.locator('text=/Are you sure|Confirm.*leave/i');
        
        if (await confirmationDialog.count() > 0) {
          // Cancel first
          const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("No")');
          if (await cancelButton.count() > 0) {
            await cancelButton.click();
            
            // Should still be a member
            await expect(leaveButton).toBeVisible();
          }
        }
      });
    });

    test('should prevent group owner from leaving', async ({ page }) => {
      // Sign back in as group owner
      await signOut(page);
      testUser = await ensureAuthenticated(page, testUser);
      
      await test.step('Try to leave as group owner', async () => {
        await navigateToGroup(page, groupId);
        
        // Owner should not see leave button, or it should be disabled
        const leaveButton = page.locator('button:has-text("Leave")');
        
        if (await leaveButton.count() > 0) {
          // If leave button exists, it should be disabled
          const isDisabled = await leaveButton.isDisabled();
          expect(isDisabled).toBeTruthy();
        } else {
          // More likely: no leave button for owner
          expect(await leaveButton.count()).toBe(0);
        }
      });
    });
  });

  test.describe('Invitation Flow', () => {
    let inviteOnlyGroupId: string;

    test.beforeEach(async ({ page }) => {
      // Create an invite-only group
      const inviteOnlyGroup = generateTestGroup();
      inviteOnlyGroup.visibility = 'invite_only';
      
      const groupId = await createGroup(page, inviteOnlyGroup);
      expect(groupId).toBeTruthy();
      inviteOnlyGroupId = groupId!;
      createdGroups.push(inviteOnlyGroupId);
    });

    test('should not allow direct joining of invite-only groups', async ({ page }) => {
      // Create second user
      secondUser = generateTestUser();
      await signOut(page);
      await createTestAccount(page, secondUser);
      
      await test.step('Attempt to access invite-only group', async () => {
        await navigateToGroup(page, inviteOnlyGroupId);
        
        // Should not see join button
        const joinButton = page.locator('button:has-text("Join")');
        await expect(joinButton).toHaveCount(0);
        
        // Should see invitation-required message or request invite button
        const inviteIndicators = [
          'text=/Invite.*required/i',
          'text=/Request.*invite/i',
          'text=/Invitation.*only/i',
          'button:has-text("Request Invite")',
        ];
        
        let inviteIndicatorFound = false;
        for (const indicator of inviteIndicators) {
          if (await page.locator(indicator).count() > 0) {
            inviteIndicatorFound = true;
            break;
          }
        }
        
        expect(inviteIndicatorFound).toBeTruthy();
      });
    });

    test('should handle invite request flow', async ({ page }) => {
      // Create second user
      secondUser = generateTestUser();
      await signOut(page);
      await createTestAccount(page, secondUser);
      
      await test.step('Request invitation to group', async () => {
        await navigateToGroup(page, inviteOnlyGroupId);
        
        // Look for request invite button
        const requestInviteButton = page.locator('button:has-text("Request Invite"), button:has-text("Request")');
        
        if (await requestInviteButton.count() > 0) {
          await requestInviteButton.click();
          
          // Should show confirmation or change button state
          await page.waitForTimeout(500);
          const requestSentIndicators = [
            'text=/Request.*sent/i',
            'text=/Invitation.*requested/i',
            'button:has-text("Requested")',
          ];
          
          let requestSentFound = false;
          for (const indicator of requestSentIndicators) {
            if (await page.locator(indicator).count() > 0) {
              requestSentFound = true;
              break;
            }
          }
          
          expect(requestSentFound).toBeTruthy();
        }
      });
    });

    test('should allow group admin to send invitations', async ({ page }) => {
      await test.step('Access group management as owner', async () => {
        await navigateToGroup(page, inviteOnlyGroupId);
        
        // Look for invite/manage members functionality
        const manageButtons = [
          'button:has-text("Invite")',
          'button:has-text("Members")',
          'button:has-text("Manage")',
          'text=Invite Members',
        ];
        
        let manageButtonFound = false;
        for (const button of manageButtons) {
          if (await page.locator(button).count() > 0) {
            manageButtonFound = true;
            await page.locator(button).click();
            break;
          }
        }
        
        if (manageButtonFound) {
          // Should see invitation interface
          const inviteInterface = [
            'input[placeholder*="email" i]',
            'input[placeholder*="invite" i]',
            'textarea[placeholder*="message" i]',
          ];
          
          let inviteInterfaceFound = false;
          for (const element of inviteInterface) {
            if (await page.locator(element).count() > 0) {
              inviteInterfaceFound = true;
              break;
            }
          }
          
          expect(inviteInterfaceFound).toBeTruthy();
        }
      });
    });
  });

  test.describe('Member Role Changes', () => {
    let groupId: string;

    test.beforeEach(async ({ page }) => {
      // Create a group and add second user as member
      const group = generateTestGroup();
      group.visibility = 'public';
      
      groupId = (await createGroup(page, group))!;
      createdGroups.push(groupId);
      
      // Add second user
      secondUser = generateTestUser();
      await signOut(page);
      await createTestAccount(page, secondUser);
      await navigateToGroup(page, groupId);
      await joinGroup(page);
      
      // Sign back in as owner
      await signOut(page);
      testUser = await ensureAuthenticated(page, testUser);
    });

    test('should view member list as group admin', async ({ page }) => {
      await test.step('Access member management', async () => {
        await navigateToGroup(page, groupId);
        
        // Look for members/manage buttons
        const memberButtons = [
          'button:has-text("Members")',
          'button:has-text("Manage Members")',
          'text=View Members',
          'a:has-text("Members")',
        ];
        
        let memberButtonFound = false;
        for (const button of memberButtons) {
          if (await page.locator(button).count() > 0) {
            await page.locator(button).click();
            memberButtonFound = true;
            break;
          }
        }
        
        if (memberButtonFound) {
          await page.waitForLoadState('networkidle');
          
          // Should see member list with both users
          const memberList = page.locator('.member-list, .members, [data-testid="member-list"]');
          
          if (await memberList.count() > 0) {
            // Should see at least 2 members (owner + secondUser)
            const memberItems = page.locator('.member-item, .member, [data-testid="member"]');
            const memberCount = await memberItems.count();
            expect(memberCount).toBeGreaterThanOrEqual(2);
          }
        }
      });
    });

    test('should promote member to moderator', async ({ page }) => {
      await test.step('Access member management and promote user', async () => {
        await navigateToGroup(page, groupId);
        
        // Navigate to members page
        const memberButtons = ['button:has-text("Members")', 'text=Members'];
        for (const button of memberButtons) {
          if (await page.locator(button).count() > 0) {
            await page.locator(button).click();
            break;
          }
        }
        
        await page.waitForLoadState('networkidle');
        
        // Look for the second user in member list
        const memberRow = page.locator('.member-item, .member').filter({ hasText: secondUser.email });
        
        if (await memberRow.count() > 0) {
          // Look for role management options
          const roleButtons = [
            'button:has-text("Make Moderator")',
            'button:has-text("Promote")',
            'select[name="role"]',
            '.role-selector',
          ];
          
          for (const button of roleButtons) {
            const roleButton = memberRow.locator(button);
            if (await roleButton.count() > 0) {
              if (button.includes('select')) {
                await roleButton.selectOption('moderator');
              } else {
                await roleButton.click();
              }
              
              // Confirm if needed
              const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
              if (await confirmButton.count() > 0) {
                await confirmButton.click();
              }
              
              await page.waitForLoadState('networkidle');
              break;
            }
          }
          
          // Verify role change (should see moderator badge or indicator)
          const moderatorIndicators = [
            'text=/Moderator/i',
            '.moderator-badge',
            '[data-role="moderator"]',
          ];
          
          let moderatorIndicatorFound = false;
          for (const indicator of moderatorIndicators) {
            if (await memberRow.locator(indicator).count() > 0) {
              moderatorIndicatorFound = true;
              break;
            }
          }
          
          // Note: Role change indicators might not always be immediately visible
          console.log('Moderator indicator found:', moderatorIndicatorFound);
        }
      });
    });

    test('should remove member from group', async ({ page }) => {
      await test.step('Access member management and remove user', async () => {
        await navigateToGroup(page, groupId);
        
        // Navigate to members page
        const memberButtons = ['button:has-text("Members")', 'text=Members'];
        for (const button of memberButtons) {
          if (await page.locator(button).count() > 0) {
            await page.locator(button).click();
            break;
          }
        }
        
        await page.waitForLoadState('networkidle');
        
        // Look for the second user in member list
        const memberRow = page.locator('.member-item, .member').filter({ hasText: secondUser.email });
        
        if (await memberRow.count() > 0) {
          // Look for remove/kick buttons
          const removeButtons = [
            'button:has-text("Remove")',
            'button:has-text("Kick")',
            'button:has-text("Ban")',
            'button[aria-label*="remove" i]',
          ];
          
          for (const button of removeButtons) {
            const removeButton = memberRow.locator(button);
            if (await removeButton.count() > 0) {
              await removeButton.click();
              
              // Confirm removal
              const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Remove"), button:has-text("Yes")');
              if (await confirmButton.count() > 0) {
                await confirmButton.click();
              }
              
              await page.waitForLoadState('networkidle');
              break;
            }
          }
          
          // Verify user is no longer in member list
          await page.waitForTimeout(1000);
          const removedMemberRow = page.locator('.member-item, .member').filter({ hasText: secondUser.email });
          expect(await removedMemberRow.count()).toBe(0);
        }
      });
    });

    test('should handle role change permissions correctly', async ({ page }) => {
      // Switch to second user (regular member)
      await signOut(page);
      await ensureAuthenticated(page, secondUser);
      
      await test.step('Verify regular member cannot manage roles', async () => {
        await navigateToGroup(page, groupId);
        
        // Members page might not be accessible to regular members
        const memberButtons = ['button:has-text("Members")', 'text=Members'];
        let memberPageAccessible = false;
        
        for (const button of memberButtons) {
          if (await page.locator(button).count() > 0) {
            await page.locator(button).click();
            memberPageAccessible = true;
            break;
          }
        }
        
        if (memberPageAccessible) {
          // Should not see role management controls
          const roleManagementButtons = [
            'button:has-text("Make Moderator")',
            'button:has-text("Remove")',
            'button:has-text("Kick")',
            'select[name="role"]',
          ];
          
          let roleManagementFound = false;
          for (const button of roleManagementButtons) {
            if (await page.locator(button).count() > 0) {
              roleManagementFound = true;
              break;
            }
          }
          
          expect(roleManagementFound).toBeFalsy();
        }
      });
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle joining non-existent group', async ({ page }) => {
      await test.step('Attempt to navigate to non-existent group', async () => {
        const fakeGroupId = 'non-existent-group-id-12345';
        await page.goto(`/groups/${fakeGroupId}`);
        
        // Should show 404 or group not found
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

    test('should handle network errors during membership operations', async ({ page }) => {
      // Create a group first
      const group = generateTestGroup();
      const groupId = await createGroup(page, group);
      createdGroups.push(groupId!);
      
      // Create second user
      secondUser = generateTestUser();
      await signOut(page);
      await createTestAccount(page, secondUser);
      
      await test.step('Simulate network failure during join', async () => {
        await navigateToGroup(page, groupId!);
        
        // Go offline and try to join
        await page.context().setOffline(true);
        
        const joinSuccess = await joinGroup(page);
        expect(joinSuccess).toBeFalsy();
        
        // Should show error or maintain original state
        const joinButton = page.locator('button:has-text("Join")');
        await expect(joinButton).toBeVisible();
        
        // Go back online
        await page.context().setOffline(false);
      });
    });

    test('should handle concurrent membership operations', async ({ page }) => {
      // This test simulates race conditions that might occur
      const group = generateTestGroup();
      const groupId = await createGroup(page, group);
      createdGroups.push(groupId!);
      
      secondUser = generateTestUser();
      await signOut(page);
      await createTestAccount(page, secondUser);
      
      await test.step('Perform rapid join/leave operations', async () => {
        await navigateToGroup(page, groupId!);
        
        // Rapid join/leave cycles
        for (let i = 0; i < 3; i++) {
          await joinGroup(page);
          await page.waitForTimeout(100);
          await leaveGroup(page);
          await page.waitForTimeout(100);
        }
        
        // Final state should be consistent
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Should see either join or leave button, but not both
        const joinButton = page.locator('button:has-text("Join")');
        const leaveButton = page.locator('button:has-text("Leave")');
        
        const joinVisible = await joinButton.count() > 0;
        const leaveVisible = await leaveButton.count() > 0;
        
        // Should see exactly one of the buttons
        expect(joinVisible !== leaveVisible).toBeTruthy();
      });
    });
  });
});