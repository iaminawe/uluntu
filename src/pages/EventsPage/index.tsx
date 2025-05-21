import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '../../components/ui/PageLayout';
import { SkeletonGrid } from '../../components/ui/Skeleton';
import { QueryError } from '../../components/ui/ErrorDisplay';
import { EmptyState } from '../../components/ui/PageLayout';
import EventsList from '../../components/EventsList';
import PageHeader from './PageHeader';
import ActionBar from './ActionBar';

// Define a simplified Event type
interface Event {
  id: number;
  title: string;
  date: string;
}

export default function EventsPage() {
  // These would normally come from a hook like useEvents()
  const isLoading = false;
  const error = null;
  const events: Event[] = []; // Assuming this would be populated from an API
  const hasEvents = events.length > 0;
  
  return (
    <>
      <Helmet>
        <title>Tech Events - Kootenay Tech Community</title>
        <meta name="description" content="Upcoming tech events, workshops, and meetups in the Kootenay region" />
      </Helmet>
      
      <PageHeader />
      
      <ContentContainer>
        <ActionBar />
        
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
        ) : (
          <EventsList />
        )}
      </ContentContainer>
    </>
  );
}
