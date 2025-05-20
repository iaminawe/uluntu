import React, { useState, useEffect } from 'react';
import { proposedTopics } from '../data/sampleData';

interface Topic {
  id: number;
  title: string;
  description: string;
  votes: number;
}

const VotingSection: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState('');
  
  // Load topics and votes from localStorage or use defaults
  useEffect(() => {
    const savedTopics = localStorage.getItem('kootenay-ai-topics');
    if (savedTopics) {
      setTopics(JSON.parse(savedTopics));
    } else {
      setTopics(proposedTopics);
    }
  }, []);
  
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
  const handleSuggestTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopic.trim()) {
      const newTopicObj = {
        id: Date.now(),
        title: newTopic,
        description: 'User suggested topic',
        votes: 0
      };
      setTopics([...topics, newTopicObj]);
      setNewTopic('');
    }
  };

  return (
    <section id="voting" className="py-16 bg-slate-50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Topic Voting for Next Meetup</h2>
          <div className="w-20 h-1 bg-indigo-600 mx-auto mb-6"></div>
          <p className="text-lg text-slate-600">
            Help us choose topics for our upcoming meetups by voting for your favorites
            or suggesting new ones.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-6">Proposed Topics</h3>
            <div className="space-y-4">
              {topics.map(topic => (
                <div 
                  key={topic.id} 
                  className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-medium text-slate-900">{topic.title}</h4>
                    <p className="text-sm text-slate-600">{topic.description}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-600 mr-2">{topic.votes}</span>
                    <button
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
                      onClick={() => handleVote(topic.id)}
                      aria-label={`Vote for ${topic.title}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-6">Suggest a Topic</h3>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <form onSubmit={handleSuggestTopic}>
                <div className="mb-4">
                  <label htmlFor="topic-suggestion" className="block text-sm font-medium text-slate-700 mb-1">
                    What AI topic would you like to learn about?
                  </label>
                  <input
                    type="text"
                    id="topic-suggestion"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your topic suggestion"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Submit Topic
                </button>
              </form>
              
              <div className="mt-8">
                <h4 className="font-medium text-slate-900 mb-3">How Topic Selection Works</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Topics with the most votes will be prioritized for upcoming meetups
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    You can vote for multiple topics that interest you
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    We reset the voting after each meetup
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Suggested topics will be reviewed by organizers before being added to the official list
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VotingSection;