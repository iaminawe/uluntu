import React, { useState, useEffect } from 'react';
import { VotingSectionProps, Topic } from './types';
import TopicList from './TopicList';
import SuggestionForm from './SuggestionForm';

// Sample topics data if no initialTopics are provided
const SAMPLE_TOPICS: Topic[] = [
  {
    id: 1,
    title: 'Introduction to Machine Learning',
    description: 'Overview of basic ML concepts and applications',
    votes: 12
  },
  {
    id: 2,
    title: 'Building AI Applications with ChatGPT',
    description: 'How to leverage large language models in your applications',
    votes: 8
  },
  {
    id: 3,
    title: 'Computer Vision Fundamentals',
    description: 'Image recognition and processing with modern AI',
    votes: 6
  }
];

const VotingSection: React.FC<VotingSectionProps> = ({
  title = "Topic Voting for Next Meetup",
  description = "Help us choose topics for our upcoming meetups by voting for your favorites or suggesting new ones.",
  initialTopics = SAMPLE_TOPICS
}) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  
  // Load topics and votes from localStorage or use defaults
  useEffect(() => {
    const savedTopics = localStorage.getItem('kootenay-ai-topics');
    if (savedTopics) {
      setTopics(JSON.parse(savedTopics));
    } else {
      setTopics(initialTopics);
    }
  }, [initialTopics]);
  
  // Save topics to localStorage when they change
  useEffect(() => {
    if (topics.length > 0) {
      localStorage.setItem('kootenay-ai-topics', JSON.stringify(topics));
    }
  }, [topics]);
  
  // Handle voting
  const handleVote = (id: number) => {
    setTopics(topics.map(topic => 
      topic.id === id ? { ...topic, votes: topic.votes + 1 } : topic
    ));
  };
  
  // Handle suggesting a new topic
  const handleSuggestTopic = (topicTitle: string) => {
    if (topicTitle.trim()) {
      const newTopicObj = {
        id: Date.now(),
        title: topicTitle,
        description: 'User suggested topic',
        votes: 0
      };
      setTopics([...topics, newTopicObj]);
    }
  };

  return (
    <section id="voting" className="py-16 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{title}</h2>
          <div className="w-20 h-1 bg-indigo-600 mx-auto mb-6"></div>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            {description}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <TopicList topics={topics} onVote={handleVote} />
          <SuggestionForm onSuggestTopic={handleSuggestTopic} />
        </div>
      </div>
    </section>
  );
};

export default VotingSection;
