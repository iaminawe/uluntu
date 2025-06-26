// Mock implementation for messaging API until database tables are created
import { logger } from '@/utils/logger';
import {
  Conversation,
  Message,
  MessageReaction,
  CreateConversationInput,
  SendMessageInput,
  UpdateMessageInput,
  ConversationFilters,
  MessageFilters,
  BlockedUser,
  CreateMarketplaceThreadInput,
  CreateOpportunityThreadInput,
  User
} from '../types';

// Define MessageThread type locally since it's not exported from types
interface MessageThread {
  id: string;
  conversation_id: string;
  created_at: string;
  updated_at: string;
}

// Mock data for development
const mockConversations: Conversation[] = [];
const mockMessages: Message[] = [];
const mockReactions: MessageReaction[] = [];
const mockBlockedUsers: BlockedUser[] = [];

export const messagingApi = {
  // =============================================
  // CONVERSATIONS - Mock Implementation
  // =============================================

  async getConversations(filters?: ConversationFilters): Promise<Conversation[]> {
    logger.debug('Mock: Getting conversations', 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    return mockConversations.filter(conv => {
      if (filters?.search && !conv.title?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters?.type && conv.type !== filters.type) {
        return false;
      }
      if (filters?.archived !== undefined && conv.is_archived !== filters.archived) {
        return false;
      }
      return true;
    });
  },

  async getConversation(id: string): Promise<Conversation | null> {
    logger.debug(`Mock: Getting conversation ${id}`, 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockConversations.find(conv => conv.id === id) || null;
  },

  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    logger.debug('Mock: Creating conversation', 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newConversation: Conversation = {
      id: Math.random().toString(36).substr(2, 9),
      type: input.type,
      title: input.title,
      participants: input.participant_ids.map(userId => ({
        id: Math.random().toString(36).substr(2, 9),
        conversation_id: '',
        user_id: userId,
        role: 'member' as const,
        is_muted: false,
        joined_at: new Date().toISOString(),
        is_active: true,
        user: {
          id: userId,
          name: `User ${userId}`,
          email: `user${userId}@example.com`,
          avatar_url: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })),
      unread_count: 0,
      is_archived: false,
      is_muted: false,
      metadata: input.metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    newConversation.participants.forEach(p => p.conversation_id = newConversation.id);
    mockConversations.push(newConversation);
    return newConversation;
  },

  async archiveConversation(id: string): Promise<void> {
    logger.debug(`Mock: Archiving conversation ${id}`, 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 50));
    const conv = mockConversations.find(c => c.id === id);
    if (conv) {
      conv.is_archived = true;
    }
  },

  async markConversationAsRead(id: string): Promise<void> {
    logger.debug(`Mock: Marking conversation ${id} as read`, 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 50));
    const conv = mockConversations.find(c => c.id === id);
    if (conv) {
      conv.unread_count = 0;
    }
  },

  // =============================================
  // MESSAGES - Mock Implementation
  // =============================================

  async getMessages(filters: MessageFilters): Promise<Message[]> {
    logger.debug('Mock: Getting messages', 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockMessages.filter(msg => {
      if (msg.conversation_id !== filters.conversation_id) return false;
      if (filters.search && !msg.content.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.message_type && msg.message_type !== filters.message_type) {
        return false;
      }
      return true;
    });
  },

  async sendMessage(input: SendMessageInput): Promise<Message> {
    logger.debug('Mock: Sending message', 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      conversation_id: input.conversation_id,
      sender_id: 'current-user-id', // In real implementation, get from auth
      content: input.content,
      sender: {
        id: 'current-user-id',
        name: 'Current User',
        email: 'current@example.com',
        avatar_url: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      message_type: input.message_type,
      parent_message_id: input.parent_message_id,
      attachments: [],
      reactions: [],
      metadata: input.metadata || {},
      is_edited: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockMessages.push(newMessage);
    return newMessage;
  },

  async updateMessage(input: UpdateMessageInput): Promise<Message> {
    logger.debug(`Mock: Updating message ${input.id}`, 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const message = mockMessages.find(m => m.id === input.id);
    if (!message) {
      throw new Error('Message not found');
    }
    
    message.content = input.content;
    message.is_edited = true;
    message.updated_at = new Date().toISOString();
    
    return message;
  },

  async deleteMessage(id: string): Promise<void> {
    logger.debug(`Mock: Deleting message ${id}`, 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const message = mockMessages.find(m => m.id === id);
    if (message) {
      message.is_deleted = true;
      message.content = '[Message deleted]';
      message.updated_at = new Date().toISOString();
    }
  },

  // =============================================
  // REACTIONS - Mock Implementation
  // =============================================

  async addReaction(messageId: string, reaction: string): Promise<MessageReaction> {
    logger.debug(`Mock: Adding reaction ${reaction} to message ${messageId}`, 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const newReaction: MessageReaction = {
      id: Math.random().toString(36).substr(2, 9),
      message_id: messageId,
      user_id: 'current-user-id',
      reaction,
      created_at: new Date().toISOString(),
      user: {
        id: 'current-user-id',
        name: 'Current User',
        email: 'current@example.com',
        avatar_url: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    mockReactions.push(newReaction);
    return newReaction;
  },

  async removeReaction(messageId: string, reaction: string): Promise<void> {
    logger.debug(`Mock: Removing reaction ${reaction} from message ${messageId}`, 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const index = mockReactions.findIndex(r => 
      r.message_id === messageId && 
      r.reaction === reaction && 
      r.user_id === 'current-user-id'
    );
    
    if (index > -1) {
      mockReactions.splice(index, 1);
    }
  },

  // =============================================
  // UTILITY - Mock Implementation
  // =============================================

  async getUnreadCount(userId?: string): Promise<number> {
    logger.debug('Mock: Getting unread count', 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockConversations.reduce((total, conv) => total + (conv.unread_count || 0), 0);
  },

  async getBlockedUsers(): Promise<BlockedUser[]> {
    logger.debug('Mock: Getting blocked users', 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockBlockedUsers;
  },

  async blockUser(userId: string, reason?: string): Promise<void> {
    logger.debug(`Mock: Blocking user ${userId}`, 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const blockedUser: BlockedUser = {
      id: Math.random().toString(36).substr(2, 9),
      blocker_id: 'current-user-id',
      blocked_id: userId,
      reason,
      created_at: new Date().toISOString(),
      blocked_user: {
        id: userId,
        name: `User ${userId}`,
        email: `user${userId}@example.com`,
        avatar_url: undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    mockBlockedUsers.push(blockedUser);
  },

  async unblockUser(userId: string): Promise<void> {
    logger.debug(`Mock: Unblocking user ${userId}`, 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const index = mockBlockedUsers.findIndex(b => b.blocked_id === userId);
    if (index > -1) {
      mockBlockedUsers.splice(index, 1);
    }
  },

  // =============================================
  // SPECIALIZED THREAD CREATION - Mock Implementation
  // =============================================

  async createMarketplaceThread(input: CreateMarketplaceThreadInput): Promise<MessageThread> {
    logger.debug('Mock: Creating marketplace thread', 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const conversation = await this.createConversation({
      type: 'marketplace',
      title: `${input.itemTitle} - Marketplace Inquiry`,
      participant_ids: [input.sellerId, input.buyerId],
      metadata: {
        marketplace_item_id: input.itemId,
        item_title: input.itemTitle,
        item_price: input.itemPrice
      },
      initial_message: input.initialMessage
    });

    return {
      id: conversation.id,
      conversation_id: conversation.id,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at
    };
  },

  async createOpportunityThread(input: CreateOpportunityThreadInput): Promise<MessageThread> {
    logger.debug('Mock: Creating opportunity thread', 'MESSAGING_API');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const conversation = await this.createConversation({
      type: 'opportunity',
      title: `${input.opportunityTitle} - Application`,
      participant_ids: [input.recruiterId, input.applicantId],
      metadata: {
        opportunity_id: input.opportunityId,
        opportunity_title: input.opportunityTitle,
        company_id: input.companyId
      },
      initial_message: input.initialMessage
    });

    return {
      id: conversation.id,
      conversation_id: conversation.id,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at
    };
  }
};