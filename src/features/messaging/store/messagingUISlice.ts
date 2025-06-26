import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MessagingUIState, Message, ConversationFilters, MessageFilters } from '../types';
import type { RootState } from '@/store';

const initialState: MessagingUIState = {
  selectedConversationId: undefined,
  isComposing: false,
  searchTerm: '',
  filters: {
    search: '',
    archived: false,
    limit: 20,
  },
  messageFilters: {
    conversation_id: '',
    limit: 50,
  },
  showEmojiPicker: false,
  showAttachmentMenu: false,
  replyingToMessage: undefined,
  editingMessage: undefined,
  selectedMessages: [],
};

const messagingUISlice = createSlice({
  name: 'messagingUI',
  initialState,
  reducers: {
    // Conversation selection
    setSelectedConversation: (state, action: PayloadAction<string | undefined>) => {
      state.selectedConversationId = action.payload;
    },
    
    // Search and filtering
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.filters.search = action.payload;
    },
    
    updateFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    updateMessageFilters: (state, action: PayloadAction<Partial<typeof initialState.messageFilters>>) => {
      state.messageFilters = { ...state.messageFilters, ...action.payload };
    },
    
    // Composer state
    setComposing: (state, action: PayloadAction<boolean>) => {
      state.isComposing = action.payload;
    },
    
    // UI elements
    toggleEmojiPicker: (state) => {
      state.showEmojiPicker = !state.showEmojiPicker;
      state.showAttachmentMenu = false; // Close other menus
    },
    
    toggleAttachmentMenu: (state) => {
      state.showAttachmentMenu = !state.showAttachmentMenu;
      state.showEmojiPicker = false; // Close other menus
    },
    
    closeAllMenus: (state) => {
      state.showEmojiPicker = false;
      state.showAttachmentMenu = false;
    },
    
    // Message interactions
    setReplyingTo: (state, action: PayloadAction<Message | undefined>) => {
      state.replyingToMessage = action.payload;
      state.editingMessage = undefined; // Can't reply and edit at same time
    },
    
    setEditing: (state, action: PayloadAction<Message | undefined>) => {
      state.editingMessage = action.payload;
      state.replyingToMessage = undefined; // Can't reply and edit at same time
    },
    
    cancelReply: (state) => {
      state.replyingToMessage = undefined;
    },
    
    cancelEdit: (state) => {
      state.editingMessage = undefined;
    },
    
    // Message selection
    toggleMessageSelection: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      const index = state.selectedMessages.indexOf(messageId);
      
      if (index > -1) {
        state.selectedMessages.splice(index, 1);
      } else {
        state.selectedMessages.push(messageId);
      }
    },
    
    clearMessageSelection: (state) => {
      state.selectedMessages = [];
    },
    
    selectAllMessages: (state, action: PayloadAction<string[]>) => {
      state.selectedMessages = action.payload;
    },
    
    // Reset state
    resetState: () => initialState,
  },
});

export const {
  setSelectedConversation,
  setSearchTerm,
  updateFilters,
  updateMessageFilters,
  setComposing,
  toggleEmojiPicker,
  toggleAttachmentMenu,
  closeAllMenus,
  setReplyingTo,
  setEditing,
  cancelReply,
  cancelEdit,
  toggleMessageSelection,
  clearMessageSelection,
  selectAllMessages,
  resetState,
} = messagingUISlice.actions;

// Selectors
export const selectMessagingUI = (state: any) => state.messagingUI;
export const selectSelectedConversationId = (state: any) => state.messagingUI.selectedConversationId;
export const selectConversationFilters = (state: any) => state.messagingUI.filters;
export const selectMessageFilters = (state: any) => state.messagingUI.messageFilters;
export const selectReplyingToMessage = (state: any) => state.messagingUI.replyingToMessage;
export const selectEditingMessage = (state: any) => state.messagingUI.editingMessage;
export const selectSelectedMessages = (state: any) => state.messagingUI.selectedMessages;
export const selectHasActiveFilters = (state: any) => {
  const filters = state.messagingUI.filters;
  return !!(filters.search || filters.type || filters.archived || filters.unread_only);
};
export const selectCanSendMessage = (state: any) => {
  return !!(state.messagingUI.selectedConversationId && !state.messagingUI.editingMessage);
};

export default messagingUISlice.reducer;