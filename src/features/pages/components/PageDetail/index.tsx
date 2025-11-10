import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPageBySlug, clearCurrentPage } from '../../store/pagesSlice';
import { jsonToHtml } from '../../utils/editorUtils';

/**
 * DOMPurify configuration for rich page content.
 * Allows formatting tags and blocks scripts/event handlers to prevent XSS attacks.
 * More permissive than theme HTML sanitization since page content requires rich formatting.
 */
const RICH_CONTENT_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'table', 'tr',
    'td', 'th', 'thead', 'tbody', 'div', 'span', 'hr',
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel'],
  ALLOW_DATA_ATTR: false,
  // Block all script execution
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
};

interface PageDetailProps {
  pageSlug?: string;
  showActions?: boolean;
}

export const PageDetail: React.FC<PageDetailProps> = ({
  pageSlug,
  showActions = false,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { currentPage, loading, error } = useAppSelector((state) => state.pages);

  const pageSlugToUse = pageSlug || slug;

  useEffect(() => {
    if (pageSlugToUse) {
      dispatch(fetchPageBySlug(pageSlugToUse));
    }

    return () => {
      dispatch(clearCurrentPage());
    };
  }, [dispatch, pageSlugToUse]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Error Loading Page</h2>
            <p>{error}</p>
          </div>
          
          <div className="mt-6">
            <Link
              to="/pages"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Pages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPage) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
          </div>
          
          <div className="mt-6">
            <Link
              to="/pages"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Pages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto py-8 px-4">
      {/* Page Header */}
      <header className="mb-8">
        {/* Status Banner (for draft/unpublished pages) */}
        {currentPage.status !== 'published' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-yellow-600 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-yellow-800 text-sm font-medium">
                This page is {currentPage.status} and not publicly visible.
              </span>
            </div>
          </div>
        )}

        {/* Featured Badge */}
        {currentPage.is_featured && (
          <div className="mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              Featured Page
            </span>
          </div>
        )}

        {/* Hero Image */}
        {currentPage.hero_image && (
          <div className="mb-8">
            <img
              src={currentPage.hero_image}
              alt={currentPage.title}
              className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Title and Meta */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {currentPage.title}
          </h1>
          
          {currentPage.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {currentPage.excerpt}
            </p>
          )}

          {/* Author and Date */}
          <div className="flex items-center justify-between py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {currentPage.author && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">
                    {currentPage.author.first_name} {currentPage.author.last_name}
                  </span>
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                {currentPage.published_at ? (
                  <>Published {formatDate(currentPage.published_at)}</>
                ) : (
                  <>Updated {formatDate(currentPage.updated_at)}</>
                )}
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/admin/pages/${currentPage.id}/edit`}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="prose prose-lg max-w-none">
        {currentPage.content ? (
          <div
            dangerouslySetInnerHTML={{
              /**
               * Defense-in-depth: Sanitize HTML even though jsonToHtml generates HTML from JSON.
               * This protects against XSS if malicious content is stored in the database
               * or if jsonToHtml has vulnerabilities in href/src attribute handling.
               */
              __html: DOMPurify.sanitize(
                jsonToHtml(currentPage.content),
                RICH_CONTENT_CONFIG
              ),
            }}
          />
        ) : (
          <p className="text-gray-500 italic">No content available.</p>
        )}
      </div>

      {/* SEO Meta (only visible to editors) */}
      {showActions && (currentPage.meta_title || currentPage.meta_description) && (
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Information</h3>
          
          {currentPage.meta_title && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Title
              </label>
              <p className="text-sm text-gray-600">{currentPage.meta_title}</p>
            </div>
          )}
          
          {currentPage.meta_description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <p className="text-sm text-gray-600">{currentPage.meta_description}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <Link
          to="/pages"
          className="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Pages
        </Link>
      </div>
    </article>
  );
};

export default PageDetail;