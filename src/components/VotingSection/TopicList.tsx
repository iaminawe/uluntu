import React from 'react';
import { Topic } from './types';

interface TopicListProps {
  topics: Topic[];
  onVote: (id: number) => void;
}

const TopicList: React.FC<TopicListProps> = ({ topics, onVote }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Proposed Topics</h3>
      <div className="space-y-4">
        {topics.map(topic => (
          <div 
            key={topic.id} 
            className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex justify-between items-center"
          >
            <div>
              <h4 className="font-medium text-slate-900 dark:text-white">{topic.title}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">{topic.description}</p>
            </div>
            <div className="flex items-center">
              <span className="text-slate-600 dark:text-slate-400 mr-2">{topic.votes}</span>
              <button
                className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors"
                onClick={() => onVote(topic.id)}
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
  );
};

export default TopicList;
