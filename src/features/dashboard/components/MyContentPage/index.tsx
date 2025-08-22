import React, { useState } from 'react';
import { Plus, Filter, SortAsc, SortDesc, Grid, List } from 'lucide-react';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { ContentTabs } from '../ContentTabs';
import { ContentGrid } from '../ContentGrid';
import { ContentList } from '../ContentList';
import { ContentFilters } from '../ContentFilters';
import { QuickActions } from '../QuickActions';
import { useUserContent } from '../../hooks/useUserContent';
import { useDebounce } from '@/hooks/useDebounce';
import type { ContentFilter, ContentType } from '../../types';

export const MyContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ContentType | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ContentFilter>({
    type: 'all',
    status: 'all',
    sortBy: 'updated_at',
    sortOrder: 'desc',
    limit: 12
  });

  const debouncedSearch = useDebounce(search, 300);

  const currentFilters = {
    ...filters,
    type: activeTab,
    search: debouncedSearch || undefined
  };

  const {
    data: contentResponse,
    isLoading,
    error,
    refetch
  } = useUserContent(currentFilters);

  const handleTabChange = (tab: ContentType | 'all') => {
    setActiveTab(tab);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (newFilters: Partial<ContentFilter>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }));
  };

  const handleSort = (field: string) => {
    const newOrder = filters.sortBy === field && filters.sortOrder === 'desc' ? 'asc' : 'desc';
    handleFilterChange({ sortBy: field as any, sortOrder: newOrder });
  };

  const handleLoadMore = () => {
    if (contentResponse?.pagination.hasNextPage) {
      setFilters(prev => ({
        ...prev,
        page: (prev.page || 1) + 1
      }));
    }
  };

  return (
    <ContentContainer>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Content
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage all your content in one place
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0 flex items-center space-x-3">
            <QuickActions />
          </div>
        </div>

        {/* Content Tabs */}
        <ContentTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          stats={contentResponse?.stats}
        />

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search your content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('updated_at')}
              className="flex items-center"
            >
              {filters.sortOrder === 'desc' ? (
                <SortDesc className="h-4 w-4 mr-2" />
              ) : (
                <SortAsc className="h-4 w-4 mr-2" />
              )}
              Sort
            </Button>
            
            <div className="flex rounded-md shadow-sm">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <ContentFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={() => setFilters({
              type: activeTab,
              status: 'all',
              sortBy: 'updated_at',
              sortOrder: 'desc',
              limit: 12
            })}
          />
        )}

        {/* Content Display */}
        {viewMode === 'grid' ? (
          <ContentGrid
            content={contentResponse?.content || []}
            isLoading={isLoading}
            error={error}
            onLoadMore={handleLoadMore}
            hasMore={contentResponse?.pagination.hasNextPage}
            onRefresh={refetch}
          />
        ) : (
          <ContentList
            content={contentResponse?.content || []}
            isLoading={isLoading}
            error={error}
            onLoadMore={handleLoadMore}
            hasMore={contentResponse?.pagination.hasNextPage}
            onRefresh={refetch}
          />
        )}
      </div>
    </ContentContainer>
  );
};

export default MyContentPage;