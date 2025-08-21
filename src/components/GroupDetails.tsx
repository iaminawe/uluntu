'use client';

import { Link } from 'react-router-dom';
import { Globe, Lock, EyeOff, ArrowRight } from 'lucide-react';
import { getMemberProfileUrl } from '@/utils/memberSlugUtils';
import { getGroupPostUrl, getEventUrl } from '@/utils/contentUrlUtils';


interface GroupEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
}

interface GroupResource {
  id: string;
  title: string;
  type: string;
  url: string;
  addedDate: string;
  description: string;
}

interface GroupPost {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    image: string;
  };
  date: string;
  image?: string;
}

// This would come from your database
const SAMPLE_GROUP = {
  id: '550e8400-e29b-41d4-a716-446655440001',
  name: 'AI Enthusiasts Kootenay',
  description: 'A group for anyone interested in artificial intelligence and its applications.',
  longDescription: `Our group brings together professionals, enthusiasts, and learners passionate about artificial intelligence and its real-world applications. We focus on:

- Monthly meetups featuring expert presentations
- Hands-on workshops and coding sessions
- Discussion of AI ethics and best practices
- Networking and collaboration opportunities
- Knowledge sharing and mentorship

Whether you're an AI expert or just starting to explore this field, you're welcome to join us!`,
  heroImage: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg',
  coverImage: 'https://images.pexels.com/photos/1181373/pexels-photo-1181373.jpeg',
  visibility: 'open' as const,
  memberCount: 45,
  members: [
    {
      id: '550e8400-e29b-41d4-a716-446655440011',
      name: 'Sarah Johnson',
      title: 'AI Research Lead',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
      role: 'admin',
      joinedDate: '2024-01-15'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440012',
      name: 'Michael Chen',
      title: 'ML Engineer',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
      role: 'member',
      joinedDate: '2024-02-01'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440013',
      name: 'Emma Wilson',
      title: 'Data Scientist',
      image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg',
      role: 'member',
      joinedDate: '2024-02-15'
    }
  ],
  events: [
    {
      id: '550e8400-e29b-41d4-a716-446655440021',
      title: 'AI Ethics Workshop',
      date: '2025-06-15T18:00:00',
      description: 'Join us for an interactive workshop on AI ethics.',
      image: 'https://images.pexels.com/photos/7089629/pexels-photo-7089629.jpeg'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440022',
      title: 'Machine Learning Study Group',
      date: '2025-06-20T19:00:00',
      description: 'Monthly meetup to discuss and practice ML concepts.',
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg'
    }
  ],
  resources: [
    {
      id: '550e8400-e29b-41d4-a716-446655440031',
      title: 'Getting Started with AI',
      type: 'Guide',
      url: '#',
      addedDate: '2024-03-01',
      description: 'A comprehensive guide for beginners in AI.'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440032',
      title: 'ML Workshop Slides',
      type: 'Presentation',
      url: '#',
      addedDate: '2024-03-15',
      description: 'Slides from our recent machine learning workshop.'
    }
  ],
  posts: [
    {
      id: '550e8400-e29b-41d4-a716-446655440041',
      title: 'Recap: February AI Ethics Workshop',
      excerpt: 'Highlights from our latest workshop on ethical considerations in AI development.',
      author: {
        name: 'Sarah Johnson',
        image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
      },
      date: '2024-02-16',
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440042',
      title: 'Announcing Our New ML Study Group',
      excerpt: 'Join our monthly machine learning study sessions starting next month.',
      author: {
        name: 'Michael Chen',
        image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
      },
      date: '2024-02-10'
    }
  ]
};

export default function GroupDetails({ groupId }: { groupId: string }) {
  // In a real app, you'd fetch the group data based on the groupId
  const group = SAMPLE_GROUP;

  const getVisibilityIcon = (visibility: 'open' | 'closed' | 'secret') => {
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
      {/* Hero Section */}
      <div className="relative h-96 rounded-xl overflow-hidden mb-8">
        <img
          src={group.coverImage}
          alt={group.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{group.name}</h1>
                <div className="flex items-center text-white/80 mb-4">
                  {getVisibilityIcon(group.visibility)}
                  <span className="ml-2 capitalize">{group.visibility} Group</span>
                  <span className="mx-2">•</span>
                  <span>{group.memberCount} members</span>
                </div>
                <p className="text-white/90 max-w-2xl">{group.description}</p>
              </div>
              <button className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                Join Group
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About</h2>
            <div className="prose dark:prose-invert max-w-none">
              {group.longDescription.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('- ')) {
                  const items = paragraph.split('\n');
                  return (
                    <ul key={index} className="list-disc list-inside mb-4">
                      {items.map((item, itemIndex) => (
                        <li key={itemIndex}>{item.replace('- ', '')}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={index} className="mb-4">{paragraph}</p>;
              })}
            </div>
          </div>

          {/* Latest Posts */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Latest Posts</h2>
              <Link
                to={`/groups/${group.id}/posts`}
                className="text-orange-500 hover:text-orange-600 transition-colors flex items-center"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="grid gap-6">
              {group.posts.map(post => (
                <div key={post.id} className="flex gap-6">
                  {post.image && (
                    <div className="w-48 h-32 flex-shrink-0">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                      <Link
                        to={getGroupPostUrl(group, post.id)}
                        className="hover:text-orange-500 transition-colors"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-3">{post.excerpt}</p>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <img
                        src={post.author.image}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span>{post.author.name}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upcoming Events</h2>
              <Link
                to={`/groups/${group.id}/events`}
                className="text-orange-500 hover:text-orange-600 transition-colors flex items-center"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="grid gap-6">
              {group.events.map(event => (
                <div key={event.id} className="flex gap-6">
                  <div className="w-48 h-32 flex-shrink-0">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
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
                to={`/groups/${group.id}/members`}
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
                to={`/groups/${group.id}/resources`}
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
    </div>
  );
}