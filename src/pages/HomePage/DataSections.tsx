import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMembersHybrid } from '@/features/directory/hooks/useMembersHybrid';
import { useCompaniesHybrid } from '@/features/companies/hooks/useCompaniesHybrid';
import { useEventsHybrid } from '@/features/events/hooks/useEventsHybrid';
import { newsApi } from '@/features/news/api/newsApi';
import { groupsApi } from '@/features/groups/api/groupsApi';
import { DetailedCard } from '@/shared/components/visual';
import { getEventUrl, getGroupUrl } from '@/utils/contentUrlUtils';
import { useEnabledFeatures } from '@/hooks/useSettings';

export default function DataSections() {
  // Check enabled features
  const { isFeatureEnabled } = useEnabledFeatures();
  const eventsEnabled = isFeatureEnabled('events_system');
  const groupsEnabled = isFeatureEnabled('groups_communities');
  const newsEnabled = isFeatureEnabled('news_blog');

  // Load data only when this component is rendered
  const { events } = useEventsHybrid();
  const { data: groups = [] } = useQuery({
    queryKey: ['groups-home'],
    queryFn: () => groupsApi.getAll({ limit: 6 }),
    staleTime: 5 * 60 * 1000,
    enabled: groupsEnabled, // Only fetch if feature is enabled
  });

  const { data: news = [] } = useQuery({
    queryKey: ['news-home'],
    queryFn: () => newsApi.getAll({ limit: 4 }),
    staleTime: 5 * 60 * 1000,
    enabled: newsEnabled, // Only fetch if feature is enabled
  });

  // Get upcoming events
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }, [events]);

  // Get featured groups
  const featuredGroups = useMemo(() => {
    return groups
      .filter(group => group.visibility === 'public')
      .slice(0, 3);
  }, [groups]);

  // Get latest news
  const latestNews = useMemo(() => {
    return news.slice(0, 3);
  }, [news]);

  return (
    <>
      {/* Upcoming Events */}
      {eventsEnabled && upcomingEvents.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Upcoming Events
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Don't miss these upcoming tech events
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <DetailedCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  excerpt={event.description}
                  image={event.image}
                  date={event.date}
                  category={event.type}
                  link={getEventUrl(event)}
                  linkText="View Event"
                />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <a 
                href="/events"
                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
              >
                View all events →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Active Groups */}
      {groupsEnabled && featuredGroups.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Active Groups
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Join community groups and connect with peers
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGroups.map((group) => (
                <DetailedCard
                  key={group.id}
                  id={group.id}
                  title={group.name}
                  excerpt={group.description || ''}
                  image={group.heroImage || group.coverImage || '/placeholder-group.png'}
                  category="Community Group"
                  readTime={`${group.memberCount || 0} members`}
                  link={getGroupUrl(group)}
                  linkText="Join Group"
                />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <a 
                href="/groups"
                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
              >
                Explore all groups →
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Latest News */}
      {newsEnabled && latestNews.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Latest News
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Stay updated with community news and insights
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestNews.map((article) => (
                <DetailedCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  excerpt={article.excerpt}
                  image={article.image}
                  date={article.date}
                  author={article.author}
                  category="News"
                  readTime="5 min read"
                  link={`/news/${article.slug || article.id}`}
                  linkText="Read More"
                />
              ))}
            </div>
            
            <div className="text-center mt-8">
              <a 
                href="/news"
                className="inline-flex items-center text-orange-600 hover:text-orange-700 font-semibold"
              >
                Read all news →
              </a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}