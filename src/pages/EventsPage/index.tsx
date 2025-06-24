import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import { EmptyState } from '@/shared/components/ui/PageLayout';
import EventsList from '@/features/events/components/EventsList';
import EventsCalendar from '@/features/events/components/EventsCalendar';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useEventsHybrid } from '@/features/events/hooks/useEventsHybrid';

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Use hybrid approach: React Query for data, Redux for UI state
  const {
    events,
    isLoading,
    isError,
    error,
    refetch,
    setSearchTerm
  } = useEventsHybrid();
  
  const hasEvents = events && events.length > 0;

  
  return (
    <>
      <Helmet>
        <title>Tech Events - Kootenay Tech Community</title>
        <meta name="description" content="Upcoming tech events, workshops, and meetups in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ActionBar 
          onSearch={setSearchTerm} 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
        />
        
        {isLoading ? (
          <SkeletonGrid count={4} columns={{ sm: 1, md: 2, lg: 2 }} />
        ) : isError ? (
          <QueryError 
            error={error ? new Error(String(error)) : new Error('Failed to load events')} 
            retry={refetch} 
            message="We couldn't load the events. Please try again."
          />
        ) : !hasEvents ? (
          <EmptyState
            title="No Events Found"
            description="There are no upcoming events scheduled at this time."
            primaryActionUrl="/events/create"
            primaryAction={{
              text: "Create an Event",
              onClick: () => console.log('Navigate to create event')
            }}
          />
        ) : viewMode === 'list' ? (
          <EventsList 
            parentEvents={events}
            parentLoading={isLoading}
            parentError={error?.message || null}
          />
        ) : (
          <EventsCalendar 
            events={events}
            isLoading={isLoading}
            error={error}
          />
        )}
      </ContentContainer>
    </>
  );
}
