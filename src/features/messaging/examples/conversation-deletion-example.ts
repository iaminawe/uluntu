/**
 * Example usage of conversation deletion functionality
 * This file demonstrates how to use the new deletion methods
 */

import { messagingApi } from '../api/messagingApi';
import { DeleteConversationInput } from '../types';

// Example: Soft delete (archive) a conversation
export async function archiveConversationExample(conversationId: string) {
  try {
    console.log('Archiving conversation:', conversationId);
    await messagingApi.archiveConversation(conversationId);
    console.log('Conversation archived successfully');
  } catch (error) {
    console.error('Failed to archive conversation:', error.message);
    throw error;
  }
}

// Example: Unarchive a conversation
export async function unarchiveConversationExample(conversationId: string) {
  try {
    console.log('Unarchiving conversation:', conversationId);
    await messagingApi.unarchiveConversation(conversationId);
    console.log('Conversation unarchived successfully');
  } catch (error) {
    console.error('Failed to unarchive conversation:', error.message);
    throw error;
  }
}

// Example: Hard delete a conversation
export async function deleteConversationExample(conversationId: string, reason?: string) {
  try {
    const deleteInput: DeleteConversationInput = {
      id: conversationId,
      deleteType: 'hard',
      reason: reason || 'User requested deletion'
    };
    
    console.log('Deleting conversation:', conversationId);
    await messagingApi.deleteConversation(deleteInput);
    console.log('Conversation deleted successfully');
  } catch (error) {
    console.error('Failed to delete conversation:', error.message);
    throw error;
  }
}

// Example: Leave a conversation
export async function leaveConversationExample(conversationId: string) {
  try {
    console.log('Leaving conversation:', conversationId);
    await messagingApi.leaveConversation(conversationId);
    console.log('Left conversation successfully');
  } catch (error) {
    console.error('Failed to leave conversation:', error.message);
    throw error;
  }
}

// Example: Block a user
export async function blockUserExample(userId: string, reason?: string) {
  try {
    console.log('Blocking user:', userId);
    await messagingApi.blockUser(userId, reason);
    console.log('User blocked successfully');
  } catch (error) {
    console.error('Failed to block user:', error.message);
    throw error;
  }
}

// Example: Unblock a user
export async function unblockUserExample(userId: string) {
  try {
    console.log('Unblocking user:', userId);
    await messagingApi.unblockUser(userId);
    console.log('User unblocked successfully');
  } catch (error) {
    console.error('Failed to unblock user:', error.message);
    throw error;
  }
}

// Example: Get blocked users list
export async function getBlockedUsersExample() {
  try {
    console.log('Getting blocked users list');
    const blockedUsers = await messagingApi.getBlockedUsers();
    console.log('Blocked users:', blockedUsers);
    return blockedUsers;
  } catch (error) {
    console.error('Failed to get blocked users:', error.message);
    throw error;
  }
}

// Example: Complete conversation management workflow
export async function conversationManagementWorkflow(conversationId: string) {
  try {
    // 1. First, archive the conversation
    await archiveConversationExample(conversationId);
    
    // 2. Wait a bit (simulating user decision time)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 3. Unarchive it
    await unarchiveConversationExample(conversationId);
    
    // 4. Finally, hard delete with reason
    await deleteConversationExample(conversationId, 'Cleanup test workflow');
    
    console.log('Conversation management workflow completed successfully');
  } catch (error) {
    console.error('Conversation management workflow failed:', error.message);
    throw error;
  }
}

// Error handling patterns
export function handleConversationDeletionError(error: any) {
  if (error.message?.includes('not a participant')) {
    return 'You are not a participant in this conversation';
  }
  
  if (error.message?.includes('Insufficient permissions')) {
    return 'You do not have permission to delete this conversation';
  }
  
  if (error.message?.includes('not found')) {
    return 'Conversation not found';
  }
  
  if (error.message?.includes('database restrictions')) {
    return 'Unable to delete conversation due to security restrictions. Please contact support.';
  }
  
  return 'An unexpected error occurred while deleting the conversation';
}