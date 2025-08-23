import { useEffect, useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';
import { Message } from '../types';
import { messagingQueryKeys } from '@/hooks/useMessagingQueries';
import { messagingApi } from '../api/messagingApi';

interface PresenceState {
  user_id: string;
  online_at: string;
  typing?: boolean;
  username?: string;
  avatar_url?: string;
}

interface MessagePayload {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  created_at: string;
  message_type: string;
}

interface EditMessagePayload {
  id: string;
  content: string;
  updated_at: string;
}

interface TypingPayload {
  user_id: string;
  username?: string;
  avatar_url?: string;
  is_typing: boolean;
}

// Helper function to update infinite query data safely with conversation isolation
const updateInfiniteQueryData = (
  queryClient: any,
  conversationId: string,
  updateFn: (pages: Message[][]) => Message[][]
) => {
  // Use conversation-specific query key with infinite suffix
  const queryKey = [...messagingQueryKeys.messages(conversationId), 50, 'infinite'];
  
  queryClient.setQueryData(
    queryKey,
    (oldData: { pages: Message[][]; pageParams: unknown[] } | undefined) => {
      if (!oldData || !oldData.pages || oldData.pages.length === 0) {
        return {
          pages: [[]],
          pageParams: [0]
        };
      }
      
      const updatedPages = updateFn([...oldData.pages]);
      
      return {
        ...oldData,
        pages: updatedPages
      };
    }
  );
};

export function useRealtimeChat(conversationId: string | undefined) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingPayload>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousConversationId = useRef<string | undefined>(undefined);

  // Initialize channel for conversation with proper cleanup
  useEffect(() => {
    if (!user || !conversationId || typeof conversationId !== 'string') {
      // Clean up state when no conversation
      setOnlineUsers([]);
      setTypingUsers(new Map());
      setIsConnected(false);
      return;
    }

    // If conversation changed, clear previous state immediately
    if (previousConversationId.current && previousConversationId.current !== conversationId) {
      setOnlineUsers([]);
      setTypingUsers(new Map());
      setIsConnected(false);
      
      // Clear cache for previous conversation to prevent bleed-through
      queryClient.removeQueries({ 
        queryKey: [...messagingQueryKeys.messages(previousConversationId.current), 50, 'infinite'],
        exact: true
      });
    }
    
    previousConversationId.current = conversationId;

    // Create a unique channel for this conversation
    const channel = supabase.channel(`conversation:${conversationId}`, {
      config: {
        broadcast: {
          self: true, // Receive own broadcasts for optimistic updates
          ack: true   // Get acknowledgement when server receives message
        },
        presence: {
          key: user.id // Use user ID as presence key
        }
      }
    });

    channelRef.current = channel;

    // Track new messages from database with conversation isolation
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Only invalidate this conversation's queries
          queryClient.invalidateQueries({ 
            queryKey: [...messagingQueryKeys.messages(conversationId), 50, 'infinite'],
            exact: true
          });
          queryClient.invalidateQueries({ 
            queryKey: messagingQueryKeys.conversations,
            exact: true
          });
        }
      );

    // Listen for real-time message broadcasts with conversation validation
    channel.on('broadcast', { event: 'new_message' }, 
      ({ payload }: { payload: MessagePayload }) => {
        // Skip if it's our own message (we handle optimistic updates separately)
        if (payload.sender_id === user.id) return;
        
        // Critical: Only process messages for the current conversation
        if (payload.conversation_id !== conversationId) {
          console.warn('Received message for wrong conversation', { 
            received: payload.conversation_id, 
            expected: conversationId 
          });
          return;
        }

        // Add message to cache immediately for infinite query
        updateInfiniteQueryData(
          queryClient,
          conversationId,
          (pages) => {
            const firstPage = pages[0] || [];
            
            // Check if message already exists (deduplication)
            if (firstPage.some(m => m.id === payload.id)) {
              return pages;
            }
            
            // Add new message to the beginning of first page (newest first)
            const newPages = [...pages];
            newPages[0] = [payload as any, ...firstPage];
            return newPages;
          }
        );

        // Play notification sound
        playNotificationSound();
      }
    );

    // Listen for message edits with conversation validation
    channel.on('broadcast', { event: 'edit_message' },
      ({ payload }: { payload: EditMessagePayload }) => {
        updateInfiniteQueryData(
          queryClient,
          conversationId,
          (pages) => {
            return pages.map(page => 
              page.map(msg => 
                msg.id === payload.id && msg.conversation_id === conversationId
                  ? { ...msg, content: payload.content, updated_at: payload.updated_at }
                  : msg
              )
            );
          }
        );
      }
    );

    // Listen for message deletions with conversation validation
    channel.on('broadcast', { event: 'delete_message' },
      ({ payload }: { payload: { id: string } }) => {
        updateInfiniteQueryData(
          queryClient,
          conversationId,
          (pages) => {
            return pages.map(page => 
              page.filter(msg => !(msg.id === payload.id && msg.conversation_id === conversationId))
            );
          }
        );
      }
    );

    // Listen for typing indicators
    channel.on('broadcast', { event: 'typing' },
      ({ payload }: { payload: TypingPayload }) => {
        if (payload.user_id === user.id) return; // Ignore our own typing
        
        setTypingUsers(prev => {
          const updated = new Map(prev);
          if (payload.is_typing) {
            updated.set(payload.user_id, payload);
          } else {
            updated.delete(payload.user_id);
          }
          return updated;
        });
      }
    );

    // Handle presence changes
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState() as RealtimePresenceState<PresenceState>;
      const users = Object.values(state).flat();
      setOnlineUsers(users.filter(u => u.user_id !== user.id));
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
      // Remove from typing users if they were typing
      setTypingUsers(prev => {
        const updated = new Map(prev);
        updated.delete(key);
        return updated;
      });
    });

    // Subscribe to channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        // Track presence
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
          username: user.email,
        });
      } else if (status === 'CLOSED') {
        setIsConnected(false);
      }
    });

    return () => {
      setIsConnected(false);
      setOnlineUsers([]);
      setTypingUsers(new Map());
      channel.unsubscribe();
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [user, conversationId, queryClient]);

  // Send message function
  const sendMessage = useCallback(async (
    content: string, 
    parentMessageId?: string,
    tempId?: string
  ) => {
    if (!user || !conversationId || !channelRef.current) return;

    // Create optimistic message
    const optimisticMessage = {
      id: tempId || `temp-${Date.now()}`,
      content,
      sender_id: user.id,
      message_type: 'text',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      conversation_id: conversationId,
      parent_message_id: parentMessageId
    };

    // Optimistic update for infinite query with conversation isolation
    updateInfiniteQueryData(
      queryClient,
      conversationId,
      (pages) => {
        if (pages.length === 0) {
          return [[optimisticMessage as any]];
        }
        
        // Add to the first page (most recent messages)
        const newPages = [...pages];
        newPages[0] = [optimisticMessage as any, ...newPages[0]];
        return newPages;
      }
    );

    try {
      // Broadcast to other users immediately
      await channelRef.current.send({
        type: 'broadcast',
        event: 'new_message',
        payload: optimisticMessage
      });

      // Send to database via messaging API
      const data = await messagingApi.sendMessage({
        conversation_id: conversationId,
        content,
        parent_message_id: parentMessageId
      });

      // Update optimistic message with real data
      updateInfiniteQueryData(
        queryClient,
        conversationId,
        (pages) => {
          return pages.map(page =>
            page.map(msg => 
              msg.id === optimisticMessage.id && msg.conversation_id === conversationId ? data : msg
            )
          );
        }
      );

    } catch (error) {
      // Remove optimistic message on error
      updateInfiniteQueryData(
        queryClient,
        conversationId,
        (pages) => {
          return pages.map(page =>
            page.filter(msg => !(msg.id === optimisticMessage.id && msg.conversation_id === conversationId))
          );
        }
      );
      
      throw error;
    }
  }, [user, conversationId, queryClient]);

  // Edit message function
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!channelRef.current) return;

    try {
      // Send edit via messaging API
      const data = await messagingApi.updateMessage(messageId, { content: newContent });

      // Broadcast edit to other users
      await channelRef.current.send({
        type: 'broadcast',
        event: 'edit_message',
        payload: {
          id: messageId,
          content: newContent,
          updated_at: data.updated_at
        }
      });

    } catch (error) {
      console.error('Failed to edit message:', error);
      throw error;
    }
  }, []);

  // Delete message function
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!channelRef.current) return;

    try {
      // Delete via messaging API
      await messagingApi.deleteMessage(messageId);

      // Broadcast deletion to other users
      await channelRef.current.send({
        type: 'broadcast',
        event: 'delete_message',
        payload: { id: messageId }
      });

    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }, []);

  // Send typing indicator
  const sendTypingIndicator = useCallback(async (isTyping: boolean) => {
    if (!user || !channelRef.current) return;

    await channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        username: user.email,
        is_typing: isTyping
      }
    });
  }, [user]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return false;
    
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return Notification.permission === 'granted';
  }, []);

  return {
    isConnected,
    onlineUsers,
    typingUsers: Array.from(typingUsers.values()),
    sendMessage,
    editMessage,
    deleteMessage,
    sendTypingIndicator,
    requestNotificationPermission
  };
}

// Helper function to play notification sound
function playNotificationSound() {
  try {
    const audio = new Audio('/notification.mp3'); // Add notification sound to public folder
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignore autoplay restrictions
    });
  } catch (error) {
    // Ignore audio errors
  }
}