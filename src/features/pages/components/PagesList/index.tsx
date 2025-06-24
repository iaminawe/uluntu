import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Page, PageFilters } from '../../types';
import { fetchPages, setFilters, deletePage } from '../../store/pagesSlice';
import { extractTextFromJson, generateExcerpt } from '../../utils/editorUtils';

interface PagesListProps {
  showFilters?: boolean;
  showActions?: boolean;
  limit?: number;
}

export const PagesList: React.FC<PagesListProps> = ({
  showFilters = true,
  showActions = true,
  limit,
}) => {
  const dispatch = useAppDispatch();
  const { pages, loading, error, filters, pagination } = useAppSelector((state) => state.pages);
  
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

  useEffect(() => {
    dispatch(fetchPages({
      filters,
      page: pagination.page,
      limit: limit || pagination.limit,
    }));
  }, [dispatch, filters, pagination.page, limit]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    dispatch(setFilters({ search: query || undefined }));
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status as 'draft' | 'published' | 'archived' | 'all');
    dispatch(setFilters({ 
      status: status === 'all' ? undefined : status as PageFilters['status']
    }));
  };

  const handleSort = (sortBy: PageFilters['sort_by']) => {
    const newOrder = filters.sort_by === sortBy && filters.sort_order === 'desc' ? 'asc' : 'desc';
    dispatch(setFilters({ sort_by: sortBy, sort_order: newOrder }));
  };

  const handleDelete = async (page: Page) => {
    if (window.confirm(`Are you sure you want to delete "${page.title}"?`)) {
      try {
        await dispatch(deletePage(page.id));
      } catch (error) {
        console.error('Failed to delete page:', error);
        alert('Failed to delete page. Please try again.');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && pages.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search pages..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Pages Grid */}
      {pages.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <div key={page.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              {/* Hero Image */}
              {page.hero_image && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={page.hero_image}
                    alt={page.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      <Link
                        to={`/pages/${page.slug}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {page.title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {getStatusBadge(page.status)}
                      {page.is_featured && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {page.excerpt || generateExcerpt(page.content || '', 120)}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>
                    By {page.author ? `${page.author.first_name} ${page.author.last_name}` : 'Unknown'}
                  </span>
                  <span>{formatDate(page.updated_at)}</span>
                </div>

                {/* Actions */}
                {showActions && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Link
                      to={`/pages/${page.slug}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View
                    </Link>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/pages/${page.id}/edit`}
                        className="text-gray-600 hover:text-gray-700 text-sm"
                      >
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(page)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pages found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.status !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating a new page.'}
            </p>
            {showActions && (
              <div className="mt-6">
                <Link
                  to="/admin/pages/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Page
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!limit && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{pagination.total}</span>
                {' '}results
              </p>
            </div>
            
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                {/* Pagination controls can be added here */}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagesList;