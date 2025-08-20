import React, { useState, useMemo } from 'react';
import { useAuthorsByIds } from '../../../../hooks/useAuthor';
import { AuthorListItem } from './AuthorListItem';
import { AuthorData } from '../../../../hooks/useAuthor';
import { filterAuthors, sortAuthorsByName } from '../../../../utils/authorUtils';
import Skeleton from '../Skeleton/Skeleton';

interface AuthorSelectorProps {
  /** Available author IDs to choose from */
  availableAuthorIds: string[];
  /** Currently selected author IDs */
  selectedAuthorIds?: string[];
  /** Callback when selection changes */
  onSelectionChange?: (authorIds: string[]) => void;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Show search input */
  searchable?: boolean;
  /** Maximum height of the list */
  maxHeight?: number;
  /** Placeholder text for search */
  searchPlaceholder?: string;
  /** Custom className */
  className?: string;
  /** Show author titles in list */
  showTitles?: boolean;
}

/**
 * Author selector component for choosing one or more authors from a list
 * Supports search, multiple selection, and loading states
 */
export function AuthorSelector({
  availableAuthorIds,
  selectedAuthorIds = [],
  onSelectionChange,
  multiple = false,
  searchable = true,
  maxHeight = 300,
  searchPlaceholder = 'Search authors...',
  className = '',
  showTitles = true
}: AuthorSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: authors = [], isLoading, error } = useAuthorsByIds(availableAuthorIds);

  const filteredAndSortedAuthors = useMemo(() => {
    const filtered = filterAuthors(authors, searchTerm);
    return sortAuthorsByName(filtered);
  }, [authors, searchTerm]);

  const handleAuthorSelect = (author: AuthorData) => {
    if (!onSelectionChange) return;

    let newSelection: string[];
    
    if (multiple) {
      if (selectedAuthorIds.includes(author.id)) {
        newSelection = selectedAuthorIds.filter(id => id !== author.id);
      } else {
        newSelection = [...selectedAuthorIds, author.id];
      }
    } else {
      newSelection = selectedAuthorIds.includes(author.id) ? [] : [author.id];
    }
    
    onSelectionChange(newSelection);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return (
      <div className={`border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
        {searchable && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <Skeleton className="h-10 w-full" />
          </div>
        )}
        <div className="p-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center p-3 space-x-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`border border-red-200 rounded-lg p-4 text-center ${className}`}>
        <div className="text-red-600 text-sm">
          Failed to load authors. Please try again.
        </div>
      </div>
    );
  }

  if (authors.length === 0) {
    return (
      <div className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center ${className}`}>
        <div className="text-gray-500 text-sm">
          No authors available
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {searchable && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className="
              w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
              rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 
              dark:bg-gray-800 dark:text-white
            "
          />
        </div>
      )}
      
      <div 
        className="overflow-y-auto"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        {filteredAndSortedAuthors.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {searchTerm ? 'No authors match your search' : 'No authors available'}
          </div>
        ) : (
          filteredAndSortedAuthors.map((author) => (
            <AuthorListItem
              key={author.id}
              author={author}
              showTitle={showTitles}
              isSelected={selectedAuthorIds.includes(author.id)}
              onSelect={handleAuthorSelect}
            />
          ))
        )}
      </div>
      
      {multiple && selectedAuthorIds.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
          {selectedAuthorIds.length} author{selectedAuthorIds.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}

export default AuthorSelector;