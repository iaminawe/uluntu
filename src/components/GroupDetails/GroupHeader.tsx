import { Link } from 'react-router-dom';
import { Group } from '@/features/groups/components/GroupDetails/types';
import { getVisibilityIcon } from '@/features/groups/components/GroupDetails/utils';
import { getGroupUrl } from '@/utils/contentUrlUtils';

interface GroupHeaderProps {
  group: Group;
}

const GroupHeader = ({ group }: GroupHeaderProps) => {
  return (
    <div className="relative mb-8">
      {/* Cover Image */}
      <div className="h-64 w-full overflow-hidden rounded-t-lg">
        <img
          src={group.coverImage || group.heroImage}
          alt={`${group.name} cover`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Group Info */}
      <div className="bg-white dark:bg-slate-800 rounded-b-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                {group.name}
              </h1>
              <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm text-slate-700 dark:text-slate-300">
                {getVisibilityIcon(group.visibility)}
                <span className="capitalize">{group.visibility}</span>
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-1">
              {group.memberCount} members
            </p>
          </div>

          <div className="flex mt-4 md:mt-0">
            <Link
              to={`/groups/${group.id}/join`}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
            >
              Join Group
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="sr-only">About</h2>
          <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">
            {group.longDescription || group.description}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="flex space-x-8">
            <Link
              to={getGroupUrl(group)}
              className="text-orange-500 border-b-2 border-orange-500 px-1 py-3 font-medium text-sm"
              aria-current="page"
            >
              Overview
            </Link>
            <Link
              to={`/groups/${group.id}/members`}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 px-1 py-3 font-medium text-sm"
            >
              Members
            </Link>
            <Link
              to={`/groups/${group.id}/events`}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 px-1 py-3 font-medium text-sm"
            >
              Events
            </Link>
            <Link
              to={`/groups/${group.id}/resources`}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 px-1 py-3 font-medium text-sm"
            >
              Resources
            </Link>
            <Link
              to={`/groups/${group.id}/posts`}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 border-b-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600 px-1 py-3 font-medium text-sm"
            >
              Posts
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;
