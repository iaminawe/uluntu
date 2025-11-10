import React from 'react';
import { Plus, X } from 'lucide-react';
import TopicSelector from '@/components/admin/TopicSelector';
import { SettingsSection } from '../components/SettingsSection';

interface InterestsTabProps {
  selectedTopicIds: string[];
  setSelectedTopicIds: (topics: string[]) => void;
  interests: string[];
  newInterest: string;
  setNewInterest: (value: string) => void;
  handleAddInterest: () => void;
  handleRemoveInterest: (interest: string) => void;
}

/**
 * Topics & Interests Tab
 */
export const InterestsTab: React.FC<InterestsTabProps> = ({
  selectedTopicIds,
  setSelectedTopicIds,
  interests,
  newInterest,
  setNewInterest,
  handleAddInterest,
  handleRemoveInterest
}) => {
  return (
    <div className="space-y-6">
      {/* Topics */}
      <SettingsSection
        title="Topics of Interest"
        description="Select topics you're interested in to help others find you and connect over shared interests."
      >
        <TopicSelector
          selectedTopics={selectedTopicIds}
          onTopicsChange={setSelectedTopicIds}
          placeholder="Search and select topics..."
          maxTopics={10}
          className="w-full"
        />
      </SettingsSection>

      {/* Interests */}
      <SettingsSection
        title="Interests & Hobbies"
        description="Share your personal interests and hobbies to connect with like-minded people."
      >
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
            className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                     bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Add an interest or hobby..."
          />
          <button
            type="button"
            onClick={handleAddInterest}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg
                     transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        {interests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30
                         text-blue-700 dark:text-blue-300 rounded-full text-sm"
              >
                {interest}
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(interest)}
                  className="hover:text-blue-900 dark:hover:text-blue-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            No interests added yet. Add some to help others discover common ground!
          </p>
        )}
      </SettingsSection>

      {/* Community Engagement Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
          Why add topics and interests?
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Help others discover you based on shared interests</li>
          <li>• Get notified about relevant events and opportunities</li>
          <li>• Connect with people who share your passions</li>
          <li>• Appear in topic-based searches and filters</li>
        </ul>
      </div>
    </div>
  );
};
