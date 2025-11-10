import React from 'react';
import { useUnreadCount } from '@/hooks/messaging';
import { useAuth } from '@/hooks/useAuth';

interface UnreadBadgeProps {
  className?: string;
  maxCount?: number;
  showZero?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Displays unread message count badge
 */
function UnreadBadge({ 
  className = '', 
  maxCount = 99, 
  showZero = false,
  size = 'md'
}: UnreadBadgeProps) {
  const { user } = useAuth();
  const unreadCountQuery = useUnreadCount(user?.id || '', {
    enabled: !!user
  });

  const count = unreadCountQuery.data || 0;

  if (!user || (!showZero && count === 0)) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  const sizeClasses = {
    sm: 'h-4 min-w-4 text-xs px-1',
    md: 'h-5 min-w-5 text-xs px-1.5',
    lg: 'h-6 min-w-6 text-sm px-2'
  };

  return (
    <span 
      className={`
        inline-flex items-center justify-center 
        bg-red-500 text-white rounded-full font-medium
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {displayCount}
    </span>
  );
}

interface ThreadUnreadBadgeProps {
  threadId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Displays unread count for a specific thread
 * Note: This would require additional API support for per-thread unread counts
 */
export function ThreadUnreadBadge({ 
  threadId, 
  className = '',
  size = 'sm'
}: ThreadUnreadBadgeProps) {
  // This is a placeholder - would need additional API endpoint
  // For now, we'll just show a dot indicator
  const hasUnread = false; // TODO: Implement per-thread unread logic

  if (!hasUnread) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <span 
      className={`
        inline-block bg-blue-500 rounded-full
        ${sizeClasses[size]}
        ${className}
      `}
    />
  );
}

// Named export for tree shaking
export { UnreadBadge };

// Default export for compatibility
export default UnreadBadge;