import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '../../hooks/useQueries';
import { Event } from '../../types';
import { format } from 'date-fns';
import FormHeader from './FormHeader';
import EventDetails from './EventDetails';
import EventImage from './EventImage';
import OrganizerSelect from './OrganizerSelect';
import SessionsManager from './SessionsManager';
import FormActions from './FormActions';
import LoadingState from './LoadingState';
import { FormData } from './types'; // Removed duplicate import

const initialFormData: FormData = {
  title: '',
  date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  endDate: format(new Date(new Date().getTime() + 2 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"), // 2 hours later
  location: '',
  description: '',
  image: '',
  type: 'in-person',
  url: '',
  organizerId: 1,
  sessions: []
};

export default function EventEditPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const eventId = id ? parseInt(id) : 0; // Using 0 instead of undefined to avoid type issues
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { 
    data: event, 
    isLoading: eventLoading
  } = useEvent(isEditMode ? eventId : 0); // Only fetch if in edit mode
  
  // Populate form with event data when in edit mode
  useEffect(() => {
    // Debug logging
    console.log('EventEditPage - Event ID:', eventId);
    console.log('EventEditPage - Event data:', event);
    console.log('EventEditPage - Event loading:', eventLoading);
    
    if (isEditMode && event) {
      console.log('EventEditPage - Setting form data from event');
      setFormData({
        title: event.title,
        date: event.date,
        endDate: event.endDate || format(new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
        location: event.location,
        description: event.description,
        image: event.image || '',
        type: event.type,
        url: event.url || '',
        organizerId: event.organizer.id,
        sessions: event.sessions || []
      });
    }
  }, [isEditMode, event, eventId, eventLoading]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Start date is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (formData.type === 'online' && !formData.url) {
      newErrors.url = 'URL is required for online events';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitSuccess(true);
      
      // Navigate back after success
      setTimeout(() => {
        navigate(isEditMode ? `/events/${id}` : '/events');
      }, 1500);
    } catch (error) {
      console.error('Error submitting event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (eventLoading && isEditMode) {
    return <LoadingState />;
  }
  
  return (
    <>
      <Helmet>
        <title>
          {isEditMode 
            ? `Edit Event: ${event?.title || 'Loading...'}`
            : 'Create New Event'
          } - Kootenay Tech Community
        </title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <FormHeader 
            isEditMode={isEditMode} 
            title={event?.title || ''} 
          />
          
          {submitSuccess ? (
            <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {isEditMode 
                      ? 'Event updated successfully!' 
                      : 'Event created successfully!'
                    } Redirecting...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 shadow-md rounded-lg p-6 space-y-6">
              <EventDetails 
                formData={formData}
                handleChange={handleChange}
                errors={errors}
              />
              
              <EventImage 
                formData={formData}
                handleChange={handleChange}
              />
              
              <OrganizerSelect
                organizer={{
                  id: formData.organizerId,
                  name: event?.organizer?.name || '',
                  image: event?.organizer?.image || ''
                }}
                onOrganizerChange={(organizer) => setFormData({ ...formData, organizerId: organizer.id })}
              />
              
              <SessionsManager
                sessions={formData.sessions || []}
                onSessionsChange={(sessions) => setFormData({ ...formData, sessions })}
              />
              
              <FormActions 
                isEditMode={isEditMode}
                isSubmitting={isSubmitting}
                navigate={navigate}
                id={id}
              />
            </form>
          )}
        </div>
      </div>
    </>
  );
}
