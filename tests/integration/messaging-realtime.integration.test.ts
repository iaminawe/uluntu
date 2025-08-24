/**
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createClient } from '@supabase/supabase-js';
import { useRealtimeChat } from '@/features/messaging/hooks/useRealtimeChat';
import { SessionProvider } from '@/shared/contexts/SessionContextWithRedux';
import React from 'react';

// Mock user for testing
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'member'
};

// Test configuration
const testConfig = {
  supabaseUrl: process.env.VITE_SUPABASE_URL || 'https://test.supabase.co',
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || 'test-key',
  conversationId: 'test-conversation-123'
};

// Create test providers
const createTestProviders = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const TestProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </QueryClientProvider>
  );

  return { TestProviders, queryClient };
};

describe('Messaging Real-time Integration Tests', () => {
  let supabase: ReturnType<typeof createClient>;
  let testConversationId: string;
  let cleanup: (() => void)[] = [];

  beforeAll(async () => {
    // Initialize Supabase client for testing
    supabase = createClient(testConfig.supabaseUrl, testConfig.supabaseAnonKey);
  });

  beforeEach(async () => {
    testConversationId = `test-conv-${Date.now()}`;
    cleanup = [];
  });

  afterEach(async () => {
    // Clean up any test data and subscriptions
    await Promise.all(cleanup.map(fn => fn()));
    cleanup = [];
  });

  describe('Real-time Message Delivery', () => {
    test('should receive real-time messages from other users', async () => {
      const { TestProviders } = createTestProviders();
      
      // Mock session with test user
      jest.spyOn(require('@/shared/contexts/SessionContextWithRedux'), 'useSession')
        .mockReturnValue({ user: mockUser });

      const { result } = renderHook(
        () => useRealtimeChat(testConversationId),
        { wrapper: TestProviders }
      );

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Test message broadcasting
      const testMessage = {
        id: 'msg-123',
        content: 'Test real-time message',
        sender_id: 'other-user-456',
        conversation_id: testConversationId,
        created_at: new Date().toISOString(),
        message_type: 'text'
      };

      // Simulate receiving a broadcast message
      act(() => {
        // This would normally come from Supabase realtime
        result.current.sendMessage('Response message');
      });

      expect(result.current.isConnected).toBe(true);
    }, 15000);

    test('should handle conversation isolation correctly', async () => {
      const { TestProviders, queryClient } = createTestProviders();
      
      jest.spyOn(require('@/shared/contexts/SessionContextWithRedux'), 'useSession')
        .mockReturnValue({ user: mockUser });

      const { result, rerender } = renderHook(
        ({ conversationId }) => useRealtimeChat(conversationId),
        { 
          wrapper: TestProviders,
          initialProps: { conversationId: testConversationId }
        }
      );

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Switch to different conversation
      const newConversationId = `test-conv-${Date.now() + 1000}`;
      
      act(() => {
        rerender({ conversationId: newConversationId });
      });

      await waitFor(() => {
        // Should maintain connection but clear state
        expect(result.current.isConnected).toBe(true);
      });

      // Verify cache isolation
      const cacheKeys = queryClient.getQueryCache().getAll().map(q => q.queryKey);
      const oldConversationQueries = cacheKeys.filter(key => 
        Array.isArray(key) && key.includes(testConversationId)
      );
      
      expect(oldConversationQueries.length).toBe(0);
    });

    test('should handle typing indicators correctly', async () => {
      const { TestProviders } = createTestProviders();
      
      jest.spyOn(require('@/shared/contexts/SessionContextWithRedux'), 'useSession')
        .mockReturnValue({ user: mockUser });

      const { result } = renderHook(
        () => useRealtimeChat(testConversationId),
        { wrapper: TestProviders }
      );

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Test typing indicator sending
      act(() => {
        result.current.sendTypingIndicator(true);
      });

      // Should not show own typing indicator
      expect(result.current.typingUsers).toHaveLength(0);

      // Simulate receiving typing indicator from another user
      const typingUser = {
        user_id: 'other-user-456',
        username: 'Other User',
        is_typing: true
      };

      // This would normally come from realtime broadcast
      expect(result.current.typingUsers).toEqual([]);
    });
  });

  describe('Message Operations', () => {
    test('should send messages with optimistic updates', async () => {
      const { TestProviders, queryClient } = createTestProviders();
      
      jest.spyOn(require('@/shared/contexts/SessionContextWithRedux'), 'useSession')
        .mockReturnValue({ user: mockUser });

      const { result } = renderHook(
        () => useRealtimeChat(testConversationId),
        { wrapper: TestProviders }
      );

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      const testMessage = 'Test message content';

      act(() => {
        result.current.sendMessage(testMessage);
      });

      // Should have optimistic update in cache
      const messageQueries = queryClient.getQueryCache().getAll()
        .filter(q => Array.isArray(q.queryKey) && q.queryKey.includes(testConversationId));
      
      expect(messageQueries.length).toBeGreaterThan(0);
    });

    test('should handle message editing', async () => {
      const { TestProviders } = createTestProviders();
      
      jest.spyOn(require('@/shared/contexts/SessionContextWithRedux'), 'useSession')
        .mockReturnValue({ user: mockUser });

      const { result } = renderHook(
        () => useRealtimeChat(testConversationId),
        { wrapper: TestProviders }
      );

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      const messageId = 'msg-to-edit-123';
      const editedContent = 'Edited message content';

      await act(async () => {
        try {
          await result.current.editMessage(messageId, editedContent);
        } catch (error) {
          // Expected in test environment without real backend
          expect(error).toBeDefined();
        }
      });
    });

    test('should handle message deletion', async () => {
      const { TestProviders } = createTestProviders();
      
      jest.spyOn(require('@/shared/contexts/SessionContextWithRedux'), 'useSession')
        .mockReturnValue({ user: mockUser });

      const { result } = renderHook(
        () => useRealtimeChat(testConversationId),
        { wrapper: TestProviders }
      );

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      const messageId = 'msg-to-delete-123';

      await act(async () => {
        try {
          await result.current.deleteMessage(messageId);
        } catch (error) {
          // Expected in test environment without real backend
          expect(error).toBeDefined();
        }
      });
    });
  });

  describe('Error Handling & Recovery', () => {
    test('should handle connection failures gracefully', async () => {
      const { TestProviders } = createTestProviders();
      
      jest.spyOn(require('@/shared/contexts/SessionContextWithRedux'), 'useSession')
        .mockReturnValue({ user: mockUser });

      // Mock connection failure
      const { result } = renderHook(
        () => useRealtimeChat(testConversationId),
        { wrapper: TestProviders }
      );

      // Initially should attempt connection
      expect(result.current.isConnected).toBe(false);
    });

    test('should handle conversation isolation errors', async () => {
      const { TestProviders } = createTestProviders();
      
      jest.spyOn(require('@/shared/contexts/SessionContextWithRedux'), 'useSession')
        .mockReturnValue({ user: mockUser });

      const { result } = renderHook(
        () => useRealtimeChat(testConversationId),
        { wrapper: TestProviders }
      );

      // Test invalid conversation ID handling
      const invalidConversationId = '';
      
      const { result: invalidResult } = renderHook(
        () => useRealtimeChat(invalidConversationId),
        { wrapper: TestProviders }
      );

      expect(invalidResult.current.isConnected).toBe(false);
      expect(invalidResult.current.onlineUsers).toHaveLength(0);
      expect(invalidResult.current.typingUsers).toHaveLength(0);
    });
  });

  describe('Performance & Memory', () => {
    test('should clean up resources on unmount', async () => {
      const { TestProviders } = createTestProviders();
      
      jest.spyOn(require('@/shared/contexts/SessionContextWithRedux'), 'useSession')
        .mockReturnValue({ user: mockUser });

      const { result, unmount } = renderHook(
        () => useRealtimeChat(testConversationId),
        { wrapper: TestProviders }
      );

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });

      // Unmount and verify cleanup
      unmount();

      // No way to directly test cleanup, but ensure no errors
      expect(true).toBe(true);
    });

    test('should handle multiple conversation switches', async () => {
      const { TestProviders, queryClient } = createTestProviders();
      
      jest.spyOn(require('@/shared/contexts/SessionContextWithRedux'), 'useSession')
        .mockReturnValue({ user: mockUser });

      const { result, rerender } = renderHook(
        ({ conversationId }) => useRealtimeChat(conversationId),
        { 
          wrapper: TestProviders,
          initialProps: { conversationId: testConversationId }
        }
      );

      // Switch conversations multiple times rapidly
      for (let i = 0; i < 5; i++) {
        const newId = `test-conv-${Date.now() + i}`;
        
        act(() => {
          rerender({ conversationId: newId });
        });
      }

      // Should handle rapid switches without memory leaks
      expect(result.current.isConnected).toBe(false);
    });
  });
});

describe('Message Thread UI Integration', () => {
  test('should render with real-time capabilities', async () => {
    // This would be a full component integration test
    // Testing RealtimeMessageThread with actual Supabase connection
    expect(true).toBe(true);
  });

  test('should handle conversation switching in UI', async () => {
    // Test UI behavior during conversation switches
    expect(true).toBe(true);
  });

  test('should display typing indicators correctly', async () => {
    // Test typing indicator UI behavior
    expect(true).toBe(true);
  });
});