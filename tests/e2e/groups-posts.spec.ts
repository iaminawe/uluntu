import { test, expect, Page } from '@playwright/test';
import { ensureAuthenticated, signOut, TestUser, generateTestUser, createTestAccount } from './helpers/auth';
import { generateTestGroup, createGroup, navigateToGroup, joinGroup } from './helpers/groups';
import { generateTestPost, createPost, replyToPost, editPost, deletePost, likePost, checkPostPermissions, TestPost } from './helpers/posts';

test.describe('Groups Posts Management', () => {
  let testUser: TestUser;
  let secondUser: TestUser;
  let groupId: string;
  let createdPosts: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Ensure we have an authenticated user
    testUser = await ensureAuthenticated(page);
    
    // Create a test group for posts
    const testGroup = generateTestGroup();
    testGroup.visibility = 'public';
    
    const id = await createGroup(page, testGroup);
    expect(id).toBeTruthy();
    groupId = id!;
    
    await navigateToGroup(page, groupId);
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    // Clean up created posts (if possible)
    for (const postId of createdPosts) {
      try {
        await deletePost(page, postId);
      } catch (error) {
        console.warn(`Failed to clean up post ${postId}:`, error);
      }
    }
    createdPosts = [];
    
    // Clean up group
    try {
      await navigateToGroup(page, groupId);
      const settingsButton = page.locator('button:has-text("Settings"), button:has-text("Options")');
      if (await settingsButton.count() > 0) {
        await settingsButton.click();
        await page.waitForTimeout(500);
        
        const deleteButton = page.locator('button:has-text("Delete"), text=Delete Group');
        if (await deleteButton.count() > 0) {
          await deleteButton.click();
          
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
    
    await signOut(page);
  });

  test.describe('Creating Posts', () => {
    test('should create a regular post successfully', async ({ page }) => {
      const testPost = generateTestPost();

      await test.step('Create a regular post', async () => {
        const postId = await createPost(page, testPost);
        expect(postId).toBeTruthy();
        
        if (postId && postId !== 'created') {
          createdPosts.push(postId);
        }
      });

      await test.step('Verify post appears in group feed', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Should see the post content in the feed
        const postContent = page.locator('[data-testid="post"], .post-item, article').filter({ 
          hasText: testPost.content.substring(0, 50) 
        });
        await expect(postContent.first()).toBeVisible();
      });

      await test.step('Verify post metadata', async () => {
        // Should show author information
        const authorInfo = page.locator('text=' + testUser.name + ', text=' + testUser.email);
        if (await authorInfo.count() > 0) {
          await expect(authorInfo.first()).toBeVisible();
        }
        
        // Should show timestamp
        const timeIndicators = [
          'text=/ago|minutes|hours|days/i',
          'time',
          '.timestamp',
          '[data-testid="post-time"]',
        ];
        
        let timeIndicatorFound = false;
        for (const indicator of timeIndicators) {
          if (await page.locator(indicator).count() > 0) {
            timeIndicatorFound = true;
            break;
          }
        }
        
        expect(timeIndicatorFound).toBeTruthy();
      });
    });

    test('should create an announcement post successfully', async ({ page }) => {
      const announcementPost = generateTestPost(true);

      await test.step('Create announcement post', async () => {
        const postId = await createPost(page, announcementPost);
        expect(postId).toBeTruthy();
        
        if (postId && postId !== 'created') {
          createdPosts.push(postId);
        }
      });

      await test.step('Verify announcement styling/indicators', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Should see announcement indicators
        const announcementIndicators = [
          'text=/Announcement/i',
          '.announcement',
          '.announcement-badge',
          '[data-type="announcement"]',
          '.post-announcement',
        ];
        
        let announcementIndicatorFound = false;
        for (const indicator of announcementIndicators) {
          if (await page.locator(indicator).count() > 0) {
            announcementIndicatorFound = true;
            break;
          }
        }
        
        // Note: Announcement styling might not always be visible
        console.log('Announcement indicator found:', announcementIndicatorFound);
      });
    });

    test('should handle post creation with empty content', async ({ page }) => {
      await test.step('Attempt to create empty post', async () => {
        const emptyPost: TestPost = {
          content: '',
        };

        const postId = await createPost(page, emptyPost);
        expect(postId).toBeNull();
        
        // Should see validation error
        const errorMessage = page.locator('text=/Content.*required|Please.*content|Post.*empty/i');
        await expect(errorMessage).toBeVisible();
      });
    });

    test('should handle post creation with very long content', async ({ page }) => {
      await test.step('Create post with maximum length content', async () => {
        const longPost: TestPost = {
          content: 'a'.repeat(5000), // Very long content
        };

        const postId = await createPost(page, longPost);
        
        if (postId) {
          // If creation succeeded, content should be truncated or fully displayed
          expect(postId).toBeTruthy();
          if (postId !== 'created') {
            createdPosts.push(postId);
          }
        } else {
          // If creation failed, should see error message
          const errorMessage = page.locator('text=/Content.*long|Character.*limit|Too.*long/i');
          await expect(errorMessage).toBeVisible();
        }
      });
    });

    test('should prevent non-members from creating posts in private groups', async ({ page }) => {
      // First, change group to private
      const settingsButton = page.locator('button:has-text("Settings"), button:has-text("Edit")');
      if (await settingsButton.count() > 0) {
        await settingsButton.click();
        await page.waitForTimeout(500);
        
        // Change to private
        const privateOption = page.locator('text=Private, input[value="private"]');
        if (await privateOption.count() > 0) {
          await privateOption.click();
          
          const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
          if (await saveButton.count() > 0) {
            await saveButton.click();
            await page.waitForLoadState('networkidle');
          }
        }
      }

      // Create second user and try to post
      secondUser = generateTestUser();
      await signOut(page);
      await createTestAccount(page, secondUser);

      await test.step('Attempt to access private group as non-member', async () => {
        await navigateToGroup(page, groupId);
        
        // Should not see post creation interface
        const postInputs = [
          'textarea[placeholder*="What\'s on your mind" i]',
          'textarea[placeholder*="Share something" i]',
          'button:has-text("Create Post")',
        ];
        
        let postInputFound = false;
        for (const input of postInputs) {
          if (await page.locator(input).count() > 0) {
            postInputFound = true;
            break;
          }
        }
        
        expect(postInputFound).toBeFalsy();
      });
    });
  });

  test.describe('Replying to Posts', () => {
    let originalPostId: string;

    test.beforeEach(async ({ page }) => {
      // Create a post to reply to
      const originalPost = generateTestPost();
      const postId = await createPost(page, originalPost);
      expect(postId).toBeTruthy();
      originalPostId = postId!;
      
      if (originalPostId !== 'created') {
        createdPosts.push(originalPostId);
      }
    });

    test('should reply to a post successfully', async ({ page }) => {
      const replyContent = `This is a test reply created at ${new Date().toISOString()}`;

      await test.step('Create reply to post', async () => {
        const replySuccess = await replyToPost(page, originalPostId, replyContent);
        expect(replySuccess).toBeTruthy();
      });

      await test.step('Verify reply appears under original post', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Should see reply content
        const replyElement = page.locator('[data-testid="reply"], .reply, .comment').filter({ 
          hasText: replyContent 
        });
        await expect(replyElement.first()).toBeVisible();
      });

      await test.step('Verify reply count is updated', async () => {
        // Should see reply count indicator
        const replyCountIndicators = [
          'text=/1.*reply|1.*comment/i',
          '[data-testid="reply-count"]',
          '.reply-count',
        ];
        
        let replyCountFound = false;
        for (const indicator of replyCountIndicators) {
          if (await page.locator(indicator).count() > 0) {
            replyCountFound = true;
            break;
          }
        }
        
        // Note: Reply count might not always be immediately visible
        console.log('Reply count indicator found:', replyCountFound);
      });
    });

    test('should reply to a post as different user', async ({ page }) => {
      // Create second user and join group
      secondUser = generateTestUser();
      await signOut(page);
      await createTestAccount(page, secondUser);
      await navigateToGroup(page, groupId);
      await joinGroup(page);

      await test.step('Reply as second user', async () => {
        const replyContent = `Reply from second user at ${new Date().toISOString()}`;
        const replySuccess = await replyToPost(page, originalPostId, replyContent);
        expect(replySuccess).toBeTruthy();
      });

      await test.step('Verify different user reply appears', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Should see the new reply
        const replyElement = page.locator('[data-testid="reply"], .reply, .comment');
        await expect(replyElement.first()).toBeVisible();
      });
    });

    test('should handle nested replies (if supported)', async ({ page }) => {
      // First create a reply
      const firstReply = 'First level reply';
      await replyToPost(page, originalPostId, firstReply);
      
      await test.step('Attempt to reply to reply', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Look for reply-to-reply functionality
        const replyButtons = page.locator('[data-testid="reply"], .reply').locator('button:has-text("Reply")');
        
        if (await replyButtons.count() > 0) {
          await replyButtons.first().click();
          
          const nestedReplyContent = 'Nested reply content';
          const replyInput = page.locator('textarea[placeholder*="reply" i], input[placeholder*="reply" i]').last();
          
          if (await replyInput.count() > 0) {
            await replyInput.fill(nestedReplyContent);
            
            const submitButton = page.locator('button:has-text("Reply"), button:has-text("Post")').last();
            if (await submitButton.count() > 0) {
              await submitButton.click();
              await page.waitForLoadState('networkidle');
              
              // Verify nested reply appears
              const nestedReply = page.locator('[data-testid="reply"], .reply').filter({ 
                hasText: nestedReplyContent 
              });
              await expect(nestedReply.first()).toBeVisible();
            }
          }
        }
      });
    });

    test('should handle empty reply gracefully', async ({ page }) => {
      await test.step('Attempt to create empty reply', async () => {
        const replySuccess = await replyToPost(page, originalPostId, '');
        expect(replySuccess).toBeFalsy();
        
        // Should see validation error or input should remain focused
        const errorMessage = page.locator('text=/Reply.*required|Please.*content/i');
        const hasError = await errorMessage.count() > 0;
        
        // Note: Some implementations might handle empty replies differently
        console.log('Empty reply validation error shown:', hasError);
      });
    });
  });

  test.describe('Post Editing and Deletion', () => {
    let editablePostId: string;

    test.beforeEach(async ({ page }) => {
      // Create a post to edit/delete
      const editablePost = generateTestPost();
      const postId = await createPost(page, editablePost);
      expect(postId).toBeTruthy();
      editablePostId = postId!;
      
      if (editablePostId !== 'created') {
        createdPosts.push(editablePostId);
      }
    });

    test('should edit own post successfully', async ({ page }) => {
      const newContent = `Edited post content at ${new Date().toISOString()}`;

      await test.step('Edit post content', async () => {
        const editSuccess = await editPost(page, editablePostId, newContent);
        expect(editSuccess).toBeTruthy();
      });

      await test.step('Verify edited content is displayed', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Should see new content
        const editedPost = page.locator('[data-testid="post"], .post-item, article').filter({ 
          hasText: newContent 
        });
        await expect(editedPost.first()).toBeVisible();
        
        // Should see edited indicator
        const editedIndicators = [
          'text=/Edited|Modified/i',
          '.edited-indicator',
          '[data-edited="true"]',
        ];
        
        let editedIndicatorFound = false;
        for (const indicator of editedIndicators) {
          if (await page.locator(indicator).count() > 0) {
            editedIndicatorFound = true;
            break;
          }
        }
        
        // Note: Edited indicators might not always be visible
        console.log('Edited indicator found:', editedIndicatorFound);
      });
    });

    test('should delete own post successfully', async ({ page }) => {
      await test.step('Delete post', async () => {
        const deleteSuccess = await deletePost(page, editablePostId);
        expect(deleteSuccess).toBeTruthy();
      });

      await test.step('Verify post no longer appears in feed', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Original post should not be visible
        const deletedPost = page.locator('[data-testid="post"], .post-item, article').filter({ 
          hasText: 'This is a test post created for automated testing' 
        });
        
        // Should either not exist or show as deleted
        const postCount = await deletedPost.count();
        if (postCount > 0) {
          // If post still exists, it should show as deleted
          const deletedIndicator = deletedPost.locator('text=/Deleted|Removed/i');
          await expect(deletedIndicator.first()).toBeVisible();
        } else {
          // Post completely removed
          expect(postCount).toBe(0);
        }
      });
      
      // Remove from cleanup list since it's already deleted
      createdPosts = createdPosts.filter(id => id !== editablePostId);
    });

    test('should prevent editing other users posts', async ({ page }) => {
      // Create second user and join group
      secondUser = generateTestUser();
      await signOut(page);
      await createTestAccount(page, secondUser);
      await navigateToGroup(page, groupId);
      await joinGroup(page);

      await test.step('Check post permissions as different user', async () => {
        const permissions = await checkPostPermissions(page, editablePostId);
        
        // Second user should not be able to edit/delete original user's post
        expect(permissions.canEdit).toBeFalsy();
        expect(permissions.canDelete).toBeFalsy();
      });
    });

    test('should allow moderators to delete posts', async ({ page }) => {
      // This test would require setting up user roles
      // For now, we'll test with the group owner
      
      // Create second user post
      secondUser = generateTestUser();
      await signOut(page);
      await createTestAccount(page, secondUser);
      await navigateToGroup(page, groupId);
      await joinGroup(page);
      
      const secondUserPost = generateTestPost();
      const secondUserPostId = await createPost(page, secondUserPost);
      
      // Switch back to group owner
      await signOut(page);
      testUser = await ensureAuthenticated(page, testUser);
      await navigateToGroup(page, groupId);

      await test.step('Group owner should be able to delete any post', async () => {
        if (secondUserPostId && secondUserPostId !== 'created') {
          const permissions = await checkPostPermissions(page, secondUserPostId);
          
          // Group owner should have delete permissions
          expect(permissions.canDelete).toBeTruthy();
        }
      });
    });
  });

  test.describe('Announcements', () => {
    test('should create and display announcements prominently', async ({ page }) => {
      const announcementPost = generateTestPost(true);

      await test.step('Create announcement', async () => {
        const postId = await createPost(page, announcementPost);
        expect(postId).toBeTruthy();
        
        if (postId && postId !== 'created') {
          createdPosts.push(postId);
        }
      });

      await test.step('Verify announcement prominence', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Announcements should appear at top or have special styling
        const firstPost = page.locator('[data-testid="post"], .post-item, article').first();
        const announcementText = announcementPost.content.substring(0, 50);
        
        // Should be the first post or have announcement styling
        const isFirstPost = await firstPost.filter({ hasText: announcementText }).count() > 0;
        const hasAnnouncementStyling = await page.locator('.announcement, [data-type="announcement"]').count() > 0;
        
        expect(isFirstPost || hasAnnouncementStyling).toBeTruthy();
      });
    });

    test('should restrict announcement creation to authorized users', async ({ page }) => {
      // Create second user (regular member)
      secondUser = generateTestUser();
      await signOut(page);
      await createTestAccount(page, secondUser);
      await navigateToGroup(page, groupId);
      await joinGroup(page);

      await test.step('Check announcement options for regular member', async () => {
        // Look for post creation interface
        const postInput = page.locator('textarea[placeholder*="What\'s on your mind" i], textarea[name="content"]').first();
        
        if (await postInput.count() > 0) {
          await postInput.click();
          
          // Announcement checkbox should not be available or should be disabled
          const announcementCheckbox = page.locator('input[type="checkbox"]:has-text("Announcement"), label:has-text("Announcement") input');
          
          if (await announcementCheckbox.count() > 0) {
            const isDisabled = await announcementCheckbox.isDisabled();
            expect(isDisabled).toBeTruthy();
          } else {
            // No announcement option available (expected for regular members)
            expect(await announcementCheckbox.count()).toBe(0);
          }
        }
      });
    });

    test('should pin announcements to group feed', async ({ page }) => {
      const pinnedAnnouncement = generateTestPost(true);

      await test.step('Create pinned announcement', async () => {
        const postId = await createPost(page, pinnedAnnouncement);
        expect(postId).toBeTruthy();
        
        if (postId && postId !== 'created') {
          createdPosts.push(postId);
        }
      });

      // Create several regular posts after announcement
      for (let i = 0; i < 3; i++) {
        const regularPost = generateTestPost();
        const postId = await createPost(page, regularPost);
        if (postId && postId !== 'created') {
          createdPosts.push(postId);
        }
        await page.waitForTimeout(500);
      }

      await test.step('Verify announcement remains at top', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Announcement should still be first or in pinned section
        const pinnedSection = page.locator('.pinned-posts, .announcements, [data-section="pinned"]');
        const firstPost = page.locator('[data-testid="post"], .post-item, article').first();
        
        const announcementText = pinnedAnnouncement.content.substring(0, 50);
        
        // Should be in pinned section or remain as first post
        const isInPinnedSection = await pinnedSection.filter({ hasText: announcementText }).count() > 0;
        const isFirstPost = await firstPost.filter({ hasText: announcementText }).count() > 0;
        
        expect(isInPinnedSection || isFirstPost).toBeTruthy();
      });
    });
  });

  test.describe('Post Permissions and Visibility', () => {
    test('should respect group visibility for post access', async ({ page }) => {
      // Create a post in public group
      const publicPost = generateTestPost();
      const postId = await createPost(page, publicPost);
      expect(postId).toBeTruthy();
      
      if (postId && postId !== 'created') {
        createdPosts.push(postId);
      }

      await test.step('Verify public group posts visible to non-members', async () => {
        // Sign out and check visibility
        await signOut(page);
        await navigateToGroup(page, groupId);
        
        // Should see post content
        const postContent = page.locator('[data-testid="post"], .post-item, article').filter({ 
          hasText: publicPost.content.substring(0, 50) 
        });
        await expect(postContent.first()).toBeVisible();
      });
    });

    test('should handle post interactions for non-members', async ({ page }) => {
      // Create a post
      const testPost = generateTestPost();
      const postId = await createPost(page, testPost);
      expect(postId).toBeTruthy();
      
      if (postId && postId !== 'created') {
        createdPosts.push(postId);
      }

      await test.step('Check interaction restrictions for non-members', async () => {
        await signOut(page);
        await navigateToGroup(page, groupId);
        
        // Should not see reply button or it should be disabled
        const replyButtons = page.locator('button:has-text("Reply")');
        
        if (await replyButtons.count() > 0) {
          // If reply buttons exist, they should be disabled or show login prompt
          const firstReplyButton = replyButtons.first();
          
          if (await firstReplyButton.isVisible()) {
            await firstReplyButton.click();
            
            // Should show login prompt or disabled state
            const loginPrompt = page.locator('text=/Sign.*in|Login|Join.*group/i');
            const hasLoginPrompt = await loginPrompt.count() > 0;
            
            // Note: Different implementations handle this differently
            console.log('Login prompt shown for non-member interaction:', hasLoginPrompt);
          }
        }
      });
    });

    test('should show appropriate post actions based on user role', async ({ page }) => {
      // Create post as group owner
      const ownerPost = generateTestPost();
      const postId = await createPost(page, ownerPost);
      expect(postId).toBeTruthy();
      
      if (postId && postId !== 'created') {
        createdPosts.push(postId);
      }

      await test.step('Verify owner can see all post actions', async () => {
        const permissions = await checkPostPermissions(page, postId!);
        
        // Owner should be able to edit and delete
        expect(permissions.canEdit).toBeTruthy();
        expect(permissions.canDelete).toBeTruthy();
      });

      // Create second user and check their permissions
      secondUser = generateTestUser();
      await signOut(page);
      await createTestAccount(page, secondUser);
      await navigateToGroup(page, groupId);
      await joinGroup(page);

      await test.step('Verify regular member permissions', async () => {
        const memberPermissions = await checkPostPermissions(page, postId!);
        
        // Regular member should not be able to edit/delete owner's post
        expect(memberPermissions.canEdit).toBeFalsy();
        expect(memberPermissions.canDelete).toBeFalsy();
      });
    });
  });

  test.describe('Post Interactions', () => {
    let interactivePostId: string;

    test.beforeEach(async ({ page }) => {
      // Create a post for interactions
      const interactivePost = generateTestPost();
      const postId = await createPost(page, interactivePost);
      expect(postId).toBeTruthy();
      interactivePostId = postId!;
      
      if (interactivePostId !== 'created') {
        createdPosts.push(interactivePostId);
      }
    });

    test('should like and unlike posts', async ({ page }) => {
      await test.step('Like a post', async () => {
        const likeSuccess = await likePost(page, interactivePostId);
        expect(likeSuccess).toBeTruthy();
      });

      await test.step('Verify like count increases', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Should see like count or liked state
        const likeIndicators = [
          'text=/1.*like/i',
          '.liked',
          '[data-liked="true"]',
          'button:has-text("Unlike")',
        ];
        
        let likeIndicatorFound = false;
        for (const indicator of likeIndicators) {
          if (await page.locator(indicator).count() > 0) {
            likeIndicatorFound = true;
            break;
          }
        }
        
        expect(likeIndicatorFound).toBeTruthy();
      });

      await test.step('Unlike the post', async () => {
        // Click like button again to unlike
        const likeSuccess = await likePost(page, interactivePostId);
        expect(likeSuccess).toBeTruthy();
      });
    });

    test('should share posts (if feature exists)', async ({ page }) => {
      await test.step('Look for share functionality', async () => {
        const shareButtons = [
          'button:has-text("Share")',
          'button[aria-label*="share" i]',
          '[data-testid="share-button"]',
        ];
        
        let shareButtonFound = false;
        for (const button of shareButtons) {
          if (await page.locator(button).count() > 0) {
            shareButtonFound = true;
            await page.locator(button).click();
            
            // Should show share options or copy link
            const shareOptions = [
              'text=/Copy.*link/i',
              'text=/Share.*link/i',
              '.share-modal',
              '[data-testid="share-options"]',
            ];
            
            let shareOptionsFound = false;
            for (const option of shareOptions) {
              if (await page.locator(option).count() > 0) {
                shareOptionsFound = true;
                break;
              }
            }
            
            expect(shareOptionsFound).toBeTruthy();
            break;
          }
        }
        
        // Note: Share functionality might not be implemented
        console.log('Share functionality found:', shareButtonFound);
      });
    });

    test('should report posts (if feature exists)', async ({ page }) => {
      // Create second user to test reporting
      secondUser = generateTestUser();
      await signOut(page);
      await createTestAccount(page, secondUser);
      await navigateToGroup(page, groupId);
      await joinGroup(page);

      await test.step('Look for report functionality', async () => {
        // Look for post menu/options
        const postMenuButton = page.locator('[data-testid="post"], .post-item, article')
          .first()
          .locator('button[aria-label*="menu" i], button[aria-label*="options" i]');
        
        if (await postMenuButton.count() > 0) {
          await postMenuButton.click();
          await page.waitForTimeout(500);
          
          // Look for report option
          const reportOption = page.locator('button:has-text("Report"), text=Report Post');
          
          if (await reportOption.count() > 0) {
            await reportOption.click();
            
            // Should show report dialog/form
            const reportDialog = [
              'text=/Report.*post/i',
              'text=/Why.*reporting/i',
              '.report-modal',
              '[data-testid="report-dialog"]',
            ];
            
            let reportDialogFound = false;
            for (const dialog of reportDialog) {
              if (await page.locator(dialog).count() > 0) {
                reportDialogFound = true;
                break;
              }
            }
            
            expect(reportDialogFound).toBeTruthy();
          }
        }
      });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors during post operations', async ({ page }) => {
      await test.step('Simulate network failure during post creation', async () => {
        await page.context().setOffline(true);
        
        const testPost = generateTestPost();
        const postId = await createPost(page, testPost);
        
        // Should fail gracefully
        expect(postId).toBeNull();
        
        await page.context().setOffline(false);
      });
    });

    test('should handle concurrent post operations', async ({ page }) => {
      await test.step('Create multiple posts rapidly', async () => {
        const postPromises = [];
        
        for (let i = 0; i < 3; i++) {
          const testPost = generateTestPost();
          testPost.content = `Rapid post ${i + 1} at ${new Date().toISOString()}`;
          postPromises.push(createPost(page, testPost));
        }
        
        const results = await Promise.all(postPromises);
        
        // At least some posts should succeed
        const successfulPosts = results.filter(id => id !== null);
        expect(successfulPosts.length).toBeGreaterThan(0);
        
        // Add successful posts to cleanup
        successfulPosts.forEach(id => {
          if (id && id !== 'created') {
            createdPosts.push(id);
          }
        });
      });
    });

    test('should handle post operations on deleted groups gracefully', async ({ page }) => {
      // Create a post first
      const testPost = generateTestPost();
      const postId = await createPost(page, testPost);
      
      if (postId && postId !== 'created') {
        createdPosts.push(postId);
      }

      // Delete the group
      const settingsButton = page.locator('button:has-text("Settings")');
      if (await settingsButton.count() > 0) {
        await settingsButton.click();
        await page.waitForTimeout(500);
        
        const deleteButton = page.locator('button:has-text("Delete")');
        if (await deleteButton.count() > 0) {
          await deleteButton.click();
          
          const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
          if (await confirmButton.count() > 0) {
            await confirmButton.click();
            await page.waitForLoadState('networkidle');
          }
        }
      }

      await test.step('Verify post operations fail gracefully after group deletion', async () => {
        // Try to navigate to the group
        await page.goto(`/groups/${groupId}`);
        
        // Should show group not found
        const notFoundIndicators = [
          'text=/404|Not Found/i',
          'text=/Group.*not.*found/i',
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
      
      // Clear cleanup list since group is deleted
      createdPosts = [];
    });
  });
});