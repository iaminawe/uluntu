import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useEventHybrid, useEventsHybrid } from '@/features/events/hooks/useEventsHybrid';
import { EventInput } from '@/features/events/types';
import { useMemberByUserId } from '@/hooks/useMemberByUserId';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { format } from 'date-fns';
import { generateSlug } from '@/utils/slugUtils';
import FormHeader from './FormHeader';
import EventDetails from './EventDetails';
import EventImage from './EventImage';
import OrganizerSelect from './OrganizerSelect';
import SessionsManager from './SessionsManager';
import FormActions from './FormActions';
import LoadingState from './LoadingState';
import { FormData } from './types';
import { uploadEventImage } from '../../lib/supabase';
import TopicSelector from '@/components/admin/TopicSelector';
import { useEntityTopics, useSetEntityTopics } from '@/features/topics/hooks/useTopicsHybrid';

const initialFormData: FormData = {
  title: '',
  slug: '',
  date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  endDate: format(new Date(new Date().getTime() + 2 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"), // 2 hours later
  location: '',
  description: '',
  image: '',
  type: 'in-person',
  url: '',
  organizerId: '1', // Use string ID to match expected type
  sessions: [],
  status: 'draft'
};

export default function EventEditPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  // Use the original string ID which is what useEvent expects
  const eventIdString = id || '';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: member } = useMemberByUserId(user?.id);
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  
  // Use hybrid approach for event data
  const { event, isLoading: eventLoading, updateEvent } = useEventHybrid(isEditMode ? id : undefined);
  const { createEvent } = useEventsHybrid();
  
  // Topic management
  const { data: entityTopics } = useEntityTopics('event', eventIdString);
  const setEntityTopicsMutation = useSetEntityTopics();
  
  // Populate form with event data when in edit mode
  useEffect(() => {
    // Debug logging
    console.log('EventEditPage - Event ID:', eventIdString);
    console.log('EventEditPage - Event data:', event);
    console.log('EventEditPage - Event loading:', eventLoading);
    
    if (isEditMode && event) {
      console.log('EventEditPage - Setting form data from event');
      setFormData({
        title: event.title,
        slug: event.slug || generateSlug(event.title),
        date: event.date,
        endDate: event.endDate || format(new Date(new Date(event.date).getTime() + 2 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
        location: event.location,
        description: event.description,
        image: event.image || '',
        type: event.type,
        url: event.url || '',
        organizerId: String(event.organizer.id), // Ensure organizerId is a string
        sessions: event.sessions || []
      });
    }
  }, [isEditMode, event, eventIdString, eventLoading]);
  
  // Populate topics when entity topics are loaded
  useEffect(() => {
    if (entityTopics) {
      setSelectedTopicIds(entityTopics.map(topic => topic.id));
    }
  }, [entityTopics]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug when title changes and slug is empty
    if (name === 'title' && !formData.slug) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        image: objectUrl
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        image: ''
      }));
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
    let finalImageUrl = formData.image;
    
    try {
      // Upload image if a new file was selected
      if (imageFile) {
        setIsUploadingImage(true);
        const eventId = id || `temp-${Date.now()}`;
        const { url, error } = await uploadEventImage(imageFile, eventId);
        
        if (error) {
          console.error('Error uploading image:', error);
          setErrors(prev => ({ ...prev, image: 'Failed to upload image. Please try again.' }));
          return;
        }
        
        finalImageUrl = url || '';
        setIsUploadingImage(false);
      }
      
      let eventResult;
      if (isEditMode && id) {
        // Update existing event using hybrid hook
        eventResult = await updateEvent({
          title: formData.title,
          description: formData.description,
          date: formData.date,
          end_date: formData.endDate,
          location: formData.location,
          image: finalImageUrl,
          url: formData.url || undefined,
          organizer_id: formData.organizerId || member?.id || ''
        });
        eventResult = { id }; // Use existing ID for topic update
      } else {
        // Create new event using events API
        if (!member) {
          console.error('Member not found for event creation');
          return;
        }
        
        const eventData: EventInput = {
          title: formData.title,
          description: formData.description,
          date: formData.date,
          end_date: formData.endDate,
          location: formData.location,
          image: finalImageUrl,
          url: formData.url || undefined,
          organizer_id: member.id,
          status: 'published'
        };

        eventResult = await createEvent(eventData);
      }
      
      // Save topics after successful event save
      if (eventResult && selectedTopicIds.length > 0) {
        await setEntityTopicsMutation.mutateAsync({
          entityType: 'event',
          entityId: eventResult.id,
          topicIds: selectedTopicIds
        });
      }
      
      setSubmitSuccess(true);
      
      // Navigate back after success
      setTimeout(() => {
        navigate(isEditMode ? `/events/${id}` : '/events');
      }, 1500);
    } catch (error) {
      console.error('Error submitting event:', error);
      setErrors(prev => ({ ...prev, image: 'Failed to save event. Please try again.' }));
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
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
        <div className="w-4/5 max-w-[80%] mx-auto">
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
                onImageChange={handleImageChange}
                isSubmitting={isSubmitting || isUploadingImage}
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
              
              {/* Topics Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topics
                </label>
                <TopicSelector
                  selectedTopics={selectedTopicIds}
                  onTopicsChange={setSelectedTopicIds}
                  placeholder="Search and select topics for this event..."
                  maxTopics={5}
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add topics to help categorize this event and make it discoverable on topic pages.
                </p>
              </div>
              
              <FormActions 
                isEditMode={isEditMode}
                isSubmitting={isSubmitting}
                navigate={navigate}
                id={id}
                status={formData.status}
                onStatusChange={(status) => setFormData({ ...formData, status })}
              />
            </form>
          )}
        </div>
      </div>
    </>
  );
}
