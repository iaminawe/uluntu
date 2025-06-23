import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEventHybrid } from '@/features/events/hooks/useEventsHybrid';
import { format, parseISO } from 'date-fns';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { Card } from '@/shared/components/ui/Card';
import PageHeader from './PageHeader';
import EventHero from './EventHero';
import EventInfo from './EventInfo';
import RegisterSidebar from './RegisterSidebar';
import EventDetailsCard from './EventDetailsCard';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

export default function EventDetailPage() {
  const { id } = useParams();
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Use hybrid approach for data fetching
  const { event, isLoading, error } = useEventHybrid(id);
  
  const handleRegister = () => {
    setIsRegistering(true);
    // Simulate API call for registration
    setTimeout(() => {
      setIsRegistering(false);
      setRegistrationSuccess(true);
    }, 1000);
  };
  
  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !event) {
    return <ErrorState />;
  }

  // Format dates for display
  const eventDate = parseISO(event.date);
  const formattedDate = format(eventDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(eventDate, 'h:mm a');
  
  // If end date exists and is different from start date
  let dateRangeDisplay = formattedDate;
  if (event.endDate && event.endDate !== event.date) {
    const endDate = parseISO(event.endDate);
    dateRangeDisplay = `${format(eventDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  }

  return (
    <>
      <Helmet>
        <title>{event.title} - Kootenay Tech Community</title>
        <meta name="description" content={event.description} />
      </Helmet>
      
      <ContentContainer>
          <PageHeader id={id as string} />
          
          <Card className="overflow-hidden">
            {/* Hero Section with image and title */}
            <EventHero event={event} dateRangeDisplay={dateRangeDisplay} />
            
            {/* Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                  <EventInfo event={event} formattedDate={formattedDate} formattedTime={formattedTime} />
                </div>
                
                {/* Sidebar */}
                <div>
                  <RegisterSidebar 
                    event={event}
                    formattedDate={formattedDate}
                    formattedTime={formattedTime}
                    isRegistering={isRegistering}
                    registrationSuccess={registrationSuccess}
                    onRegister={handleRegister}
                  />
                  
                  <div className="mt-6">
                    <EventDetailsCard 
                      event={event} 
                      formattedDate={formattedDate} 
                      formattedTime={formattedTime} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
      </ContentContainer>
    </>
  );
}
