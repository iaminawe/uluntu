import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { EntityType, Like, Comment } from '@/components/interactions/types';

interface UseInteractionsOptions {
  entityType: EntityType;
  entityId: string;
}

export function useInteractions({ entityType, entityId }: UseInteractionsOptions) {
  const { user } = useAuth();
  const [likes, setLikes] = useState<Like[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInteractions();
  }, [entityType, entityId, user]);

  const fetchInteractions = async () => {
    setIsLoading(true);
    
    try {
      // Fetch likes
      const { data: likesData, count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact' })
        .eq('entity_type', entityType)
        .eq('entity_id', entityId);

      if (likesData) {
        setLikes(likesData);
        setLikeCount(likesCount || 0);
        
        if (user) {
          setIsLiked(likesData.some(like => like.user_id === user.id));
        }
      }

      // Fetch comments count
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('is_deleted', false);

      setCommentCount(commentsCount || 0);
    } catch (error) {
      console.error('Error fetching interactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!user) return { error: 'User not authenticated' };

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('entity_type', entityType)
          .eq('entity_id', entityId);

        if (!error) {
          setIsLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
        }
        return { error };
      } else {
        const { data, error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            entity_type: entityType,
            entity_id: entityId
          })
          .select()
          .single();

        if (!error && data) {
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
        }
        return { data, error };
      }
    } catch (error) {
      return { error };
    }
  };

  const addComment = async (content: string, parentId?: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          entity_type: entityType,
          entity_id: entityId,
          parent_id: parentId,
          content: content.trim()
        })
        .select()
        .single();

      if (!error && data) {
        setCommentCount(prev => prev + 1);
      }

      return { data, error };
    } catch (error) {
      return { error };
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      // @ts-ignore - comments table doesn't exist in types yet
      const { data, error } = await supabase
        .from('comments')
        .update({ 
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user.id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { error };
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      // @ts-ignore - comments table doesn't exist in types yet
      const { error } = await supabase
        .from('comments')
        .update({ is_deleted: true })
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (!error) {
        setCommentCount(prev => Math.max(0, prev - 1));
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  return {
    likes,
    comments,
    isLiked,
    likeCount,
    commentCount,
    isLoading,
    toggleLike,
    addComment,
    updateComment,
    deleteComment,
    refetch: fetchInteractions
  };
}