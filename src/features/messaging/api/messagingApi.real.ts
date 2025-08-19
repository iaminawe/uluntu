import { supabase } from '@/lib/supabase';
import {
  Conversation,
  Message,
  MessageReaction,
  CreateConversationInput,
  SendMessageInput,
  UpdateMessageInput,
  ConversationFilters,
  MessageFilters,
  CreateMarketplaceThreadInput,
  CreateOpportunityThreadInput
} from '../types';

class MessagingApiReal {
  /**
   * Get current user's member ID
   */
  private async getCurrentMemberId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!member) throw new Error('User does not have a member profile');
    return member.id;
  }
  /**
   * Get conversations for the current user
   */
  async getConversations(filters?: ConversationFilters): Promise<Conversation[]> {
    const memberId = await this.getCurrentMemberId();

    let query = supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants!inner(
          user_id,
          last_read_message_id,
          notifications_enabled
        ),
        messages(
          id,
          content,
          created_at,
          sender_id
        )
      `)
      .eq('conversation_participants.user_id', memberId)
      .order('updated_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.archived !== undefined) {
      query = query.eq('archived', filters.archived);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  /**
   * Get a single conversation by ID
   */
  async getConversation(id: string): Promise<Conversation | null> {
    const memberId = await this.getCurrentMemberId();

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants(
          user_id,
          role,
          last_read_message_id,
          notifications_enabled
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    // Check if user is a participant
    const isParticipant = data?.conversation_participants?.some(
      (p: any) => p.user_id === memberId
    );
    
    if (!isParticipant) {
      throw new Error('User is not a participant in this conversation');
    }

    return data;
  }

  /**
   * Create a new conversation
   */
  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    const memberId = await this.getCurrentMemberId();

    // Use the database function for creating direct conversations
    if (input.type === 'direct' && input.participant_ids.length === 1) {
      // First validate that the recipient exists in members table
      const { data: recipientMember, error: recipientError } = await supabase
        .from('members')
        .select('id, user_id')
        .eq('id', input.participant_ids[0])
        .single();
      
      if (recipientError || !recipientMember) {
        throw new Error(`Recipient member not found: ${recipientError?.message || 'Unknown error'}`);
      }

      const { data, error } = await supabase
        .rpc('create_direct_conversation', {
          other_user_id: input.participant_ids[0],
          initial_message: input.initial_message || null
        });

      if (error) throw error;
      return data;
    }

    // For group conversations, create manually
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        type: input.type,
        name: input.name,
        description: input.description,
        created_by: memberId
      })
      .select()
      .single();

    if (convError) throw convError;

    // Add participants
    const participants = [memberId, ...input.participant_ids].map(userId => ({
      conversation_id: conversation.id,
      user_id: userId,
      role: userId === memberId ? 'admin' : 'member'
    }));

    const { error: partError } = await supabase
      .from('conversation_participants')
      .insert(participants);

    if (partError) throw partError;

    // Send initial message if provided
    if (input.initial_message) {
      await this.sendMessage({
        conversation_id: conversation.id,
        content: input.initial_message
      });
    }

    return conversation;
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, filters?: MessageFilters): Promise<Message[]> {
    const memberId = await this.getCurrentMemberId();

    // Verify user is participant
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', memberId)
      .single();

    if (!participant) {
      throw new Error('User is not a participant in this conversation');
    }

    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        ),
        reactions:message_reactions(
          id,
          emoji,
          user_id,
          created_at
        ),
        attachments:message_attachments(
          id,
          file_name,
          file_size,
          mime_type,
          url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  /**
   * Send a message
   */
  async sendMessage(input: SendMessageInput): Promise<Message> {
    const memberId = await this.getCurrentMemberId();

    // Verify user is participant
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', input.conversation_id)
      .eq('user_id', memberId)
      .single();

    if (!participant) {
      throw new Error('User is not a participant in this conversation');
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: input.conversation_id,
        sender_id: memberId,
        content: input.content,
        parent_message_id: input.parent_message_id
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    // Update conversation's updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', input.conversation_id);

    return data;
  }

  /**
   * Update a message
   */
  async updateMessage(id: string, input: UpdateMessageInput): Promise<Message> {
    const memberId = await this.getCurrentMemberId();

    // Verify user is the sender
    const { data: message } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', id)
      .single();

    if (!message || message.sender_id !== memberId) {
      throw new Error('You can only edit your own messages');
    }

    const { data, error } = await supabase
      .from('messages')
      .update({
        content: input.content,
        edited: true,
        edited_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a message
   */
  async deleteMessage(id: string): Promise<void> {
    const memberId = await this.getCurrentMemberId();

    // Verify user is the sender
    const { data: message } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('id', id)
      .single();

    if (!message || message.sender_id !== memberId) {
      throw new Error('You can only delete your own messages');
    }

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Mark conversation as read
   */
  async markConversationAsRead(conversationId: string): Promise<void> {
    const memberId = await this.getCurrentMemberId();

    const { error } = await supabase
      .rpc('mark_conversation_as_read', {
        conversation_uuid: conversationId
      });

    if (error) throw error;
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<number> {
    const memberId = await this.getCurrentMemberId();

    const { data, error } = await supabase
      .rpc('get_unread_message_count');

    if (error) throw error;
    return data || 0;
  }

  /**
   * Create marketplace thread
   */
  async createMarketplaceThread(input: CreateMarketplaceThreadInput): Promise<Conversation> {
    const conversation = await this.createConversation({
      type: 'direct',
      participant_ids: [input.seller_id],
      initial_message: input.initial_message
    });

    // Link to marketplace listing
    await supabase
      .from('message_marketplace_contexts')
      .insert({
        conversation_id: conversation.id,
        listing_id: input.listing_id
      });

    return conversation;
  }

  /**
   * Create opportunity thread
   */
  async createOpportunityThread(input: CreateOpportunityThreadInput): Promise<Conversation> {
    const conversation = await this.createConversation({
      type: 'direct',
      participant_ids: [input.employer_id],
      initial_message: input.initial_message
    });

    // Link to opportunity
    await supabase
      .from('message_opportunity_contexts')
      .insert({
        conversation_id: conversation.id,
        opportunity_id: input.opportunity_id
      });

    return conversation;
  }
}

export const messagingApi = new MessagingApiReal();