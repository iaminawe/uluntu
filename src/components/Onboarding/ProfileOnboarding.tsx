import React, { useState } from 'react';
import { useCurrentMember } from '../../hooks/useCurrentMember';
import { useProfileCompletion, getFieldDisplayName } from '../../hooks/useProfileCompletion';
import { useProfilePrivacy, getPrivacyStatusDisplay } from '../../hooks/useProfilePrivacy';
import { Link } from 'react-router-dom';

interface ProfileOnboardingProps {
  onComplete?: () => void;
  onSkip?: () => void;
  showSkipOption?: boolean;
}

export function ProfileOnboarding({ onComplete, onSkip, showSkipOption = true }: ProfileOnboardingProps) {
  const { data: member, isLoading } = useCurrentMember();
  const { isComplete, completionPercentage, requiredFields, suggestedFields } = useProfileCompletion(member);
  const { currentSettings, togglePublicVisibility, isUpdating } = useProfilePrivacy(member || null);
  const [step, setStep] = useState<'welcome' | 'privacy' | 'complete'>('welcome');

  const privacyDisplay = getPrivacyStatusDisplay(currentSettings.status);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (step === 'complete' || (isComplete && step === 'welcome')) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the Community!</h2>
          <p className="text-gray-600 mb-6">
            Your profile is set up and ready. You can always update your information and privacy settings later.
          </p>
          <div className="space-y-3">
            <Link
              to="/profile/edit"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Edit Profile
            </Link>
            <button
              onClick={onComplete}
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Continue to Community
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'privacy') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">{privacyDisplay.icon}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Privacy</h2>
          <p className="text-gray-600">
            Would you like your profile to be visible in the community directory?
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
            currentSettings.isPublic ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">👁️</span>
                <div>
                  <h3 className="font-medium text-gray-900">Public Profile</h3>
                  <p className="text-sm text-gray-600">Visible in community directory</p>
                </div>
              </div>
              <input
                type="radio"
                checked={currentSettings.isPublic}
                onChange={() => !isUpdating && !currentSettings.isPublic && togglePublicVisibility()}
                className="w-4 h-4 text-green-600"
                disabled={isUpdating}
              />
            </div>
          </div>

          <div className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
            !currentSettings.isPublic ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xl">🔒</span>
                <div>
                  <h3 className="font-medium text-gray-900">Private Profile</h3>
                  <p className="text-sm text-gray-600">Hidden from directory</p>
                </div>
              </div>
              <input
                type="radio"
                checked={!currentSettings.isPublic}
                onChange={() => !isUpdating && currentSettings.isPublic && togglePublicVisibility()}
                className="w-4 h-4 text-yellow-600"
                disabled={isUpdating}
              />
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setStep('welcome')}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
            disabled={isUpdating}
          >
            Back
          </button>
          <button
            onClick={() => setStep('complete')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }

  // Welcome step
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">👋</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Uluntu!</h2>
        <p className="text-gray-600">
          Let's help you complete your profile and connect with the community.
        </p>
      </div>

      {/* Profile completion status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Profile Completion</span>
          <span className="text-sm text-gray-600">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Missing fields */}
      {requiredFields.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Required Information:</h3>
          <ul className="space-y-1">
            {requiredFields.map(field => (
              <li key={field} className="flex items-center text-sm text-red-600">
                <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                {getFieldDisplayName(field)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {suggestedFields.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Suggested Information:</h3>
          <ul className="space-y-1">
            {suggestedFields.slice(0, 3).map(field => (
              <li key={field} className="flex items-center text-sm text-yellow-600">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                {getFieldDisplayName(field)}
              </li>
            ))}
            {suggestedFields.length > 3 && (
              <li className="text-sm text-gray-500">
                +{suggestedFields.length - 3} more
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        <Link
          to="/onboarding"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-center transition-colors"
        >
          Complete Onboarding
        </Link>
        <button
          onClick={() => setStep('privacy')}
          className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
        >
          Set Privacy Preferences
        </button>
        {showSkipOption && (
          <button
            onClick={onSkip}
            className="block w-full text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}