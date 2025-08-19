import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Save } from 'lucide-react';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useMemberByUserId } from '@/hooks/useMemberByUserId';
import { createMemberProfile, updateMemberProfile } from '@/features/directory/api/createMemberProfile';
import { uploadImage } from '@/utils/uploadImage';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import BasicInfoSection from './DirectoryEditPage/BasicInfoSection';
import SkillsSection from './DirectoryEditPage/SkillsSection';
import InterestsSection from './DirectoryEditPage/InterestsSection';
import SocialSection from './DirectoryEditPage/SocialSection';
import { FormData } from './DirectoryEditPage/types';
import { initialFormData } from './DirectoryEditPage/data';
import TopicSelector from '@/components/admin/TopicSelector';
import { useEntityTopics, useSetEntityTopics } from '@/features/topics/hooks/useTopicsHybrid';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user } = useSession();
  const userId = user?.id;
  
  // Fetch the member profile associated with the logged-in user
  const { data: member, isLoading, refetch } = useMemberByUserId(userId);
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'social', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  
  // Topic management hooks
  const { data: memberTopics } = useEntityTopics('member', member?.id || '');
  const setEntityTopicsMutation = useSetEntityTopics();
  
  useEffect(() => {
    // If user is not logged in, redirect to login page
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);
  
  // Populate form with member data when it loads
  useEffect(() => {
    if (member) {
      // Cast social to a Record to safely access properties
      const socialData = member.social as Record<string, any> || {};
      
      const newFormData = {
        name: member.name || '',
        slug: (member.slug && typeof member.slug === 'string') ? member.slug : '',
        title: typeof member.title === 'string' ? member.title : '',
        company: typeof member.company === 'string' ? member.company : '',
        location: typeof member.location === 'string' ? member.location : '',
        image: member.image || '',
        bio: member.bio || '',
        skills: Array.isArray(member.skills) ? member.skills : [],
        interests: [], // Member type doesn't have interests field, defaulting to empty array
        joinDate: member.joinDate || new Date().toISOString().split('T')[0],
        status: member.status || 'published',
        featured: member.featured || false,
        social: {
          linkedin: socialData.linkedin || '',
          twitter: socialData.twitter || '',
          github: socialData.github || '',
          website: socialData.website || ''
        }
      };
      
      setFormData(newFormData);
    }
  }, [member]);
  
  // Populate topics when member topics load
  useEffect(() => {
    if (memberTopics) {
      setSelectedTopicIds(memberTopics.map(topic => topic.id));
    }
  }, [memberTopics]);
  
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
  
  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    
    if (file) {
      // Create a preview URL for display
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: previewUrl }));
    } else {
      setFormData(prev => ({ ...prev, image: '' }));
    }
    
    // Clear image error if it exists
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: undefined }));
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
  
  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
      
      // Clear interest error if it exists
      if (errors.interests) {
        setErrors(prev => ({ ...prev, interests: undefined }));
      }
    }
  };
  
  const handleRemoveInterest = (interestToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
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
    
    // Image is now optional
    // if (!formData.image || (typeof formData.image === 'string' && !formData.image.trim())) {
    //   newErrors.image = 'Profile image is required';
    // }
    
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
      // Upload image if there's a new file
      let imageUrl = formData.image;
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (error) {
          console.error('Failed to upload image:', error);
          setErrors(prev => ({ ...prev, image: 'Failed to upload image' }));
          setIsSubmitting(false);
          return;
        }
      }
      
      // Prepare the data for submission
      const memberData = {
        name: formData.name,
        title: formData.title,
        bio: formData.bio,
        location: formData.location,
        image: imageUrl,
        company: formData.company || undefined,
        skills: formData.skills,
        interests: formData.interests,
        social: {
          website: formData.social.website || undefined,
          github: formData.social.github || undefined,
          linkedin: formData.social.linkedin || undefined,
          twitter: formData.social.twitter || undefined
        },
        user_id: userId! // Link to the authenticated user
      };

      let profileId = member?.id;
      
      if (member) {
        // Update existing profile
        await updateMemberProfile(member.id, memberData);
      } else {
        // Create new profile
        const newProfile = await createMemberProfile(memberData);
        if (newProfile) {
          profileId = newProfile.id;
        }
      }
      
      // Save topics after successful profile save
      if (profileId && selectedTopicIds.length > 0) {
        try {
          await setEntityTopicsMutation.mutateAsync({
            entityType: 'member',
            entityId: profileId,
            topicIds: selectedTopicIds
          });
        } catch (topicError) {
          console.error('Error saving topics:', topicError);
          // Continue anyway as the profile was saved
        }
      }
      
      // Refetch the member data to get the updated/created profile
      await refetch();
      
      setSubmitSuccess(true);
      
      // Redirect to the profile page after successful submission
      setTimeout(() => {
        if (profileId) {
          navigate(`/directory/${profileId}`);
        } else {
          navigate('/directory');
        }
      }, 1000);
    } catch (error) {
      console.error('Error saving profile:', error);
      // You might want to show an error message to the user here
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

  // If no member profile exists yet, allow creating one
  const isCreatingNew = !member && !isLoading;



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
                {isCreatingNew ? 'Create Your Profile' : 'Edit Profile'}
              </h1>
              
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                {isCreatingNew 
                  ? 'Set up your profile to get listed in the community directory'
                  : 'Update your profile information in the community directory'}
              </p>
            </div>
            
            <Link 
              to={member ? `/directory/${member.id}` : '/directory'}
              className="flex items-center text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              View Profile
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
                  onImageChange={handleImageChange}
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
                
                <InterestsSection 
                  interests={formData.interests}
                  newInterest={newInterest}
                  setNewInterest={setNewInterest}
                  onAdd={handleAddInterest}
                  onRemove={handleRemoveInterest}
                  isSubmitting={isSubmitting}
                  error={errors.interests}
                />
                
                <hr className="border-t border-slate-200 dark:border-slate-700" />
                
                {/* Topics Section */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Topics of Interest
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Select topics you're interested in to help others find you and connect over shared interests.
                  </p>
                  <TopicSelector
                    selectedTopics={selectedTopicIds}
                    onTopicsChange={setSelectedTopicIds}
                    placeholder="Search and select topics..."
                    maxTopics={10}
                    className="w-full"
                  />
                </div>
                
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
                    onClick={() => navigate(member ? `/directory/${member.id}` : '/directory')}
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
