import React from 'react';
import { AuthorLink } from './index';
import { AuthorData } from '../../../../hooks/useAuthor';

interface AuthorListItemProps {
  author: AuthorData;
  showTitle?: boolean;
  isSelected?: boolean;
  onSelect?: (author: AuthorData) => void;
  className?: string;
}

/**
 * List item component for displaying authors in lists or dropdowns
 * Optimized for selection interfaces and search results
 */
export function AuthorListItem({
  author,
  showTitle = true,
  isSelected = false,
  onSelect,
  className = ''
}: AuthorListItemProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(author);
    }
  };

  return (
    <div
      className={`
        flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors
        ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500' : ''}
        ${className}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-selected={isSelected}
    >
      <AuthorLink
        authorId={author.id}
        showAvatar
        showTitle={showTitle}
        size="sm"
        noLink
        onClick={onSelect ? undefined : undefined} // Disable link when used for selection
        className="flex-1 min-w-0"
      />
      {isSelected && (
        <div className="ml-2 text-blue-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      )}
    </div>
  );
}

export default AuthorListItem;