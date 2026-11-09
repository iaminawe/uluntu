import React from 'react';
import { FooterProps } from './types';
import FooterColumn from './FooterColumn';
import SocialLinks from './SocialLinks';
import DynamicFooterMenu from './DynamicFooterMenu';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';
import { useEnabledFeatures } from '@/hooks/useSettings';
import { useFooterNavigation } from '@/hooks/useNavigation';

const Footer: React.FC<FooterProps> = ({
  columns,
  socialLinks,
  copyrightText,
  enableDynamicMenu = true,
  fallbackColumns,
  maxColumns = 4,
  showSocialLinks = true,
  showCopyright = true
}) => {
  const { isFeatureEnabled } = useEnabledFeatures();
  
  // Get footer navigation from NavigationProvider
  const { 
    navLinks: footerNavLinks, 
    loading: footerLoading, 
    error: footerError,
    isDynamic 
  } = useFooterNavigation();
  
  // Check if dynamic footer menus are enabled via feature flag
  const isDynamicMenuEnabled = enableDynamicMenu && (isDynamic || isFeatureEnabled('dynamic_footer_menus'));
  
  // Feature mapping for footer links
  const linkFeatureMap: Record<string, string> = {
    '/marketplace': 'marketplace',
    '/opportunities': 'opportunities_board',
    '/directory': 'members_directory',
    '/companies': 'companies_listing',
    '/groups': 'groups_communities',
    '/events': 'events_system',
    '/news': 'news_blog',
    '/resources': 'resources_library',
    '/galleries': 'photo_galleries'
  };

  // Filter columns by feature flags
  const filterColumnsByFeatures = (cols: typeof fallbackColumns) => {
    if (!cols) return [];
    return cols.map(column => ({
      ...column,
      links: column.links.filter(link => {
        const feature = linkFeatureMap[link.href];
        return !feature || isFeatureEnabled(feature);
      })
    })).filter(column => column.links.length > 0); // Remove empty columns
  };

  // Default fallback columns if none provided
  const defaultFallbackColumns = filterColumnsByFeatures(fallbackColumns || [
    {
      id: 'community-fallback',
      title: 'Community',
      links: [
        { text: 'Directory', href: '/directory' },
        { text: 'Companies', href: '/companies' },
        { text: 'Groups', href: '/groups' },
        { text: 'Events', href: '/events' }
      ]
    },
    {
      id: 'resources-fallback',
      title: 'Resources',
      links: [
        { text: 'News', href: '/news' },
        { text: 'Resources', href: '/resources' },
        { text: 'Galleries', href: '/galleries' },
        { text: 'Topics', href: '/topics' }
      ]
    },
    {
      id: 'business-fallback',
      title: 'Business',
      links: [
        { text: 'Marketplace', href: '/marketplace' },
        { text: 'Opportunities', href: '/opportunities' }
      ]
    },
    {
      id: 'company-fallback',
      title: 'Company',
      links: [
        { text: 'About Us', href: '/about' },
        { text: 'Contact', href: '/contact' },
        { text: 'Privacy', href: '/privacy' },
        { text: 'Terms', href: '/terms' }
      ]
    }
  ]);

  // Default social links if none provided and social links are enabled
  const defaultSocialLinks = socialLinks || [
    {
      platform: 'GitHub',
      href: 'https://github.com/iaminawe/uluntu',
      icon: <Github className="h-5 w-5" />,
      ariaLabel: 'Follow us on GitHub'
    },
    {
      platform: 'LinkedIn', 
      href: 'https://linkedin.com/company/kootenay-tech-community',
      icon: <Linkedin className="h-5 w-5" />,
      ariaLabel: 'Follow us on LinkedIn'
    },
    {
      platform: 'Twitter',
      href: 'https://twitter.com/kootenaytechcom',
      icon: <Twitter className="h-5 w-5" />,
      ariaLabel: 'Follow us on Twitter'
    },
    {
      platform: 'Email',
      href: 'mailto:info@uluntu.io',
      icon: <Mail className="h-5 w-5" />,
      ariaLabel: 'Email us'
    }
  ];

  // Default copyright text if none provided
  const defaultCopyrightText = copyrightText || 
    `© ${new Date().getFullYear()} Uluntu. All rights reserved.`;

  // Handle error from dynamic footer menu
  const handleMenuError = (error: string) => {
    console.warn('Dynamic footer menu error:', error);
    // Could integrate with error reporting service here
  };

  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dynamic or Static Footer Menu */}
        <div className="mb-8">
          {isDynamicMenuEnabled ? (
            <DynamicFooterMenu
              enableDynamicMenu={true}
              fallbackColumns={columns || defaultFallbackColumns}
              featureFlagKey="dynamic_footer_menus"
              maxColumns={maxColumns}
              columnLayout="auto"
              className=""
              onError={handleMenuError}
              config={{
                groupingStrategy: 'by-category',
                maxItemsPerColumn: 6,
                showIcons: false,
                showDescriptions: false,
                preserveHierarchy: true
              }}
            />
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(maxColumns, 4)} gap-8`}>
              {filterColumnsByFeatures(columns || defaultFallbackColumns).map((column, index) => (
                <FooterColumn
                  key={column.id || index}
                  column={column}
                  showIcons={false}
                />
              ))}
            </div>
          )}
          
          {/* Social Links Section */}
          {showSocialLinks && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 text-center md:text-left">
                    Follow Us
                  </h3>
                  <SocialLinks socialLinks={defaultSocialLinks} />
                </div>
                
                {/* Newsletter Signup - if feature is enabled */}
                {isFeatureEnabled('newsletter_signup') && (
                  <div className="flex flex-col items-center md:items-end">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Stay Updated
                    </h3>
                    <div className="flex gap-2">
                      <input 
                        type="email" 
                        placeholder="Enter your email"
                        className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Email address for newsletter"
                      />
                      <button 
                        type="submit"
                        className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        aria-label="Subscribe to newsletter"
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Copyright Section */}
        {showCopyright && (
          <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
            <div className="text-center text-slate-600 dark:text-slate-400">
              <p className="text-sm">{defaultCopyrightText}</p>
              {/* Additional legal links */}
              <div className="mt-2 flex justify-center space-x-4 text-xs">
                <a 
                  href="/privacy" 
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </a>
                <a 
                  href="/terms" 
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
