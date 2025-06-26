import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { BookOpen, Plus } from 'lucide-react';
import { useResources } from '@/hooks/useResourceQueries';
import ResourceCard from '@/features/resources/components/ResourceCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Resource } from '@/types';

export default function ResourcesPage() {
  const { data: resources = [], isLoading, error } = useResources();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'guides', label: 'Guides' },
    { value: 'tutorials', label: 'Tutorials' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'tools', label: 'Tools' },
    { value: 'templates', label: 'Templates' },
    { value: 'other', label: 'Other' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'article', label: 'Article' },
    { value: 'video', label: 'Video' },
    { value: 'document', label: 'Document' },
    { value: 'link', label: 'External Link' },
    { value: 'course', label: 'Course' }
  ];

  // Filter resources
  const filteredResources = resources.filter((resource: Resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    const matchesType = !selectedType || resource.resource_type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

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
    <>
      <Helmet>
        <title>Resources - Kootenay Tech Community</title>
        <meta name="description" content="Discover guides, tutorials, and tools to help you learn and grow in the Kootenay tech community." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resources</h1>
              </div>
              <Link
                to="/resources/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Share Resource
              </Link>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Discover guides, tutorials, and tools to help you learn and grow
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {typeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Resources Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || selectedCategory || selectedType
                  ? 'No resources found matching your criteria.'
                  : 'No resources found. Be the first to share a resource!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource: Resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}