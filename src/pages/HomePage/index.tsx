import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Calendar, 
  Users, 
  Briefcase, 
  ShoppingBag, 
  Newspaper, 
  Building,
  Heart,
  BookOpen
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchMembers } from '@/features/directory/store/membersSlice';
import { fetchCompanies } from '@/features/companies/store/companiesSlice';
import { fetchEvents } from '@/features/events/store/eventsSlice';
import { fetchNewsArticles } from '@/features/news/store/newsSlice';
import { fetchGroups } from '@/features/groups/store/groupsSlice';
import { fetchGalleries } from '@/features/gallery/store/gallerySlice';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { SkeletonGrid } from '@/shared/components/ui/Skeleton';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';

// Import visual components
import { 
  DynamicHero, 
  ImageCard, 
  GlassCard, 
  FeatureCard,
  ImageSection,
  ImageGallery,
  DetailedCard
} from '@/shared/components/visual';

import { FeaturedItems } from './FeaturedItems';
import { Member, Company, Event, Group, NewsArticle } from './types';

// Import the source types
import { Member as ApiMember } from '@/hooks/useMemberQueries';
import { Company as ApiCompany } from '../../types';
import { Event as ApiEvent } from '../../types';
import { Group as ApiGroup } from '../../types';
import { NewsArticle as ApiNewsArticle } from '../../types';

// Type guard to ensure a value is a string
function ensureString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

// Adapter functions to convert application types to HomePage types
function adaptMembersForHomePage(members: ApiMember[]): Member[] {
  return members.map(member => {
    const adaptedMember: Member = {
      id: member.id,
      name: member.name,
      title: ensureString(member.role || member.title || ''),
      company: typeof member.company === 'string' ? member.company : undefined,
      location: typeof member.location === 'string' ? member.location : undefined,
      image: member.image || '',
      bio: typeof member.bio === 'string' ? member.bio : undefined,
      skills: Array.isArray(member.skills) ? member.skills : [],
      joinDate: typeof member.joinDate === 'string' ? member.joinDate : 
                typeof member.created_at === 'string' ? member.created_at : 
                new Date().toISOString(),
      featured: member.featured === true,
      social: member.social || {}
    };
    return adaptedMember;
  });
}

function adaptCompaniesForHomePage(companies: ApiCompany[]): Company[] {
  return companies.map(company => {
    const adaptedCompany: Company = {
      id: company.id,
      name: company.name,
      description: company.description,
      logo: company.logo,
      coverImage: company.coverImage,
      industry: company.industry,
      size: company.size,
      founded: company.founded,
      location: company.location,
      featured: company.featured === true,
      website: company.website,
      social: company.social,
      employees: company.employees
    };
    return adaptedCompany;
  });
}

function adaptEventsForHomePage(events: ApiEvent[]): Event[] {
  return events.map(event => {
    const adaptedEvent: Event = {
      id: event.id,
      title: event.title,
      date: event.date,
      endDate: event.endDate,
      location: event.location,
      description: event.description,
      image: event.image,
      organizer: {
        id: event.organizer?.id || '',
        name: event.organizer?.name || '',
        image: event.organizer?.image || ''
      },
      attendees: event.attendees,
      type: event.type as 'in-person' | 'online' | 'hybrid',
      featured: event.featured === true,
      url: event.url
    };
    return adaptedEvent;
  });
}

function adaptGroupsForHomePage(groups: ApiGroup[]): Group[] {
  return groups.map(group => {
    // We need to adapt any nested events to HomePage Event type
    const adaptedEvents = group.events ? adaptEventsForHomePage(group.events) : undefined;
    
    const adaptedGroup: Group = {
      id: group.id,
      name: group.name,
      description: group.description,
      longDescription: group.longDescription,
      heroImage: group.heroImage,
      coverImage: group.coverImage,
      visibility: group.visibility,
      memberCount: group.memberCount,
      eventCount: group.eventCount,
      resourceCount: group.resourceCount,
      postCount: group.postCount,
      lastActive: group.lastActive,
      featured: group.featured === true,
      members: group.members,
      events: adaptedEvents,
      resources: group.resources,
      posts: group.posts
    };
    return adaptedGroup;
  });
}

function adaptNewsForHomePage(news: ApiNewsArticle[]): NewsArticle[] {
  return news.map(article => {
    const adaptedArticle: NewsArticle = {
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      date: article.date,
      image: article.image,
      featured: article.featured === true,
      author: article.author,
      tags: article.tags || [],
      slug: article.slug || '',
      hero_image_alt: article.hero_image_alt
    };
    return adaptedArticle;
  });
}

export default function HomePage() {
  const dispatch = useAppDispatch();
  
  // Get data from Redux store
  const apiMembers = useAppSelector(state => state.members?.members || []);
  const apiCompanies = useAppSelector(state => state.companies?.companies || []);
  const apiEvents = useAppSelector(state => state.events?.events || []);
  const apiNews = useAppSelector(state => state.news?.articles || []);
  const apiGroups = useAppSelector(state => state.groups?.groups || []);
  const apiGalleries = useAppSelector(state => state.gallery?.galleries || []);
  
  // Get loading and error states
  const membersStatus = useAppSelector(state => state.members?.status);
  const companiesStatus = useAppSelector(state => state.companies?.status);
  const eventsStatus = useAppSelector(state => state.events?.status);
  const newsStatus = useAppSelector(state => state.news?.status);
  const groupsStatus = useAppSelector(state => state.groups?.status);
  const galleriesStatus = useAppSelector(state => state.gallery?.status);
  
  // Determine if any data is still loading
  const isLoading = 
    membersStatus === 'loading' || 
    companiesStatus === 'loading' || 
    eventsStatus === 'loading' || 
    newsStatus === 'loading' || 
    groupsStatus === 'loading' ||
    galleriesStatus === 'loading';
  
  // Get the first error encountered, if any
  const error = 
    membersStatus === 'failed' ? 'Failed to load members' :
    companiesStatus === 'failed' ? 'Failed to load companies' :
    eventsStatus === 'failed' ? 'Failed to load events' :
    newsStatus === 'failed' ? 'Failed to load news' :
    groupsStatus === 'failed' ? 'Failed to load groups' :
    galleriesStatus === 'failed' ? 'Failed to load galleries' : null;
  
  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchMembers());
    dispatch(fetchCompanies());
    dispatch(fetchEvents());
    dispatch(fetchNewsArticles());
    dispatch(fetchGroups());
    dispatch(fetchGalleries());
  }, [dispatch]);

  // Convert API data to HomePage types
  const members = adaptMembersForHomePage(apiMembers);
  const companies = adaptCompaniesForHomePage(apiCompanies);
  const events = adaptEventsForHomePage(apiEvents);
  const groups = adaptGroupsForHomePage(apiGroups);
  const news = adaptNewsForHomePage(apiNews);
  
  // Get featured items
  const { 
    featuredCompanies, 
    featuredEvents, 
    activeGroups, 
    latestNews 
  } = FeaturedItems({ 
    members, 
    companies, 
    events, 
    groups, 
    news 
  });

  // Hero images configuration
  const heroImages = useMemo(() => [
    {
      src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=2400&h=1600&fit=crop",
      alt: "Tech professionals working with mountain view"
    },
    {
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=2400&h=1600&fit=crop",
      alt: "Collaborative tech workspace"
    },
    {
      src: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=2400&h=1600&fit=crop",
      alt: "Tech meetup event"
    }
  ], []);

  // Feature cards configuration with dynamic stats
  const features = useMemo(() => [
    {
      icon: Users,
      title: "Member Directory",
      description: `Connect with ${members.length}+ tech professionals in the Kootenay region`,
      link: "/directory",
      color: "blue" as const
    },
    {
      icon: Calendar,
      title: "Tech Events",
      description: `Join ${events.length}+ workshops, meetups, and conferences happening locally`,
      link: "/events",
      color: "orange" as const
    },
    {
      icon: Briefcase,
      title: "Job Board",
      description: "Find your next opportunity with local tech companies",
      link: "/opportunities",
      color: "emerald" as const
    },
    {
      icon: Building,
      title: "Companies",
      description: `Explore ${companies.length}+ innovative tech companies in our region`,
      link: "/companies",
      color: "purple" as const
    }
  ], [members.length, events.length, companies.length]);

  // Get upcoming events sorted by date
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => new Date(event.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6); // Get 6 upcoming events
  }, [events]);

  // Community moments content (news, blogs, galleries)
  const communityMoments = useMemo(() => {
    // Get latest news articles (including blogs)
    const newsItems = news.slice(0, 4).map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      image: article.image,
      date: article.date,
      author: article.author,
      category: article.tags?.includes('blog') ? 'Blog' : 'News',
      readTime: '5 min read', // You could calculate this from content
      link: `/news/${article.slug || article.id}`,
      type: 'news' as const
    }));
    
    // Get featured galleries  
    const galleryItems = apiGalleries
      .filter(gallery => gallery.privacy === 'public' && gallery.photos?.length > 0)
      .slice(0, 2)
      .map(gallery => ({
        id: gallery.id,
        title: gallery.title,
        excerpt: gallery.description || 'A collection of photos from our community',
        image: gallery.photos?.[0]?.url || gallery.coverImage,
        date: gallery.created_at,
        author: gallery.owner ? {
          id: gallery.owner.id,
          name: gallery.owner.name,
          image: gallery.owner.image
        } : {
          id: '1',
          name: 'Community',
          image: ''
        },
        category: 'Gallery',
        readTime: `${gallery.photos?.length || 0} photos`,
        link: `/galleries/${gallery.id}`,
        type: 'gallery' as const
      }));
    
    // Combine and sort by date
    return [...newsItems, ...galleryItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6); // Show 6 items total
  }, [news, apiGalleries]);

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Nelson Tech Community - Connecting Kootenay Tech Professionals</title>
          <meta name="description" content="Join the thriving tech community in Nelson and the Kootenays. Connect with professionals, discover events, and explore opportunities." />
        </Helmet>
        
        <DynamicHero
          title="Nelson Tech Community"
          subtitle="Kootenay Innovation Hub"
          description="Connecting tech professionals in the heart of British Columbia's mountain paradise"
          images={heroImages}
          height="large"
          actions={[
            { label: "Join the Community", href: "/directory", variant: "primary" },
            { label: "Explore Events", href: "/events", variant: "secondary" }
          ]}
        />
        
        <div className="bg-slate-50 dark:bg-slate-900 py-20">
          <ContentContainer>
            <SkeletonGrid count={4} columns={{ sm: 1, md: 2, lg: 4 }} />
          </ContentContainer>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Nelson Tech Community - Connecting Kootenay Tech Professionals</title>
          <meta name="description" content="Join the thriving tech community in Nelson and the Kootenays. Connect with professionals, discover events, and explore opportunities." />
        </Helmet>
        
        <DynamicHero
          title="Nelson Tech Community"
          subtitle="Kootenay Innovation Hub"
          description="Connecting tech professionals in the heart of British Columbia's mountain paradise"
          images={heroImages}
          height="large"
          actions={[
            { label: "Join the Community", href: "/directory", variant: "primary" },
            { label: "Explore Events", href: "/events", variant: "secondary" }
          ]}
        />
        
        <div className="bg-slate-50 dark:bg-slate-900 py-20">
          <ContentContainer>
            <QueryError 
              error={error} 
              retry={() => {
                dispatch(fetchMembers());
                dispatch(fetchCompanies());
                dispatch(fetchEvents());
                dispatch(fetchNewsArticles());
                dispatch(fetchGroups());
                dispatch(fetchGalleries());
              }} 
              message="We couldn't load the community data. Please try again."
            />
          </ContentContainer>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Nelson Tech Community - Connecting Kootenay Tech Professionals</title>
        <meta name="description" content="Join the thriving tech community in Nelson and the Kootenays. Connect with professionals, discover events, and explore opportunities." />
      </Helmet>

      {/* Dynamic Hero Section */}
      <DynamicHero
        title="Nelson Tech Community"
        subtitle="Kootenay Innovation Hub"
        description="Connecting tech professionals in the heart of British Columbia's mountain paradise"
        images={heroImages}
        height="large"
        actions={[
          { label: "Join the Community", href: "/directory", variant: "primary" },
          { label: "Explore Events", href: "/events", variant: "secondary" }
        ]}
      />

      {/* Feature Cards Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Your gateway to the Kootenay tech ecosystem
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                {...feature}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Upcoming Events
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Join the most exciting tech events happening in the Kootenays
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <DetailedCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  excerpt={event.description}
                  image={event.image}
                  date={event.date}
                  category={event.type === 'online' ? 'Online' : event.type === 'hybrid' ? 'Hybrid' : 'In-Person'}
                  link={`/events/${event.id}`}
                  linkText="View Event"
                  author={{
                    name: event.organizer.name,
                    image: event.organizer.image
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Community Moments Section */}
      {communityMoments.length > 0 && (
        <section className="py-20 bg-white dark:bg-slate-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Community Moments
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Latest news, blogs, and galleries from our community
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communityMoments.map((item) => (
                <DetailedCard
                  key={`${item.type}-${item.id}`}
                  id={item.id}
                  title={item.title}
                  excerpt={item.excerpt}
                  image={item.image}
                  date={item.date}
                  author={item.author}
                  category={item.category}
                  readTime={item.readTime}
                  link={item.link}
                  linkText={item.type === 'gallery' ? 'View Gallery' : 'Read More'}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section with Glass Cards */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GlassCard blur="lg" gradient>
              <div className="p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">{members.length}+</div>
                <div className="text-white/80">Active Members</div>
              </div>
            </GlassCard>
            
            <GlassCard blur="lg" gradient>
              <div className="p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">{companies.length}+</div>
                <div className="text-white/80">Tech Companies</div>
              </div>
            </GlassCard>
            
            <GlassCard blur="lg" gradient>
              <div className="p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">{events.length}+</div>
                <div className="text-white/80">Events</div>
              </div>
            </GlassCard>
            
            <GlassCard blur="lg" gradient>
              <div className="p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">{groups.length}+</div>
                <div className="text-white/80">Active Groups</div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <ImageSection
        title="Ready to Join?"
        description="Become part of the Kootenay's fastest growing tech community"
        background={{
          src: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=2400&h=800&fit=crop",
          alt: "Join us background"
        }}
        overlay={{
          gradient: {
            colors: ['from-slate-900/90', 'to-slate-900/60'],
            direction: 'to-top'
          }
        }}
        theme="dark"
        padding="xl"
        align="center"
      >
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <a
            href="/directory"
            className="px-8 py-4 bg-orange-500 text-white rounded-lg font-semibold text-lg hover:bg-orange-600 transform hover:scale-105 transition-all duration-300 shadow-xl"
          >
            Get Started Today
          </a>
          <a
            href="/about"
            className="px-8 py-4 bg-white/10 text-white backdrop-blur-sm border border-white/20 rounded-lg font-semibold text-lg hover:bg-white/20 transition-all duration-300"
          >
            Learn More
          </a>
        </div>
      </ImageSection>
    </>
  );
}