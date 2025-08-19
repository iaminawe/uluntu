import React, { useState, useEffect } from 'react';
import { Hash, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { useMemberByUserId } from '@/hooks/useMemberByUserId';
import TopicSelector from '@/components/admin/TopicSelector';
import { useEntityTopics, useSetEntityTopics } from '@/features/topics/hooks/useTopicsHybrid';
import type { OnboardingStepProps } from '../../types';

const TopicInterestsStep: React.FC<OnboardingStepProps> = ({
  onNext,
  onBack,
  onSkip,
  isFirstStep,
  isLastStep,
}) => {
  const user = useAppSelector(selectCurrentUser);
  const { data: member } = useMemberByUserId(user?.id);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Topic management hooks
  const { data: memberTopics } = useEntityTopics('member', member?.id || '');
  const setEntityTopicsMutation = useSetEntityTopics();
  
  // Populate existing topics if they exist
  useEffect(() => {
    if (memberTopics) {
      setSelectedTopicIds(memberTopics.map(topic => topic.id));
    }
  }, [memberTopics]);

  const handleSubmit = async () => {
    if (!member?.id) {
      // If no member profile exists yet, just move to next step
      onNext();
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save topics if any are selected
      if (selectedTopicIds.length > 0) {
        await setEntityTopicsMutation.mutateAsync({
          entityType: 'member',
          entityId: member.id,
          topicIds: selectedTopicIds
        });
      }
      
      onNext();
    } catch (error) {
      console.error('Error saving topics:', error);
      // Continue anyway
      onNext();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-4">
          <Hash className="h-8 w-8 text-orange-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          What are you interested in?
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Select topics that match your interests to help others find you and connect over shared passions
        </p>
      </div>

      {/* Topic Selector */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Choose up to 10 topics
          </label>
          <TopicSelector
            selectedTopics={selectedTopicIds}
            onTopicsChange={setSelectedTopicIds}
            placeholder="Search and select topics that interest you..."
            maxTopics={10}
            className="w-full"
          />
        </div>
        
        {selectedTopicIds.length > 0 && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong>{selectedTopicIds.length}</strong> topic{selectedTopicIds.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </div>

      {/* Why Topics Matter */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          Why select topics?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Help community members discover you based on shared interests</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Get personalized content recommendations</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Connect with others who share your passions</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Find relevant events, resources, and opportunities</span>
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          disabled={isFirstStep}
          className={`flex items-center px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors ${
            isFirstStep ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Previous
        </button>

        <button
          onClick={handleSkip}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          Skip for now
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedTopicIds.length === 0}
          className={`flex items-center px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors ${
            (isSubmitting || selectedTopicIds.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Saving...' : isLastStep ? 'Complete' : 'Continue'}
          {!isLastStep && <ChevronRight className="h-5 w-5 ml-1" />}
        </button>
      </div>
    </div>
  );
};

export default TopicInterestsStep;