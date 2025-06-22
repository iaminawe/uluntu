import React, { useState, useEffect } from 'react';
import { Users, Heart, Briefcase, Calendar, Code, Lightbulb, GraduationCap, Check, Star } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateCommunityEngagement } from '../../store/onboardingSlice';
import ProfilePublisher from '../shared/ProfilePublisher';
import type { OnboardingStepProps, CommunityEngagement } from '../../types';

// Mock data for groups and interests
const interestCategories = [
  {
    id: 'technology',
    name: 'Technology',
    icon: <Code className="w-5 h-5" />,
    interests: ['Web Development', 'Mobile Development', 'AI/ML', 'Data Science', 'DevOps', 'Cybersecurity', 'Cloud Computing', 'Blockchain']
  },
  {
    id: 'business',
    name: 'Business',
    icon: <Briefcase className="w-5 h-5" />,
    interests: ['Entrepreneurship', 'Product Management', 'Marketing', 'Sales', 'Project Management', 'Consulting', 'Finance', 'Operations']
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: <Lightbulb className="w-5 h-5" />,
    interests: ['UI/UX Design', 'Graphic Design', 'Content Creation', 'Photography', 'Video Production', 'Writing', 'Animation', 'Branding']
  },
  {
    id: 'learning',
    name: 'Learning & Growth',
    icon: <GraduationCap className="w-5 h-5" />,
    interests: ['Mentorship', 'Professional Development', 'Public Speaking', 'Networking', 'Career Change', 'Skills Training', 'Certification', 'Leadership']
  }
];

const mockGroups = [
  { id: '1', name: 'Nelson Tech Meetup', description: 'Monthly tech talks and networking', memberCount: 124, category: 'technology' },
  { id: '2', name: 'Kootenay Entrepreneurs', description: 'Supporting local startups and business owners', memberCount: 89, category: 'business' },
  { id: '3', name: 'Web Developers Circle', description: 'Frontend and backend web development community', memberCount: 67, category: 'technology' },
  { id: '4', name: 'UX/UI Design Guild', description: 'Design thinking and user experience focus', memberCount: 45, category: 'creative' },
  { id: '5', name: 'Women in Tech Nelson', description: 'Empowering women in technology careers', memberCount: 78, category: 'technology' },
  { id: '6', name: 'Digital Marketing Pros', description: 'Online marketing strategies and trends', memberCount: 92, category: 'business' },
];

const eventTypes = [
  'Tech Talks', 'Workshops', 'Networking Events', 'Hackathons', 'Panel Discussions', 
  'Career Fairs', 'Startup Pitches', 'Code Reviews', 'Design Critiques', 'Book Clubs'
];

const CommunityEngagementStep: React.FC<OnboardingStepProps> = ({ onNext }) => {
  const dispatch = useAppDispatch();
  const { engagement } = useAppSelector((state) => state.onboarding.formData);
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>(engagement.interests || []);
  const [selectedGroups, setSelectedGroups] = useState<string[]>(engagement.groupIds || []);
  const [volunteeringAvailable, setVolunteeringAvailable] = useState(engagement.volunteeringAvailable || false);
  const [mentorshipInterest, setMentorshipInterest] = useState(engagement.mentorshipInterest || 'none');
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(engagement.eventTypes || []);
  const [communicationFreq, setCommunicationFreq] = useState(engagement.communicationPreferences?.frequency || 'weekly');

  // Auto-save changes
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(updateCommunityEngagement({
        interests: selectedInterests,
        groupIds: selectedGroups,
        volunteeringAvailable,
        mentorshipInterest: mentorshipInterest as any,
        eventTypes: selectedEventTypes,
        communicationPreferences: {
          frequency: communicationFreq as any,
          channels: ['email'] // Default to email
        }
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [dispatch, selectedInterests, selectedGroups, volunteeringAvailable, mentorshipInterest, selectedEventTypes, communicationFreq]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleEventType = (eventType: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(eventType) 
        ? prev.filter(type => type !== eventType)
        : [...prev, eventType]
    );
  };

  const getRecommendedGroups = () => {
    if (selectedInterests.length === 0) return mockGroups.slice(0, 3);
    
    return mockGroups.filter(group => {
      const category = interestCategories.find(cat => cat.id === group.category);
      return category && category.interests.some(interest => selectedInterests.includes(interest));
    }).slice(0, 4);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Join the Community
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Help us recommend groups, events, and opportunities that match your interests
        </p>
      </div>

      <div className="space-y-8">
        {/* Interests Selection */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            What are you interested in?
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Select areas that align with your professional interests and goals
          </p>
          
          <div className="space-y-4">
            {interestCategories.map((category) => (
              <div key={category.id} className="border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="text-slate-600 dark:text-slate-400">
                    {category.icon}
                  </div>
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    {category.name}
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.interests.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        selectedInterests.includes(interest)
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {interest}
                      {selectedInterests.includes(interest) && (
                        <Check className="w-3 h-3 ml-1 inline" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Group Recommendations */}
        {selectedInterests.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Recommended Groups
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Based on your interests, here are some groups you might like to join
            </p>
            
            <div className="space-y-3">
              {getRecommendedGroups().map((group) => (
                <div
                  key={group.id}
                  onClick={() => toggleGroup(group.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedGroups.includes(group.id)
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-slate-500" />
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white">
                          {group.name}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {group.description} • {group.memberCount} members
                        </p>
                      </div>
                    </div>
                    {selectedGroups.includes(group.id) && (
                      <Check className="w-5 h-5 text-orange-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Event Preferences
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            What types of events interest you most?
          </p>
          
          <div className="flex flex-wrap gap-2">
            {eventTypes.map((eventType) => (
              <button
                key={eventType}
                onClick={() => toggleEventType(eventType)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedEventTypes.includes(eventType)
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <Calendar className="w-4 h-4 mr-1 inline" />
                {eventType}
                {selectedEventTypes.includes(eventType) && (
                  <Check className="w-3 h-3 ml-1 inline" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mentorship */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Mentorship Interest
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Are you interested in mentoring others or being mentored?
          </p>
          
          <div className="space-y-3">
            {[
              { value: 'mentor', label: 'I want to mentor others', description: 'Share your expertise and help others grow' },
              { value: 'mentee', label: 'I want to be mentored', description: 'Learn from experienced professionals' },
              { value: 'both', label: 'Both mentor and mentee', description: 'Give and receive guidance in different areas' },
              { value: 'none', label: 'Not interested in mentorship', description: 'Maybe later when I have more time' }
            ].map((option) => (
              <div
                key={option.value}
                onClick={() => setMentorshipInterest(option.value)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  mentorshipInterest === option.value
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {option.label}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {option.description}
                    </p>
                  </div>
                  {mentorshipInterest === option.value && (
                    <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Volunteering */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Community Involvement
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-600 rounded-lg">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-slate-500" />
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    Volunteer for Community Events
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Help organize meetups, workshops, and community initiatives
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={volunteeringAvailable}
                  onChange={(e) => setVolunteeringAvailable(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Communication Frequency */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Communication Preferences
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            How often would you like to receive community updates?
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'daily', label: 'Daily', description: 'Stay up to date with everything' },
              { value: 'weekly', label: 'Weekly', description: 'Regular updates without overwhelm' },
              { value: 'monthly', label: 'Monthly', description: 'Just the highlights' },
              { value: 'never', label: 'Never', description: 'I\'ll check in when I want' }
            ].map((option) => (
              <div
                key={option.value}
                onClick={() => setCommunicationFreq(option.value)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  communicationFreq === option.value
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
              >
                <div className="text-center">
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    {option.label}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {option.description}
                  </p>
                  {communicationFreq === option.value && (
                    <Star className="w-4 h-4 text-orange-500 mx-auto mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        {(selectedInterests.length > 0 || selectedGroups.length > 0) && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex gap-3">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-300 mb-1">
                  Great choices!
                </h4>
                <p className="text-sm text-green-700 dark:text-green-400">
                  You've selected {selectedInterests.length} interests and {selectedGroups.length} groups. 
                  We'll use this to recommend relevant events, opportunities, and connections.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Publishing */}
        <div className="border-t border-slate-200 dark:border-slate-600 pt-8">
          <ProfilePublisher />
        </div>
      </div>
    </div>
  );
};

export default CommunityEngagementStep;