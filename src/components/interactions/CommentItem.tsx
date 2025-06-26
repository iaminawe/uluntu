import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { cn } from '@/utils/cn';
import { LikeButton } from './LikeButton';
import { CommentForm } from './CommentForm';
import { Button } from '@/components/ui/Button';
import type { Comment, EntityType } from './types';

interface CommentItemProps {
  comment: Comment;
  entityType: EntityType;
  entityId: string;
  isReply?: boolean;
  onDeleted: (commentId: string) => void;
  onReplyAdded: () => void;
}

export function CommentItem({
  comment,
  entityType,
  entityId,
  isReply = false,
  onDeleted,
  onReplyAdded
}: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === comment.user_id;
  const authorName = comment.member?.name || 
    comment.user?.raw_user_meta_data?.name || 
    'Anonymous';
  const authorAvatar = comment.member?.avatar_url || 
    comment.user?.raw_user_meta_data?.avatar_url;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setIsDeleting(true);
    try {
      // @ts-ignore - comments table doesn't exist in types yet
      const { error } = await supabase
        .from('comments')
        .update({ is_deleted: true })
        .eq('id', comment.id);

      if (!error) {
        onDeleted(comment.id);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = async (content: string) => {
    try {
      // @ts-ignore - comments table doesn't exist in types yet
      const { error } = await supabase
        .from('comments')
        .update({ 
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', comment.id);

      if (!error) {
        // Refresh the comments
        onReplyAdded();
        setShowEditForm(false);
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleReplyAdded = () => {
    setShowReplyForm(false);
    onReplyAdded();
  };

  return (
    <div className={cn('group', isReply && 'ml-12')}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={authorName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {authorName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {authorName}
              </h4>
              <time className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </time>
            </div>

            {showEditForm ? (
              <CommentForm
                entityType={entityType}
                entityId={entityId}
                initialContent={comment.content}
                onSuccess={() => handleEdit}
                onCancel={() => setShowEditForm(false)}
                isEdit
              />
            ) : (
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <LikeButton
              entityType="comment"
              entityId={comment.id}
              initialLikeCount={comment.like_count || 0}
              size="sm"
              className="text-xs"
            />

            {!isReply && user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="text-xs gap-1"
              >
                <MessageCircle className="h-3 w-3" />
                Reply
              </Button>
            )}

            {isOwner && !showEditForm && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditForm(true)}
                  className="text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-xs gap-1 text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </>
            )}
          </div>

          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                entityType={entityType}
                entityId={entityId}
                parentId={comment.id}
                onSuccess={handleReplyAdded}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  entityType={entityType}
                  entityId={entityId}
                  isReply
                  onDeleted={onDeleted}
                  onReplyAdded={onReplyAdded}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}