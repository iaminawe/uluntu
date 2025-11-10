import React from 'react';
import { useUnreadCount } from '@/hooks/messaging';

interface UnreadBadgeProps {
  className?: string;
  maxCount?: number;
}

/**
 * Displays unread message count badge
 */
export function UnreadBadge({ className = '', maxCount = 99 }: UnreadBadgeProps) {
  const { data: unreadCount = 0, isLoading } = useUnreadCount();

  if (isLoading || unreadCount === 0) {
    return null;
  }

  const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount.toString();

  return (
    <span className={`
      inline-flex items-center justify-center
      bg-red-500 text-white text-xs font-bold
      rounded-full min-w-[1.25rem] h-5 px-1
      ${className}
    `}>
      {displayCount}
    </span>
  );
}

export default UnreadBadge;