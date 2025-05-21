import React, { useState } from 'react';

interface SuggestionFormProps {
  onSuggestTopic: (title: string) => void;
}

const SuggestionForm: React.FC<SuggestionFormProps> = ({ onSuggestTopic }) => {
  const [newTopic, setNewTopic] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopic.trim()) {
      onSuggestTopic(newTopic);
      setNewTopic('');
    }
  };
  
  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Suggest a Topic</h3>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="topic-suggestion" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              What AI topic would you like to learn about?
            </label>
            <input
              type="text"
              id="topic-suggestion"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                      text-slate-900 dark:text-white bg-white dark:bg-slate-700
                      focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
          <h4 className="font-medium text-slate-900 dark:text-white mb-3">How Topic Selection Works</h4>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
              Topics with the most votes will be prioritized for upcoming meetups
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
              You can vote for multiple topics that interest you
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
              We reset the voting after each meetup
            </li>
            <li className="flex items-start">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">•</span>
              Suggested topics will be reviewed by organizers before being added to the official list
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SuggestionForm;
