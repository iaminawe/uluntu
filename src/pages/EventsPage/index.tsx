import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import { EmptyState } from '../../components/ui/PageLayout';
import EventsList from '../../components/EventsList';
import EventsCalendar from '../../components/EventsCalendar';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';
import { useEvents } from '../../hooks/useQueries';

// Using Event type from useQueries

export default function EventsPage() {
  // State for search term from ActionBar
  const [searchTerm, setSearchTerm] = useState('');
  // State for view mode (list or calendar)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  // Use the useEvents hook to fetch events data
  const { data: events = [], isLoading, error } = useEvents();
  const hasEvents = events.length > 0;
  
  useEffect(() => {
    console.log('EventsPage - Events:', events);
    console.log('EventsPage - Loading:', isLoading);
    console.log('EventsPage - Error:', error);
  }, [events, isLoading, error]);
  
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
        ) : error ? (
          <QueryError 
            error={error} 
            retry={() => console.log('Retrying events query')} 
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
          <EventsList initialSearch={searchTerm} />
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
