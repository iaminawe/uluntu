import React from 'react';
import { User, Briefcase, MapPin, Plus, X } from 'lucide-react';
import { FormImageUpload } from '@/shared/components/ui/Form/FormImageUpload';
import { SettingsField } from '../components/SettingsField';

interface ProfileTabProps {
  // Profile state
  displayName: string;
  setDisplayName: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  company: string;
  setCompany: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  imageUrl: string;
  handleImageChange: (file: File | null) => void;
  skills: string[];
  newSkill: string;
  setNewSkill: (value: string) => void;
  handleAddSkill: () => void;
  handleRemoveSkill: (skill: string) => void;
  employmentStatus: string;
  setEmploymentStatus: (value: string) => void;
  arrivedInNelson: string;
  setArrivedInNelson: (value: string) => void;
  isSaving: boolean;
}

/**
 * Profile Tab - Basic profile information
 */
export const ProfileTab: React.FC<ProfileTabProps> = ({
  displayName,
  setDisplayName,
  title,
  setTitle,
  company,
  setCompany,
  bio,
  setBio,
  location,
  setLocation,
  imageUrl,
  handleImageChange,
  skills,
  newSkill,
  setNewSkill,
  handleAddSkill,
  handleRemoveSkill,
  employmentStatus,
  setEmploymentStatus,
  arrivedInNelson,
  setArrivedInNelson,
  isSaving
}) => {
  return (
    <div className="space-y-6">
      {/* Profile Image */}
      <SettingsField label="Profile Image">
        <FormImageUpload
          currentImage={imageUrl}
          onImageChange={handleImageChange}
          disabled={isSaving}
        />
      </SettingsField>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingsField label="Full Name" required>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="John Doe"
              required
            />
          </div>
        </SettingsField>

        <SettingsField label="Professional Title">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Briefcase className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Full Stack Developer"
            />
          </div>
        </SettingsField>

        <SettingsField label="Company">
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Acme Inc."
          />
        </SettingsField>

        <SettingsField label="Location">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MapPin className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Nelson, BC"
            />
          </div>
        </SettingsField>

        <SettingsField label="Employment Status">
          <select
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select status...</option>
            <option value="employed">Employed</option>
            <option value="self-employed">Self-Employed</option>
            <option value="freelance">Freelancer</option>
            <option value="looking">Looking for opportunities</option>
            <option value="student">Student</option>
            <option value="retired">Retired</option>
          </select>
        </SettingsField>

        <SettingsField label="When did you arrive in Nelson?">
          <input
            type="text"
            value={arrivedInNelson}
            onChange={(e) => setArrivedInNelson(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., 2020 or Born here"
          />
        </SettingsField>
      </div>

      {/* Bio */}
      <SettingsField
        label="Bio"
        required
        description={`${bio.length}/500 characters`}
      >
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          maxLength={500}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                   bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Tell us about yourself, your work, and what brings you to Nelson..."
          required
        />
      </SettingsField>

      {/* Skills */}
      <SettingsField
        label="Skills"
        required
        description={skills.length === 0 ? "Add at least one skill to showcase your expertise" : undefined}
      >
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Add a skill..."
          />
          <button
            type="button"
            onClick={handleAddSkill}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg
                     transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30
                         text-orange-700 dark:text-orange-300 rounded-full text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-orange-900 dark:hover:text-orange-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </SettingsField>
    </div>
  );
};
