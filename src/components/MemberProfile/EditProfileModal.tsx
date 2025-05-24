import { useState } from 'react';
import { X } from 'lucide-react';
import { Member } from './types';
import FormImageUpload from '../ui/Form/FormImageUpload';
import { uploadProfileImage, uploadCoverImage, getCurrentUser } from '../../lib/supabase';

interface EditProfileModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMember: Partial<Member>) => void;
}

const EditProfileModal = ({ member, onClose, onSave }: EditProfileModalProps) => {
  const [formData, setFormData] = useState({
    name: member.name,
    title: member.title,
    bio: member.bio,
    location: member.location,
    image: member.image,
    coverImage: member.coverImage || '',
    website: member.website || '',
    skills: member.skills.join(', '),
    employmentStatus: member.employmentStatus,
    openToVolunteering: member.openToVolunteering
  });
  
  // State for file uploads
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get the current user
      const { user, error: userError } = await getCurrentUser();
      
      if (userError || !user) {
        console.error('Error getting current user:', userError);
        throw new Error('Could not authenticate user');
      }
      
      // Upload profile image if a new one was selected
      let profileImageUrl = formData.image;
      if (profileImageFile) {
        const { url, error } = await uploadProfileImage(profileImageFile, user.id);
        if (error) throw error;
        if (url) profileImageUrl = url;
      }
      
      // Upload cover image if a new one was selected
      let coverImageUrl = formData.coverImage;
      if (coverImageFile) {
        const { url, error } = await uploadCoverImage(coverImageFile, user.id);
        if (error) throw error;
        if (url) coverImageUrl = url;
      }
      
      // Save the updated profile data
      onSave({
        ...formData,
        image: profileImageUrl,
        coverImage: coverImageUrl,
        skills: formData.skills.split(',').map(skill => skill.trim())
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setSubmitError('There was an error updating your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full p-6 shadow-xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Images Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Profile Images</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cover Image */}
              <div>
                <FormImageUpload
                  label="Cover Image"
                  id="coverImage"
                  name="coverImage"
                  currentImage={formData.coverImage}
                  onChange={(file) => {
                    setCoverImageFile(file);
                    // If user removes the image, clear the URL
                    if (!file && formData.coverImage) {
                      setFormData(prev => ({ ...prev, coverImage: '' }));
                    }
                  }}
                  placeholder="Drag and drop your cover image, or click to select"
                  helperText="This image will appear at the top of your profile"
                  maxSize={10 * 1024 * 1024} // 10MB
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                />
              </div>
              
              {/* Profile Image */}
              <div>
                <FormImageUpload
                  label="Profile Image"
                  id="profileImage"
                  name="profileImage"
                  currentImage={formData.image}
                  onChange={(file) => {
                    setProfileImageFile(file);
                    // If user removes the image, clear the URL
                    if (!file && formData.image) {
                      setFormData(prev => ({ ...prev, image: '' }));
                    }
                  }}
                  placeholder="Drag and drop your profile image, or click to select"
                  helperText="This is your main profile picture"
                  maxSize={5 * 1024 * 1024} // 5MB
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                />
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Professional Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="skills"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Skills (comma separated)
              </label>
              <input
                type="text"
                id="skills"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="employmentStatus"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
              >
                Employment Status
              </label>
              <select
                id="employmentStatus"
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              >
                <option value="full-time">Full-time</option>
                <option value="freelance">Freelance</option>
                <option value="looking">Looking for work</option>
                <option value="not-looking">Not looking</option>
              </select>
            </div>

            <div className="flex items-center h-full">
              <input
                type="checkbox"
                id="openToVolunteering"
                name="openToVolunteering"
                checked={formData.openToVolunteering}
                onChange={handleChange}
                className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-slate-300 rounded"
              />
              <label
                htmlFor="openToVolunteering"
                className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
              >
                Available for volunteer opportunities
              </label>
            </div>
          </div>

          {submitError && (
            <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-md">
              {submitError}
            </div>
          )}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
