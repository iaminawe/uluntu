import { useEffect, useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { RealtimeChannel, RealtimePresenceState } from '@supabase/supabase-js';
import { Message } from '../types';
import { messagingQueryKeys } from '@/hooks/useMessagingQueries';

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
  sender_name: string;
  sender_avatar?: string;
  created_at: string;
  conversation_id: string;
  edited?: boolean;
  parent_message_id?: string;
}

interface TypingPayload {
  user_id: string;
  username: string;
  avatar_url?: string;
  is_typing: boolean;
}

export function useRealtimeChat(conversationId: string | undefined) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingPayload>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize channel for conversation
  useEffect(() => {
    if (!user || !conversationId) return;

    // Create a unique channel for this conversation
    const channel = supabase.channel(`conversation:${conversationId}`, {
      config: {
        broadcast: {
          self: true, // Receive own broadcasts for optimistic updates
          ack: true   // Get acknowledgement when server receives message
        },
        presence: {
          key: user.id
        }
      }
    });

    channelRef.current = channel;

    // Handle connection state
    channel
      .on('system', { event: 'error' }, (payload) => {
        console.error('Channel error:', payload);
        setIsConnected(false);
      })
      .on('system', { event: 'connected' }, () => {
        console.log('Connected to conversation:', conversationId);
        setIsConnected(true);
      });

    // Subscribe to new messages via broadcast (faster than postgres_changes)
    channel.on(
      'broadcast',
      { event: 'new_message' },
      ({ payload }: { payload: MessagePayload }) => {
        // Skip if it's our own message (we handle optimistic updates separately)
        if (payload.sender_id === user.id) return;

        // Add message to cache immediately
        queryClient.setQueryData(
          messagingQueryKeys.messages(conversationId),
          (oldMessages: Message[] | undefined) => {
            if (!oldMessages) return [payload as any];
            
            // Check if message already exists (deduplication)
            if (oldMessages.some(m => m.id === payload.id)) {
              return oldMessages;
            }
            
            // Add new message to the beginning (newest first)
            return [payload as any, ...oldMessages];
          }
        );

        // Play notification sound
        playNotificationSound();

        // Show browser notification
        showNotification(payload);
      }
    );

    // Subscribe to message edits
    channel.on(
      'broadcast',
      { event: 'edit_message' },
      ({ payload }: { payload: { id: string; content: string; edited_at: string } }) => {
        queryClient.setQueryData(
          messagingQueryKeys.messages(conversationId),
          (oldMessages: Message[] | undefined) => {
            if (!oldMessages) return [];
            return oldMessages.map(msg => 
              msg.id === payload.id 
                ? { ...msg, content: payload.content, edited: true, edited_at: payload.edited_at }
                : msg
            );
          }
        );
      }
    );

    // Subscribe to message deletions
    channel.on(
      'broadcast',
      { event: 'delete_message' },
      ({ payload }: { payload: { id: string } }) => {
        queryClient.setQueryData(
          messagingQueryKeys.messages(conversationId),
          (oldMessages: Message[] | undefined) => {
            if (!oldMessages) return [];
            return oldMessages.filter(msg => msg.id !== payload.id);
          }
        );
      }
    );

    // Subscribe to typing indicators
    channel.on(
      'broadcast',
      { event: 'typing' },
      ({ payload }: { payload: TypingPayload }) => {
        if (payload.user_id === user.id) return;

        setTypingUsers(prev => {
          const updated = new Map(prev);
          if (payload.is_typing) {
            updated.set(payload.user_id, payload);
            // Auto-remove after 3 seconds
            setTimeout(() => {
              setTypingUsers(p => {
                const u = new Map(p);
                u.delete(payload.user_id);
                return u;
              });
            }, 3000);
          } else {
            updated.delete(payload.user_id);
          }
          return updated;
        });
      }
    );

    // Track presence (who's online)
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

    // Subscribe to the channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track our presence
        await channel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
          username: user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url
        });
      }
    });

    // Also subscribe to database changes for persistence
    const dbSubscription = supabase
      .channel(`db:conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Invalidate queries to fetch full message data with relations
          queryClient.invalidateQueries({ 
            queryKey: messagingQueryKeys.messages(conversationId) 
          });
          queryClient.invalidateQueries({ 
            queryKey: messagingQueryKeys.conversations 
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      dbSubscription.unsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user, conversationId, queryClient]);

  // Send a message with optimistic update
  const sendMessage = useCallback(async (content: string, parentMessageId?: string) => {
    if (!user || !conversationId || !channelRef.current) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: MessagePayload = {
      id: tempId,
      content,
      sender_id: user.id,
      sender_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'You',
      sender_avatar: user.user_metadata?.avatar_url,
      created_at: new Date().toISOString(),
      conversation_id: conversationId,
      parent_message_id: parentMessageId
    };

    // Optimistic update
    queryClient.setQueryData(
      messagingQueryKeys.messages(conversationId),
      (oldMessages: Message[] | undefined) => {
        if (!oldMessages) return [optimisticMessage as any];
        return [optimisticMessage as any, ...oldMessages];
      }
    );

    try {
      // Broadcast to other users immediately
      await channelRef.current.send({
        type: 'broadcast',
        event: 'new_message',
        payload: optimisticMessage
      });

      // Save to database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          parent_message_id: parentMessageId
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic message with real one
      queryClient.setQueryData(
        messagingQueryKeys.messages(conversationId),
        (oldMessages: Message[] | undefined) => {
          if (!oldMessages) return [data];
          return oldMessages.map(msg => 
            msg.id === tempId ? data : msg
          );
        }
      );

      // Update conversation's last message
      queryClient.invalidateQueries({ 
        queryKey: messagingQueryKeys.conversations 
      });

      return data;
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove optimistic message on error
      queryClient.setQueryData(
        messagingQueryKeys.messages(conversationId),
        (oldMessages: Message[] | undefined) => {
          if (!oldMessages) return [];
          return oldMessages.filter(msg => msg.id !== tempId);
        }
      );
      
      throw error;
    }
  }, [user, conversationId, queryClient]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!user || !channelRef.current) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing status
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        username: user.user_metadata?.first_name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url,
        is_typing: isTyping
      }
    });

    // Auto-stop typing after 2 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(false);
      }, 2000);
    }
  }, [user]);

  // Edit a message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!user || !channelRef.current) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ 
          content: newContent, 
          edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id) // Ensure user owns the message
        .select()
        .single();

      if (error) throw error;

      // Broadcast the edit
      await channelRef.current.send({
        type: 'broadcast',
        event: 'edit_message',
        payload: {
          id: messageId,
          content: newContent,
          edited_at: data.edited_at
        }
      });

      return data;
    } catch (error) {
      console.error('Failed to edit message:', error);
      throw error;
    }
  }, [user]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user || !channelRef.current) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id); // Ensure user owns the message

      if (error) throw error;

      // Broadcast the deletion
      await channelRef.current.send({
        type: 'broadcast',
        event: 'delete_message',
        payload: { id: messageId }
      });
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }, [user]);

  // Helper functions
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Could not play sound:', e));
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const showNotification = (message: MessagePayload) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`New message from ${message.sender_name}`, {
        body: message.content.substring(0, 100),
        icon: message.sender_avatar || '/default-avatar.png',
        tag: `message-${message.id}`,
        requireInteraction: false
      });
    }
  };

  return {
    // State
    isConnected,
    onlineUsers,
    typingUsers: Array.from(typingUsers.values()),
    
    // Actions
    sendMessage,
    editMessage,
    deleteMessage,
    sendTypingIndicator,
    
    // Utilities
    requestNotificationPermission: async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return Notification.permission === 'granted';
    }
  };
}