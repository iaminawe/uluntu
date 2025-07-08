import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link } from 'react-router-dom';
import { useTopicBySlug, useTopicContentCounts } from '@/features/topics/hooks/useTopicsHybrid';
import { useTopicContent } from '@/features/topics/hooks/useTopicContent';
import { Tag, Calendar, Users, Building, Briefcase, BookOpen, Image, ArrowRight, Search } from 'lucide-react';

interface TopicContent {
  id: string;
  title: string;
  excerpt?: string;
  date?: string;
  image?: string;
  author?: {
    name: string;
    image?: string;
  };
  type: string;
  url: string;
}

export default function TopicLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<string>('all');

  const { data: topic, isLoading: topicLoading } = useTopicBySlug(slug || '');
  const { data: contentCounts } = useTopicContentCounts(slug || '');
  const { data: content = {}, isLoading: contentLoading } = useTopicContent(slug || '');

  const isLoading = topicLoading || contentLoading;

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'events': return Calendar;
      case 'news': return BookOpen;
      case 'resources': return Briefcase;
      case 'groups': return Users;
      case 'companies': return Building;
      case 'opportunities': return Search;
      case 'galleries': return Image;
      default: return Tag;
    }
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'events': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'news': return 'text-green-600 bg-green-50 border-green-200';
      case 'resources': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'groups': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'companies': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'opportunities': return 'text-red-600 bg-red-50 border-red-200';
      case 'galleries': return 'text-pink-600 bg-pink-50 border-pink-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const contentTypes = Object.keys(content).filter(type => content[type]?.length > 0);
  const totalItems = Object.values(content).reduce((sum, items) => sum + items.length, 0);

  if (topicLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-96 mb-8"></div>
            <div className="grid gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-6">
                  <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Topic Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The topic you're looking for doesn't exist.</p>
          <Link 
            to="/topics" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Topics
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{topic.name} - Topic Hub - Kootenay Tech Community</title>
        <meta name="description" content={topic.description || `Explore all content related to ${topic.name} in the Kootenay Tech Community`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-800 shadow-sm">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-start gap-4 mb-6">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: topic.color }}
              >
                <Tag className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {topic.name}
                </h1>
                {topic.description && (
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                    {topic.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{totalItems} total items</span>
                  {contentCounts && Object.keys(contentCounts).length > 0 && (
                    <span>• Active in {Object.keys(contentCounts).length} categories</span>
                  )}
                </div>
              </div>
            </div>

            {/* Content Type Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                All Content ({totalItems})
              </button>
              {contentTypes.map(type => {
                const Icon = getEntityIcon(type);
                const count = content[type]?.length || 0;
                return (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                      activeTab === type
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="container mx-auto px-4 py-12">
          {totalItems === 0 ? (
            <div className="text-center py-12">
              <Tag 
                className="h-16 w-16 text-gray-400 mx-auto mb-4"
                style={{ color: topic.color }}
              />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No content yet for {topic.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Be the first to create content for this topic!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  to="/events/create" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  Create Event
                </Link>
                <Link 
                  to="/news/create" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  Write Article
                </Link>
                <Link 
                  to="/resources/create" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Briefcase className="h-4 w-4" />
                  Share Resource
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {(activeTab === 'all' ? contentTypes : [activeTab]).map(type => {
                if (!content[type] || content[type].length === 0) return null;
                
                const Icon = getEntityIcon(type);
                
                return (
                  <div key={type} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </h2>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({content[type].length})
                      </span>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {content[type].map(item => (
                        <Link 
                          key={item.id}
                          to={item.url}
                          className="block bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 group"
                        >
                          {item.image && (
                            <img 
                              src={item.image} 
                              alt={item.title}
                              className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                          )}
                          
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3 ${getEntityColor(type)}`}>
                            <Icon className="h-3 w-3" />
                            {type.slice(0, -1)}
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {item.title}
                          </h3>
                          
                          {item.excerpt && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                              {item.excerpt}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              {item.author && (
                                <>
                                  {item.author.image && (
                                    <img 
                                      src={item.author.image} 
                                      alt={item.author.name}
                                      className="w-4 h-4 rounded-full"
                                    />
                                  )}
                                  <span>{item.author.name}</span>
                                </>
                              )}
                              {item.date && (
                                <span>
                                  {item.author ? '•' : ''} {new Date(item.date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}