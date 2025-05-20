'use client';

import { useState } from 'react';
import { Search, Users, Calendar, BookOpen, Newspaper, Lock, Globe, EyeOff } from 'lucide-react';
import Link from 'next/link';

type GroupVisibility = 'open' | 'closed' | 'secret';

interface GroupMember {
  id: number;
  name: string;
  image: string;
  role: 'admin' | 'member';
  joinedDate: string;
}

interface Group {
  id: number;
  name: string;
  description: string;
  heroImage: string;
  visibility: GroupVisibility;
  memberCount: number;
  members: GroupMember[];
  eventCount: number;
  resourceCount: number;
  postCount: number;
}

const SAMPLE_GROUPS: Group[] = [
  {
    id: 1,
    name: 'AI Enthusiasts Kootenay',
    description: 'A group for anyone interested in artificial intelligence and its applications.',
    heroImage: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
    visibility: 'open',
    memberCount: 45,
    eventCount: 3,
    resourceCount: 12,
    postCount: 8,
    members: [
      {
        id: 1,
        name: 'Sarah Johnson',
        image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
        role: 'admin',
        joinedDate: '2024-01-15'
      },
      {
        id: 2,
        name: 'Michael Chen',
        image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
        role: 'member',
        joinedDate: '2024-02-01'
      }
    ]
  },
  {
    id: 2,
    name: 'Kootenay Tech Organizers',
    description: 'A group for tech event organizers and community leaders.',
    heroImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    visibility: 'closed',
    memberCount: 12,
    eventCount: 5,
    resourceCount: 8,
    postCount: 15,
    members: [
      {
        id: 3,
        name: 'Emma Wilson',
        image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg',
        role: 'admin',
        joinedDate: '2024-01-10'
      }
    ]
  },
  {
    id: 3,
    name: 'Admin Council',
    description: 'Private group for community administrators.',
    heroImage: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
    visibility: 'secret',
    memberCount: 5,
    eventCount: 2,
    resourceCount: 20,
    postCount: 25,
    members: []
  }
];

interface JoinModalProps {
  group: Group;
  onClose: () => void;
}

function JoinModal({ group, onClose }: JoinModalProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Join request submitted:', { groupId: group.id, message });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Join {group.name}
        </h3>
        {group.visibility === 'closed' ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Why would you like to join this group?
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Submit Request
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              You'll be able to participate in discussions, access resources, and attend events.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Join Group
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GroupsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const isLoggedIn = true; // This would come from your auth context

  const filteredGroups = SAMPLE_GROUPS.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const visibilityAllowed = group.visibility !== 'secret' || isLoggedIn;
    return matchesSearch && visibilityAllowed;
  });

  const getVisibilityIcon = (visibility: GroupVisibility) => {
    switch (visibility) {
      case 'open':
        return <Globe className="h-5 w-5" />;
      case 'closed':
        return <Lock className="h-5 w-5" />;
      case 'secret':
        return <EyeOff className="h-5 w-5" />;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg 
                     bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filteredGroups.map(group => (
          <div key={group.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden flex flex-col lg:flex-row">
            <div className="lg:w-2/5 h-48 lg:h-auto relative">
              <img
                src={group.heroImage}
                alt={group.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-full p-2">
                {getVisibilityIcon(group.visibility)}
              </div>
            </div>
            <div className="lg:w-3/5 p-6 flex flex-col">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link
                      href={`/groups/${group.id}`}
                      className="text-xl font-semibold text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                    >
                      {group.name}
                    </Link>
                    <p className="text-slate-600 dark:text-slate-300 mt-2">
                      {group.description}
                    </p>
                  </div>
                  {group.visibility !== 'secret' && (
                    <button
                      onClick={() => setSelectedGroup(group)}
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
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{group.eventCount}</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <BookOpen className="h-5 w-5 mr-2" />
                    <span>{group.resourceCount}</span>
                  </div>
                  <div className="flex items-center text-slate-600 dark:text-slate-300">
                    <Newspaper className="h-5 w-5 mr-2" />
                    <span>{group.postCount}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Recent Members</h4>
                  <div className="flex -space-x-2">
                    {group.members.slice(0, 5).map(member => (
                      <img
                        key={member.id}
                        src={member.image}
                        alt={member.name}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800"
                        title={`${member.name} (${member.role})`}
                      />
                    ))}
                    {group.memberCount > 5 && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-sm font-medium text-slate-600 dark:text-slate-300 border-2 border-white dark:border-slate-800">
                        +{group.memberCount - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedGroup && (
        <JoinModal
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
}