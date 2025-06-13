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
import { useEventsRedux } from '../../hooks/useEventsRedux';

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  // Use the Redux-based useEventsRedux hook to fetch events data.
  const { events = [], isLoading, error, getAllEvents } = useEventsRedux();
  
  // Fetch events when component mounts
  useEffect(() => {
    getAllEvents();
  }, [getAllEvents]);
  
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
            error={error || 'Error loading events'} 
            retry={() => getAllEvents()} 
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
            initialSearch={searchTerm} 
            parentEvents={events} 
            parentLoading={isLoading} 
            parentError={error}
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
