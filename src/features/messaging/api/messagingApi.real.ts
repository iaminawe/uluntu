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
  CreateOpportunityThreadInput,
  UpdateConversationInput,
  DeleteConversationInput
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

    // First get conversation IDs user participates in
    const { data: participantData, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', memberId)
      .is('left_at', null);

    if (participantError) throw participantError;

    if (!participantData || participantData.length === 0) {
      return [];
    }

    const conversationIds = participantData.map(p => p.conversation_id);

    // Then get conversations with details
    let query = supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants(
          user_id,
          last_read_message_id,
          notification_settings
        ),
        messages(
          id,
          content,
          created_at,
          sender_id
        )
      `)
      .in('id', conversationIds)
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
   * Get a single conversation by ID with secure access
   */
  async getConversation(id: string): Promise<Conversation | null> {
    try {
      // Validate ID is a string
      if (typeof id !== 'string' || !id.trim()) {
        throw new Error('Invalid conversation ID provided');
      }

      // First attempt: Use secure database function
      const { data: secureData, error: secureError } = await supabase
        .rpc('get_conversation_secure', {
          conversation_id: id
        });

      if (secureData && !secureError) {
        // Get additional participant information
        const { data: participants, error: partError } = await supabase
          .from('conversation_participants')
          .select(`
            id,
            user_id,
            role,
            joined_at,
            left_at,
            last_read_message_id,
            notification_settings,
            member:members(
              id,
              name,
              email,
              avatar_url
            )
          `)
          .eq('conversation_id', id)
          .is('left_at', null);

        return {
          ...secureData,
          participants: participants || []
        };
      }

      // Fallback: Try traditional approach with better error handling
      const memberId = await this.getCurrentMemberId();

      // Check participant status using our secure function
      const participantInfo = await this.checkParticipantStatus(id);
      
      if (!participantInfo.isParticipant && !participantInfo.isCreator) {
        return null; // User doesn't have access
      }

      // Get conversation with minimal data to avoid 406 errors
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          title,
          type,
          created_by,
          created_at,
          updated_at,
          archived_at
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        
        // Handle 406 errors by trying without .single()
        if (error.code === 'PGRST106') {
          const { data: arrayData, error: arrayError } = await supabase
            .from('conversations')
            .select(`
              id,
              title,
              type,
              created_by,
              created_at,
              updated_at,
              archived_at
            `)
            .eq('id', id);

          if (arrayError || !arrayData || arrayData.length === 0) {
            return null;
          }

          const conversation = arrayData[0];
          
          // Get participants separately to avoid complex joins
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select(`
              id,
              user_id,
              role,
              joined_at,
              left_at,
              last_read_message_id,
              notification_settings,
              member:members(
                id,
                name,
                email,
                avatar_url
              )
            `)
            .eq('conversation_id', id)
            .is('left_at', null);

          return {
            ...conversation,
            participants: participants || []
          };
        }
        
        throw error;
      }

      // Get participants separately
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select(`
          id,
          user_id,
          role,
          joined_at,
          left_at,
          last_read_message_id,
          notification_settings,
          member:members(
            id,
            name,
            email,
            avatar_url
          )
        `)
        .eq('conversation_id', id)
        .is('left_at', null);

      return {
        ...data,
        participants: participants || []
      };
    } catch (error) {
      console.error('Error getting conversation:', error);
      
      // Handle authorization errors gracefully
      if (error.message?.includes('not authorized') || error.message?.includes('access')) {
        return null;
      }
      
      throw error;
    }
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

      // If force_new is true, always create a new conversation
      // Otherwise, check for existing conversation first
      if (!input.force_new) {
        // Check if there's an existing conversation with this user
        const existingConv = await this.findExistingConversation(input.participant_ids[0]);
        if (existingConv) {
          console.log('Using existing conversation:', existingConv.id);
          return existingConv;
        }
      }

      // Create conversation using RPC function
      try {
        // First, try the enhanced version with force_new parameter (if it exists)
        const { data, error } = await supabase
          .rpc('create_direct_conversation', {
            other_user_id: input.participant_ids[0],
            initial_message: input.initial_message && input.initial_message.trim() ? input.initial_message.trim() : null,
            force_new: input.force_new || false
          });

        if (error) {
          // If the enhanced version doesn't exist (missing force_new parameter),
          // fall back to the basic version
          if (error.code === 'PGRST202' || error.message?.includes('force_new')) {
            console.warn('Enhanced create_direct_conversation not found, using basic version');
            
            // For force_new with basic version, we need a workaround
            if (input.force_new) {
              // Add timestamp to message to make it unique
              const uniqueMessage = input.initial_message 
                ? `${input.initial_message} [${new Date().toISOString()}]`
                : `New conversation started at ${new Date().toISOString()}`;
              
              const { data: fallbackData, error: fallbackError } = await supabase
                .rpc('create_direct_conversation', {
                  other_user_id: input.participant_ids[0],
                  initial_message: uniqueMessage
                });
              
              if (fallbackError) throw fallbackError;
              
              console.log('Created conversation (basic RPC):', fallbackData.id);
              return fallbackData;
            } else {
              // Non-force_new, use basic version normally
              const { data: fallbackData, error: fallbackError } = await supabase
                .rpc('create_direct_conversation', {
                  other_user_id: input.participant_ids[0],
                  initial_message: input.initial_message && input.initial_message.trim() ? input.initial_message.trim() : null
                });
              
              if (fallbackError) throw fallbackError;
              return fallbackData;
            }
          }
          
          throw error;
        }
        
        console.log('Created conversation:', data.id, 'force_new:', input.force_new);
        return data;
      } catch (error: any) {
        console.error('Conversation creation failed:', error);
        throw new Error('Unable to create conversation. Please try again.');
      }
    }

    // For group conversations, we can't create manually due to RLS
    // This would require a proper database function for group conversations
    throw new Error('Group conversation creation is not currently supported due to database restrictions. Please contact support.');
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, filters?: MessageFilters): Promise<Message[]> {
    const memberId = await this.getCurrentMemberId();

    // Validate conversation ID is a string
    if (typeof conversationId !== 'string' || !conversationId.trim()) {
      throw new Error('Invalid conversation ID provided');
    }

    // Verify user is participant
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .eq('user_id', memberId)
      .is('left_at', null)
      .single();

    if (participantError && participantError.code !== 'PGRST116') {
      throw participantError;
    }

    if (!participant) {
      throw new Error('User is not a participant in this conversation');
    }

    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:members!messages_sender_id_fkey(
          id,
          name,
          image
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
        sender:members!messages_sender_id_fkey(
          id,
          name,
          image
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

  // /**
  //  * Delete a conversation (soft delete - removes user from participants)
  //  * @deprecated - Use the deleteConversation method with DeleteConversationInput parameter
  //  */
  // async deleteConversation(id: string): Promise<void> {
  //   const memberId = await this.getCurrentMemberId();

  //   // Verify user is a participant
  //   const { data: participant } = await supabase
  //     .from('conversation_participants')
  //     .select('user_id, role')
  //     .eq('conversation_id', id)
  //     .eq('user_id', memberId)
  //     .is('left_at', null)
  //     .single();

  //   if (!participant) {
  //     throw new Error('You are not a participant in this conversation');
  //   }

  //   // Soft delete by setting left_at timestamp
  //   const { error } = await supabase
  //     .from('conversation_participants')
  //     .update({ left_at: new Date().toISOString() })
  //     .eq('conversation_id', id)
  //     .eq('user_id', memberId);

  //   if (error) {
  //     console.error('Error deleting conversation:', error);
  //     throw new Error('Failed to delete conversation. Please try again.');
  //   }
  // }

  // /**
  //  * Delete multiple conversations (bulk delete)
  //  * @deprecated - Use the deleteConversations method with conversationIds parameter
  //  */
  // async deleteConversations(ids: string[]): Promise<void> {
  //   const memberId = await this.getCurrentMemberId();

  //   // Verify user is a participant in all conversations
  //   const { data: participants, error: checkError } = await supabase
  //     .from('conversation_participants')
  //     .select('conversation_id')
  //     .in('conversation_id', ids)
  //     .eq('user_id', memberId)
  //     .is('left_at', null);

  //   if (checkError) {
  //     console.error('Error checking conversation participants:', checkError);
  //     throw new Error('Failed to verify conversation access');
  //   }

  //   const accessibleIds = participants?.map(p => p.conversation_id) || [];
  //   const inaccessibleCount = ids.length - accessibleIds.length;

  //   if (inaccessibleCount > 0) {
  //     throw new Error(`Cannot delete ${inaccessibleCount} conversation(s) - access denied`);
  //   }

  //   // Bulk soft delete
  //   const { error } = await supabase
  //     .from('conversation_participants')
  //     .update({ left_at: new Date().toISOString() })
  //     .in('conversation_id', accessibleIds)
  //     .eq('user_id', memberId);

  //   if (error) {
  //     console.error('Error bulk deleting conversations:', error);
  //     throw new Error('Failed to delete conversations. Please try again.');
  //   }
  // }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId?: string): Promise<number> {
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
      participant_ids: [input.sellerId],
      initial_message: input.initialMessage
    });

    // Link to marketplace listing
    await supabase
      .from('message_marketplace_contexts')
      .insert({
        conversation_id: conversation.id,
        listing_id: input.itemId
      });

    return conversation;
  }

  /**
   * Create opportunity thread
   */
  async createOpportunityThread(input: CreateOpportunityThreadInput): Promise<Conversation> {
    const conversation = await this.createConversation({
      type: 'direct',
      participant_ids: [input.recruiterId],
      initial_message: input.initialMessage
    });

    // Link to opportunity
    await supabase
      .from('message_opportunity_contexts')
      .insert({
        conversation_id: conversation.id,
        opportunity_id: input.opportunityId
      });

    return conversation;
  }

  /**
   * Update conversation details
   */
  async updateConversation(id: string, updates: UpdateConversationInput): Promise<Conversation> {
    try {
      // First attempt: Use secure database function for title updates
      if (updates.title !== undefined) {
        const { data, error } = await supabase
          .rpc('update_conversation_title', {
            conversation_id: id,
            new_title: updates.title
          });

        if (error) {
          // If function doesn't exist, use fallback immediately
          if (error.code === 'PGRST202' || error.message?.includes('does not exist')) {
            console.warn('update_conversation_title function not found, using fallback');
            return await this.updateConversationFallback(id, updates);
          }
          
          console.error('Database function update failed:', error);
          
          // For other errors, check permissions and use fallback
          const participantInfo = await this.checkParticipantStatus(id);
          if (!participantInfo.canUpdate) {
            throw new Error('You do not have permission to update this conversation');
          }
          
          // Fallback: Try direct update with error handling
          return await this.updateConversationFallback(id, updates);
        }

        return data;
      }

      // For other updates, use fallback method
      return await this.updateConversationFallback(id, updates);
    } catch (error) {
      console.error('Conversation update error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('not authorized') || error.message?.includes('permission')) {
        throw new Error('You do not have permission to update this conversation');
      }
      
      if (error.message?.includes('not found')) {
        throw new Error('Conversation not found');
      }
      
      // Handle RLS errors with user-friendly message
      if (error.code === '42501' || error.message?.includes('RLS')) {
        throw new Error('Unable to update conversation due to security restrictions. Please try again or contact support.');
      }
      
      // Handle 406 errors (multiple/no rows)
      if (error.code === 'PGRST106' || error.message?.includes('JSON object requested')) {
        console.warn('406 error detected, attempting participant verification');
        const participantInfo = await this.checkParticipantStatus(id);
        if (!participantInfo.canUpdate) {
          throw new Error('You do not have permission to update this conversation');
        }
        throw new Error('Conversation update temporarily unavailable. Please try again.');
      }
      
      throw error;
    }
  }

  /**
   * Fallback method for conversation updates
   */
  private async updateConversationFallback(id: string, updates: UpdateConversationInput): Promise<Conversation> {
    const memberId = await this.getCurrentMemberId();

    // Verify participant status using database function
    const participantInfo = await this.checkParticipantStatus(id);
    
    if (!participantInfo.isParticipant && !participantInfo.isCreator) {
      throw new Error('You are not authorized to update this conversation');
    }

    // Prepare update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.title !== undefined) {
      updateData.title = updates.title;
    }

    if (updates.archived !== undefined) {
      updateData.archived_at = updates.archived ? new Date().toISOString() : null;
    }

    // Try direct update with minimal selection to avoid 406 errors
    const { data, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', id)
      .select('id, title, type, created_by, updated_at, archived_at')
      .single();

    if (error) {
      console.error('Fallback update failed:', error);
      
      // If still failing, try without .single() to avoid 406 errors
      const { data: arrayData, error: arrayError } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', id)
        .select('id, title, type, created_by, updated_at, archived_at');

      if (arrayError) {
        throw arrayError;
      }

      if (!arrayData || arrayData.length === 0) {
        throw new Error('Conversation not found or update failed');
      }

      if (arrayData.length > 1) {
        console.warn('Multiple conversations returned, using first one');
      }

      return arrayData[0] as Conversation;
    }
    
    return data;
  }

  /**
   * Check participant status using secure database function or fallback
   */
  private async checkParticipantStatus(conversationId: string): Promise<{
    isParticipant: boolean;
    isCreator: boolean;
    role: string | null;
    canUpdate: boolean;
  }> {
    try {
      // Try to use the secure database function first
      const { data, error } = await supabase
        .rpc('check_conversation_participant', {
          conversation_id: conversationId
        });

      if (error) {
        // If function doesn't exist, use fallback method
        if (error.code === 'PGRST202' || error.message?.includes('does not exist')) {
          console.warn('check_conversation_participant function not found, using fallback');
          return await this.checkParticipantStatusFallback(conversationId);
        }
        
        console.error('Participant check failed:', error);
        return {
          isParticipant: false,
          isCreator: false,
          role: null,
          canUpdate: false
        };
      }

      const info = data || {};
      return {
        isParticipant: info.is_participant || false,
        isCreator: info.is_creator || false,
        role: info.role || null,
        canUpdate: (info.is_participant && ['admin', 'moderator'].includes(info.role)) || info.is_creator || false
      };
    } catch (error) {
      console.error('Error checking participant status:', error);
      // Use fallback on any error
      return await this.checkParticipantStatusFallback(conversationId);
    }
  }

  /**
   * Fallback method to check participant status without database function
   */
  private async checkParticipantStatusFallback(conversationId: string): Promise<{
    isParticipant: boolean;
    isCreator: boolean;
    role: string | null;
    canUpdate: boolean;
  }> {
    try {
      const memberId = await this.getCurrentMemberId();
      
      // Check if user is a participant
      const { data: participant } = await supabase
        .from('conversation_participants')
        .select('role')
        .eq('conversation_id', conversationId)
        .eq('user_id', memberId)
        .is('left_at', null)
        .single();

      // Check if user is the creator
      const { data: conversation } = await supabase
        .from('conversations')
        .select('created_by')
        .eq('id', conversationId)
        .single();

      const isParticipant = !!participant;
      const isCreator = conversation?.created_by === memberId;
      const role = participant?.role || null;
      const canUpdate = isCreator || (isParticipant && ['admin', 'moderator'].includes(role || ''));

      return {
        isParticipant,
        isCreator,
        role,
        canUpdate
      };
    } catch (error) {
      console.error('Fallback participant check failed:', error);
      return {
        isParticipant: false,
        isCreator: false,
        role: null,
        canUpdate: false
      };
    }
  }

  /**
   * Archive a conversation (soft delete)
   */
  async archiveConversation(id: string): Promise<void> {
    const { error } = await supabase
      .rpc('archive_conversation', {
        conversation_uuid: id
      });

    if (error) {
      console.error('Error archiving conversation:', error);
      throw new Error(`Failed to archive conversation: ${error.message}`);
    }
  }

  /**
   * Unarchive a conversation
   */
  async unarchiveConversation(id: string): Promise<void> {
    const { error } = await supabase
      .rpc('unarchive_conversation', {
        conversation_uuid: id
      });

    if (error) {
      console.error('Error unarchiving conversation:', error);
      throw new Error(`Failed to unarchive conversation: ${error.message}`);
    }
  }

  /**
   * Delete a conversation (soft or hard delete)
   */
  async deleteConversation(input: DeleteConversationInput): Promise<void> {
    if (input.deleteType === 'soft') {
      // Soft delete: just archive the conversation
      await this.archiveConversation(input.id);
    } else {
      // Hard delete: use database function for proper permission checking
      const { error } = await supabase
        .rpc('delete_conversation', {
          conversation_uuid: input.id,
          delete_reason: input.reason || null
        });

      if (error) {
        console.error('Error deleting conversation:', error);
        throw new Error(`Failed to delete conversation: ${error.message}`);
      }
    }
  }

  /**
   * Leave a conversation (removes user from participants)
   */
  async leaveConversation(conversationId: string): Promise<void> {
    const { error } = await supabase
      .rpc('leave_conversation', {
        conversation_uuid: conversationId
      });

    if (error) {
      console.error('Error leaving conversation:', error);
      throw new Error(`Failed to leave conversation: ${error.message}`);
    }
  }

  /**
   * Block a user from messaging
   */
  async blockUser(userId: string, reason?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('messaging_blocks')
      .insert({
        blocker_id: user.id,
        blocked_id: userId,
        reason: reason
      });

    if (error) {
      if (error.code === '23505') {
        throw new Error('User is already blocked');
      }
      throw error;
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('messaging_blocks')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', userId);

    if (error) throw error;
  }

  /**
   * Get blocked users
   */
  async getBlockedUsers(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('messaging_blocks')
      .select(`
        *,
        blocked_user:members!messaging_blocks_blocked_id_fkey(
          id,
          name,
          image
        )
      `)
      .eq('blocker_id', user.id);

    if (error) throw error;
    return data || [];
  }

  /**
   * Add reaction to message
   */
  async addReaction(messageId: string, reaction: string): Promise<MessageReaction> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: user.id,
        reaction: reaction
      })
      .select(`
        *,
        user:members!message_reactions_user_id_fkey(
          id,
          name,
          image
        )
      `)
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('You have already reacted with this emoji');
      }
      throw error;
    }

    return data;
  }

  /**
   * Remove reaction from message
   */
  async removeReaction(messageId: string, reaction: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('reaction', reaction);

    if (error) throw error;
  }

  /**
   * Check if conversation exists between users
   */
  async findExistingConversation(participantId: string): Promise<Conversation | null> {
    const memberId = await this.getCurrentMemberId();

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants!inner(
          user_id,
          left_at
        )
      `)
      .eq('type', 'direct')
      .eq('conversation_participants.user_id', memberId)
      .is('conversation_participants.left_at', null);

    if (error) throw error;

    if (!conversations || conversations.length === 0) return null;

    // Find a conversation that has both users as participants, in one query
    // rather than one per conversation.
    const { data: shared, error: sharedError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .in('conversation_id', conversations.map(c => c.id))
      .eq('user_id', participantId)
      .is('left_at', null)
      .limit(1);

    if (sharedError) throw sharedError;
    if (!shared || shared.length === 0) return null;

    return conversations.find(c => c.id === shared[0].conversation_id) ?? null;
  }


  /**
   * Delete multiple conversations (bulk operation)
   */
  async deleteConversations(conversationIds: string[]): Promise<void> {
    const memberId = await this.getCurrentMemberId();

    if (!conversationIds || conversationIds.length === 0) {
      throw new Error('No conversations provided for deletion');
    }

    // Verify user is participant in all conversations
    const { data: participants, error: participantError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .in('conversation_id', conversationIds)
      .eq('user_id', memberId)
      .is('left_at', null);

    if (participantError) {
      throw participantError;
    }

    const validConversationIds = participants?.map(p => p.conversation_id) || [];
    
    if (validConversationIds.length !== conversationIds.length) {
      const invalidIds = conversationIds.filter(id => !validConversationIds.includes(id));
      console.warn('Some conversations not found or user not participant:', invalidIds);
    }

    if (validConversationIds.length === 0) {
      throw new Error('No valid conversations found for deletion');
    }

    // Mark user as having left all conversations (bulk soft delete)
    const { error } = await supabase
      .from('conversation_participants')
      .update({ 
        left_at: new Date().toISOString(),
        is_active: false
      })
      .in('conversation_id', validConversationIds)
      .eq('user_id', memberId);

    if (error) {
      console.error('Error deleting conversations:', error);
      throw new Error('Failed to delete conversations. Please try again.');
    }
  }



  /**
   * Generate conversation title from participants
   */
  async generateConversationTitle(conversationId: string): Promise<string> {
    const memberId = await this.getCurrentMemberId();

    const { data: participants, error } = await supabase
      .from('conversation_participants')
      .select(`
        user_id,
        members:members!conversation_participants_user_id_fkey(
          name,
          user_id
        )
      `)
      .eq('conversation_id', conversationId)
      .is('left_at', null)
      .neq('user_id', memberId);

    if (error) throw error;

    if (participants && participants.length > 0) {
      const names = participants
        .map(p => p.members?.name || 'Unknown User')
        .join(', ');
      return names.length > 30 ? names.substring(0, 27) + '...' : names;
    }

    return 'Conversation';
  }
}

export const messagingApi = new MessagingApiReal();