import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroup, useCreateGroup, useUpdateGroup } from '../../hooks/useGroupQueries';
import { ContentContainer } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';
import { TagsInput } from '../../components/TagsInput';
import FormHeader from './FormHeader';
import GroupInfo from './GroupInfo';
import VisibilitySelect from './VisibilitySelect';
import ImageUpload from './ImageUpload';
import FormActions from './FormActions';
import LoadingState from './LoadingState';
import { FormData } from './types';

const initialFormData: FormData = {
  name: '',
  description: '',
  longDescription: '',
  heroImage: '',
  coverImage: '',
  visibility: 'open',
  interests: []
};

export default function GroupEditPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const groupId = id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { 
    data: group, 
    isLoading: groupLoading
  } = useGroup(groupId);
  
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  
  // Populate form with group data when in edit mode
  useEffect(() => {
    if (isEditMode && group) {
      setFormData({
        name: group.name,
        description: group.description,
        longDescription: group.longDescription || '',
        heroImage: group.heroImage || '',
        coverImage: group.coverImage || '',
        visibility: (['open', 'closed', 'secret'].includes(group.visibility as string)
          ? (group.visibility as 'open' | 'closed' | 'secret')
          : 'open'),
        interests: group.interests || []
      });
    }
  }, [isEditMode, group]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleInterestsChange = (interests: string[]) => {
    setFormData(prev => ({ ...prev, interests }));
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Short description is required';
    }
    
    if (!formData.heroImage.trim()) {
      newErrors.heroImage = 'Hero image is required';
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
      const groupData = {
        name: formData.name,
        description: formData.description,
        longDescription: formData.longDescription || null,
        heroImage: formData.heroImage,
        visibility: formData.visibility,
        interests: formData.interests
      };
      
      if (isEditMode && id) {
        await updateGroup.mutateAsync({ id, data: groupData });
        console.log('Group updated successfully!');
      } else {
        const result = await createGroup.mutateAsync(groupData);
        if (result) {
          console.log('Group created successfully!');
        }
      }
      
      setSubmitSuccess(true);
      
      // Navigate back after success
      setTimeout(() => {
        navigate(isEditMode ? `/groups/${id}` : '/groups');
      }, 1500);
    } catch (error) {
      console.error('Error submitting group:', error);
      console.error(isEditMode ? 'Failed to update group' : 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (groupLoading && isEditMode) {
    return <LoadingState />;
  }
  
  return (
    <>
      <Helmet>
        <title>
          {isEditMode ? `Edit Group: ${group?.name || 'Loading...'}` : 'Create New Group'} - Kootenay Tech Community
        </title>
        <meta 
          name="description" 
          content={`${isEditMode ? 'Edit' : 'Create'} a group for the Kootenay Tech Community.`} 
        />
      </Helmet>
      
      <ContentContainer maxWidth="lg">
          <FormHeader 
            isEditMode={isEditMode} 
            groupName={group?.name || ''} 
          />
          
          {submitSuccess ? (
            <Card className="mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4">
                <div className="flex">
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      {isEditMode 
                        ? 'Group updated successfully!' 
                        : 'Group created successfully!'
                      } Redirecting...
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <GroupInfo 
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                />
                
                <VisibilitySelect 
                  formData={formData}
                  handleChange={handleChange}
                />
                
                <ImageUpload 
                  formData={formData}
                  handleChange={handleChange}
                  errors={errors}
                />
                
                <div>
                  <TagsInput
                    label="Interests, Hobbies, and Goals"
                    value={formData.interests}
                    onChange={handleInterestsChange}
                    placeholder="Add interests (e.g., hiking, photography, AI)"
                    helperText="Add tags to help people find groups based on shared interests"
                  />
                </div>
                
                <FormActions 
                  isEditMode={isEditMode}
                  isSubmitting={isSubmitting}
                  navigate={navigate}
                  id={id}
                />
              </form>
            </Card>
          )}
      </ContentContainer>
    </>
  );
}
