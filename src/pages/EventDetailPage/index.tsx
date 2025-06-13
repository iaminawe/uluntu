import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEventRedux } from '../../hooks/useEventsRedux';
import { useRegisterForEvent, useUnregisterFromEvent, useEventRegistrationStatus } from '../../hooks/useEventQueries';
import { useUserProfile } from '../../hooks/useProfileQueries';
import { format, parseISO } from 'date-fns';
import { ContentContainer } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';
import PageHeader from './PageHeader';
import EventHero from './EventHero';
import EventInfo from './EventInfo';
import RegisterSidebar from './RegisterSidebar';
import EventDetailsCard from './EventDetailsCard';
import AttendeesList from './AttendeesList';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

export default function EventDetailPage() {
  const { id } = useParams();
  // Use the original string ID as useEvent expects a string
  const eventIdString = id || '';
  
  // Use Redux-based hook for a single event
  const { event, isLoading, error, getEvent } = useEventRedux(eventIdString);
  
  // Get current user profile to get member ID
  const { data: userProfile } = useUserProfile();
  const currentMemberId = userProfile?.id;
  
  // Registration hooks
  const { data: isAlreadyRegistered = false } = useEventRegistrationStatus(eventIdString, currentMemberId);
  const registerMutation = useRegisterForEvent();
  const unregisterMutation = useUnregisterFromEvent();
  
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Fetch event when component mounts or ID changes
  useEffect(() => {
    getEvent();
  }, [getEvent, eventIdString]);
  
  // Reset success state when registration status changes
  useEffect(() => {
    if (isAlreadyRegistered) {
      setRegistrationSuccess(false);
    }
  }, [isAlreadyRegistered]);
  
  const handleRegister = async () => {
    if (!currentMemberId || !eventIdString) {
      console.error('Missing member ID or event ID');
      return;
    }
    
    try {
      if (isAlreadyRegistered) {
        await unregisterMutation.mutateAsync({ eventId: eventIdString, memberId: currentMemberId });
      } else {
        await registerMutation.mutateAsync({ eventId: eventIdString, memberId: currentMemberId });
        setRegistrationSuccess(true);
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };
  
  const isRegistering = registerMutation.isPending || unregisterMutation.isPending;
  
  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !event) {
    return <ErrorState />;
  }

  // Check if current user is the organizer
  const isOrganizer = userProfile?.id === event.organizer?.id;
  
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
                    isAlreadyRegistered={isAlreadyRegistered}
                    onRegister={handleRegister}
                  />
                  
                  <div className="mt-6">
                    <EventDetailsCard 
                      event={event} 
                      formattedDate={formattedDate} 
                      formattedTime={formattedTime} 
                    />
                  </div>
                  
                  <div className="mt-6">
                    <AttendeesList 
                      eventId={eventIdString}
                      isOrganizer={isOrganizer}
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
