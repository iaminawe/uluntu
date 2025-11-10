import React from 'react';
import { LinkIcon, Linkedin, Twitter, Github } from 'lucide-react';
import { SettingsSection } from '../components/SettingsSection';
import { SettingsField } from '../components/SettingsField';

interface SocialTabProps {
  website: string;
  setWebsite: (value: string) => void;
  linkedin: string;
  setLinkedin: (value: string) => void;
  twitter: string;
  setTwitter: (value: string) => void;
  github: string;
  setGithub: (value: string) => void;
}

/**
 * Social Media Tab
 */
export const SocialTab: React.FC<SocialTabProps> = ({
  website,
  setWebsite,
  linkedin,
  setLinkedin,
  twitter,
  setTwitter,
  github,
  setGithub
}) => {
  return (
    <div className="space-y-6">
      <SettingsSection
        title="Social Media & Links"
        description="Add your social media profiles and website to make it easier for others to connect with you."
      >
        <SettingsField label="Personal Website">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <LinkIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </SettingsField>

        <SettingsField
          label="LinkedIn Profile"
          description="Enter your full LinkedIn profile URL"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Linkedin className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </SettingsField>

        <SettingsField
          label="Twitter / X Profile"
          description="Enter your Twitter/X profile URL"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Twitter className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="url"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://twitter.com/username"
            />
          </div>
        </SettingsField>

        <SettingsField
          label="GitHub Profile"
          description="Share your GitHub profile to showcase your projects"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Github className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="https://github.com/username"
            />
          </div>
        </SettingsField>
      </SettingsSection>

      {/* Social Media Tips */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">
          Tips for Social Links
        </h4>
        <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
          <li>• Use complete URLs including https://</li>
          <li>• Double-check your profile URLs are correct</li>
          <li>• Only add profiles you're comfortable sharing publicly</li>
          <li>• Keep your profiles up to date for better networking</li>
        </ul>
      </div>
    </div>
  );
};
