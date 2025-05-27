import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentStatus } from '../../data/mock/types';
import { ContentContainer } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';
import FormHeader from './FormHeader';
import ResourceDetails from './ResourceDetails';
import ResourceTypeSelect from './ResourceTypeSelect';
import UrlInput from './UrlInput';
import TagsInput from './TagsInput';
import GroupSelect from './GroupSelect';
import StatusOptions from './StatusOptions';
import FormActions from './FormActions';
import DeleteConfirm from './DeleteConfirm';
import LoadingState from './LoadingState';
import { FormData, ResourceType } from './types';

// This would normally come from a hook like useResource
const SAMPLE_RESOURCE = {
  id: '1', // Use string ID for consistency across the application
  title: 'Introduction to AI Ethics',
  description: 'A comprehensive guide to ethical considerations in AI development.',
  type: 'document' as ResourceType,
  url: 'https://example.com/ai-ethics-guide',
  tags: ['AI', 'Ethics', 'Technology', 'Guidelines'],
  group: {
    id: '1', // Use string ID for consistency across the application
    name: 'AI Enthusiasts Kootenay'
  },
  status: 'published' as ContentStatus,
  featured: true // Example resource is featured
};

export default function ResourceEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id !== undefined && id !== 'create';
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    status: 'draft' as ContentStatus,
    featured: false, // Default not featured
    type: 'document' as ResourceType,
    url: '',
    tags: [] as string[],
    groupId: '',
    newTag: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);
  
  useEffect(() => {
    if (isEditing) {
      // This would normally be an API call
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setFormData({
          title: SAMPLE_RESOURCE.title,
          description: SAMPLE_RESOURCE.description,
          type: SAMPLE_RESOURCE.type,
          url: SAMPLE_RESOURCE.url,
          tags: SAMPLE_RESOURCE.tags,
          groupId: SAMPLE_RESOURCE.group.id.toString(),
          newTag: '',
          status: SAMPLE_RESOURCE.status,
          featured: SAMPLE_RESOURCE.featured || false
        });
        setIsLoading(false);
      }, 500);
    }
  }, [isEditing]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // This would normally send the data to an API
      console.log('Submitting resource data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/resources');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      // This would normally send a delete request to an API
      console.log('Deleting resource:', id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect after successful deletion
      navigate('/resources');
    } catch (error) {
      console.error('Error deleting resource:', error);
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Edit Resource' : 'Add New Resource'} - Kootenay Tech Community</title>
      </Helmet>
      
      <ContentContainer maxWidth="lg">
          <FormHeader isEditing={isEditing} />
          
          <Card className="p-6">
            {submitSuccess ? (
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4">
                <div className="flex">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Resource {isEditing ? 'updated' : 'created'} successfully! Redirecting...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <ResourceDetails 
                  formData={formData} 
                  handleChange={handleChange} 
                />
                
                <ResourceTypeSelect 
                  formData={formData} 
                  handleChange={handleChange} 
                />
                
                <UrlInput 
                  formData={formData} 
                  handleChange={handleChange} 
                />
                
                <TagsInput 
                  formData={formData} 
                  handleChange={handleChange}
                  handleAddTag={handleAddTag}
                  handleRemoveTag={handleRemoveTag}
                />
                
                <GroupSelect 
                  formData={formData} 
                  handleChange={handleChange} 
                />
                
                <StatusOptions 
                  formData={formData} 
                  handleChange={handleChange}
                  setFormData={setFormData}
                />
                
                <FormActions 
                  isEditing={isEditing}
                  isSubmitting={isSubmitting}
                  submitSuccess={submitSuccess}
                  formData={formData}
                  setShowDeleteConfirm={setShowDeleteConfirm}
                />
              </form>
            )}
          </Card>
      </ContentContainer>
      
      <DeleteConfirm
        show={showDeleteConfirm}
        setShow={setShowDeleteConfirm}
        handleDelete={handleDelete}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
