import Link from 'next/link';
import { Users, Calendar, BookOpen, Newspaper, Package } from 'lucide-react';
import { Member } from './types';
import { getTypeIcon } from './utils';

interface ProfileContentProps {
  member: Member;
}

const ProfileContent = ({ member }: ProfileContentProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Users className="h-5 w-5 text-orange-500 mr-2" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Groups</h2>
        </div>
        <div className="space-y-4">
          {member.groups.map(group => (
            <div key={group.id} className="flex justify-between items-center">
              <div>
                <Link
                  href={`/groups/${group.id}`}
                  className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                >
                  {group.name}
                </Link>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {group.role === 'admin' ? 'Admin' : 'Member'} • Joined {new Date(group.joinedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Calendar className="h-5 w-5 text-orange-500 mr-2" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Events</h2>
        </div>
        <div className="space-y-4">
          {member.events.map(event => (
            <div key={event.id} className="flex justify-between items-center">
              <div>
                <Link
                  href={`/events/${event.id}`}
                  className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                >
                  {event.title}
                </Link>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {new Date(event.date).toLocaleDateString()} • {event.presentation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <BookOpen className="h-5 w-5 text-orange-500 mr-2" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Resources</h2>
        </div>
        <div className="space-y-4">
          {member.resources.map(resource => (
            <div key={resource.id} className="flex justify-between items-center">
              <div>
                <Link
                  href={`/resources/${resource.id}`}
                  className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                >
                  {resource.title}
                </Link>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {resource.type} • {new Date(resource.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Package className="h-5 w-5 text-orange-500 mr-2" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Marketplace Listings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {member.marketplaceListings.map(listing => (
            <Link
              key={listing.id}
              href={`/marketplace/${listing.id}`}
              className="bg-slate-50 dark:bg-slate-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-48">
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-slate-900 dark:text-white">{listing.title}</h3>
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                    {getTypeIcon(listing.type)}
                  </div>
                </div>
                <p className="text-orange-600 dark:text-orange-400">
                  ${listing.price}{listing.type === 'service' && '/hr'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Listed {new Date(listing.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Newspaper className="h-5 w-5 text-orange-500 mr-2" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Posts</h2>
        </div>
        <div className="space-y-4">
          {member.posts.map(post => (
            <div key={post.id} className="flex justify-between items-center">
              <div>
                <Link
                  href={`/groups/${post.group.id}/posts/${post.id}`}
                  className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                >
                  {post.title}
                </Link>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Posted in {post.group.name} • {new Date(post.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;
