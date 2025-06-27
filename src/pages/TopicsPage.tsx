import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Hash, TrendingUp, Layers, BookOpen, Calendar, Briefcase, Users } from 'lucide-react';
import { useTopicsHybrid, useTopicAnalytics } from '@/features/topics/hooks/useTopicsHybrid';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/shared/components/ui/ErrorDisplay';
import type { TopicWithAnalytics } from '@/features/topics/types';

const TopicsPage = () => {
  const { topics, isLoading, error, setSearchTerm } = useTopicsHybrid();
  const { data: topicsWithAnalytics, isLoading: analyticsLoading } = useTopicAnalytics();
  const [searchInput, setSearchInput] = useState('');

  if (isLoading || analyticsLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error.message} />;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'events': return Calendar;
      case 'news': return BookOpen;
      case 'resources': return Layers;
      case 'opportunities': return Briefcase;
      case 'groups': return Users;
      default: return Hash;
    }
  };

  const getContentSummary = (topic: TopicWithAnalytics) => {
    const parts = [];
    if (topic.eventCount > 0) parts.push(`${topic.eventCount} events`);
    if (topic.newsCount > 0) parts.push(`${topic.newsCount} news`);
    if (topic.resourceCount > 0) parts.push(`${topic.resourceCount} resources`);
    if (topic.opportunityCount > 0) parts.push(`${topic.opportunityCount} opportunities`);
    if (topic.groupCount > 0) parts.push(`${topic.groupCount} groups`);
    if (topic.companyCount > 0) parts.push(`${topic.companyCount} companies`);
    if (topic.memberCount > 0) parts.push(`${topic.memberCount} members`);
    
    return parts.slice(0, 3).join(', ') + (parts.length > 3 ? ' and more' : '');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Explore Topics
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Discover content organized by topic across our community
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-2 max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search topics..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors duration-200"
          >
            Search
          </button>
        </div>
      </form>

      {/* Topics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(topicsWithAnalytics || topics).map((topic) => (
          <Link
            key={topic.id}
            to={`/topics/${topic.slug}`}
            className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm 
                     hover:shadow-lg transition-all duration-300 overflow-hidden
                     border border-gray-200 dark:border-gray-700"
          >
            {/* Color accent bar */}
            <div 
              className="absolute top-0 left-0 w-full h-1 transition-all duration-300 group-hover:h-2"
              style={{ backgroundColor: topic.color }}
            />
            
            <div className="p-6">
              {/* Topic Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: topic.color }}
                  >
                    <Tag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {topic.name}
                    </h3>
                    {'totalContentCount' in topic && typeof topic.totalContentCount === 'number' && topic.totalContentCount > 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {topic.totalContentCount} items
                      </p>
                    )}
                  </div>
                </div>
                
                {'popularityPercentage' in topic && typeof topic.popularityPercentage === 'number' && topic.popularityPercentage > 50 && (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                )}
              </div>

              {/* Description */}
              {topic.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {topic.description}
                </p>
              )}

              {/* Content Summary */}
              {'totalContentCount' in topic && typeof topic.totalContentCount === 'number' && topic.totalContentCount > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {getContentSummary(topic as TopicWithAnalytics)}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {topics.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No topics found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default TopicsPage;