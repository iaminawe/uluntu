import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { ContentStatus } from '../../data/mock/types';
import { resourcesApi, ResourceInput } from '@/features/resources/api/resourcesApi';
import { useMemberByUserId } from '@/hooks/useMemberByUserId';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { Card } from '@/shared/components/ui/Card';
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
  const { user } = useAuth();
  const { data: member } = useMemberByUserId(user?.id);
  
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
    if (isEditing && id) {
      loadResource();
    }
  }, [isEditing, id]);

  const loadResource = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const resource = await resourcesApi.getById(id);
      if (resource) {
        setFormData({
          title: resource.title,
          description: resource.description,
          type: resource.type as ResourceType,
          url: resource.url,
          tags: resource.tags || [],
          groupId: resource.groupId || '',
          newTag: '',
          status: resource.status,
          featured: resource.featured || false
        });
      }
    } catch (error) {
      console.error('Error loading resource:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
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
    if (!member) {
      console.error('Member not found');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const resourceData: ResourceInput = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        url: formData.url,
        status: formData.status,
        featured: formData.featured,
        contributorId: member.id,
        groupId: formData.groupId || null,
        tags: formData.tags
      };

      let result;
      if (isEditing && id) {
        result = await resourcesApi.update(id, resourceData);
      } else {
        result = await resourcesApi.create(resourceData);
      }

      if (result) {
        setSubmitSuccess(true);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/resources');
        }, 1500);
      } else {
        throw new Error('Failed to save resource');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    
    try {
      const success = await resourcesApi.delete(id);
      if (success) {
        navigate('/resources');
      } else {
        console.error('Failed to delete resource');
      }
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
