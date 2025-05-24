import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMember } from '../hooks/useQueries';
import { ContentContainer } from '../components/ui/PageLayout';
import BasicInfoSection from './DirectoryEditPage/BasicInfoSection';
import SkillsSection from './DirectoryEditPage/SkillsSection';
import SocialSection from './DirectoryEditPage/SocialSection';
import { FormData } from './DirectoryEditPage/types';
import { initialFormData } from './DirectoryEditPage/data';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  
  // In a real app, this would fetch the member data for the logged-in user
  // For now, we're just using the ID from the authentication
  const { data: member, isLoading } = useMember(userId ? parseInt(userId) : 0);
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'social', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);
  
  // Populate form with member data when it loads
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        title: member.title || '',
        company: member.company || '',
        location: member.location || '',
        image: member.image || '',
        bio: member.bio || '',
        skills: Array.isArray(member.skills) ? member.skills : [],
        joinDate: member.joinDate || new Date().toISOString().split('T')[0],
        social: {
          linkedin: member.social?.linkedin || '',
          twitter: member.social?.twitter || '',
          github: member.social?.github || '',
          website: member.social?.website || ''
        }
      });
    }
  }, [member]);
  
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
    
    try {
      // In a real implementation this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitSuccess(true);
      
      // Redirect after successful submission
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <ContentContainer>
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
      </ContentContainer>
    );
  }



  return (
    <>
      <Helmet>
        <title>Edit Profile - Kootenay Tech Community</title>
        <meta name="description" content="Edit your profile information" />
      </Helmet>
      
      <ContentContainer>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Edit Profile
              </h1>
              
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Update your profile information in the community directory
              </p>
            </div>
            
            <Link 
              to="/profile"
              className="flex items-center text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Profile
            </Link>
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
                  Profile Updated Successfully!
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  You will be redirected to the profile page shortly.
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
                    onClick={() => navigate('/profile')}
                    className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                              text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 
                              transition-colors"
                  >
                    Cancel
                  </button>
                  
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
              </form>
            )}
          </div>
        </div>
      </ContentContainer>
    </>
  );
}
