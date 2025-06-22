import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Users, Globe, Check, ChevronRight } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useProfilePublishing } from '../../hooks/useProfilePublishing';

interface ProfilePublisherProps {
  onPublish?: () => void;
  showPreview?: boolean;
  className?: string;
}

const ProfilePublisher: React.FC<ProfilePublisherProps> = ({ 
  onPublish, 
  showPreview = true, 
  className = '' 
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const { formData, completionPercentage } = useAppSelector((state) => state.onboarding);
  const {
    profileStatus,
    isPublishing,
    publishProfile,
    unpublishProfile,
    checkProfileStatus,
    isPublished
  } = useProfilePublishing();

  const [showPublishOptions, setShowPublishOptions] = useState(false);

  useEffect(() => {
    checkProfileStatus();
  }, [checkProfileStatus]);

  const handlePublish = async () => {
    const success = await publishProfile();
    if (success && onPublish) {
      onPublish();
    }
  };

  const handleUnpublish = async () => {
    await unpublishProfile();
  };

  const getProfilePreview = () => {
    const { professional, privacy } = formData;
    
    return {
      name: user?.email?.split('@')[0] || 'Your Name',
      title: professional.title || 'Your Professional Title',
      bio: professional.bio || 'Your professional bio will appear here...',
      skills: professional.skills || [],
      location: privacy.showLocation ? 'Nelson, BC' : 'Location hidden',
      email: privacy.showEmail ? user?.email : 'Email hidden',
      completeness: completionPercentage,
    };
  };

  const preview = getProfilePreview();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profile Preview */}
      {showPreview && (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Profile Preview
          </h3>
          <div className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                {preview.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 dark:text-white">
                  {preview.name}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {preview.title}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  📍 {preview.location}
                </p>
                
                {preview.bio && (
                  <p className="text-slate-700 dark:text-slate-300 text-sm mt-2 line-clamp-2">
                    {preview.bio}
                  </p>
                )}
                
                {preview.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {preview.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                    {preview.skills.length > 3 && (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400 text-xs rounded">
                        +{preview.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Completion indicator */}
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Profile completion
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {preview.completeness}%
                </span>
              </div>
              <div className="mt-1 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${preview.completeness}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publishing Options */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Profile Visibility
        </h3>

        {!isPublished ? (
          <>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
                <EyeOff className="w-5 h-5 text-slate-500" />
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    Currently Private
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Your profile is not visible in the community directory
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePublish}
                disabled={isPublishing || completionPercentage < 50}
                className="w-full flex items-center justify-between p-4 bg-orange-500 hover:bg-orange-600 
                         disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg 
                         transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">
                      {isPublishing ? 'Publishing...' : 'Publish to Directory'}
                    </div>
                    <div className="text-sm opacity-90">
                      Make your profile visible to the community
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setShowPublishOptions(!showPublishOptions)}
                className="w-full text-left text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 
                         dark:hover:text-slate-200 transition-colors"
              >
                What does publishing mean?
              </button>

              {showPublishOptions && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                    Publishing Your Profile
                  </h5>
                  <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Your profile will appear in the community directory</li>
                    <li>• Other members can find and connect with you</li>
                    <li>• You'll be visible for collaboration opportunities</li>
                    <li>• You can unpublish at any time from your profile settings</li>
                    <li>• Only information you've chosen to share will be visible</li>
                  </ul>
                </div>
              )}

              {completionPercentage < 50 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Complete at least 50% of your profile to publish it to the directory. 
                    You can always publish later from your profile settings.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <h4 className="font-medium text-green-900 dark:text-green-300">
                    Published to Directory
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Your profile is visible to other community members
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleUnpublish}
              disabled={isPublishing}
              className="w-full flex items-center justify-center gap-2 p-3 border border-slate-300 dark:border-slate-600 
                       text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 
                       rounded-lg transition-colors"
            >
              <EyeOff className="w-4 h-4" />
              Make Profile Private
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePublisher;