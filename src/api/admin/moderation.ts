import { supabase } from '@/lib/supabase';
import { ModerationItem } from '@/types/admin';

export const adminModerationApi = {
  // Get moderation queue
  async getModerationQueue(filters?: {
    status?: 'pending' | 'approved' | 'rejected';
    entityType?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('moderation_queue')
      .select('*, submitted_by_user:auth.users!submitted_by(email)', { count: 'exact' });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(
        filters?.offset || 0,
        (filters?.offset || 0) + (filters?.limit || 20) - 1
      );

    const { data, error, count } = await query;

    if (error) throw error;
    return { data: data as ModerationItem[], count };
  },

  // Get single moderation item
  async getModerationItem(itemId: string) {
    const { data, error } = await supabase
      .from('moderation_queue')
      .select(`
        *,
        submitted_by_user:auth.users!submitted_by(email),
        reviewed_by_user:auth.users!reviewed_by(email)
      `)
      .eq('id', itemId)
      .single();

    if (error) throw error;
    return data as ModerationItem;
  },

  // Submit content for moderation
  async submitForModeration(
    entityType: ModerationItem['entity_type'],
    entityId: string,
    actionType: ModerationItem['action_type'],
    content: Record<string, any>
  ) {
    const { data, error } = await supabase
      .from('moderation_queue')
      .insert({
        entity_type: entityType,
        entity_id: entityId,
        action_type: actionType,
        content,
        submitted_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) throw error;
    return data as ModerationItem;
  },

  // Approve moderation item
  async approveItem(itemId: string, notes?: string) {
    const { data: item } = await this.getModerationItem(itemId);
    if (!item) throw new Error('Moderation item not found');

    // Update moderation queue
    const { error } = await supabase
      .from('moderation_queue')
      .update({
        status: 'approved',
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        review_notes: notes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (error) throw error;

    // Apply the approved change
    await this.applyModerationAction(item);
    
    return true;
  },

  // Reject moderation item
  async rejectItem(itemId: string, notes: string) {
    const { error } = await supabase
      .from('moderation_queue')
      .update({
        status: 'rejected',
        reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        review_notes: notes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (error) throw error;
    return true;
  },

  // Apply approved moderation action
  private async applyModerationAction(item: ModerationItem) {
    const { entity_type, entity_id, action_type, content } = item;

    switch (action_type) {
      case 'create':
        await supabase.from(entity_type).insert(content);
        break;
      
      case 'update':
        await supabase
          .from(entity_type)
          .update(content)
          .eq('id', entity_id);
        break;
      
      case 'delete':
        await supabase
          .from(entity_type)
          .delete()
          .eq('id', entity_id);
        break;
    }
  },

  // Get moderation stats
  async getModerationStats() {
    const { data: pending } = await supabase
      .from('moderation_queue')
      .select('entity_type', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { data: stats } = await supabase
      .from('moderation_queue')
      .select('entity_type, status')
      .order('created_at', { ascending: false })
      .limit(100);

    const statsByType = stats?.reduce((acc, item) => {
      if (!acc[item.entity_type]) {
        acc[item.entity_type] = { pending: 0, approved: 0, rejected: 0 };
      }
      acc[item.entity_type][item.status]++;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    return {
      totalPending: pending?.length || 0,
      byType: statsByType || {}
    };
  }
};