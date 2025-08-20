import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Group } from './types';
import { getMemberProfileUrl } from '@/utils/memberSlugUtils';
import { getEventUrl, getGroupUrl } from '@/utils/contentUrlUtils';

interface GroupContentProps {
  group: Group;
}

const GroupContent = ({ group }: GroupContentProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Main Content - Posts and Events */}
      <div className="md:col-span-2 space-y-8">
        {/* Featured Posts */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Posts</h2>
            <Link
              to={`/groups/${group.id}/posts`}
              className="text-orange-500 hover:text-orange-600 transition-colors flex items-center"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-6">
            {group.posts.map(post => (
              <div key={post.id} className="flex flex-col md:flex-row gap-6">
                {post.image && (
                  <div className="md:w-1/3">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
                <div className={post.image ? 'md:w-2/3' : 'w-full'}>
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={post.author.image}
                      alt={post.author.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {post.author.name} • {new Date(post.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
                    <Link
                      to={`/groups/${group.id}/posts/${post.id}`}
                      className="hover:text-orange-500 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {post.excerpt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Events</h2>
            <Link
              to={`/groups/${group.id}/events`}
              className="text-orange-500 hover:text-orange-600 transition-colors flex items-center"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="space-y-6">
            {group.events.map(event => (
              <div key={event.id} className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                </div>
                <div className="md:w-2/3">
                  <div className="mb-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">
                      <Link
                        to={getEventUrl(event)}
                        className="hover:text-orange-500 transition-colors"
                      >
                        {event.title}
                      </Link>
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-3">{event.description}</p>
                    <div className="text-sm text-orange-500">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-8">
        {/* New Members */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Members</h2>
            <Link
              to={`${getGroupUrl(group)}/members`}
              className="text-orange-500 hover:text-orange-600 transition-colors flex items-center"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {group.members.map(member => (
              <div key={member.id} className="flex items-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    <Link
                      to={getMemberProfileUrl(member)}
                      className="hover:text-orange-500 transition-colors"
                    >
                      {member.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {member.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Resources */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Resources</h2>
            <Link
              to={`${getGroupUrl(group)}/resources`}
              className="text-orange-500 hover:text-orange-600 transition-colors flex items-center"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {group.resources.map(resource => (
              <div key={resource.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                  <a
                    href={resource.url}
                    className="hover:text-orange-500 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resource.title}
                  </a>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                  {resource.description}
                </p>
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <span>{resource.type}</span>
                  <span>{new Date(resource.addedDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupContent;
