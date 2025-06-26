import { useState, useEffect } from 'react';
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { cn } from '@/utils/cn';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { EntityType, Comment } from './types';

interface CommentsListProps {
  entityType: EntityType;
  entityId: string;
  className?: string;
  showToggle?: boolean;
  defaultExpanded?: boolean;
}

export function CommentsList({
  entityType,
  entityId,
  className,
  showToggle = true,
  defaultExpanded = false
}: CommentsListProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    fetchComments();
  }, [entityType, entityId]);

  const fetchComments = async () => {
    setIsLoading(true);
    
    try {
      // Fetch comments with user/member data
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id (
            id,
            email,
            raw_user_meta_data
          ),
          member:members!comments_user_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .eq('is_deleted', false)
        .is('parent_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch replies for each comment
      const commentsWithReplies = await Promise.all(
        (commentsData || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from('comments')
            .select(`
              *,
              user:user_id (
                id,
                email,
                raw_user_meta_data
              ),
              member:members!comments_user_id_fkey (
                id,
                name,
                avatar_url
              )
            `)
            .eq('parent_id', comment.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

          return {
            ...comment,
            replies: replies || []
          };
        })
      );

      setComments(commentsWithReplies);
      
      // Calculate total comment count including replies
      const totalCount = commentsWithReplies.reduce(
        (sum, comment) => sum + 1 + (comment.replies?.length || 0),
        0
      );
      setCommentCount(totalCount);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentAdded = () => {
    fetchComments();
    setShowCommentForm(false);
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments(prevComments => 
      prevComments
        .filter(c => c.id !== commentId)
        .map(c => ({
          ...c,
          replies: c.replies?.filter(r => r.id !== commentId) || []
        }))
    );
    setCommentCount(prev => Math.max(0, prev - 1));
  };

  if (showToggle && !isExpanded) {
    return (
      <div className={cn('border-t dark:border-gray-800', className)}>
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(true)}
          className="w-full justify-between py-4 text-left"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span>Comments ({commentCount})</span>
          </div>
          <ChevronDown className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('border-t dark:border-gray-800', className)}>
      {showToggle && (
        <div className="flex items-center justify-between py-4">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Comments ({commentCount})</span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
          {user && !showCommentForm && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowCommentForm(true)}
            >
              Add Comment
            </Button>
          )}
        </div>
      )}

      {(isExpanded || !showToggle) && (
        <div className="space-y-4 pb-4">
          {showCommentForm && (
            <div className="mb-4">
              <CommentForm
                entityType={entityType}
                entityId={entityId}
                onSuccess={handleCommentAdded}
                onCancel={() => setShowCommentForm(false)}
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
              {user && !showCommentForm && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowCommentForm(true)}
                  className="mt-4"
                >
                  Add Comment
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  entityType={entityType}
                  entityId={entityId}
                  onDeleted={handleCommentDeleted}
                  onReplyAdded={fetchComments}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}