import React, { useState } from 'react';
import { DashboardTab } from '../../types';
import { CreateContentDropdown } from '../CreateContentDropdown';
import { ContentDisplay } from '../ContentDisplay';
import { cn } from '@/utils/cn';

interface VerticalTabSetProps {
  tabs: DashboardTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  showCreateButton?: boolean;
}

export const VerticalTabSet: React.FC<VerticalTabSetProps> = ({
  tabs,
  activeTab,
  onTabChange,
  showCreateButton = true
}) => {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
      {/* Left Vertical Tabs */}
      <div className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div className="p-4">
          {/* Create Dropdown Button */}
          {showCreateButton && (
            <CreateContentDropdown className="w-full mb-6" />
          )}

          {/* Content Type Tabs */}
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-l-4 border-orange-500"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
                  )}
                >
                  <Icon className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-orange-500" : "text-slate-400"
                  )} />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={cn(
                      "ml-2 px-2 py-1 text-xs rounded-full font-medium",
                      isActive
                        ? "bg-orange-100 dark:bg-orange-800 text-orange-800 dark:text-orange-200"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    )}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 min-w-0">
        <ContentDisplay activeTab={activeTab} />
      </div>
    </div>
  );
};

export default VerticalTabSet;