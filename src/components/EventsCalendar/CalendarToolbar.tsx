import React from 'react';
import { ToolbarProps, NavigateAction, View } from 'react-big-calendar';

export const CalendarToolbar: React.FC<ToolbarProps> = (props) => {
  const { onNavigate, onView, label, view } = props;

  const navigate = (action: NavigateAction) => {
    onNavigate(action);
  };

  const viewNames: Record<string, string> = {
    month: 'Month',
    week: 'Week',
    day: 'Day',
    agenda: 'Agenda'
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 p-2">
      <div className="flex items-center mb-3 sm:mb-0">
        <button
          type="button"
          onClick={() => navigate('TODAY')}
          className="px-3 py-1 mr-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => navigate('PREV')}
          className="p-1 mr-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => navigate('NEXT')}
          className="p-1 mr-4 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{label}</h2>
      </div>
      
      <div className="flex bg-slate-100 dark:bg-slate-700 rounded-md">
        {Object.entries(viewNames).map(([key, name]) => (
          <button
            key={key}
            type="button"
            onClick={() => onView(key as View)}
            className={`px-3 py-1 text-sm ${
              view === key 
                ? 'bg-orange-500 text-white' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            } rounded-md transition-colors`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};
