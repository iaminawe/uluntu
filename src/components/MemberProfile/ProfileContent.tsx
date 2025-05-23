import { Link } from 'react-router-dom';
import { Users, Calendar, BookOpen, Newspaper, Package, Briefcase, Award, ExternalLink } from 'lucide-react';
import { Member } from './types';
import { getTypeIcon } from './utils';
import { MemberContributions } from '../../hooks/useMemberContributions';

interface ProfileContentProps {
  member: Member;
  contributions?: MemberContributions;
}

const ProfileContent = ({ member, contributions }: ProfileContentProps) => {
  // Use contributions data if available, otherwise fall back to member data
  const groups = contributions?.groups || member.groups || [];
  const resources = contributions?.resources || member.resources || [];
  const events = contributions?.events || member.events || [];
  const posts = contributions?.posts || member.posts || [];
  const marketplaceListings = contributions?.marketplaceListings || member.marketplaceListings || [];
  const opportunities = contributions?.opportunities || member.opportunities || [];
  const achievements = member.achievements || [];
  return (
    <div className="space-y-8 mt-8">
      {/* Main content sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Groups section with visual enhancements */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-6">
            <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-full mr-3">
              <Users className="h-5 w-5 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Groups</h2>
          </div>
          
          {groups.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-4">No groups joined yet</p>
          ) : (
            <div className="space-y-5">
              {groups.map(group => (
                <div key={group.id} className="flex items-start border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <Link
                      to={`/groups/${group.id}`}
                      className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 block mb-1"
                    >
                      {group.name}
                    </Link>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${group.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'} mr-2`}>
                        {group.role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                      <span>Joined {new Date(group.joinedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resources section with improved visuals */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-6">
            <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-full mr-3">
              <BookOpen className="h-5 w-5 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Resources</h2>
          </div>
          
          {resources.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-4">No resources shared yet</p>
          ) : (
            <div className="space-y-5">
              {resources.map(resource => (
                <div key={resource.id} className="flex items-start border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <Link
                      to={`/resources/${resource.id}`}
                      className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 block mb-1"
                    >
                      {resource.title}
                    </Link>
                    <div className="flex items-center text-sm">
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mr-2">
                        {resource.type}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">
                        {new Date(resource.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 ml-2"
                    aria-label="Open resource"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Events and presentations section */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center mb-6">
            <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-full mr-3">
              <Calendar className="h-5 w-5 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Events & Presentations</h2>
          </div>
          
          {events.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-4">No events or presentations yet</p>
          ) : (
            <div className="space-y-5">
              {events.map(event => (
                <div key={event.id} className="flex items-start border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <Link
                      to={`/events/${event.id}`}
                      className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 block mb-1"
                    >
                      {event.title}
                    </Link>
                    <div className="flex items-center text-sm">
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 mr-2">
                        {event.presentation || 'Attendee'}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Opportunities section - New addition */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center mb-6">
          <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-full mr-3">
            <Briefcase className="h-5 w-5 text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Opportunities</h2>
        </div>
        
        {!member.opportunities || member.opportunities.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">No opportunities posted yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {member.opportunities?.map(opportunity => (
              <div key={opportunity.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-600">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-slate-900 dark:text-white">{opportunity.title}</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {opportunity.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                    {opportunity.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-orange-600 dark:text-orange-400">
                      {opportunity.location} {opportunity.remote && '• Remote'}
                    </span>
                    <Link 
                      to={`/opportunities/${opportunity.id}`}
                      className="text-sm font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Marketplace listings with enhanced visual appeal */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-full mr-3">
              <Package className="h-5 w-5 text-orange-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Marketplace Contributions</h2>
          </div>
          <Link 
            to="/marketplace" 
            className="text-sm font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
          >
            View All
          </Link>
        </div>
        
        {marketplaceListings.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">No marketplace listings yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {marketplaceListings.map(listing => (
              <Link
                key={listing.id}
                to={`/marketplace/${listing.id}`}
                className="group bg-slate-50 dark:bg-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-all border border-slate-100 dark:border-slate-600"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-slate-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                      {listing.title}
                    </h3>
                    <div className="p-1.5 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                      {getTypeIcon(listing.type)}
                    </div>
                  </div>
                  <p className="text-orange-600 dark:text-orange-400 font-medium">
                    ${listing.price}{listing.type === 'service' && '/hr'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Listed {new Date(listing.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Posts section with improved layout */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center mb-6">
          <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-full mr-3">
            <Newspaper className="h-5 w-5 text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Posts & Contributions</h2>
        </div>
        
        {posts.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">No posts or contributions yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map(post => (
              <div key={post.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-5 hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-600">
                <Link
                  to={`/groups/${post.group.id}/posts/${post.id}`}
                  className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 block mb-2"
                >
                  {post.title}
                </Link>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                  {post.excerpt || 'No excerpt available'}
                </p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/groups/${post.group.id}`}
                    className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    {post.group.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Opportunities section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center mb-6">
          <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-full mr-3">
            <Briefcase className="h-5 w-5 text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Opportunities Posted</h2>
        </div>
        
        {opportunities.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">No opportunities posted yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opportunity) => (
              <div key={opportunity.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-5 hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-600">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-slate-900 dark:text-white">{opportunity.title}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${opportunity.type === 'volunteer' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 line-clamp-2">
                  {opportunity.description}
                </p>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center mr-4">
                    {opportunity.location}
                    {opportunity.remote && <span className="ml-1">(Remote)</span>}
                  </span>
                  <Link 
                    to={`/opportunities/${opportunity.id}`}
                    className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 ml-auto"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Achievements section - New addition */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center mb-6">
          <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-full mr-3">
            <Award className="h-5 w-5 text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Achievements & Recognition</h2>
        </div>
        
        {achievements.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-4">No achievements listed yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-5 border border-slate-100 dark:border-slate-600 flex flex-col items-center text-center">
                <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full mb-3">
                  <Award className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">{achievement.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{achievement.description}</p>
                <span className="text-xs text-slate-500 dark:text-slate-400">{achievement.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileContent;
