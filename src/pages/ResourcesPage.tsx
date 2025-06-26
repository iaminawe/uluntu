import React from 'react';
import { BookOpen } from 'lucide-react';
import { useResourceQueries } from '@/hooks/useResourceQueries';
import EntityListPage from '@/components/EntityListPage';
import ResourceCard from '@/features/resources/components/ResourceCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EntityListHeader from '@/components/EntityListHeader';

export default function ResourcesPage() {
  const { resources, isLoading, error, filters, updateFilter } = useResourceQueries();

  const categoryOptions = [
    { value: 'guides', label: 'Guides' },
    { value: 'tutorials', label: 'Tutorials' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'tools', label: 'Tools' },
    { value: 'templates', label: 'Templates' },
    { value: 'other', label: 'Other' }
  ];

  const typeOptions = [
    { value: 'article', label: 'Article' },
    { value: 'video', label: 'Video' },
    { value: 'document', label: 'Document' },
    { value: 'link', label: 'External Link' },
    { value: 'course', label: 'Course' }
  ];

  const filterOptions = [
    {
      key: 'category',
      label: 'Category',
      type: 'select' as const,
      options: categoryOptions
    },
    {
      key: 'resource_type',
      label: 'Type',
      type: 'select' as const,
      options: typeOptions
    },
    {
      key: 'featured',
      label: 'Featured Only',
      type: 'toggle' as const
    }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">Error loading resources. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EntityListHeader
          title="Resources"
          description="Discover guides, tutorials, and tools to help you learn and grow"
          icon={BookOpen}
          createPath="/resources/create"
          createLabel="Share Resource"
        />

        <EntityListPage
          items={resources}
          isLoading={isLoading}
          filters={filters}
          updateFilter={updateFilter}
          filterOptions={filterOptions}
          renderItem={(resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          )}
          emptyMessage="No resources found. Be the first to share a resource!"
          gridCols="md:grid-cols-2 lg:grid-cols-3"
        />
      </div>
    </div>
  );
}