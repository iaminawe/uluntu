import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Navigate } from 'react-router-dom';
import { useTopicAnalytics } from '@/features/topics/hooks/useTopicsHybrid';
import { useEnabledFeatures } from '@/hooks/useSettings';
import { Tag, Search, TrendingUp, Hash, Calendar, Users, Building, Briefcase, BookOpen, Image, ArrowRight } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function TopicsIndexPage() {
  const { isFeatureEnabled, loading: featuresLoading } = useEnabledFeatures();
  const topicsEnabled = isFeatureEnabled('topics_system');

  // Redirect if topics feature is disabled
  if (!featuresLoading && !topicsEnabled) {
    return <Navigate to="/" replace />;
  }

  if (featuresLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popularity' | 'name' | 'recent'>('popularity');
  
  const { data: topics, isLoading } = useTopicAnalytics();

  const filteredTopics = topics?.filter(topic =>
    topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (topic.description && topic.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return (b.totalContentCount || 0) - (a.totalContentCount || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'event': return Calendar;
      case 'news': return BookOpen;
      case 'resource': return Briefcase;
      case 'group': return Users;
      case 'company': return Building;
      case 'opportunity': return Search;
      case 'gallery': return Image;
      default: return Tag;
    }
  };

  const getPopularityBadge = (percentage: number) => {
    if (percentage >= 80) return { label: 'Very Popular', color: 'bg-red-100 text-red-800 border-red-200' };
    if (percentage >= 60) return { label: 'Popular', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    if (percentage >= 40) return { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (percentage >= 20) return { label: 'Growing', color: 'bg-green-100 text-green-800 border-green-200' };
    return { label: 'New', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-96 mb-8"></div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Topics Hub - Discover Content by Category - Uluntu</title>
        <meta name="description" content="Browse all topics and discover content organized by category in Uluntu" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-800 shadow-sm">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Hash className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Topics Hub
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Discover content organized by topic. Find events, articles, resources, and more 
                related to your interests in the Kootenay tech community.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg 
                              bg-white dark:bg-slate-700 text-gray-900 dark:text-white 
                              focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'popularity' | 'name' | 'recent')}
                    className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg 
                              bg-white dark:bg-slate-700 text-gray-900 dark:text-white 
                              focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="popularity">Most Popular</option>
                    <option value="name">Alphabetical</option>
                    <option value="recent">Recently Added</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>{sortedTopics.length} topics found</span>
                <span>•</span>
                <span>{topics?.reduce((sum, topic) => sum + (topic.totalContentCount || 0), 0)} total items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="container mx-auto px-4 py-12">
          {sortedTopics.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No topics found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'Try adjusting your search terms' : 'No topics have been created yet'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedTopics.map(topic => {
                const popularityBadge = getPopularityBadge(topic.popularityPercentage || 0);
                const totalContent = topic.totalContentCount || 0;
                
                return (
                  <Link
                    key={topic.id}
                    to={`/topics/${topic.slug}`}
                    className="group bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-lg 
                              transition-all duration-200 p-6 border border-gray-100 dark:border-slate-700
                              hover:border-blue-200 dark:hover:border-blue-600"
                  >
                    {/* Topic Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: topic.color }}
                      >
                        <Tag className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 
                                      dark:group-hover:text-blue-400 transition-colors mb-1 truncate">
                          {topic.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${popularityBadge.color}`}>
                            {popularityBadge.label}
                          </span>
                          {totalContent > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {totalContent} items
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {topic.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                        {topic.description}
                      </p>
                    )}

                    {/* Content Breakdown */}
                    {totalContent > 0 && (
                      <div className="space-y-2 mb-4">
                        <div className="flex flex-wrap gap-1">
                          {[
                            { key: 'eventCount', label: 'Events', icon: Calendar },
                            { key: 'newsCount', label: 'News', icon: BookOpen },
                            { key: 'resourceCount', label: 'Resources', icon: Briefcase },
                            { key: 'groupCount', label: 'Groups', icon: Users },
                            { key: 'companyCount', label: 'Companies', icon: Building },
                            { key: 'opportunityCount', label: 'Jobs', icon: Search },
                          ].map(({ key, label, icon: Icon }) => {
                            const count = (topic as any)[key] || 0;
                            if (count === 0) return null;
                            
                            return (
                              <div key={key} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Icon className="h-3 w-3" />
                                <span>{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <TrendingUp className="h-3 w-3" />
                        <span>{topic.popularityPercentage || 0}% popular</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 
                                          dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Don't see your topic?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Topics are automatically created when you add content. Create an event, write an article, 
              or share a resource and tag it with relevant topics to help others discover it.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/events/create" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg 
                          hover:bg-blue-50 transition-colors font-medium"
              >
                <Calendar className="h-5 w-5" />
                Create Event
              </Link>
              <Link 
                to="/news/create" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg 
                          hover:bg-blue-50 transition-colors font-medium"
              >
                <BookOpen className="h-5 w-5" />
                Write Article
              </Link>
              <Link 
                to="/resources/create" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg 
                          hover:bg-blue-50 transition-colors font-medium"
              >
                <Briefcase className="h-5 w-5" />
                Share Resource
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}