import React, { useMemo, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useQueryClient } from '@tanstack/react-query';
import {
  useConversations,
  useConversation,
  useMessages,
  useUnreadMessageCount,
  useCreateConversation,
  useSendMessage,
  useUpdateMessage,
  useUpdateConversation,
  useDeleteMessage,
  useAddReaction,
  useRemoveReaction,
  useBlockUser,
  useUnblockUser,
  messagingQueryKeys,
  invalidateMessagingQueries,
  clearConversationCache,
  resetConversationState
} from '@/hooks/useMessagingQueries';
import {
  setSelectedConversation,
  setComposing,
  setSearchTerm,
  updateFilters,
  updateMessageFilters,
  toggleEmojiPicker,
  toggleAttachmentMenu,
  setReplyingTo,
  setEditing,
  cancelReply,
  cancelEdit,
  toggleMessageSelection,
  clearMessageSelection,
  resetState
} from '../store/messagingUISlice';
import {
  selectMessagingUI,
  selectSelectedConversationId,
  selectConversationFilters,
  selectMessageFilters,
  selectReplyingToMessage,
  selectEditingMessage,
  selectSelectedMessages,
  selectHasActiveFilters,
  selectCanSendMessage
} from '../store/messagingUISlice';
import {
  CreateConversationInput,
  SendMessageInput,
  UpdateMessageInput,
  UpdateConversationInput,
  ConversationFilters,
  MessageFilters,
  Message
} from '../types';

/**
 * Hybrid hook for messaging that combines React Query for data fetching
 * with Redux for UI state management (filters, selections, etc.)
 * Following the established hybrid pattern used throughout the application
 */
export function useMessagingHybrid() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  // Get UI state from Redux
  const uiState = useAppSelector(selectMessagingUI);
  const selectedConversationId = useAppSelector(selectSelectedConversationId);
  const conversationFilters = useAppSelector(selectConversationFilters);
  const messageFilters = useAppSelector(selectMessageFilters);
  const replyingToMessage = useAppSelector(selectReplyingToMessage);
  const editingMessage = useAppSelector(selectEditingMessage);
  const selectedMessages = useAppSelector(selectSelectedMessages);
  const hasActiveFilters = useAppSelector(selectHasActiveFilters);
  const canSendMessage = useAppSelector(selectCanSendMessage);

  // React Query hooks for data fetching
  const conversationsQuery = useConversations(hasActiveFilters ? conversationFilters : undefined);
  const selectedConversationQuery = useConversation(selectedConversationId || '');
  const messagesQuery = useMessages(selectedConversationId || '', messageFilters.limit);
  const unreadCountQuery = useUnreadMessageCount();

  // Mutation hooks
  const createConversationMutation = useCreateConversation();
  const sendMessageMutation = useSendMessage();
  const updateMessageMutation = useUpdateMessage();
  const updateConversationMutation = useUpdateConversation();
  const deleteMessageMutation = useDeleteMessage();
  const addReactionMutation = useAddReaction();
  const removeReactionMutation = useRemoveReaction();
  // Archive and mark as read functionality not implemented yet
  // const archiveConversationMutation = useArchiveConversation();
  // const markAsReadMutation = useMarkAsRead();
  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  // =============================================
  // CONVERSATION ACTIONS
  // =============================================

  const selectConversation = useCallback((conversationId: string) => {
    // If switching conversations, clear any stale cache for better isolation
    if (selectedConversationId && selectedConversationId !== conversationId) {
      // Clear previous conversation's cache to prevent message bleed-through
      clearConversationCache(queryClient, selectedConversationId);
      
      // Reset UI state for the new conversation
      dispatch(cancelReply());
      dispatch(cancelEdit());
      dispatch(clearMessageSelection());
    }
    
    dispatch(setSelectedConversation(conversationId));
    // Automatically mark as read when selecting (not implemented yet)
    // markAsReadMutation.mutate(conversationId);
  }, [dispatch, selectedConversationId, queryClient]);

  const createConversation = useCallback(async (input: CreateConversationInput) => {
    try {
      const conversation = await createConversationMutation.mutateAsync(input);
      
      // Clear any existing cache for better isolation
      if (selectedConversationId) {
        clearConversationCache(queryClient, selectedConversationId);
      }
      
      // Reset UI state when creating new conversation
      dispatch(cancelReply());
      dispatch(cancelEdit());
      dispatch(clearMessageSelection());
      
      // Select the new conversation
      dispatch(setSelectedConversation(conversation.id));
      return conversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  }, [createConversationMutation, dispatch, selectedConversationId, queryClient]);

  const archiveConversation = useCallback(async (conversationId: string) => {
    try {
      // Archive functionality not implemented yet
      console.log('Archive not implemented yet for conversation:', conversationId);
      // If the archived conversation was selected, clear selection
      if (selectedConversationId === conversationId) {
        dispatch(setSelectedConversation(undefined));
      }
    } catch (error) {
      console.error('Failed to archive conversation:', error);
      throw error;
    }
  }, [selectedConversationId, dispatch]);

  const updateConversation = useCallback(async (conversationId: string, updates: UpdateConversationInput) => {
    try {
      const conversation = await updateConversationMutation.mutateAsync({ id: conversationId, ...updates });
      return conversation;
    } catch (error) {
      console.error('Failed to update conversation:', error);
      throw error;
    }
  }, [updateConversationMutation]);

  // =============================================
  // MESSAGE ACTIONS
  // =============================================

  const sendMessage = useCallback(async (content: string, attachments?: File[]) => {
    if (!selectedConversationId || !canSendMessage) {
      throw new Error('No conversation selected or cannot send message');
    }

    const input: SendMessageInput = {
      conversation_id: selectedConversationId,
      content: content.trim(),
      message_type: 'text',
      parent_message_id: replyingToMessage?.id,
      attachments,
      metadata: {}
    };

    try {
      const message = await sendMessageMutation.mutateAsync(input);
      
      // Clear reply state after sending
      if (replyingToMessage) {
        dispatch(cancelReply());
      }
      
      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }, [selectedConversationId, canSendMessage, replyingToMessage, sendMessageMutation, dispatch]);

  const updateMessage = useCallback(async (messageId: string, content: string) => {
    const input: UpdateMessageInput = {
      id: messageId,
      content: content.trim()
    };

    try {
      const message = await updateMessageMutation.mutateAsync(input);
      
      // Clear editing state after updating
      if (editingMessage?.id === messageId) {
        dispatch(cancelEdit());
      }
      
      return message;
    } catch (error) {
      console.error('Failed to update message:', error);
      throw error;
    }
  }, [updateMessageMutation, editingMessage, dispatch]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await deleteMessageMutation.mutateAsync(messageId);
      
      // Clear any UI state related to the deleted message
      if (editingMessage?.id === messageId) {
        dispatch(cancelEdit());
      }
      if (replyingToMessage?.id === messageId) {
        dispatch(cancelReply());
      }
      // Remove from selection if it was selected
      if (selectedMessages.includes(messageId)) {
        dispatch(toggleMessageSelection(messageId));
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  }, [deleteMessageMutation, editingMessage, replyingToMessage, dispatch]);

  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    try {
      return await addReactionMutation.mutateAsync({ messageId, reaction });
    } catch (error) {
      console.error('Failed to add reaction:', error);
      throw error;
    }
  }, [addReactionMutation]);

  const removeReaction = useCallback(async (messageId: string, reaction: string) => {
    try {
      await removeReactionMutation.mutateAsync({ messageId, reaction });
    } catch (error) {
      console.error('Failed to remove reaction:', error);
      throw error;
    }
  }, [removeReactionMutation]);

  // =============================================
  // UI STATE ACTIONS
  // =============================================

  const setSearchTermAction = useCallback((search: string) => {
    dispatch(setSearchTerm(search));
  }, [dispatch]);

  const updateFiltersAction = useCallback((filters: Partial<ConversationFilters>) => {
    dispatch(updateFilters(filters));
  }, [dispatch]);

  const clearFiltersAction = useCallback(() => {
    dispatch(updateFilters({ search: '', archived: false }));
  }, [dispatch]);

  const setReplyingToAction = useCallback((message: Message | undefined) => {
    dispatch(setReplyingTo(message));
  }, [dispatch]);

  const setEditingAction = useCallback((message: Message | undefined) => {
    dispatch(setEditing(message));
  }, [dispatch]);

  const toggleEmojiPickerAction = useCallback(() => {
    dispatch(toggleEmojiPicker());
  }, [dispatch]);

  const toggleAttachmentMenuAction = useCallback(() => {
    dispatch(toggleAttachmentMenu());
  }, [dispatch]);

  const toggleMessageSelectionAction = useCallback((messageId: string) => {
    dispatch(toggleMessageSelection(messageId));
  }, [dispatch]);

  const clearSelection = useCallback(() => {
    dispatch(clearMessageSelection());
  }, [dispatch]);

  const openComposer = useCallback(() => {
    dispatch(setComposing(true));
  }, [dispatch]);

  const closeComposer = useCallback(() => {
    dispatch(setComposing(false));
  }, [dispatch]);

  // Sidebar state for mobile/desktop layout
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Composer state for external triggers
  const composerState = React.useMemo(() => ({
    open: uiState.isComposing,
    recipientId: null, // Could be expanded to support direct messaging
    context: null // Could be expanded to support marketplace/opportunity contexts
  }), [uiState.isComposing]);

  // =============================================
  // USER BLOCKING ACTIONS
  // =============================================

  const blockUser = useCallback(async (userId: string, reason?: string) => {
    try {
      await blockUserMutation.mutateAsync({ userId, reason });
    } catch (error) {
      console.error('Failed to block user:', error);
      throw error;
    }
  }, [blockUserMutation]);

  const unblockUser = useCallback(async (userId: string) => {
    try {
      await unblockUserMutation.mutateAsync(userId);
    } catch (error) {
      console.error('Failed to unblock user:', error);
      throw error;
    }
  }, [unblockUserMutation]);

  // =============================================
  // UTILITY ACTIONS
  // =============================================

  const refreshData = useCallback(() => {
    invalidateMessagingQueries(queryClient);
  }, [queryClient]);

  const loadMoreMessages = useCallback(() => {
    if (messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
      messagesQuery.fetchNextPage();
    }
  }, [messagesQuery]);

  // =============================================
  // COMPUTED VALUES
  // =============================================

  const conversations = useMemo(() => conversationsQuery.data || [], [conversationsQuery.data]);
  const selectedConversation = useMemo(() => selectedConversationQuery.data, [selectedConversationQuery.data]);
  const messages = useMemo(() => {
    if (!messagesQuery.data) return [];
    // Handle both infinite query (with pages) and regular query (direct array)
    if ('pages' in messagesQuery.data && messagesQuery.data.pages) {
      return Array.isArray(messagesQuery.data.pages) ? messagesQuery.data.pages.flat() : [];
    }
    return Array.isArray(messagesQuery.data) ? messagesQuery.data : [];
  }, [messagesQuery.data]);

  const isLoading = useMemo(() => {
    return conversationsQuery.isLoading || 
           selectedConversationQuery.isLoading || 
           messagesQuery.isLoading;
  }, [conversationsQuery.isLoading, selectedConversationQuery.isLoading, messagesQuery.isLoading]);

  const error = useMemo(() => {
    return conversationsQuery.error || 
           selectedConversationQuery.error || 
           messagesQuery.error;
  }, [conversationsQuery.error, selectedConversationQuery.error, messagesQuery.error]);

  const isCreatingConversation = createConversationMutation.isPending;
  const isSendingMessage = sendMessageMutation.isPending;
  const isUpdatingMessage = updateMessageMutation.isPending;
  const isUpdatingConversation = updateConversationMutation.isPending;
  const isDeletingMessage = deleteMessageMutation.isPending;

  // Additional loading states for MessagesPage
  const isLoadingConversations = conversationsQuery.isLoading;
  const conversationsError = conversationsQuery.error;
  const isLoadingSelectedConversation = selectedConversationQuery.isLoading;

  // =============================================
  // RETURN INTERFACE
  // =============================================

  return {
    // Data from React Query
    conversations,
    selectedConversation,
    messages,
    unreadCount: unreadCountQuery.data || 0,
    isLoading,
    error,
    
    // Additional loading states for pages
    isLoadingConversations,
    conversationsError,
    isLoadingSelectedConversation,

    // Loading states
    isCreatingConversation,
    isSendingMessage,
    isUpdatingMessage,
    isUpdatingConversation,
    isDeletingMessage,
    isLoadingMore: messagesQuery.isFetchingNextPage,
    hasMoreMessages: messagesQuery.hasNextPage,

    // UI state from Redux
    selectedConversationId,
    conversationFilters,
    messageFilters,
    replyingToMessage,
    editingMessage,
    selectedMessages,
    hasActiveFilters,
    canSendMessage,
    showEmojiPicker: uiState.showEmojiPicker,
    showAttachmentMenu: uiState.showAttachmentMenu,
    isComposing: uiState.isComposing,
    searchTerm: uiState.searchTerm,
    
    // Layout state
    sidebarOpen,
    setSidebarOpen,
    composerState,

    // Actions
    selectConversation,
    createConversation,
    updateConversation,
    archiveConversation,
    sendMessage,
    updateMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    loadMoreMessages,

    // UI actions
    setSearchTerm: setSearchTermAction,
    updateFilters: updateFiltersAction,
    clearFilters: clearFiltersAction,
    setReplyingTo: setReplyingToAction,
    setEditing: setEditingAction,
    cancelReply: () => dispatch(cancelReply()),
    cancelEdit: () => dispatch(cancelEdit()),
    toggleEmojiPicker: toggleEmojiPickerAction,
    toggleAttachmentMenu: toggleAttachmentMenuAction,
    toggleMessageSelection: toggleMessageSelectionAction,
    clearSelection,
    openComposer,
    closeComposer,

    // User management
    blockUser,
    unblockUser,

    // Utilities
    refreshData,
    refetch: conversationsQuery.refetch,
    refetchConversation: selectedConversationQuery.refetch,
    refetchMessages: messagesQuery.refetch
  };
}