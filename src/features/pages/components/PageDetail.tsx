import React, { useEffect, useState } from 'react';
import { 
  PencilIcon, 
  EyeIcon, 
  TrashIcon, 
  DocumentDuplicateIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  GlobeAltIcon 
} from '@heroicons/react/24/outline';
import { usePages } from '../hooks/usePages';
import { Page } from '../types';

interface PageDetailProps {
  pageId?: string;
  slug?: string;
  showActions?: boolean;
  onEdit?: (page: Page) => void;
  onDelete?: (page: Page) => void;
  onDuplicate?: (page: Page) => void;
  className?: string;
}

interface PageHeaderProps {
  page: Page;
  showActions?: boolean;
  onEdit?: (page: Page) => void;
  onDelete?: (page: Page) => void;
  onDuplicate?: (page: Page) => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  page,
  showActions = true,
  onEdit,
  onDelete,
  onDuplicate
}) => {
  const getStatusBadge = (status: string, isPublished?: boolean) => {
    if (status === 'published' && isPublished) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <GlobeAltIcon className="w-3 h-3 mr-1" />
          Published
        </span>
      );
    }
    if (status === 'draft') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <PencilIcon className="w-3 h-3 mr-1" />
          Draft
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Unpublished
      </span>
    );
  };

  const getTemplateBadge = (template?: string) => {
    const badges = {
      landing: { color: 'blue', label: 'Landing Page' },
      article: { color: 'green', label: 'Article' },
      form: { color: 'purple', label: 'Form' },
      default: { color: 'gray', label: 'Default' }
    };
    
    const badge = badges[template as keyof typeof badges] || badges.default;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${badge.color}-100 text-${badge.color}-800`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {page.title}
            </h1>
            {page.is_home && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Home Page
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            {page.slug && (
              <div className="flex items-center">
                <TagIcon className="w-4 h-4 mr-1" />
                /{page.slug}
              </div>
            )}
            
            {page.updated_at && (
              <div className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                Updated {new Date(page.updated_at).toLocaleDateString()}
              </div>
            )}
            
            {page.author && (
              <div className="flex items-center">
                <UserIcon className="w-4 h-4 mr-1" />
                {page.author.name}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {getStatusBadge(page.status, page.is_published)}
            {getTemplateBadge(page.template)}
          </div>

          {page.excerpt && (
            <p className="mt-3 text-gray-600 line-clamp-2">
              {page.excerpt}
            </p>
          )}
        </div>

        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => onEdit?.(page)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Edit
            </button>
            
            <button
              onClick={() => window.open(`/pages/${page.slug}`, '_blank')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <EyeIcon className="w-4 h-4 mr-1" />
              Preview
            </button>

            <button
              onClick={() => onDuplicate?.(page)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
              Duplicate
            </button>

            <button
              onClick={() => onDelete?.(page)}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface PageContentProps {
  page: Page;
}

const PageContent: React.FC<PageContentProps> = ({ page }) => {
  return (
    <div className="bg-white">
      {/* Cover Image */}
      {page.cover_image && (
        <div className="relative h-64 bg-gray-200">
          <img
            src={page.cover_image}
            alt={page.cover_image_alt || page.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-8">
        {page.meta_title && page.meta_title !== page.title && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SEO Title
            </label>
            <p className="text-gray-600">{page.meta_title}</p>
          </div>
        )}

        {page.meta_description && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meta Description
            </label>
            <p className="text-gray-600">{page.meta_description}</p>
          </div>
        )}

        <div className="prose max-w-none">
          {page.content ? (
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            <p className="text-gray-500 italic">No content available</p>
          )}
        </div>

        {/* SEO Keywords */}
        {page.seo_keywords && page.seo_keywords.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SEO Keywords
            </label>
            <div className="flex flex-wrap gap-2">
              {page.seo_keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Page Metadata */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Page Information
              </label>
              <div className="space-y-1 text-gray-600">
                <div>Template: {page.template || 'default'}</div>
                <div>Status: {page.status}</div>
                <div>Published: {page.is_published ? 'Yes' : 'No'}</div>
                {page.order && <div>Order: {page.order}</div>}
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Timestamps
              </label>
              <div className="space-y-1 text-gray-600">
                <div>Created: {new Date(page.created_at).toLocaleString()}</div>
                <div>Updated: {new Date(page.updated_at).toLocaleString()}</div>
                {page.published_at && (
                  <div>Published: {new Date(page.published_at).toLocaleString()}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PageDetail: React.FC<PageDetailProps> = ({
  pageId,
  slug,
  showActions = true,
  onEdit,
  onDelete,
  onDuplicate,
  className = ''
}) => {
  const {
    currentPage,
    currentPageStatus,
    error,
    loadPageById,
    loadPageBySlug
  } = usePages();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      try {
        if (pageId) {
          await loadPageById(pageId);
        } else if (slug) {
          await loadPageBySlug(slug);
        }
      } finally {
        setLoading(false);
      }
    };

    if (pageId || slug) {
      loadPage();
    }
  }, [pageId, slug, loadPageById, loadPageBySlug]);

  const isLoading = loading || currentPageStatus === 'loading';

  if (isLoading) {
    return (
      <div className={`bg-white shadow-sm border border-gray-200 rounded-lg ${className}`}>
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="flex space-x-2">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
          
          {/* Content skeleton */}
          <div className="px-6 py-8">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white shadow-sm border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <div className="text-red-600 mb-2">Error loading page</div>
        <div className="text-gray-500 text-sm mb-4">{error}</div>
        <button
          onClick={() => {
            if (pageId) {
              loadPageById(pageId);
            } else if (slug) {
              loadPageBySlug(slug);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className={`bg-white shadow-sm border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <div className="text-gray-500">Page not found</div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <PageHeader
        page={currentPage}
        showActions={showActions}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />
      <PageContent page={currentPage} />
    </div>
  );
};

export default PageDetail;