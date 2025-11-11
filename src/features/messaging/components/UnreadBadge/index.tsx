import React from 'react';
import { useUnreadCount } from '@/hooks/messaging';
import { useEnabledFeatures } from '@/hooks/useSettings';

interface UnreadBadgeProps {
  className?: string;
  maxCount?: number;
}

/**
 * Displays unread message count badge
 * Only fetches and displays count when messaging feature is enabled
 */
export function UnreadBadge({ className = '', maxCount = 99 }: UnreadBadgeProps) {
  // Check if messaging feature is enabled
  const { isFeatureEnabled } = useEnabledFeatures();
  const messagingEnabled = isFeatureEnabled('user_messaging');

  // Only fetch unread count if messaging is enabled
  const { data: unreadCount = 0, isLoading } = useUnreadCount(undefined, {
    enabled: messagingEnabled
  });

  // Don't show badge if messaging is disabled or no unread messages
  if (!messagingEnabled || isLoading || unreadCount === 0) {
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