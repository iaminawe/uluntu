import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DashboardTab } from '../../types';

interface DashboardTabsProps {
  tabs: DashboardTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  const location = useLocation();
  
  // Function to generate the URL for each tab
  const getTabUrl = (tabId: string) => {
    if (tabId === 'all') {
      return '/dashboard';
    }
    return `/dashboard/${tabId}`;
  };
  
  return (
    <div className={`border-b border-slate-200 dark:border-slate-700 ${className}`}>
      <nav className="-mb-px flex space-x-2 sm:space-x-4 lg:space-x-6 overflow-x-auto w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          
          return (
            <Link
              key={tab.id}
              to={getTabUrl(tab.id)}
              className={`
                group inline-flex items-center py-3 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0
                ${isActive
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
                }
              `}
            >
              <Icon className={`
                -ml-0.5 mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-colors
                ${isActive 
                  ? 'text-orange-500 dark:text-orange-400' 
                  : 'text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-400'
                }
              `} />
              
              <span>{tab.label}</span>
              
              {(tab.count !== undefined && tab.count > 0) && (
                <span className={`
                  ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${isActive
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }
                `}>
                  {tab.count}
                </span>
              )}
              
              {tab.badge && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  {tab.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardTabs;