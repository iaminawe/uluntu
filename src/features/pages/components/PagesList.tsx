import React, { useEffect, useState } from 'react';
import { ChevronRightIcon, PlusIcon, FolderIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { usePages } from '../hooks/usePages';
import { Page, PageFilters } from '../types';

interface PagesListProps {
  showFilters?: boolean;
  onPageSelect?: (page: Page) => void;
  selectedPageId?: string;
  className?: string;
}

interface PageCardProps {
  page: Page;
  onSelect?: (page: Page) => void;
  isSelected?: boolean;
  depth?: number;
}

const PageCard: React.FC<PageCardProps> = ({ page, onSelect, isSelected, depth = 0 }) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect(page);
    }
  };

  const getStatusColor = (status: string, isPublished?: boolean) => {
    if (status === 'published' && isPublished) return 'text-green-600';
    if (status === 'draft') return 'text-yellow-600';
    return 'text-gray-500';
  };

  const getStatusText = (status: string, isPublished?: boolean) => {
    if (status === 'published' && isPublished) return 'Published';
    if (status === 'draft') return 'Draft';
    return 'Unpublished';
  };

  const getTemplateIcon = (template?: string) => {
    switch (template) {
      case 'landing':
        return <FolderIcon className="w-5 h-5 text-blue-500" />;
      case 'article':
        return <DocumentTextIcon className="w-5 h-5 text-green-500" />;
      case 'form':
        return <DocumentTextIcon className="w-5 h-5 text-purple-500" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
        ${depth > 0 ? `ml-${depth * 4}` : ''}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {getTemplateIcon((page as any).template)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {page.title}
                {(page as any).is_home && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Home
                  </span>
                )}
              </h3>
            </div>
            
            {page.excerpt && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {page.excerpt}
              </p>
            )}
            
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span className={getStatusColor(page.status, (page as any).is_published)}>
                {getStatusText(page.status, (page as any).is_published)}
              </span>
              
              {(page as any).template && (
                <span>
                  Template: {(page as any).template}
                </span>
              )}
              
              {page.updated_at && (
                <span>
                  Updated: {new Date(page.updated_at).toLocaleDateString()}
                </span>
              )}
            </div>

            {page.slug && (
              <div className="mt-1 text-xs text-gray-400">
                /{page.slug}
              </div>
            )}
          </div>
        </div>
        
        <ChevronRightIcon className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
};

const PagesFilters: React.FC<{
  filters: PageFilters;
  onFiltersChange: (filters: PageFilters) => void;
}> = ({ filters, onFiltersChange }) => {
  const [localFilters, setLocalFilters] = useState<PageFilters>(filters);

  const handleFilterChange = (key: keyof PageFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <button
          onClick={handleClearFilters}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          Clear all
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={localFilters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search pages..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template
          </label>
          <select
            value={localFilters.template || ''}
            onChange={(e) => handleFilterChange('template', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All templates</option>
            <option value="default">Default</option>
            <option value="landing">Landing</option>
            <option value="article">Article</option>
            <option value="form">Form</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Published
          </label>
          <select
            value={localFilters.is_published === undefined ? '' : localFilters.is_published.toString()}
            onChange={(e) => {
              const value = e.target.value;
              handleFilterChange('is_published', value === '' ? undefined : value === 'true');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="true">Published</option>
            <option value="false">Unpublished</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export const PagesList: React.FC<PagesListProps> = ({
  showFilters = true,
  onPageSelect,
  selectedPageId,
  className = ''
}) => {
  const {
    pages,
    filteredPages,
    filters,
    status,
    filteredStatus,
    error,
    isLoading,
    loadPages,
    loadFilteredPages,
    updateFilters
  } = usePages();

  const [hasFilters, setHasFilters] = useState(false);

  useEffect(() => {
    if (hasFilters) {
      loadFilteredPages(filters);
    } else {
      loadPages();
    }
  }, [loadPages, loadFilteredPages, filters, hasFilters]);

  const handleFiltersChange = (newFilters: PageFilters) => {
    updateFilters(newFilters);
    const hasActiveFilters = Object.values(newFilters).some(value => 
      value !== undefined && value !== '' && value !== null
    );
    setHasFilters(hasActiveFilters);
  };

  const displayPages = hasFilters ? filteredPages : pages;
  const currentStatus = hasFilters ? filteredStatus : status;

  if (currentStatus === 'loading') {
    return (
      <div className={`space-y-4 ${className}`}>
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-600 mb-2">Error loading pages</div>
        <div className="text-gray-500 text-sm">{error}</div>
        <button
          onClick={() => hasFilters ? loadFilteredPages(filters) : loadPages()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {showFilters && (
        <PagesFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Pages
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {displayPages.length} page{displayPages.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <PlusIcon className="w-4 h-4 mr-2" />
          New Page
        </button>
      </div>

      {displayPages.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No pages found
          </h3>
          <p className="text-gray-500 mb-6">
            {hasFilters 
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by creating your first page.'
            }
          </p>
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Page
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayPages.map(page => (
            <PageCard
              key={page.id}
              page={page}
              onSelect={onPageSelect}
              isSelected={selectedPageId === page.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PagesList;