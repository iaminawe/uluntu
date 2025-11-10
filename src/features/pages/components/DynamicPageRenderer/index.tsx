import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import { supabase } from '@/lib/supabase';
import {
  Calendar,
  Users,
  Briefcase,
  BookOpen,
  Rocket,
  Target,
  Code,
  Globe,
  Award,
  TrendingUp,
  MessageSquare,
  Mail,
  MapPin,
  Twitter,
  Linkedin,
  Github,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import CarouselHero from '@/components/CarouselHero';

/**
 * DOMPurify configuration for video embed codes.
 * Very restrictive - only allows iframe from trusted video platforms.
 * Blocks all script execution and event handlers.
 */
const VIDEO_EMBED_CONFIG = {
  ALLOWED_TAGS: ['iframe', 'div'],
  ALLOWED_ATTR: [
    'src',
    'title',
    'width',
    'height',
    'frameborder',
    'allowfullscreen',
    'allow',
    'class',
  ],
  ALLOW_DATA_ATTR: false,
  FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  // Only allow iframe sources from trusted video platforms
  ALLOWED_URI_REGEXP: /^(?:https?:)?\/\/(?:www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com|dailymotion\.com|vimeo\.com)\//i,
};

interface PageBlock {
  type: string;
  content: string;
  metadata?: {
    icon?: string;
    link?: string;
    style?: string;
    columns?: number;
  };
}

interface DynamicPageRendererProps {
  blocks: PageBlock[];
  slug: string;
}

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  calendar: <Calendar className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  briefcase: <Briefcase className="h-5 w-5" />,
  bookopen: <BookOpen className="h-5 w-5" />,
  rocket: <Rocket className="h-5 w-5" />,
  target: <Target className="h-5 w-5" />,
  code: <Code className="h-5 w-5" />,
  globe: <Globe className="h-5 w-5" />,
  award: <Award className="h-5 w-5" />,
  trending: <TrendingUp className="h-5 w-5" />,
  message: <MessageSquare className="h-5 w-5" />,
  mail: <Mail className="h-5 w-5" />,
  mappin: <MapPin className="h-5 w-5" />,
  twitter: <Twitter className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  github: <Github className="h-5 w-5" />,
  arrow: <ArrowRight className="h-5 w-5" />,
  check: <CheckCircle className="h-5 w-5" />
};

// Component renderers for special sections
const ComponentRenderers: Record<string, React.FC<any>> = {
  hero: ({ content, metadata }) => (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 text-white rounded-2xl p-12 mb-8">
      <div className="relative z-10">
        <h1 className="text-5xl font-bold mb-4">{content}</h1>
        {metadata?.subtitle && (
          <p className="text-xl opacity-90 mb-6">{metadata.subtitle}</p>
        )}
        {metadata?.cta && (
          <div className="flex gap-4">
            <Button size="lg" variant="white">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="ghost" className="text-white border-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        )}
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
    </div>
  ),

  carousel: ({ content, metadata }) => (
    <div className="mb-8">
      <CarouselHero
        slides={metadata?.slides || []}
        autoPlay={metadata?.autoPlay !== false}
        showDots={metadata?.showDots !== false}
        showArrows={metadata?.showArrows !== false}
        height={metadata?.height || '500px'}
        editable={false}
      />
    </div>
  ),

  image: ({ content, metadata }) => {
    const alignmentClass = {
      left: 'text-left',
      center: 'text-center', 
      right: 'text-right'
    }[metadata?.alignment || 'center'];

    return (
      <div className={`mb-8 ${alignmentClass}`}>
        <div className="inline-block" style={{ width: metadata?.width || '100%' }}>
          <img
            src={metadata?.src || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop'}
            alt={metadata?.alt || content}
            className="w-full h-auto rounded-lg shadow-sm"
          />
          {metadata?.caption !== false && content && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
              {content}
            </p>
          )}
        </div>
      </div>
    );
  },

  video: ({ content, metadata }) => {
    const getVideoEmbed = () => {
      const src = metadata?.src || '';
      
      // YouTube URL
      if (src.includes('youtube.com') || src.includes('youtu.be')) {
        const videoId = src.includes('youtu.be') 
          ? src.split('youtu.be/')[1]?.split('?')[0]
          : src.split('v=')[1]?.split('&')[0];
        
        if (videoId) {
          return (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=${metadata?.autoPlay ? 1 : 0}&controls=${metadata?.controls !== false ? 1 : 0}&mute=${metadata?.muted ? 1 : 0}`}
              title={content}
              className="w-full aspect-video rounded-lg"
              allowFullScreen
            />
          );
        }
      }
      
      // Vimeo URL
      if (src.includes('vimeo.com')) {
        const videoId = src.split('vimeo.com/')[1]?.split('/')[0];
        if (videoId) {
          return (
            <iframe
              src={`https://player.vimeo.com/video/${videoId}?autoplay=${metadata?.autoPlay ? 1 : 0}&controls=${metadata?.controls !== false ? 1 : 0}&muted=${metadata?.muted ? 1 : 0}`}
              title={content}
              className="w-full aspect-video rounded-lg"
              allowFullScreen
            />
          );
        }
      }
      
      // MP4 or direct video file
      if (metadata?.type === 'mp4' || src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.ogg')) {
        return (
          <video
            src={src}
            controls={metadata?.controls !== false}
            autoPlay={metadata?.autoPlay || false}
            muted={metadata?.muted || false}
            className="w-full aspect-video rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        );
      }
      
      // Custom embed code
      if (metadata?.type === 'embed' && src.includes('<')) {
        /**
         * CRITICAL: Sanitize video embed code to prevent XSS attacks.
         * Only allow iframes from trusted video platforms (YouTube, Vimeo, etc.)
         * and block all script execution.
         */
        return (
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(src, VIDEO_EMBED_CONFIG),
            }}
          />
        );
      }
      
      // Fallback
      return (
        <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Invalid video URL or embed code</p>
        </div>
      );
    };

    return (
      <div className="mb-8">
        {content && (
          <h3 className="text-xl font-semibold mb-4">{content}</h3>
        )}
        {getVideoEmbed()}
      </div>
    );
  },

  columns: ({ content, metadata }) => {
    const columnCount = metadata?.columnCount || 2;
    const gap = metadata?.gap || 'medium';
    const gapClass = {
      small: 'gap-4',
      medium: 'gap-6', 
      large: 'gap-8'
    }[gap];

    return (
      <div className="mb-8">
        {content && (
          <h3 className="text-xl font-semibold mb-6">{content}</h3>
        )}
        <div className={`grid grid-cols-1 md:grid-cols-${columnCount} ${gapClass}`}>
          {(metadata?.columns || []).map((column: any, index: number) => (
            <div key={column.id || index} className="space-y-4">
              {(column.blocks || []).map((block: any, blockIndex: number) => (
                <div key={blockIndex}>
                  {/* Recursive block rendering would go here */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Column {index + 1} - Block {blockIndex + 1}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Nested block content coming soon
                    </p>
                  </div>
                </div>
              ))}
              {column.blocks?.length === 0 && (
                <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Empty column - add content in edit mode
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  },

  features: ({ content, metadata }) => {
    const features = [
      { icon: 'briefcase', title: 'Browse Companies', desc: 'Discover local tech companies and opportunities' },
      { icon: 'users', title: 'Connect', desc: 'Network with professionals in your field' },
      { icon: 'bookopen', title: 'Learn', desc: 'Access resources and knowledge sharing' },
      { icon: 'target', title: 'Find Jobs', desc: 'Explore career opportunities in tech' },
      { icon: 'rocket', title: 'Showcase', desc: 'Share your projects and achievements' },
      { icon: 'calendar', title: 'Events', desc: 'Join meetups and workshops' }
    ];

    return (
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">{content}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  {iconMap[feature.icon]}
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  },

  stats: ({ content }) => {
    const stats = [
      { value: '500+', label: 'Community Members' },
      { value: '50+', label: 'Tech Companies' },
      { value: '100+', label: 'Monthly Events' },
      { value: '1000+', label: 'Job Opportunities' }
    ];

    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 mb-12">
        <h2 className="text-3xl font-bold mb-8 text-center">{content}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  },

  events: ({ content }) => {
    const { data: events } = useQuery({
      queryKey: ['upcoming-events'],
      queryFn: async () => {
        const { data } = await supabase
          .from('events')
          .select('*')
          .gte('date', new Date().toISOString())
          .order('date', { ascending: true })
          .limit(3);
        return data || [];
      }
    });

    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">{content}</h2>
          <Link to="/events">
            <Button variant="ghost">
              View All Events <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events?.length ? events.map((event: any) => (
            <Link key={event.id} to={`/events/${event.slug}`} className="block">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{event.description}</p>
              </div>
            </Link>
          )) : (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No upcoming events at the moment
            </div>
          )}
        </div>
      </div>
    );
  },

  companies: ({ content }) => {
    const { data: companies } = useQuery({
      queryKey: ['featured-companies'],
      queryFn: async () => {
        const { data } = await supabase
          .from('companies')
          .select('*')
          .eq('is_verified', true)
          .limit(6);
        return data || [];
      }
    });

    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">{content}</h2>
          <Link to="/companies">
            <Button variant="ghost">
              View All Companies <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {companies?.map((company: any) => (
            <Link key={company.id} to={`/companies/${company.slug}`} className="block">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm hover:shadow-lg transition-shadow text-center">
                {company.logo_url ? (
                  <img src={company.logo_url} alt={company.name} className="h-12 w-auto mx-auto mb-2" />
                ) : (
                  <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-2" />
                )}
                <p className="text-sm font-medium truncate">{company.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  },

  cta: ({ content, metadata }) => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 text-center mb-12">
      <h2 className="text-3xl font-bold mb-4">{content}</h2>
      {metadata?.description && (
        <p className="text-xl opacity-90 mb-6 max-w-2xl mx-auto">{metadata.description}</p>
      )}
      <div className="flex gap-4 justify-center">
        <Link to="/signup">
          <Button size="lg" variant="white">
            Join Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link to="/about">
          <Button size="lg" variant="ghost" className="text-white border-white hover:bg-white/10">
            Learn More
          </Button>
        </Link>
      </div>
    </div>
  ),

  values: ({ content }) => {
    const values = [
      { icon: 'users', title: 'Community First', desc: 'We believe in the power of collaboration' },
      { icon: 'bookopen', title: 'Knowledge Sharing', desc: 'Learning and teaching go hand in hand' },
      { icon: 'trending', title: 'Growth Mindset', desc: 'Always evolving and improving' },
      { icon: 'target', title: 'Inclusivity', desc: 'Tech is for everyone' },
      { icon: 'rocket', title: 'Innovation', desc: 'Embracing new ideas and technologies' }
    ];

    return (
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-8">{content}</h2>
        <div className="space-y-4">
          {values.map((value, index) => (
            <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 mt-1">
                {iconMap[value.icon]}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{value.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },

  contact: ({ content }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 mb-12">
      <h2 className="text-3xl font-bold mb-6">{content}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <a href="mailto:hello@nelson.tech" className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            <Mail className="h-5 w-5" />
            hello@nelson.tech
          </a>
          <a href="https://twitter.com/NelsonTechNZ" className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            <Twitter className="h-5 w-5" />
            @NelsonTechNZ
          </a>
          <a href="https://linkedin.com/company/nelson-tech" className="flex items-center gap-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
            <Linkedin className="h-5 w-5" />
            Nelson Tech Community
          </a>
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <MapPin className="h-5 w-5" />
            Nelson, New Zealand
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Send us a message</h3>
          <form className="space-y-4">
            <input 
              type="email" 
              placeholder="Your email" 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800"
            />
            <textarea 
              placeholder="Your message" 
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800"
            />
            <Button type="submit" variant="primary" className="w-full">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
};

export default function DynamicPageRenderer({ blocks, slug }: DynamicPageRendererProps) {
  // Special rendering for home page - ONLY if no blocks are provided
  if (slug === 'home' && (!blocks || blocks.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto">
        <ComponentRenderers.hero 
          content="Welcome to Nelson Tech Community" 
          metadata={{ 
            subtitle: "Connect with the vibrant tech community in Nelson, New Zealand",
            cta: true 
          }} 
        />
        <ComponentRenderers.features content="Community Features" metadata={{}} />
        <ComponentRenderers.stats content="Our Growing Community" />
        <ComponentRenderers.events content="Upcoming Events" />
        <ComponentRenderers.companies content="Featured Companies" />
        <ComponentRenderers.cta 
          content="Ready to Join?" 
          metadata={{ 
            description: "Whether you're a developer, designer, entrepreneur, or tech enthusiast, there's a place for you in Nelson Tech." 
          }} 
        />
      </div>
    );
  }

  // Special rendering for about page - ONLY if no blocks are provided
  if (slug === 'about' && (!blocks || blocks.length === 0)) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-6">About Nelson Tech Community</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Nelson Tech is a community-driven platform that connects technology professionals, 
            companies, and enthusiasts in the Nelson-Tasman region.
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg">
            To foster innovation, collaboration, and growth in Nelson's technology ecosystem 
            by providing a central hub for networking, knowledge sharing, and professional development.
          </p>
        </div>

        <ComponentRenderers.values content="Our Values" />

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Host regular tech meetups and workshops',
              'Connect local tech professionals and companies',
              'Provide a platform for sharing resources',
              'Support tech education and career development',
              'Promote Nelson as a destination for tech talent',
              'Foster innovation and entrepreneurship'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <ComponentRenderers.cta 
          content="Get Involved" 
          metadata={{ 
            description: "Join us in building Nelson's tech future. Whether you want to attend events, share your expertise, or connect with like-minded professionals, we welcome you." 
          }} 
        />
      </div>
    );
  }

  // Default rendering for other pages
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {blocks.map((block: any, index: number) => {
        const content = typeof block.content === 'string' 
          ? block.content 
          : block.content?.text || '';
        
        // Check if this is a special component
        if (block.type in ComponentRenderers) {
          const Component = ComponentRenderers[block.type];
          return <Component key={index} content={content} metadata={block.metadata} />;
        }
        
        // Enhanced default block rendering with metadata support
        switch (block.type) {
          case 'heading': {
            const level = block.metadata?.level || 'h2';
            const Component = level as keyof JSX.IntrinsicElements;
            const sizeClasses = {
              h1: 'text-4xl font-bold mb-8',
              h2: 'text-3xl font-bold mb-6', 
              h3: 'text-2xl font-bold mb-4',
              h4: 'text-xl font-bold mb-3'
            };
            
            return (
              <Component key={index} className={`${sizeClasses[level as keyof typeof sizeClasses]} text-slate-900 dark:text-slate-100`}>
                {content}
              </Component>
            );
          }
          
          case 'paragraph': {
            const size = block.metadata?.size || 'base';
            const sizeClasses = {
              sm: 'text-sm',
              base: 'text-base',
              lg: 'text-lg',
              xl: 'text-xl'
            };
            
            return (
              <p key={index} className={`${sizeClasses[size as keyof typeof sizeClasses]} mb-6 leading-relaxed text-slate-700 dark:text-slate-300`}>
                {content}
              </p>
            );
          }
          
          case 'bulletList':
            return (
              <ul key={index} className="list-disc list-inside mb-6">
                <li className="text-lg leading-relaxed text-slate-700 dark:text-slate-300">{content}</li>
              </ul>
            );
            
          case 'quote': {
            const style = block.metadata?.style || 'default';
            const styleClasses = {
              default: 'border-l-4 border-blue-500 pl-6 py-4 mb-6 italic text-xl text-gray-700 dark:text-gray-300',
              bordered: 'border border-slate-300 dark:border-slate-600 rounded-lg p-6 mb-6 italic text-xl text-gray-700 dark:text-gray-300 bg-slate-50 dark:bg-slate-800',
              highlighted: 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 pl-6 py-4 mb-6 italic text-xl text-blue-800 dark:text-blue-200',
              minimal: 'pl-6 py-4 mb-6 italic text-xl text-gray-600 dark:text-gray-400'
            };
            
            return (
              <blockquote key={index} className={styleClasses[style as keyof typeof styleClasses]}>
                "{content}"
              </blockquote>
            );
          }
          
          default:
            return <div key={index} className="mb-4">{content}</div>;
        }
      })}
    </div>
  );
}