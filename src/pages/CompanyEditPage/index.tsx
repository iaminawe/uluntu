import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCompany } from '../../hooks/useQueries';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import BasicInfoSection from './BasicInfoSection';
import IndustrySection from './IndustrySection';
import SocialSection from './SocialSection';
import { FormData } from './types';
import { initialFormData } from './data';

export default function CompanyEditPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const companyId = id ? parseInt(id) : undefined;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [newIndustry, setNewIndustry] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'social', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { 
    data: company, 
    isLoading: companyLoading
  } = useCompany(companyId as number);
  
  // Populate form with company data when in edit mode
  useEffect(() => {
    if (isEditMode && company) {
      setFormData({
        name: company.name,
        description: company.description,
        logo: company.logo || '',
        coverImage: company.coverImage || '',
        industry: company.industry || [],
        size: company.size,
        founded: company.founded,
        location: company.location,
        website: company.website || '',
        social: {
          linkedin: company.social?.linkedin || '',
          twitter: company.social?.twitter || '',
          github: company.social?.github || ''
        }
      });
    }
  }, [isEditMode, company]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('social.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        social: {
          ...prev.social,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleAddIndustry = () => {
    if (newIndustry.trim() && !formData.industry.includes(newIndustry.trim())) {
      setFormData(prev => ({
        ...prev,
        industry: [...prev.industry, newIndustry.trim()]
      }));
      setNewIndustry('');
      
      // Clear industry error if it exists
      if (errors.industry) {
        setErrors(prev => ({ ...prev, industry: undefined }));
      }
    }
  };
  
  const handleRemoveIndustry = (industryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      industry: prev.industry.filter(industry => industry !== industryToRemove)
    }));
  };
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | 'social', string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.logo.trim()) {
      newErrors.logo = 'Logo is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.industry.length) {
      newErrors.industry = 'At least one industry tag is required';
    }
    
    if (!formData.size) {
      newErrors.size = 'Company size is required';
    }
    
    if (!formData.founded.trim()) {
      newErrors.founded = 'Founded year is required';
    } else if (!/^\d{4}$/.test(formData.founded)) {
      newErrors.founded = 'Please enter a valid year (e.g., 2023)';
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
        navigate(isEditMode ? `/companies/${id}` : '/companies');
      }, 1000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEditMode ? 'Edit Company' : 'Add Company'}</title>
        <meta name="description" content={isEditMode ? 'Edit company information' : 'Add a new company to the directory'} />
      </Helmet>
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-6">
          <Link
            to="/companies"
            className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-500"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Companies
          </Link>
          
          <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Company' : 'Add Company'}
          </h1>
          
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {isEditMode 
              ? 'Update company information in the directory'
              : 'Add a new company to the community directory'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {companyLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading company information...</p>
            </div>
          ) : submitSuccess ? (
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
                {isEditMode ? 'Company Updated Successfully!' : 'Company Added Successfully!'}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                You will be redirected to the companies page shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <BasicInfoSection 
                formData={formData}
                errors={errors}
                onChange={handleChange}
                isSubmitting={isSubmitting}
              />
              
              <hr className="border-t border-slate-200 dark:border-slate-700" />
              
              <IndustrySection 
                industries={formData.industry}
                newIndustry={newIndustry}
                setNewIndustry={setNewIndustry}
                onAdd={handleAddIndustry}
                onRemove={handleRemoveIndustry}
                isSubmitting={isSubmitting}
                error={errors.industry}
              />
              
              <hr className="border-t border-slate-200 dark:border-slate-700" />
              
              <SocialSection 
                social={formData.social}
                onChange={handleChange}
                errors={errors}
                isSubmitting={isSubmitting}
              />
              
              <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => navigate(isEditMode ? `/companies/${id}` : '/companies')}
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
                      className="px-6 py-2 border border-red-300 text-red-600 rounded-lg 
                                hover:bg-red-50 transition-colors flex items-center gap-2"
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
                    {isSubmitting ? 'Saving...' : 'Save Company'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
