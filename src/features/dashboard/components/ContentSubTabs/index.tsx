import React from 'react';
import { DashboardTab } from '../../types';

interface ContentSubTabsProps {
  tabs: DashboardTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const ContentSubTabs: React.FC<ContentSubTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <div className={`bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="px-6 py-3">
        <nav className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap
                  ${isActive
                    ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }
                `}
              >
                <Icon className={`
                  mr-2 h-4 w-4 transition-colors
                  ${isActive 
                    ? 'text-orange-500 dark:text-orange-400' 
                    : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400'
                  }
                `} />
                
                <span>{tab.label}</span>
                
                {(tab.count !== undefined && tab.count > 0) && (
                  <span className={`
                    ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium
                    ${isActive
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-600 dark:text-slate-300'
                    }
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default ContentSubTabs;