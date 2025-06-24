import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useMemberById as useMember } from '@/hooks/useMemberQueries';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import BasicInfoSection from './BasicInfoSection';
import SkillsSection from './SkillsSection';
import SocialSection from './SocialSection';
import { FormData } from './types';
import { initialFormData } from './data';
import { uploadDirectoryImage } from '../../lib/supabase';

export default function DirectoryEditPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  // Use the original string ID which is what useMember expects
  const memberIdString = id || '';
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'social', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const { 
    data: member, 
    isLoading: memberLoading
  } = useMember(memberIdString);
  
  // Populate form with member data when in edit mode
  useEffect(() => {
    if (isEditMode && member) {
      // Ensure we have string values for all text fields
      // Explicitly type the social object to include all expected properties
      const memberSocial: {
        linkedin?: string;
        twitter?: string;
        github?: string;
        website?: string;
      } = member.social || {};
      
      setFormData({
        name: member.name || '',
        title: typeof member.title === 'string' ? member.title : '',
        company: typeof member.company === 'string' ? member.company : '',
        location: typeof member.location === 'string' ? member.location : '',
        image: typeof member.image === 'string' ? member.image : '',
        bio: typeof member.bio === 'string' ? member.bio : '',
        skills: Array.isArray(member.skills) ? member.skills : [],
        interests: [], // Add missing interests field
        joinDate: member.joinDate || '',
        social: {
          linkedin: typeof memberSocial.linkedin === 'string' ? memberSocial.linkedin : '',
          twitter: typeof memberSocial.twitter === 'string' ? memberSocial.twitter : '',
          github: typeof memberSocial.github === 'string' ? memberSocial.github : '',
          website: typeof memberSocial.website === 'string' ? memberSocial.website : ''
        }
      });
    }
  }, [isEditMode, member]);
  
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
  
  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
      
      // Clear skill error if it exists
      if (errors.skills) {
        setErrors(prev => ({ ...prev, skills: undefined }));
      }
    }
  };
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
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
  
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | 'social', string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.image.trim()) {
      newErrors.image = 'Profile image is required';
    }
    
    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    }
    
    if (!formData.skills.length) {
      newErrors.skills = 'At least one skill is required';
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
        const directoryId = id || `temp-${Date.now()}`;
        const { url, error } = await uploadDirectoryImage(imageFile, directoryId);
        
        if (error) {
          console.error('Error uploading image:', error);
          setErrors(prev => ({ ...prev, image: 'Failed to upload image. Please try again.' }));
          return;
        }
        
        finalImageUrl = url || '';
        setIsUploadingImage(false);
      }
      
      // Update form data with final image URL
      const finalFormData = { ...formData, image: finalImageUrl };
      
      // In a real implementation this would make an API call with finalFormData
      console.log('Submitting directory profile with data:', finalFormData);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      
      // Redirect after successful submission
      setTimeout(() => {
        navigate(isEditMode ? `/directory/${id}` : '/directory');
      }, 1000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({ ...prev, image: 'Failed to save profile. Please try again.' }));
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEditMode ? 'Edit Profile' : 'Create Profile'}</title>
        <meta name="description" content={isEditMode ? 'Edit your community profile' : 'Create a new community profile'} />
      </Helmet>
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="mb-6">
          <Link
            to="/directory"
            className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-500"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Directory
          </Link>
          
          <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Profile' : 'Create Profile'}
          </h1>
          
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {isEditMode 
              ? 'Update your profile information in the community directory'
              : 'Tell the community about yourself and your expertise'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          {memberLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
              <p className="mt-4 text-slate-600 dark:text-slate-400">Loading profile information...</p>
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
                {isEditMode ? 'Profile Updated Successfully!' : 'Profile Created Successfully!'}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                You will be redirected to the directory page shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <BasicInfoSection 
                formData={formData}
                errors={errors}
                onChange={handleChange}
                onImageChange={handleImageChange}
                isSubmitting={isSubmitting || isUploadingImage}
              />
              
              <hr className="border-t border-slate-200 dark:border-slate-700" />
              
              <SkillsSection 
                skills={formData.skills}
                newSkill={newSkill}
                setNewSkill={setNewSkill}
                onAdd={handleAddSkill}
                onRemove={handleRemoveSkill}
                isSubmitting={isSubmitting}
                error={errors.skills}
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
                  onClick={() => navigate(isEditMode ? `/directory/${id}` : '/directory')}
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
                    {isSubmitting ? 'Saving...' : 'Save Profile'}
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
