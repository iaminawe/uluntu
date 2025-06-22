import React from 'react';
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

// Import visual components
import { 
  DynamicHero, 
  ImageCard, 
  GlassCard, 
  FeatureCard,
  ImageSection,
  ImageGallery
} from '@/shared/components/visual';

// Example implementation of visual home page
const VisualHomePage: React.FC = () => {
  // Hero images configuration
  const heroImages = [
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
  ];

  // Feature cards configuration
  const features = [
    {
      icon: Users,
      title: "Member Directory",
      description: "Connect with over 500 tech professionals in the Kootenay region",
      link: "/directory",
      color: "blue"
    },
    {
      icon: Calendar,
      title: "Tech Events",
      description: "Join workshops, meetups, and conferences happening locally",
      link: "/events",
      color: "orange"
    },
    {
      icon: Briefcase,
      title: "Job Board",
      description: "Find your next opportunity with local tech companies",
      link: "/opportunities",
      color: "emerald"
    },
    {
      icon: Building,
      title: "Companies",
      description: "Explore innovative tech companies in our region",
      link: "/companies",
      color: "purple"
    }
  ];

  // Event cards data
  const upcomingEvents = [
    {
      image: { 
        src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop",
        alt: "Tech conference"
      },
      title: "Nelson Tech Summit 2024",
      description: "Annual gathering of tech leaders and innovators",
      badge: "Featured",
      meta: [
        { text: "March 15, 2024" },
        { text: "Prestige Lakeside Resort" }
      ],
      link: "/events/tech-summit-2024"
    },
    {
      image: { 
        src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop",
        alt: "Workshop session"
      },
      title: "AI & Machine Learning Workshop",
      description: "Hands-on workshop for ML enthusiasts",
      badge: "Workshop",
      badgeColor: "bg-blue-500",
      meta: [
        { text: "March 22, 2024" },
        { text: "Online Event" }
      ],
      link: "/events/ml-workshop"
    },
    {
      image: { 
        src: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop",
        alt: "Networking event"
      },
      title: "Tech Professionals Meetup",
      description: "Monthly networking for tech community",
      badge: "Meetup",
      badgeColor: "bg-emerald-500",
      meta: [
        { text: "March 28, 2024" },
        { text: "Backroads Brewing" }
      ],
      link: "/events/march-meetup"
    }
  ];

  // Gallery items
  const communityGallery = [
    {
      id: "1",
      image: { 
        src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
        alt: "Team collaboration"
      },
      title: "Innovation Lab Opening",
      category: "community"
    },
    {
      id: "2",
      image: { 
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
        alt: "Developer at work"
      },
      title: "Code & Coffee Sessions",
      category: "meetups"
    },
    {
      id: "3",
      image: { 
        src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&h=600&fit=crop",
        alt: "Tech presentation"
      },
      title: "Startup Pitch Night",
      category: "events"
    },
    {
      id: "4",
      image: { 
        src: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop",
        alt: "Hackathon team"
      },
      title: "24hr Hackathon",
      category: "events"
    },
    {
      id: "5",
      image: { 
        src: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=600&fit=crop",
        alt: "Workshop training"
      },
      title: "React Training Workshop",
      category: "education"
    },
    {
      id: "6",
      image: { 
        src: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=800&h=600&fit=crop",
        alt: "Remote work setup"
      },
      title: "Remote Work Resources",
      category: "resources"
    }
  ];

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
          { label: "Join the Community", href: "/signup", variant: "primary" },
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

      {/* Upcoming Events with Image Cards */}
      <ImageSection
        title="Upcoming Events"
        subtitle="Don't Miss Out"
        description="Join the most exciting tech events happening in the Kootenays"
        background={{
          src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=2400&h=800&fit=crop",
          alt: "Event background"
        }}
        theme="dark"
        padding="xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {upcomingEvents.map((event, index) => (
            <ImageCard
              key={index}
              {...event}
              variant="glass"
              hoverable
              animated
            />
          ))}
        </div>
      </ImageSection>

      {/* Community Gallery */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Community Moments
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              Capturing the spirit of innovation in the Kootenays
            </p>
          </div>
          
          <ImageGallery
            items={communityGallery}
            columns={3}
            gap="md"
            variant="grid"
            animated
          />
        </div>
      </section>

      {/* Stats Section with Glass Cards */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <GlassCard blur="lg" gradient>
              <div className="p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">500+</div>
                <div className="text-white/80">Active Members</div>
              </div>
            </GlassCard>
            
            <GlassCard blur="lg" gradient>
              <div className="p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">50+</div>
                <div className="text-white/80">Tech Companies</div>
              </div>
            </GlassCard>
            
            <GlassCard blur="lg" gradient>
              <div className="p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">100+</div>
                <div className="text-white/80">Events Yearly</div>
              </div>
            </GlassCard>
            
            <GlassCard blur="lg" gradient>
              <div className="p-8 text-center">
                <div className="text-5xl font-bold text-white mb-2">25+</div>
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
            href="/signup"
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
};

export default VisualHomePage;