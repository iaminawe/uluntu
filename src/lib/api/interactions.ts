import { supabase } from '@/lib/supabase';
import type { EntityType, Like, Comment } from '@/components/interactions/types';

export const interactionsApi = {
  // Likes
  async getLikes(entityType: EntityType, entityId: string) {
    const { data, error, count } = await supabase
      .from('likes')
      .select('*', { count: 'exact' })
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    return { data, error, count };
  },

  async getUserLike(userId: string, entityType: EntityType, entityId: string) {
    const { data, error } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .single();

    return { data, error };
  },

  async createLike(userId: string, entityType: EntityType, entityId: string) {
    const { data, error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId
      })
      .select()
      .single();

    return { data, error };
  },

  async deleteLike(userId: string, entityType: EntityType, entityId: string) {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);

    return { error };
  },

  // Comments
  async getComments(entityType: EntityType, entityId: string, parentId?: string) {
    let query = supabase
      .from('comments')
      .select(`
        *
      `)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .eq('is_deleted', false);

    if (parentId === null) {
      query = query.is('parent_id', null);
    } else if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async createComment(
    userId: string,
    entityType: EntityType,
    entityId: string,
    content: string,
    parentId?: string
  ) {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        content: content.trim(),
        parent_id: parentId
      })
      .select(`
        *
      `)
      .single();

    return { data, error };
  },

  async updateComment(commentId: string, userId: string, content: string) {
    const { data, error } = await supabase
      .from('comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .eq('user_id', userId)
      .select(`
        *
      `)
      .single();

    return { data, error };
  },

  async deleteComment(commentId: string, userId: string) {
    const { error } = await supabase
      .from('comments')
      .update({ is_deleted: true })
      .eq('id', commentId)
      .eq('user_id', userId);

    return { error };
  },

  // Admin functions
  async deleteCommentAsAdmin(commentId: string) {
    const { error } = await supabase
      .from('comments')
      .update({ is_deleted: true })
      .eq('id', commentId);

    return { error };
  },

  // Get interaction counts for multiple entities
  async getInteractionCounts(entityType: EntityType, entityIds: string[]) {
    const { data: likes, error: likesError } = await supabase
      .from('likes')
      .select('entity_id')
      .eq('entity_type', entityType)
      .in('entity_id', entityIds);

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('entity_id')
      .eq('entity_type', entityType)
      .in('entity_id', entityIds)
      .eq('is_deleted', false);

    if (likesError || commentsError) {
      return { error: likesError || commentsError };
    }

    // Count interactions per entity
    const likeCounts: Record<string, number> = {};
    const commentCounts: Record<string, number> = {};

    likes?.forEach(like => {
      likeCounts[like.entity_id] = (likeCounts[like.entity_id] || 0) + 1;
    });

    comments?.forEach(comment => {
      commentCounts[comment.entity_id] = (commentCounts[comment.entity_id] || 0) + 1;
    });

    return {
      data: entityIds.map(id => ({
        entity_id: id,
        like_count: likeCounts[id] || 0,
        comment_count: commentCounts[id] || 0
      })),
      error: null
    };
  }
};