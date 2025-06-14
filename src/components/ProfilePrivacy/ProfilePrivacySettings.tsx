import React from 'react';
import { useProfilePrivacy, getPrivacyStatusDisplay } from '../../hooks/useProfilePrivacy';
import { Member } from '../../types';

interface ProfilePrivacySettingsProps {
  member: Member | null;
  className?: string;
}

export function ProfilePrivacySettings({ member, className = '' }: ProfilePrivacySettingsProps) {
  const { 
    currentSettings, 
    isUpdating, 
    error, 
    togglePublicVisibility 
  } = useProfilePrivacy(member);

  const privacyDisplay = getPrivacyStatusDisplay(currentSettings.status);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          currentSettings.isPublic 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          <span className="mr-1">{privacyDisplay.icon}</span>
          {privacyDisplay.label}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        {privacyDisplay.description}
      </p>

      {/* Toggle Switch */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label htmlFor="public-profile" className="text-sm font-medium text-gray-700">
            Show in Community Directory
          </label>
          <p className="text-sm text-gray-500">
            Make your profile discoverable by other community members
          </p>
        </div>
        <div className="ml-4">
          <button
            type="button"
            onClick={togglePublicVisibility}
            disabled={isUpdating}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              currentSettings.isPublic ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            id="public-profile"
            aria-pressed={currentSettings.isPublic}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                currentSettings.isPublic ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Privacy Options */}
      <div className="mt-6 space-y-4">
        <div className={`border rounded-lg p-4 ${
          currentSettings.isPublic ? 'border-green-200 bg-green-50' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="text-lg">👁️</span>
            <div>
              <h4 className="font-medium text-gray-900">Public Profile</h4>
              <p className="text-sm text-gray-600">
                Your profile appears in the community directory and search results. 
                Other members can discover and contact you.
              </p>
            </div>
          </div>
        </div>

        <div className={`border rounded-lg p-4 ${
          !currentSettings.isPublic ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="text-lg">🔒</span>
            <div>
              <h4 className="font-medium text-gray-900">Private Profile</h4>
              <p className="text-sm text-gray-600">
                Your profile is hidden from the directory. You can still participate in 
                groups and events, but others can't find you through search.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {isUpdating && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-blue-800">Updating privacy settings...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <span className="text-sm text-red-800">
            Failed to update privacy settings. Please try again.
          </span>
        </div>
      )}

      {/* Additional Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• You can change these settings at any time</li>
          <li>• Private profiles can still join groups and attend events</li>
          <li>• Your activity in groups may still be visible to group members</li>
          <li>• Profile photos and names may be visible in event attendee lists</li>
        </ul>
      </div>
    </div>
  );
}