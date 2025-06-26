import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import type { EntityType } from './types';

interface CommentFormProps {
  entityType: EntityType;
  entityId: string;
  parentId?: string;
  initialContent?: string;
  onSuccess: (content: string) => void;
  onCancel: () => void;
  isEdit?: boolean;
  className?: string;
}

export function CommentForm({
  entityType,
  entityId,
  parentId,
  initialContent = '',
  onSuccess,
  onCancel,
  isEdit = false,
  className
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to comment');
      return;
    }

    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isEdit) {
        // Edit mode - parent will handle the update
        onSuccess(content);
      } else {
        // Create new comment
        // @ts-ignore - comments table doesn't exist in types yet
        const { error } = await supabase.from('comments').insert({
          user_id: user.id,
          entity_type: entityType,
          entity_id: entityId,
          parent_id: parentId,
          content: content.trim()
        });

        if (error) throw error;
        
        setContent('');
        onSuccess(content);
      }
    } catch (error) {
      console.error('Error saving comment:', error);
      setError('Failed to save comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', className)}>
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentId ? 'Write a reply...' : 'Write a comment...'}
          className={cn(
            'w-full rounded-lg border border-gray-300 dark:border-gray-700',
            'bg-white dark:bg-gray-900',
            'px-3 py-2 text-sm',
            'placeholder:text-gray-500 dark:placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
            'resize-none'
          )}
          rows={3}
          disabled={isSubmitting}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="default"
          size="sm"
          disabled={isSubmitting || !content.trim()}
        >
          {isSubmitting ? 'Posting...' : isEdit ? 'Save' : 'Post'}
        </Button>
      </div>
    </form>
  );
}