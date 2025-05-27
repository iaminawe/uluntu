import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { ContentContainer } from '../../components/ui/PageLayout';
import BasicInfoSection from './BasicInfoSection';
import ListSection from './ListSection';
import DeleteConfirmModal from './DeleteConfirmModal';
import FormHeader from './FormHeader';
import FormActions from './FormActions';
import LoadingState from './LoadingState';
import { FormData } from './types';
import { SAMPLE_OPPORTUNITY, initialFormData } from './data';

export default function OpportunityEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [newRequirement, setNewRequirement] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  
  // In a real implementation, this would use a hook like useOpportunity(opportunityId)
  useEffect(() => {
    if (isEditMode) {
      // Simulate loading
      const timer = setTimeout(() => {
        // For edit mode, populate form with sample data
        setFormData({
          title: SAMPLE_OPPORTUNITY.title,
          description: SAMPLE_OPPORTUNITY.description,
          type: SAMPLE_OPPORTUNITY.type,
          organization: SAMPLE_OPPORTUNITY.organization,
          location: SAMPLE_OPPORTUNITY.location,
          deadline: SAMPLE_OPPORTUNITY.deadline,
          contactEmail: SAMPLE_OPPORTUNITY.contactEmail || '',
          website: SAMPLE_OPPORTUNITY.website || '',
          image: SAMPLE_OPPORTUNITY.image || '',
          compensation: SAMPLE_OPPORTUNITY.compensation || '',
          requirements: SAMPLE_OPPORTUNITY.requirements || [],
          responsibilities: SAMPLE_OPPORTUNITY.responsibilities || [],
          benefits: SAMPLE_OPPORTUNITY.benefits || [],
          status: SAMPLE_OPPORTUNITY.status,
          featured: SAMPLE_OPPORTUNITY.featured
        });
        setIsLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isEditMode, id]);

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
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      
      // Navigate back after success
      setTimeout(() => {
        navigate(isEditMode ? `/opportunities/${id}` : '/opportunities');
      }, 2000);
    } catch (error) {
      console.error('Error submitting opportunity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect after successful deletion
      navigate('/opportunities');
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
      
      <ContentContainer maxWidth="lg">
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
                    isSubmitting={isSubmitting}
                  />
                  
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
      </ContentContainer>
    </>
  );
}
