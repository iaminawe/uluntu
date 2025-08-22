/**
 * Core messaging types for the messaging system
 * Following the established type patterns used throughout the application
 */

// Base types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  avatar?: string; // For backward compatibility
  username?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'marketplace' | 'opportunity' | 'group';
  title?: string;
  participants: ConversationParticipant[];
  last_message?: Message;
  last_message_at?: string;
  is_archived: boolean;
  is_muted: boolean;
  created_at: string;
  updated_at: string;
  metadata?: ConversationMetadata;
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  user: User;
  role: 'admin' | 'member';
  joined_at: string;
  last_read_at?: string;
  is_active: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender: User;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  parent_message_id?: string;
  parent_message?: Message;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  metadata?: MessageMetadata;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  thumbnail_url?: string;
  created_at: string;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  user: User;
  reaction: string; // Emoji or reaction type
  created_at: string;
}

// Metadata types
export interface ConversationMetadata {
  marketplace_item_id?: string;
  marketplace_item_title?: string;
  marketplace_item_price?: number;
  opportunity_id?: string;
  opportunity_title?: string;
  company_id?: string;
  group_id?: string;
  [key: string]: any;
}

export interface MessageMetadata {
  edited_at?: string;
  system_type?: 'user_joined' | 'user_left' | 'title_changed' | 'archived';
  [key: string]: any;
}

// Input types for API operations
export interface CreateConversationInput {
  type: Conversation['type'];
  title?: string;
  participant_ids: string[];
  initial_message?: string;
  metadata?: ConversationMetadata;
  force_new?: boolean; // Force creation of new conversation even if one exists
}

export interface SendMessageInput {
  conversation_id: string;
  content: string;
  message_type: Message['message_type'];
  parent_message_id?: string;
  attachments?: File[];
  metadata?: MessageMetadata;
}

export interface UpdateMessageInput {
  id: string;
  content: string;
}

export interface UpdateConversationInput {
  title?: string;
  archived?: boolean;
}

export interface DeleteConversationInput {
  id: string;
  deleteType: 'soft' | 'hard';
  reason?: string;
}

export interface CreateMarketplaceThreadInput {
  itemId: string;
  itemTitle: string;
  sellerId: string;
  buyerId: string;
  initialMessage: string;
  itemPrice?: number;
}

export interface CreateOpportunityThreadInput {
  opportunityId: string;
  opportunityTitle: string;
  recruiterId: string;
  applicantId: string;
  initialMessage: string;
  companyId?: string;
}

// Filter types
export interface ConversationFilters {
  search?: string;
  type?: Conversation['type'];
  archived?: boolean;
  unread_only?: boolean;
  participant_id?: string;
  limit?: number;
  offset?: number;
}

export interface MessageFilters {
  conversation_id: string;
  search?: string;
  message_type?: Message['message_type'];
  sender_id?: string;
  before_message_id?: string;
  after_message_id?: string;
  limit?: number;
  offset?: number;
}

// UI State types
export interface MessagingUIState {
  selectedConversationId?: string;
  isComposing: boolean;
  searchTerm: string;
  filters: ConversationFilters;
  messageFilters: MessageFilters;
  showEmojiPicker: boolean;
  showAttachmentMenu: boolean;
  replyingToMessage?: Message;
  editingMessage?: Message;
  selectedMessages: string[];
}

// Notification types
export interface MessageNotification {
  id: string;
  type: 'new_message' | 'new_conversation' | 'message_reaction';
  conversation_id: string;
  message_id?: string;
  sender: User;
  content: string;
  created_at: string;
  is_read: boolean;
}

// Typing indicator types
export interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  user: User;
  timestamp: string;
}

export interface TypingStatus {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: string;
}

// Block/Report types
export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  blocked_user: User;
  reason?: string;
  created_at: string;
}

// API Response types
export interface ConversationsResponse {
  conversations: Conversation[];
  total: number;
  has_more: boolean;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
  has_more: boolean;
}

// Error types
export interface MessagingError {
  code: string;
  message: string;
  details?: any;
}

// Utility types
export type ConversationType = Conversation['type'];
export type MessageType = Message['message_type'];
export type ParticipantRole = ConversationParticipant['role'];
export type DeleteType = 'soft' | 'hard';

// Component prop types
export interface MessagingComponentProps {
  className?: string;
  onError?: (error: MessagingError) => void;
}

export interface ConversationListProps extends MessagingComponentProps {
  conversations?: Conversation[];
  selectedConversationId?: string;
  onSelectConversation?: (conversationId: string) => void;
  onArchiveConversation?: (conversationId: string) => void;
  loading?: boolean;
  error?: Error | null;
}

export interface MessageListProps extends MessagingComponentProps {
  messages?: Message[];
  conversationId?: string;
  onReplyToMessage?: (message: Message) => void;
  onEditMessage?: (message: Message) => void;
  onDeleteMessage?: (messageId: string) => void;
  onReactToMessage?: (messageId: string, reaction: string) => void;
  loading?: boolean;
  error?: Error | null;
}

export interface MessageComposerProps extends MessagingComponentProps {
  conversationId?: string;
  replyingToMessage?: Message;
  editingMessage?: Message;
  onSendMessage?: (content: string, attachments?: File[]) => void;
  onUpdateMessage?: (messageId: string, content: string) => void;
  onCancelReply?: () => void;
  onCancelEdit?: () => void;
  disabled?: boolean;
}

// Thread creation result type
export interface MessageThread {
  id: string;
  type: 'direct' | 'marketplace' | 'opportunity' | 'group';
  title?: string;
  participants: ConversationParticipant[];
  last_message?: Message;
  last_message_at?: string;
  is_archived: boolean;
  is_muted: boolean;
  created_at: string;
  updated_at: string;
  metadata?: ConversationMetadata;
  unread_count?: number;
}