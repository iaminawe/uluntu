/**
 * Example implementation of standardized form components for Company entity
 * This demonstrates the complete integration pattern with all standard features
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FormPageWrapper,
  FormContainer,
  SlugField,
  SeoFields,
  StandardFormActions,
  FormSectionDivider,
  SuccessMessage,
  ErrorMessage
} from '../StandardFormComponents';
import { FormInput } from '../FormInput';
import { FormTextarea } from '../FormTextarea';
import { FormSelect } from '../FormSelect';
import { FormImageUpload } from '../FormImageUpload';
import TagsInput from '../TagsInput';

interface CompanyFormData {
  // Basic Information
  name: string;
  slug: string;
  description: string;
  logo: string;
  coverImage: string;
  
  // Company Details
  size: string;
  founded: string;
  location: string;
  website: string;
  industry: string[];
  
  // Social Links
  social: {
    linkedin: string;
    twitter: string;
    github: string;
  };
  
  // SEO
  metaTitle: string;
  metaDescription: string;
  
  // Publishing
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
}

const initialFormData: CompanyFormData = {
  name: '',
  slug: '',
  description: '',
  logo: '',
  coverImage: '',
  size: '1-10',
  founded: new Date().getFullYear().toString(),
  location: '',
  website: '',
  industry: [],
  social: {
    linkedin: '',
    twitter: '',
    github: ''
  },
  metaTitle: '',
  metaDescription: '',
  status: 'draft',
  featured: false
};

const companySizeOptions = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' }
];

export default function CompanyFormExample() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyFormData | 'social', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [generalError, setGeneralError] = useState('');
  
  // Simulated edit mode - in real app, this would come from route params
  const isEditMode = false;
  const companyId = undefined;

  const handleChange = (field: keyof CompanyFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSocialChange = (platform: keyof CompanyFormData['social'], value: string) => {
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'URL slug is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (formData.industry.length === 0) {
      newErrors.industry = 'At least one industry is required';
    }
    
    // Validate URLs
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setGeneralError('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app, call your API here
      // const result = await companiesApi.create(formData);
      
      setSubmitSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/companies');
      }, 2000);
    } catch (error) {
      setGeneralError('Failed to save company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishToggle = async () => {
    const newStatus = formData.status === 'published' ? 'draft' : 'published';
    handleChange('status', newStatus);
    
    // In real app, you might want to save immediately
    // await updateCompanyStatus(companyId, newStatus);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this company?')) {
      return;
    }
    
    // Handle deletion
    console.log('Delete company');
  };

  if (submitSuccess) {
    return (
      <FormPageWrapper
        title={isEditMode ? 'Edit Company' : 'Add Company'}
        backUrl="/companies"
      >
        <SuccessMessage
          title={isEditMode ? 'Company Updated!' : 'Company Added!'}
          message="Redirecting to companies list..."
        />
      </FormPageWrapper>
    );
  }

  return (
    <FormPageWrapper
      title={isEditMode ? 'Edit Company' : 'Add Company'}
      backUrl="/companies"
      isLoading={false}
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {generalError && (
          <ErrorMessage 
            error={generalError} 
            onDismiss={() => setGeneralError('')}
          />
        )}
        
        {/* Basic Information Section */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
            Basic Information
          </h3>
          
          <div className="space-y-4">
            <FormInput
              label="Company Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              error={errors.name}
              placeholder="Acme Corporation"
            />
            
            <SlugField
              value={formData.slug}
              onChange={(value) => handleChange('slug', value)}
              sourceValue={formData.name}
              baseUrl="/companies/"
              error={errors.slug}
              required
            />
            
            <FormTextarea
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
              error={errors.description}
              rows={4}
              placeholder="Tell us about your company..."
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormImageUpload
                label="Company Logo"
                currentImage={formData.logo}
                onChange={(file: File | null) => {
                  if (file) {
                    const url = URL.createObjectURL(file);
                    handleChange('logo', url);
                  }
                }}
              />
              
              <FormImageUpload
                label="Cover Image"
                currentImage={formData.coverImage}
                onChange={(file: File | null) => {
                  if (file) {
                    const url = URL.createObjectURL(file);
                    handleChange('coverImage', url);
                  }
                }}
              />
            </div>
          </div>
        </div>
        
        <FormSectionDivider />
        
        {/* Company Details Section */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
            Company Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              id="company-size"
              name="size"
              label="Company Size"
              value={formData.size}
              onChange={(e) => handleChange('size', e.target.value)}
              options={companySizeOptions}
              required
            />
            
            <FormInput
              label="Founded Year"
              type="number"
              value={formData.founded}
              onChange={(e) => handleChange('founded', e.target.value)}
              required
              min="1800"
              max={new Date().getFullYear()}
            />
            
            <FormInput
              label="Location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
              error={errors.location}
              placeholder="Nelson, BC, Canada"
            />
            
            <FormInput
              label="Website"
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              error={errors.website}
              placeholder="https://example.com"
            />
          </div>
          
          <div className="mt-4">
            <TagsInput
              label="Industries"
              tags={formData.industry}
              onChange={(tags) => handleChange('industry', tags)}
              placeholder="Add an industry..."
              helperText="Press Enter to add"
              required
            />
          </div>
        </div>
        
        <FormSectionDivider />
        
        {/* Social Links Section */}
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
            Social Links
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="LinkedIn"
              value={formData.social.linkedin}
              onChange={(e) => handleSocialChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/company/..."
            />
            
            <FormInput
              label="Twitter"
              value={formData.social.twitter}
              onChange={(e) => handleSocialChange('twitter', e.target.value)}
              placeholder="https://twitter.com/..."
            />
            
            <FormInput
              label="GitHub"
              value={formData.social.github}
              onChange={(e) => handleSocialChange('github', e.target.value)}
              placeholder="https://github.com/..."
            />
          </div>
        </div>
        
        <FormSectionDivider />
        
        {/* SEO Section */}
        <SeoFields
          metaTitle={formData.metaTitle}
          metaDescription={formData.metaDescription}
          onMetaTitleChange={(value) => handleChange('metaTitle', value)}
          onMetaDescriptionChange={(value) => handleChange('metaDescription', value)}
          titlePlaceholder={formData.name ? `${formData.name} - Kootenay Tech` : 'SEO title'}
          descriptionPlaceholder={formData.description ? 
            formData.description.substring(0, 160) : 
            'SEO description'
          }
        />
        
        {/* Form Actions */}
        <StandardFormActions
          onSubmit={() => handleSubmit(new Event('submit') as any)}
          onCancel={() => navigate('/companies')}
          onDelete={isEditMode ? handleDelete : undefined}
          onPublishToggle={handlePublishToggle}
          submitText={isEditMode ? 'Update Company' : 'Add Company'}
          isNew={!isEditMode}
          isPublished={formData.status === 'published'}
          showPublishToggle={true}
          isSubmitting={isSubmitting}
        />
      </form>
    </FormPageWrapper>
  );
}