import Link from 'next/link';
import { ArrowRight, Users, Building, Calendar, Newspaper, Heart, Briefcase, Mail } from 'lucide-react';
import Hero from "../components/HeroSection";

function FeaturedSection({ title, description, items, link }: {
  title: string;
  description: string;
  items: any[];
  link: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-1">{description}</p>
        </div>
        <Link
          href={link}
          className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items}
      </div>
    </div>
  );
}

function CalloutSection({ title, description, buttonText, buttonLink, icon: Icon, bgColor }: {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  icon: any;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-lg p-8 text-white`}>
      <div className="flex items-center mb-4">
        <div className="p-3 bg-white/10 rounded-lg">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-white/80 mb-6">{description}</p>
      <Link
        href={buttonLink}
        className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
      >
        {buttonText}
        <ArrowRight className="h-4 w-4 ml-2" />
      </Link>
    </div>
  );
}

export default function Home() {
  // Featured Members
  const featuredMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      title: 'Full Stack Developer',
      company: 'Mountain Tech Solutions',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
    },
    {
      id: 2,
      name: 'Michael Chen',
      title: 'UX Designer',
      company: 'Design Forward',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      title: 'Data Scientist',
      company: 'Data Insights Co',
      image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg'
    }
  ];

  // Featured Companies
  const featuredCompanies = [
    {
      id: 1,
      name: 'Mountain Tech Solutions',
      description: 'Custom software development',
      image: 'https://images.pexels.com/photos/1181373/pexels-photo-1181373.jpeg'
    },
    {
      id: 2,
      name: 'Design Forward',
      description: 'UX design studio',
      image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg'
    },
    {
      id: 3,
      name: 'Data Insights Co',
      description: 'Data analytics solutions',
      image: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg'
    }
  ];

  // Featured Events
  const featuredEvents = [
    {
      id: 1,
      title: 'AI in Healthcare Workshop',
      date: '2025-06-15',
      image: 'https://images.pexels.com/photos/7089629/pexels-photo-7089629.jpeg'
    },
    {
      id: 2,
      title: 'Machine Learning Study Group',
      date: '2025-06-20',
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg'
    },
    {
      id: 3,
      title: 'Tech Startup Meetup',
      date: '2025-06-25',
      image: 'https://images.pexels.com/photos/7367920/pexels-photo-7367920.jpeg'
    }
  ];

  // Featured News
  const featuredNews = [
    {
      id: 1,
      title: 'Kootenay Tech Scene Continues to Grow',
      excerpt: 'The region\'s technology sector is experiencing unprecedented growth.',
      image: 'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg'
    },
    {
      id: 2,
      title: 'Local AI Startup Secures Funding',
      excerpt: 'Nelson-based startup receives major investment for AI development.',
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg'
    },
    {
      id: 3,
      title: 'New Tech Hub Opens Downtown',
      excerpt: 'State-of-the-art facility welcomes tech companies and startups.',
      image: 'https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg'
    }
  ];

  // Active Groups
  const activeGroups = [
    {
      id: 1,
      name: 'AI Enthusiasts Kootenay',
      members: 45,
      lastActive: '2025-03-15',
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg'
    },
    {
      id: 2,
      name: 'Kootenay Tech Organizers',
      members: 12,
      lastActive: '2025-03-14',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg'
    },
    {
      id: 3,
      name: 'Web Dev Meetup',
      members: 28,
      lastActive: '2025-03-13',
      image: 'https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg'
    }
  ];

  return (
    <>
      <Hero />
      
      <div className="bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-16 space-y-16">
          {/* Featured Members */}
          <FeaturedSection
            title="Featured Members"
            description="Meet some of our community's talented tech professionals"
            link="/directory"
            items={featuredMembers.map(member => (
              <Link
                key={member.id}
                href={`/directory/${member.id}`}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{member.name}</h3>
                  <p className="text-orange-500">{member.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{member.company}</p>
                </div>
              </Link>
            ))}
          />

          {/* Featured Companies */}
          <FeaturedSection
            title="Featured Companies"
            description="Discover innovative tech companies in the Kootenays"
            link="/companies"
            items={featuredCompanies.map(company => (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={company.image}
                    alt={company.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{company.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{company.description}</p>
                </div>
              </Link>
            ))}
          />

          {/* Callout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CalloutSection
              title="Volunteer with Us"
              description="Help organize events, mentor others, or contribute to community projects."
              buttonText="Get Involved"
              buttonLink="/opportunities?type=volunteer"
              icon={Heart}
              bgColor="bg-gradient-to-r from-pink-500 to-rose-500"
            />
            <CalloutSection
              title="Find Opportunities"
              description="Discover jobs, funding, and collaboration opportunities in tech."
              buttonText="View Opportunities"
              buttonLink="/opportunities"
              icon={Briefcase}
              bgColor="bg-gradient-to-r from-blue-500 to-cyan-500"
            />
          </div>

          {/* Featured Events */}
          <FeaturedSection
            title="Upcoming Events"
            description="Join us at our next tech community gatherings"
            link="/events"
            items={featuredEvents.map(event => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{event.title}</h3>
                  <p className="text-sm text-orange-500">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </Link>
            ))}
          />

          {/* Active Groups */}
          <FeaturedSection
            title="Active Groups"
            description="Join tech groups and connect with like-minded professionals"
            link="/groups"
            items={activeGroups.map(group => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={group.image}
                    alt={group.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{group.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {group.members} members
                    </span>
                    <span>
                      Active {new Date(group.lastActive).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          />

          {/* Featured News */}
          <FeaturedSection
            title="Latest News"
            description="Stay updated with the latest from our tech community"
            link="/news"
            items={featuredNews.map(article => (
              <Link
                key={article.id}
                href={`/news/${article.id}`}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{article.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{article.excerpt}</p>
                </div>
              </Link>
            ))}
          />

          {/* Newsletter Signup */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-8 text-white">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-6">
                <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto">
                  <Mail className="h-6 w-6" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4">Stay Connected</h2>
              <p className="text-white/80 mb-6">
                Get the latest updates from the Nelson tech community, including events, job opportunities, and news.
              </p>
              <form className="flex gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-white/90 transition-colors font-medium"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}