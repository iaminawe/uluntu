import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { opportunitiesApi, OpportunityInput } from '@/features/opportunities/api/opportunitiesApi';
import { useMemberByUserId } from '@/hooks/useMemberByUserId';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { generateSlug } from '@/utils/slugUtils';
import { Card } from '@/shared/components/ui/Card';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import BasicInfoSection from './BasicInfoSection';
import ListSection from './ListSection';
import DeleteConfirmModal from './DeleteConfirmModal';
import FormHeader from './FormHeader';
import FormActions from './FormActions';
import LoadingState from './LoadingState';
import { FormData } from './types';
import { initialFormData } from './data';
import { uploadOpportunityImage } from '../../lib/supabase';
import TopicSelector from '@/components/admin/TopicSelector';
import { useEntityTopics, useSetEntityTopics } from '@/features/topics/hooks/useTopicsHybrid';

export default function OpportunityEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const { user } = useAuth();
  const { data: member } = useMemberByUserId(user?.id);
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [newRequirement, setNewRequirement] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  
  // Topic management
  const { data: entityTopics } = useEntityTopics('opportunity', id || '');
  const setEntityTopicsMutation = useSetEntityTopics();
  
  useEffect(() => {
    if (isEditMode && id) {
      loadOpportunity();
    }
  }, [isEditMode, id]);
  
  // Effect to populate topics - only update if actually different
  useEffect(() => {
    if (entityTopics && entityTopics.length > 0) {
      const newTopicIds = entityTopics.map(topic => topic.id);
      // Only update if the topic IDs have actually changed
      setSelectedTopicIds(prevIds => {
        const hasChanged = prevIds.length !== newTopicIds.length || 
                          !prevIds.every(id => newTopicIds.includes(id));
        return hasChanged ? newTopicIds : prevIds;
      });
    }
  }, [entityTopics]);

  const loadOpportunity = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const opportunity = await opportunitiesApi.getExtendedById(id);
      if (opportunity) {
        setFormData({
          title: opportunity.title,
          slug: opportunity.slug || generateSlug(opportunity.title),
          description: opportunity.description,
          type: opportunity.type as FormData['type'],
          organization: opportunity.organization,
          location: opportunity.location,
          deadline: opportunity.deadline,
          contactEmail: opportunity.contactEmail,
          website: opportunity.website,
          image: opportunity.image,
          compensation: opportunity.compensation,
          requirements: opportunity.requirements,
          responsibilities: opportunity.responsibilities,
          benefits: opportunity.benefits,
          status: opportunity.status as FormData['status'],
          featured: opportunity.featured
        });
      }
    } catch (error) {
      console.error('Error loading opportunity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDescriptionChange = (data: string) => {
    setFormData(prev => ({
      ...prev,
      description: data
    }));
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

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleAddResponsibility = () => {
    if (newResponsibility.trim()) {
      setFormData(prev => ({
        ...prev,
        responsibilities: [...prev.responsibilities, newResponsibility.trim()]
      }));
      setNewResponsibility('');
    }
  };

  const handleRemoveResponsibility = (index: number) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    // Required field validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
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
        const opportunityId = id || `temp-${Date.now()}`;
        const { url, error } = await uploadOpportunityImage(imageFile, opportunityId);
        
        if (error) {
          console.error('Error uploading image:', error);
          setErrors(prev => ({ ...prev, image: 'Failed to upload image. Please try again.' }));
          return;
        }
        
        finalImageUrl = url || '';
        setIsUploadingImage(false);
      }
      
      if (!member) {
        console.error('Member not found for opportunity creation');
        return;
      }
      
      const opportunityData: OpportunityInput = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        organization: formData.organization,
        location: formData.location,
        compensation: formData.compensation,
        deadline: formData.deadline,
        contactEmail: formData.contactEmail,
        website: formData.website,
        image: finalImageUrl,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        benefits: formData.benefits,
        status: formData.status as "draft" | "published" | "archived" | null | undefined,
        featured: formData.featured,
        postedBy: member.id
      };

      let result;
      if (isEditMode && id) {
        result = await opportunitiesApi.update(id, opportunityData);
      } else {
        result = await opportunitiesApi.create(opportunityData);
      }

      if (result) {
        // Save topics after successful entity save
        if (selectedTopicIds.length > 0) {
          try {
            await setEntityTopicsMutation.mutateAsync({
              entityType: 'opportunity',
              entityId: result.id,
              topicIds: selectedTopicIds
            });
          } catch (topicError) {
            console.error('Error saving topics:', topicError);
          }
        }
        
        setSubmitSuccess(true);
        
        // Navigate back after success
        setTimeout(() => {
          navigate(isEditMode ? `/opportunities/${id}` : '/opportunities');
        }, 2000);
      } else {
        throw new Error('Failed to save opportunity');
      }
    } catch (error) {
      console.error('Error submitting opportunity:', error);
      setErrors(prev => ({ ...prev, image: 'Failed to save opportunity. Please try again.' }));
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await opportunitiesApi.delete(id);
      if (success) {
        navigate('/opportunities');
      } else {
        console.error('Failed to delete opportunity');
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      setShowDeleteConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEditMode ? 'Edit Opportunity' : 'Create New Opportunity'} - Kootenay Tech Community</title>
        <meta name="description" content={isEditMode ? 'Edit an existing opportunity' : 'Create a new opportunity listing'} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-12">
        <div className="w-4/5 max-w-[80%] mx-auto">
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            <FormHeader 
              isEditMode={isEditMode} 
              opportunityTitle={formData.title} 
            />
            
            {submitSuccess ? (
              <Card className="mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4">
                  <div className="flex">
                    <div>
                      <p className="text-sm text-green-700 dark:text-green-400">
                        {isEditMode 
                          ? 'Opportunity updated successfully!' 
                          : 'Opportunity created successfully!'} 
                        Redirecting...
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                  <BasicInfoSection 
                    formData={formData}
                    errors={errors}
                    onChange={handleChange}
                    onDescriptionChange={handleDescriptionChange}
                    onImageChange={handleImageChange}
                    isSubmitting={isSubmitting || isUploadingImage}
                  />
                  
                  {/* Topics Section */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Topics
                    </label>
                    <TopicSelector
                      selectedTopics={selectedTopicIds}
                      onTopicsChange={setSelectedTopicIds}
                      placeholder="Search and select topics for this opportunity..."
                      maxTopics={5}
                      className="w-full"
                    />
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Add topics to help categorize this opportunity and make it discoverable on topic pages.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ListSection
                      items={formData.requirements}
                      newItem={newRequirement}
                      setNewItem={setNewRequirement}
                      onAdd={handleAddRequirement}
                      onRemove={handleRemoveRequirement}
                      label="Requirements"
                      placeholder="Add a requirement"
                      isSubmitting={isSubmitting}
                    />
                    
                    <ListSection
                      items={formData.responsibilities}
                      newItem={newResponsibility}
                      setNewItem={setNewResponsibility}
                      onAdd={handleAddResponsibility}
                      onRemove={handleRemoveResponsibility}
                      label="Responsibilities"
                      placeholder="Add a responsibility"
                      isSubmitting={isSubmitting}
                    />
                    
                    <ListSection
                      items={formData.benefits}
                      newItem={newBenefit}
                      setNewItem={setNewBenefit}
                      onAdd={handleAddBenefit}
                      onRemove={handleRemoveBenefit}
                      label="Benefits"
                      placeholder="Add a benefit"
                      isSubmitting={isSubmitting}
                    />
                  </div>
                  
                  <FormActions
                    isEditMode={isEditMode}
                    isSubmitting={isSubmitting}
                    formData={formData}
                    id={id}
                    setShowDeleteConfirm={setShowDeleteConfirm}
                    setFormData={setFormData}
                  />
                </form>
              </Card>
            )}
          </>
        )}
        
        <DeleteConfirmModal 
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
        />
        </div>
      </div>
    </>
  );
}
