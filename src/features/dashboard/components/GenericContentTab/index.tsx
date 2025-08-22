import React, { useState, useMemo } from 'react';
import { GenericContentTabProps, GenericContentItem } from '../../types';
import ContentCard from '../ContentCard';
import Card from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ErrorDisplay } from '@/shared/components/ui/ErrorDisplay';

/**
 * Generic Content Tab Component
 * Displays a flexible table/grid of any content type with sorting and filtering
 */
const GenericContentTab: React.FC<GenericContentTabProps> = ({
  contentType,
  data,
  columns,
  loading = false,
  error = null,
  onRefresh,
  onEdit,
  onDelete,
  onDuplicate,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to load content"
        message={error}
        retry={onRefresh}
      />
    );
  }

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply column filter
    if (filterBy && filterValue) {
      filtered = filtered.filter(item => {
        const value = item[filterBy as keyof GenericContentItem];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(filterValue.toLowerCase());
        }
        return String(value).toLowerCase().includes(filterValue.toLowerCase());
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof GenericContentItem];
      const bValue = b[sortBy as keyof GenericContentItem];
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [data, searchTerm, filterBy, filterValue, sortBy, sortOrder]);

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('desc');
    }
  };

  const getColumnValue = (item: GenericContentItem, column: any) => {
    const value = item[column.key as keyof GenericContentItem];
    
    if (column.render) {
      return column.render(value, item);
    }
    
    switch (column.type) {
      case 'date':
        return new Date(value as string).toLocaleDateString();
      case 'status':
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            value === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            value === 'draft' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
          }`}>
            {String(value)}
          </span>
        );
      case 'user':
        if (typeof value === 'object' && value && 'name' in value) {
          return (
            <div className="flex items-center space-x-2">
              {value.image && (
                <img className="w-6 h-6 rounded-full" src={value.image} alt={value.name} />
              )}
              <span>{value.name}</span>
            </div>
          );
        }
        return String(value);
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      default:
        return String(value || '');
    }
  };

  const getFilterableColumns = () => {
    return columns.filter(col => col.filterable);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter */}
          {getFilterableColumns().length > 0 && (
            <div className="flex space-x-2">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Filter by...</option>
                {getFilterableColumns().map(col => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
              {filterBy && (
                <input
                  type="text"
                  placeholder="Filter value..."
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>

          {/* Results count */}
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {processedData.length} of {data.length} items
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} hasImage={viewMode === 'grid'} lines={viewMode === 'grid' ? 3 : 1} />
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {/* Table View */}
          {viewMode === 'table' && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.key}
                          className={`px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider ${
                            column.sortable ? 'cursor-pointer hover:text-slate-700 dark:hover:text-slate-300' : ''
                          }`}
                          onClick={column.sortable ? () => handleSort(column.key) : undefined}
                        >
                          <div className="flex items-center space-x-1">
                            <span>{column.label}</span>
                            {column.sortable && (
                              <svg className={`w-4 h-4 transition-transform ${
                                sortBy === column.key && sortOrder === 'desc' ? 'rotate-180' : ''
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                    {processedData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                        {columns.map((column) => (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                            {getColumnValue(item, column)}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {onEdit && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(item)}
                                className="text-xs"
                              >
                                Edit
                              </Button>
                            )}
                            {onDuplicate && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDuplicate(item)}
                                className="text-xs"
                              >
                                Duplicate
                              </Button>
                            )}
                            {onDelete && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => onDelete(item)}
                                className="text-xs"
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedData.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  type="generic"
                  size="md"
                  layout="card"
                  showActions={true}
                  actions={[
                    ...(onEdit ? [{
                      id: 'edit',
                      label: 'Edit',
                      icon: 'edit',
                      variant: 'outline' as const,
                      onClick: () => onEdit(item),
                    }] : []),
                    ...(onDuplicate ? [{
                      id: 'duplicate',
                      label: 'Duplicate',
                      icon: 'copy',
                      variant: 'outline' as const,
                      onClick: () => onDuplicate(item),
                    }] : []),
                    ...(onDelete ? [{
                      id: 'delete',
                      label: 'Delete',
                      icon: 'trash',
                      variant: 'danger' as const,
                      onClick: () => onDelete(item),
                    }] : []),
                  ]}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && processedData.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                {searchTerm || filterValue ? 'No matching content found' : `No ${contentType} content`}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
                {searchTerm || filterValue
                  ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                  : `You haven't created any ${contentType} content yet.`
                }
              </p>
              {(searchTerm || filterValue) && (
                <div className="space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterValue('');
                      setFilterBy('');
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default GenericContentTab;