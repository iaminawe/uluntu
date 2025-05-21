import { Users, Calendar, BookOpen, Newspaper } from 'lucide-react';
import { TabsProps, TabType } from './types';

const Tabs: React.FC<TabsProps> = ({ selectedTab, setSelectedTab, group }) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'about', label: 'About', icon: <BookOpen className="h-5 w-5" /> },
    { id: 'events', label: 'Events', icon: <Calendar className="h-5 w-5" />, count: group.eventCount },
    { id: 'members', label: 'Members', icon: <Users className="h-5 w-5" />, count: group.memberCount },
    { id: 'resources', label: 'Resources', icon: <BookOpen className="h-5 w-5" />, count: group.resourceCount },
    { id: 'posts', label: 'Posts', icon: <Newspaper className="h-5 w-5" />, count: group.postCount },
  ];

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <div className="flex overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`
              px-6 py-4 flex items-center text-sm font-medium border-b-2 -mb-px whitespace-nowrap
              ${selectedTab === tab.id
                ? 'border-orange-500 text-orange-500' 
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }
            `}
          >
            <span className="flex items-center">
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`
                  ml-2 px-2 py-0.5 rounded-full text-xs 
                  ${selectedTab === tab.id 
                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
