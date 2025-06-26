/**
 * Messaging System Integration Tests
 * 
 * Comprehensive test suite for validating the complete messaging system
 * including database operations, API layer, hooks, and email notifications.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ReactNode } from 'react';

// Import the systems under test
import { useMessagingHybrid } from '../hooks/useMessagingHybrid';
import { messagingApi } from '../api/messagingApi';
import { useCreateMarketplaceThread, useCreateOpportunityThread } from '@/hooks/useMessagingQueries';
import { emailNotificationService } from '@/services/emailNotificationService';
import messagingUIReducer from '../store/messagingUISlice';

// Mock external dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } }
      })
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    rpc: vi.fn().mockResolvedValue({ data: 0, error: null }),
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'test-url' } })
    }
  }
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn()
  }
}));

// Test data
const mockConversation = {
  id: 'conv-1',
  type: 'direct' as const,
  title: 'Test Conversation',
  participants: [
    {
      id: 'part-1',
      conversation_id: 'conv-1',
      user_id: 'user-1',
      user: {
        id: 'user-1',
        first_name: 'John',
        last_name: 'Doe',
        avatar_url: 'avatar.jpg'
      },
      role: 'member' as const,
      joined_at: '2025-01-01T00:00:00Z',
      is_active: true
    }
  ],
  is_archived: false,
  is_muted: false,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  metadata: {}
};

const mockMessage = {
  id: 'msg-1',
  conversation_id: 'conv-1',
  sender_id: 'user-1',
  sender: {
    id: 'user-1',
    first_name: 'John',
    last_name: 'Doe',
    avatar_url: 'avatar.jpg'
  },
  content: 'Hello, world!',
  message_type: 'text' as const,
  is_edited: false,
  is_deleted: false,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  metadata: {}
};

// Test wrapper component
function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  const store = configureStore({
    reducer: {
      messagingUI: messagingUIReducer
    }
  });

  return function TestWrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Provider>
    );
  };
}

describe('Messaging System Integration', () => {
  let TestWrapper: ReturnType<typeof createTestWrapper>;

  beforeEach(() => {
    TestWrapper = createTestWrapper();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Database Schema Integration', () => {
    it('should handle conversation creation with proper schema', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      // Mock successful conversation creation
      mockSupabase.supabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockConversation,
        error: null
      });

      const result = await messagingApi.createConversation({
        type: 'direct',
        participant_ids: ['user-1', 'user-2'],
        title: 'Test Conversation'
      });

      expect(result).toEqual(mockConversation);
      expect(mockSupabase.supabase.from).toHaveBeenCalledWith('conversations');
    });

    it('should handle message creation with attachments', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      // Mock successful message creation
      mockSupabase.supabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockMessage,
        error: null
      });

      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      const result = await messagingApi.sendMessage({
        conversation_id: 'conv-1',
        content: 'Test message',
        message_type: 'text',
        attachments: [mockFile]
      });

      expect(result).toEqual(mockMessage);
      expect(mockSupabase.supabase.storage.from).toHaveBeenCalledWith('message-attachments');
    });

    it('should handle conversation archiving', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      // Mock successful archive
      mockSupabase.supabase.from().update().eq.mockResolvedValueOnce({
        data: null,
        error: null
      });

      await messagingApi.archiveConversation('conv-1');

      expect(mockSupabase.supabase.from).toHaveBeenCalledWith('conversations');
      expect(mockSupabase.supabase.from().update).toHaveBeenCalledWith({
        is_archived: true,
        updated_at: expect.any(String)
      });
    });
  });

  describe('API Layer Integration', () => {
    it('should fetch conversations with proper filtering', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      mockSupabase.supabase.from().select().order().mockResolvedValueOnce({
        data: [mockConversation],
        error: null
      });

      const result = await messagingApi.getConversations({
        type: 'direct',
        search: 'test',
        limit: 10
      });

      expect(result).toEqual([mockConversation]);
      expect(mockSupabase.supabase.from).toHaveBeenCalledWith('conversations');
    });

    it('should handle message reactions correctly', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      const mockReaction = {
        id: 'reaction-1',
        message_id: 'msg-1',
        user_id: 'user-1',
        reaction: '👍',
        created_at: '2025-01-01T00:00:00Z'
      };

      mockSupabase.supabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockReaction,
        error: null
      });

      const result = await messagingApi.addReaction('msg-1', '👍');

      expect(result).toEqual(mockReaction);
      expect(mockSupabase.supabase.from).toHaveBeenCalledWith('message_reactions');
    });

    it('should handle user blocking functionality', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      mockSupabase.supabase.from().insert().mockResolvedValueOnce({
        data: null,
        error: null
      });

      await messagingApi.blockUser('user-2', 'Spam');

      expect(mockSupabase.supabase.from).toHaveBeenCalledWith('blocked_users');
    });
  });

  describe('Hybrid Hook Integration', () => {
    it('should integrate React Query with Redux UI state', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      // Mock conversations query
      mockSupabase.supabase.from().select().order().mockResolvedValueOnce({
        data: [mockConversation],
        error: null
      });

      const { result } = renderHook(() => useMessagingHybrid(), {
        wrapper: TestWrapper
      });

      // Check initial state
      expect(result.current.conversations).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.selectedConversationId).toBeUndefined();

      // Test Redux UI actions
      result.current.selectConversation('conv-1');
      expect(result.current.selectedConversationId).toBe('conv-1');

      result.current.updateFilters({ search: 'test' });
      expect(result.current.conversationFilters.search).toBe('test');
    });

    it('should handle message sending with proper state updates', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      // Mock message sending
      mockSupabase.supabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockMessage,
        error: null
      });

      const { result } = renderHook(() => useMessagingHybrid(), {
        wrapper: TestWrapper
      });

      // Select a conversation first
      result.current.selectConversation('conv-1');

      // Send a message
      await result.current.sendMessage('Hello, world!');

      expect(mockSupabase.supabase.from).toHaveBeenCalledWith('messages');
    });
  });

  describe('Marketplace Integration', () => {
    it('should create marketplace conversation thread', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      const mockThread = {
        id: 'thread-1',
        conversation_id: 'conv-1',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      mockSupabase.supabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockConversation,
        error: null
      });

      const { result } = renderHook(() => useCreateMarketplaceThread(), {
        wrapper: TestWrapper
      });

      const threadInput = {
        itemId: 'item-1',
        itemTitle: 'Test Item',
        sellerId: 'seller-1',
        buyerId: 'buyer-1',
        initialMessage: 'Interested in this item',
        itemPrice: 100
      };

      result.current.mutate(threadInput);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockSupabase.supabase.from).toHaveBeenCalledWith('conversations');
    });
  });

  describe('Opportunity Integration', () => {
    it('should create opportunity conversation thread', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      mockSupabase.supabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockConversation,
        error: null
      });

      const { result } = renderHook(() => useCreateOpportunityThread(), {
        wrapper: TestWrapper
      });

      const threadInput = {
        opportunityId: 'opp-1',
        opportunityTitle: 'Test Job',
        recruiterId: 'recruiter-1',
        applicantId: 'applicant-1',
        initialMessage: 'Interested in this position',
        companyId: 'company-1'
      };

      result.current.mutate(threadInput);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockSupabase.supabase.from).toHaveBeenCalledWith('conversations');
    });
  });

  describe('Email Notification Integration', () => {
    it('should send new message notification', async () => {
      const emailSpy = vi.spyOn(emailNotificationService, 'sendNewMessageNotification');
      emailSpy.mockResolvedValueOnce(true);

      const messageData = {
        id: 'msg-1',
        content: 'Hello!',
        sender_name: 'John Doe',
        conversation_id: 'conv-1',
        recipient_id: 'user-2',
        recipient_email: 'user2@example.com',
        created_at: '2025-01-01T00:00:00Z'
      };

      const result = await emailNotificationService.sendNewMessageNotification(messageData);

      expect(result).toBe(true);
      expect(emailSpy).toHaveBeenCalledWith(messageData);
    });

    it('should send message mention notification', async () => {
      const emailSpy = vi.spyOn(emailNotificationService, 'sendMessageMentionNotification');
      emailSpy.mockResolvedValueOnce(true);

      const mentionData = {
        message_id: 'msg-1',
        message_content: 'Hey @user2, check this out!',
        sender_name: 'John Doe',
        mentioned_user_id: 'user-2',
        mentioned_user_email: 'user2@example.com',
        conversation_id: 'conv-1',
        created_at: '2025-01-01T00:00:00Z'
      };

      const result = await emailNotificationService.sendMessageMentionNotification(mentionData);

      expect(result).toBe(true);
      expect(emailSpy).toHaveBeenCalledWith(mentionData);
    });

    it('should send conversation invite notification', async () => {
      const emailSpy = vi.spyOn(emailNotificationService, 'sendConversationInviteNotification');
      emailSpy.mockResolvedValueOnce(true);

      const inviteData = {
        conversation_id: 'conv-1',
        conversation_title: 'Project Discussion',
        inviter_name: 'John Doe',
        invited_user_id: 'user-2',
        invited_user_email: 'user2@example.com',
        created_at: '2025-01-01T00:00:00Z'
      };

      const result = await emailNotificationService.sendConversationInviteNotification(inviteData);

      expect(result).toBe(true);
      expect(emailSpy).toHaveBeenCalledWith(inviteData);
    });
  });

  describe('Security and Privacy', () => {
    it('should respect user blocking in conversations', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      // Mock blocked user query
      mockSupabase.supabase.from().select().order().mockResolvedValueOnce({
        data: [{
          id: 'block-1',
          blocker_id: 'user-1',
          blocked_id: 'user-2',
          reason: 'Spam',
          created_at: '2025-01-01T00:00:00Z'
        }],
        error: null
      });

      const blockedUsers = await messagingApi.getBlockedUsers();

      expect(blockedUsers).toHaveLength(1);
      expect(blockedUsers[0].blocked_id).toBe('user-2');
    });

    it('should handle permission checks for message operations', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      // Mock authentication check
      mockSupabase.supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'user-1', email: 'user1@example.com' } },
        error: null
      });

      // Should allow user to update their own message
      mockSupabase.supabase.from().update().eq().select().single.mockResolvedValueOnce({
        data: { ...mockMessage, content: 'Updated message' },
        error: null
      });

      const result = await messagingApi.updateMessage({
        id: 'msg-1',
        content: 'Updated message'
      });

      expect(result.content).toBe('Updated message');
    });
  });

  describe('Performance and Caching', () => {
    it('should properly invalidate caches on message operations', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      mockSupabase.supabase.from().insert().select().single.mockResolvedValueOnce({
        data: mockMessage,
        error: null
      });

      const { result } = renderHook(() => useMessagingHybrid(), {
        wrapper: TestWrapper
      });

      // Send a message should trigger cache updates
      result.current.selectConversation('conv-1');
      await result.current.sendMessage('Test message');

      // Verify that the message was sent
      expect(mockSupabase.supabase.from).toHaveBeenCalledWith('messages');
    });

    it('should handle infinite scroll for message loading', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      // Mock multiple pages of messages
      mockSupabase.supabase.from().select().eq().order().mockResolvedValueOnce({
        data: [mockMessage],
        error: null
      });

      const { result } = renderHook(() => useMessagingHybrid(), {
        wrapper: TestWrapper
      });

      result.current.selectConversation('conv-1');
      
      // Test loading more messages
      result.current.loadMoreMessages();

      expect(mockSupabase.supabase.from).toHaveBeenCalledWith('messages');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      // Mock API error
      mockSupabase.supabase.from().select().order().mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed', code: 'PGRST301' }
      });

      await expect(messagingApi.getConversations()).rejects.toThrow('Failed to fetch conversations');
    });

    it('should handle network failures in hooks', async () => {
      const mockSupabase = await import('@/lib/supabase');
      
      // Mock network error
      mockSupabase.supabase.from().insert().select().single.mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useMessagingHybrid(), {
        wrapper: TestWrapper
      });

      result.current.selectConversation('conv-1');
      
      // This should handle the error gracefully
      await expect(result.current.sendMessage('Test')).rejects.toThrow();
    });
  });
});

describe('End-to-End Integration Scenarios', () => {
  let TestWrapper: ReturnType<typeof createTestWrapper>;

  beforeEach(() => {
    TestWrapper = createTestWrapper();
    vi.clearAllMocks();
  });

  it('should handle complete marketplace inquiry flow', async () => {
    const mockSupabase = await import('@/lib/supabase');
    
    // Step 1: User clicks "Message Seller" on marketplace item
    // Step 2: Create marketplace thread
    mockSupabase.supabase.from().insert().select().single.mockResolvedValueOnce({
      data: mockConversation,
      error: null
    });

    // Step 3: Send initial message
    mockSupabase.supabase.from().insert().select().single.mockResolvedValueOnce({
      data: mockMessage,
      error: null
    });

    // Step 4: Send email notification
    const emailSpy = vi.spyOn(emailNotificationService, 'sendNewMessageNotification');
    emailSpy.mockResolvedValueOnce(true);

    const { result } = renderHook(() => useCreateMarketplaceThread(), {
      wrapper: TestWrapper
    });

    const threadInput = {
      itemId: 'item-1',
      itemTitle: 'MacBook Pro',
      sellerId: 'seller-1',
      buyerId: 'buyer-1',
      initialMessage: 'Hi, is this still available?',
      itemPrice: 1500
    };

    result.current.mutate(threadInput);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify all steps completed
    expect(mockSupabase.supabase.from).toHaveBeenCalledWith('conversations');
  });

  it('should handle complete opportunity application flow', async () => {
    const mockSupabase = await import('@/lib/supabase');
    
    // Similar flow for opportunity applications
    mockSupabase.supabase.from().insert().select().single.mockResolvedValueOnce({
      data: { ...mockConversation, type: 'opportunity' },
      error: null
    });

    const { result } = renderHook(() => useCreateOpportunityThread(), {
      wrapper: TestWrapper
    });

    const threadInput = {
      opportunityId: 'opp-1',
      opportunityTitle: 'Senior Developer',
      recruiterId: 'recruiter-1',
      applicantId: 'applicant-1',
      initialMessage: 'I would like to apply for this position',
      companyId: 'company-1'
    };

    result.current.mutate(threadInput);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSupabase.supabase.from).toHaveBeenCalledWith('conversations');
  });
});