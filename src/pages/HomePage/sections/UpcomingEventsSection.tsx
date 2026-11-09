import { useMemo } from 'react';
import { useEventsHybrid } from '@/features/events/hooks/useEventsHybrid';
import { DetailedCard } from '@/shared/components/visual';

export default function UpcomingEventsSection() {
  const { events, isLoading } = useEventsHybrid();
  
  // Get upcoming events sorted by date
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6);
  }, [events]);

  if (isLoading || upcomingEvents.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Upcoming Events
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Join the latest events happening in the Uluntu community
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
              category={event.type === 'online' ? 'Online' : event.type === 'hybrid' ? 'Hybrid' : 'In-Person'}
              link={`/events/${event.id}`}
              linkText="View Event"
              author={{
                name: event.organizer?.name || 'Organizer',
                image: event.organizer?.image || ''
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}