import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { cn } from '@/utils/cn';
import type { EntityType } from './types';

interface LikeButtonProps {
  entityType: EntityType;
  entityId: string;
  initialLikeCount?: number;
  className?: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LikeButton({
  entityType,
  entityId,
  initialLikeCount = 0,
  className,
  showCount = true,
  size = 'md'
}: LikeButtonProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has liked this entity
  useEffect(() => {
    async function checkLikeStatus() {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .single();

        if (!error && data) {
          setIsLiked(true);
        }
      } catch (err) {
        // Silently fail if table doesn't exist
        console.warn('Likes table may not exist:', err);
      }
    }

    checkLikeStatus();
  }, [user, entityType, entityId]);

  // Get current like count
  useEffect(() => {
    async function fetchLikeCount() {
      try {
        const { count, error } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('entity_type', entityType)
          .eq('entity_id', entityId);

        if (!error && count !== null) {
          setLikeCount(count);
        }
      } catch (err) {
        // Silently fail if table doesn't exist, use initial count
        console.warn('Likes table may not exist:', err);
        setLikeCount(initialLikeCount);
      }
    }

    fetchLikeCount();
  }, [entityType, entityId, initialLikeCount]);

  const handleToggleLike = async () => {
    if (!user) {
      // You could show a login modal here
      return;
    }

    setIsLoading(true);

    try {
      if (isLiked) {
        // Remove like
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
      } else {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            entity_type: entityType,
            entity_id: entityId
          });

        if (!error) {
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
        }
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      // If table doesn't exist, fail silently
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        console.warn('Likes table does not exist yet');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const buttonSizeClasses = {
    sm: 'text-sm gap-1 px-2 py-1',
    md: 'text-base gap-1.5 px-3 py-1.5',
    lg: 'text-lg gap-2 px-4 py-2'
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading || !user}
      className={cn(
        'inline-flex items-center rounded-md transition-all duration-200',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        buttonSizeClasses[size],
        isLiked && 'text-red-600 dark:text-red-500',
        !isLiked && 'text-gray-600 dark:text-gray-400',
        className
      )}
      aria-label={isLiked ? 'Unlike' : 'Like'}
    >
      <Heart
        className={cn(
          sizeClasses[size],
          'transition-all duration-200',
          isLiked && 'fill-current'
        )}
      />
      {showCount && (
        <span className="font-medium tabular-nums">
          {likeCount}
        </span>
      )}
    </button>
  );
}