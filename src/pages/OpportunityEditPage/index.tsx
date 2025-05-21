import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import BasicInfoSection from './BasicInfoSection';
import ListSection from './ListSection';
import DeleteConfirmModal from './DeleteConfirmModal';
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
  
  // In a real implementation, this would use a hook like useOpportunity(opportunityId)
  useEffect(() => {
    if (isEditMode) {
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
      newErrors.organization = 'Organization name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
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
      // In a real implementation this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      
      // Redirect after successful submission
      setTimeout(() => {
        navigate(isEditMode ? `/opportunities/${id}` : '/opportunities');
      }, 1000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real implementation this would make an API call
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
        <title>{isEditMode ? 'Edit Opportunity' : 'Create New Opportunity'}</title>
        <meta name="description" content={isEditMode ? 'Edit an existing opportunity' : 'Create a new opportunity listing'} />
      </Helmet>
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-6">
          <Link
            to="/opportunities"
            className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-500"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Opportunities
          </Link>
          
          <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Opportunity' : 'Create New Opportunity'}
          </h1>
          
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {isEditMode 
              ? 'Update the information for this opportunity'
              : 'Fill out the form below to create a new opportunity listing'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {submitSuccess ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                {isEditMode ? 'Opportunity Updated Successfully!' : 'Opportunity Created Successfully!'}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                You will be redirected to the opportunities page shortly.
              </p>
            </div>
          ) : (
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
              
              <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => navigate(isEditMode ? `/opportunities/${id}` : '/opportunities')}
                  className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                            text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 
                            transition-colors"
                >
                  Cancel
                </button>
                
                <div className="flex gap-2">
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-6 py-2 border border-red-300 text-red-600 rounded-lg 
                                hover:bg-red-50 transition-colors flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 bg-orange-500 text-white rounded-lg 
                              hover:bg-orange-600 transition-colors flex items-center gap-2
                              ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <Save className="h-5 w-5" />
                    {isSubmitting 
                      ? 'Saving...' 
                      : formData.status === 'draft' 
                        ? 'Save as Draft' 
                        : formData.status === 'published' 
                          ? 'Publish Opportunity' 
                          : 'Archive Opportunity'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
      
      <DeleteConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
