import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '@/features/groups/api/groupsApi';
import { DetailedCard } from '@/shared/components/visual';
import { getGroupUrl } from '@/utils/contentUrlUtils';

export default function ActiveGroupsSection() {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups-home'],
    queryFn: () => groupsApi.getAll({ limit: 10 }),
    staleTime: 5 * 60 * 1000,
  });
  
  const recentActiveGroups = useMemo(() => {
    return groups
      .filter(group => group.visibility === 'public')
      .slice(0, 6)
      .map(group => ({
        id: group.id,
        title: group.name,
        excerpt: group.description || 'Join this active community group',
        image: group.heroImage || group.coverImage,
        date: group.lastActive || group.created_at,
        category: 'Community Group',
        readTime: `${group.memberCount || 0} members`,
        link: getGroupUrl(group),
        type: 'group' as const
      }));
  }, [groups]);

  if (isLoading || recentActiveGroups.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Active Groups
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Join thriving community groups and connect with like-minded professionals
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentActiveGroups.map((group) => (
            <DetailedCard
              key={`group-${group.id}`}
              id={group.id}
              title={group.title}
              excerpt={group.excerpt}
              image={group.image}
              date={group.date}
              category={group.category}
              readTime={group.readTime}
              link={group.link}
              linkText="Join Group"
            />
          ))}
        </div>
      </div>
    </section>
  );
}