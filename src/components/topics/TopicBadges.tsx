import React from 'react';
import { Link } from 'react-router-dom';
import type { Topic } from '@/types/topic';

interface TopicBadgesProps {
  topics: Topic[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  maxDisplay?: number;
}

export function TopicBadges({
  topics,
  className = '',
  size = 'md',
  interactive = true,
  maxDisplay = 5
}: TopicBadgesProps) {
  if (!topics || topics.length === 0) {
    return null;
  }

  const displayTopics = topics.slice(0, maxDisplay);
  const remainingCount = topics.length - maxDisplay;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const Badge = ({ topic }: { topic: Topic }) => {
    const badgeContent = (
      <span
        className={`
          inline-flex items-center gap-1 rounded-full font-medium
          ${sizeClasses[size]}
          ${interactive ? 'hover:opacity-80 transition-opacity' : ''}
        `}
        style={{
          backgroundColor: topic.color ? topic.color + '20' : '#e5e5e5',
          color: topic.color || '#666'
        }}
      >
        {topic.icon && (
          <span className="text-inherit opacity-70">
            {/* You can replace this with an actual icon component */}
            {topic.icon}
          </span>
        )}
        {topic.name}
      </span>
    );

    if (interactive) {
      return (
        <Link to={`/topics/${topic.slug}`} className="no-underline">
          {badgeContent}
        </Link>
      );
    }

    return badgeContent;
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayTopics.map(topic => (
        <Badge key={topic.id} topic={topic} />
      ))}
      {remainingCount > 0 && (
        <span
          className={`
            inline-flex items-center rounded-full bg-gray-100 text-gray-600 font-medium
            ${sizeClasses[size]}
          `}
        >
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

// Compact version for list views
export function TopicBadgesCompact({ topics, className = '' }: { topics: Topic[]; className?: string }) {
  if (!topics || topics.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {topics.slice(0, 3).map(topic => (
        <span
          key={topic.id}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: topic.color || '#888' }}
          title={topic.name}
        />
      ))}
      {topics.length > 3 && (
        <span className="text-xs text-gray-500 ml-1">
          +{topics.length - 3}
        </span>
      )}
    </div>
  );
}