import React from 'react';
import { Link } from 'react-router-dom';
import { X, User, Shield, CheckCircle } from 'lucide-react';
import { useOnboardingStatus } from '../OnboardingGuard';
import { getFieldDisplayName } from '../../hooks/useProfileCompletion';

interface ProfileCompletionPromptProps {
  onDismiss?: () => void;
  showDismiss?: boolean;
  compact?: boolean;
}

export function ProfileCompletionPrompt({ 
  onDismiss, 
  showDismiss = true, 
  compact = false 
}: ProfileCompletionPromptProps) {
  const { 
    isLoading, 
    needsOnboarding, 
    profileComplete, 
    completionPercentage, 
    missingRequiredFields,
    shouldShowPrompt 
  } = useOnboardingStatus();

  // Don't show if loading or no action needed
  if (isLoading || !shouldShowPrompt) {
    return null;
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <User className="h-5 w-5" />
            <div>
              <p className="font-medium">Complete your profile ({completionPercentage}%)</p>
              <p className="text-sm text-blue-100">
                {missingRequiredFields.length} required field{missingRequiredFields.length !== 1 ? 's' : ''} missing
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link
              to="/profile/edit"
              className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Complete
            </Link>
            {showDismiss && onDismiss && (
              <button
                onClick={onDismiss}
                className="text-blue-100 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-blue-200 rounded-lg shadow-sm p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Complete Your Profile
            </h3>
          </div>

          <p className="text-gray-600 mb-4">
            Help other community members get to know you by completing your profile. 
            You can also choose whether to be visible in the public directory.
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-sm text-gray-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Missing Fields */}
          {missingRequiredFields.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Required Information Needed:
              </p>
              <div className="flex flex-wrap gap-2">
                {missingRequiredFields.map(field => (
                  <span
                    key={field}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                  >
                    {getFieldDisplayName(field)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Privacy First</p>
                <p className="text-sm text-yellow-700">
                  Your profile is currently private. You can choose to make it public in the directory once you complete it.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/profile/edit"
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <User className="h-4 w-4 mr-2" />
              Complete Profile
            </Link>
            <Link
              to="/profile/edit#privacy"
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              <Shield className="h-4 w-4 mr-2" />
              Privacy Settings
            </Link>
          </div>
        </div>

        {showDismiss && onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Smaller banner version for top of pages
 */
export function ProfileCompletionBanner({ onDismiss }: { onDismiss?: () => void }) {
  const { shouldShowPrompt, completionPercentage, missingRequiredFields } = useOnboardingStatus();

  if (!shouldShowPrompt) return null;

  return (
    <div className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">
              Profile {completionPercentage}% complete
            </span>
            <span className="text-sm text-blue-100">
              • {missingRequiredFields.length} required field{missingRequiredFields.length !== 1 ? 's' : ''} needed
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/profile/edit"
              className="text-sm font-medium underline hover:no-underline"
            >
              Complete Now
            </Link>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-blue-100 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}