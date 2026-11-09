import { useMemo } from 'react';
import { useMembersHybrid } from '@/features/directory/hooks/useMembersHybrid';
import { DetailedCard } from '@/shared/components/visual';
import { getMemberProfileUrl } from '@/utils/memberSlugUtils';

export default function NewMembersSection() {
  const { members, isLoading } = useMembersHybrid();
  
  const newMembers = useMemo(() => {
    return members
      .slice(0, 6)
      .map(member => ({
        id: member.id,
        title: member.name,
        excerpt: member.bio || 'Welcome to our growing community!',
        image: member.image,
        date: member.joinDate || member.created_at,
        category: member.title || member.role || 'Community Member',
        readTime: member.company || 'View Profile',
        link: getMemberProfileUrl(member),
        type: 'member' as const,
        author: {
          id: member.id,
          name: member.name,
          image: member.image || ''
        }
      }));
  }, [members]);

  if (isLoading || newMembers.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            New Members
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Welcome our newest members to the Uluntu community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newMembers.map((member) => (
            <DetailedCard
              key={`member-${member.id}`}
              id={member.id}
              title={member.title}
              excerpt={member.excerpt}
              image={member.image}
              date={member.date}
              author={member.author}
              category={member.category}
              readTime={member.readTime}
              link={member.link}
              linkText="View Profile"
            />
          ))}
        </div>
      </div>
    </section>
  );
}