import { useParams, Link } from 'react-router-dom';
import { Tag, Calendar, BookOpen, Layers, Briefcase, Users, Building, ArrowLeft } from 'lucide-react';
import { useTopicBySlug, useTopicContentCounts } from '@/features/topics/hooks/useTopicsHybrid';
import { useEventsHybrid } from '@/features/events/hooks/useEventsHybrid';
import { useNewsHybrid } from '@/features/news/hooks/useNewsHybrid';
import { useResourcesHybrid } from '@/features/resources/hooks/useResourcesHybrid';
import { useOpportunitiesHybrid } from '@/features/opportunities/hooks/useOpportunitiesHybrid';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/shared/components/ui/ErrorDisplay';
import NotFoundError from '@/shared/components/ui/ErrorDisplay/NotFoundError';

const TopicDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: topic, isLoading, error } = useTopicBySlug(slug || '');
  const { data: contentCounts } = useTopicContentCounts(slug || '');
  
  // Fetch content for this topic
  const { events } = useEventsHybrid();
  const { articles: news } = useNewsHybrid();
  const { resources } = useResourcesHybrid();
  const { opportunities } = useOpportunitiesHybrid();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error.message} />;
  if (!topic) return <NotFoundError />;

  // Filter content by topic (this would need to be implemented in the APIs)
  // For now, we'll just show the counts

  const sections = [
    {
      title: 'Events',
      count: contentCounts?.events || 0,
      icon: Calendar,
      link: '/events',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      items: events.slice(0, 3) // Show first 3 events
    },
    {
      title: 'News',
      count: contentCounts?.news || 0,
      icon: BookOpen,
      link: '/news',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      items: news.slice(0, 3)
    },
    {
      title: 'Resources',
      count: contentCounts?.resources || 0,
      icon: Layers,
      link: '/resources',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      items: resources.slice(0, 3)
    },
    {
      title: 'Opportunities',
      count: contentCounts?.opportunities || 0,
      icon: Briefcase,
      link: '/opportunities',
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      items: opportunities.slice(0, 3)
    },
    {
      title: 'Groups',
      count: contentCounts?.groups || 0,
      icon: Users,
      link: '/groups',
      color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      items: []
    },
    {
      title: 'Companies',
      count: contentCounts?.companies || 0,
      icon: Building,
      link: '/companies',
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      items: []
    }
  ].filter(section => section.count > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Link */}
      <Link 
        to="/topics" 
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 
                   hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Topics
      </Link>

      {/* Topic Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="w-16 h-16 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: topic.color }}
          >
            <Tag className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {topic.name}
            </h1>
            {topic.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                {topic.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="space-y-8">
        {sections.map((section) => {
          const Icon = section.icon;
          
          return (
            <div key={section.title} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${section.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({section.count})
                  </span>
                </div>
                <Link 
                  to={section.link}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View all
                </Link>
              </div>

              {/* Content Preview */}
              {section.items.length > 0 ? (
                <div className="grid gap-3">
                  {section.items.map((item: any) => (
                    <Link
                      key={item.id}
                      to={`${section.link}/${item.id}`}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg
                               hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {item.title || item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No {section.title.toLowerCase()} found with this topic yet.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sections.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No content yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This topic doesn't have any associated content yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default TopicDetailPage;