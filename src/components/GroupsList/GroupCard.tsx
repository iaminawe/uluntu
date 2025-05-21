import { Link } from 'react-router-dom';
import { Users, Calendar, BookOpen, Newspaper } from 'lucide-react';
import { Group } from './types';
import { getVisibilityLabel } from './utils';

interface GroupCardProps {
  group: Group;
  onJoinClick: (group: Group) => void;
}

const GroupCard = ({ group, onJoinClick }: GroupCardProps) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
      <div className="h-48 overflow-hidden">
        <img 
          src={group.heroImage} 
          alt={group.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center mb-1">
              <Link
                to={`/groups/${group.id}`}
                className="text-xl font-semibold text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
              >
                {group.name}
              </Link>
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                {getVisibilityLabel(group.visibility)}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              {group.description}
            </p>
          </div>
          {group.visibility !== 'secret' && (
            <button
              onClick={() => onJoinClick(group)}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors whitespace-nowrap"
            >
              {group.visibility === 'closed' ? 'Request to Join' : 'Join Group'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center text-slate-600 dark:text-slate-300">
            <Users className="h-5 w-5 mr-2" />
            <span>{group.memberCount}</span>
          </div>
          {group.eventCount !== undefined && (
            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{group.eventCount}</span>
            </div>
          )}
          {group.resourceCount !== undefined && (
            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <BookOpen className="h-5 w-5 mr-2" />
              <span>{group.resourceCount}</span>
            </div>
          )}
          {group.postCount !== undefined && (
            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <Newspaper className="h-5 w-5 mr-2" />
              <span>{group.postCount}</span>
            </div>
          )}
        </div>

        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Recent Members</h4>
          <div className="flex -space-x-2">
            {Array.isArray(group.members) && group.members.slice(0, 5).map(member => (
              <img
                key={member.id}
                src={member.image}
                alt={member.name}
                className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800"
                title={`${member.name} (${member.role})`}
              />
            ))}
            {group.memberCount && group.memberCount > 5 && (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-300 border-2 border-white dark:border-slate-800">
                +{group.memberCount - 5}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
