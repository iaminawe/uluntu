import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useMessagingHybrid } from './useMessagingHybrid';
import { messagingQueryKeys } from '../api/messagingApi';
import { Message, Conversation, TypingStatus } from '../types';

export function useRealtimeMessaging() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const messagingHybrid = useMessagingHybrid();
  // Mock typing functions for now since they're not implemented in the hybrid hook
  const addTypingUser = (userId: string) => console.log('Add typing user:', userId);
  const removeTypingUser = (userId: string) => console.log('Remove typing user:', userId);
  const showNotifications = true; // Default value
  const soundEnabled = true; // Default value
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    if (soundEnabled) {
      audioRef.current = new Audio('/notification-sound.mp3'); // You'd need to add this sound file
      audioRef.current.volume = 0.3;
    }
  }, [soundEnabled]);

  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(e => {
        console.log('Could not play notification sound:', e);
      });
    }
  }, [soundEnabled]);

  // Subscribe to new messages
  useEffect(() => {
    if (!user) return;

    const messagesSubscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=in.(${user.id})` // This would need to be dynamically updated with user's conversation IDs
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Don't process own messages
          if (newMessage.sender_id === user.id) return;
          
          // Update relevant queries
          queryClient.invalidateQueries({ queryKey: messagingQueryKeys.conversations });
          queryClient.invalidateQueries({ 
            queryKey: messagingQueryKeys.messages(newMessage.conversation_id) 
          });
          queryClient.invalidateQueries({ queryKey: messagingQueryKeys.unreadCount });
          
          // Play notification sound
          playNotificationSound();
          
          // Show browser notification if supported and permitted
          if (showNotifications && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(`New message from ${newMessage.sender?.name || 'Unknown'}`, {
              body: newMessage.content.substring(0, 100),
              icon: newMessage.sender?.avatar_url || newMessage.sender?.avatar || '/default-avatar.png',
              tag: `message-${newMessage.id}`,
              requireInteraction: false
            });
          }
        }
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [user, queryClient, playNotificationSound, showNotifications]);

  // Subscribe to message status updates (read receipts)
  useEffect(() => {
    if (!user) return;

    const statusSubscription = supabase
      .channel('message_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id}`
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          
          // Update messages queries to reflect status changes
          queryClient.invalidateQueries({ 
            queryKey: messagingQueryKeys.messages(updatedMessage.conversation_id) 
          });
        }
      )
      .subscribe();

    return () => {
      statusSubscription.unsubscribe();
    };
  }, [user, queryClient]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!user) return;

    const typingSubscription = supabase
      .channel('typing_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status'
        },
        (payload) => {
          const typingStatus = payload.new as TypingStatus;
          
          // Don't process own typing status
          if (typingStatus.userId === user.id) return;
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (typingStatus.isTyping) {
              addTypingUser(typingStatus.userId);
            } else {
              removeTypingUser(typingStatus.userId);
            }
          } else if (payload.eventType === 'DELETE') {
            removeTypingUser(typingStatus.userId);
          }
        }
      )
      .subscribe();

    return () => {
      typingSubscription.unsubscribe();
    };
  }, [user, addTypingUser, removeTypingUser]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!user) return;

    const conversationsSubscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        () => {
          // Refresh conversations when any conversation is updated
          queryClient.invalidateQueries({ queryKey: messagingQueryKeys.conversations });
        }
      )
      .subscribe();

    return () => {
      conversationsSubscription.unsubscribe();
    };
  }, [user, queryClient]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  return {
    requestNotificationPermission
  };
}