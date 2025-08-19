import React from 'react';
import Footer from './index';
import { FooterMenuProvider } from './FooterMenuProvider';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

/**
 * Complete example of the dynamic footer system
 * Demonstrates all features including dynamic menus, feature flags, and permissions
 */
export const FooterExample: React.FC = () => {
  // Example custom social links
  const customSocialLinks = [
    {
      platform: 'GitHub',
      href: 'https://github.com/kootenaytechcommunity',
      icon: <Github className="w-5 h-5" />,
      ariaLabel: 'Follow us on GitHub'
    },
    {
      platform: 'LinkedIn',
      href: 'https://linkedin.com/company/kootenay-tech-community',
      icon: <Linkedin className="w-5 h-5" />,
      ariaLabel: 'Connect with us on LinkedIn'
    },
    {
      platform: 'Twitter',
      href: 'https://twitter.com/kootenaytechcom',
      icon: <Twitter className="w-5 h-5" />,
      ariaLabel: 'Follow us on Twitter'
    },
    {
      platform: 'Email',
      href: 'mailto:info@kootenaytechcommunity.com',
      icon: <Mail className="w-5 h-5" />,
      ariaLabel: 'Send us an email'
    }
  ];

  // Example fallback columns for when dynamic menu fails or is disabled
  const fallbackColumns = [
    {
      id: 'community',
      title: 'Community',
      links: [
        { text: 'Member Directory', href: '/directory' },
        { text: 'Local Companies', href: '/companies' },
        { text: 'Interest Groups', href: '/groups' },
        { text: 'Tech Events', href: '/events' }
      ]
    },
    {
      id: 'resources',
      title: 'Resources',
      links: [
        { text: 'Tech News', href: '/news' },
        { text: 'Learning Resources', href: '/resources' },
        { text: 'Photo Galleries', href: '/galleries' },
        { text: 'Topic Discussions', href: '/topics' }
      ]
    },
    {
      id: 'opportunities',
      title: 'Opportunities',
      links: [
        { text: 'Job Board', href: '/opportunities' },
        { text: 'Marketplace', href: '/marketplace' },
        { text: 'Volunteer Roles', href: '/volunteer' }
      ]
    },
    {
      id: 'about',
      title: 'About',
      links: [
        { text: 'Our Mission', href: '/about' },
        { text: 'About Uluntu', href: '/about-uluntu' },
        { text: 'Contact Us', href: '/contact' },
        { text: 'Privacy Policy', href: '/privacy' },
        { text: 'Terms of Service', href: '/terms' }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content area */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            Dynamic Footer System Example
          </h1>
          
          <div className="space-y-6">
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Features Demonstrated</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-green-600">✓ Dynamic Menu Integration</h3>
                  <p className="text-sm text-gray-600">Loads menu items from database</p>
                </div>
                <div>
                  <h3 className="font-medium text-green-600">✓ Multi-Column Layout</h3>
                  <p className="text-sm text-gray-600">Responsive grid with smart grouping</p>
                </div>
                <div>
                  <h3 className="font-medium text-green-600">✓ Feature Flag Support</h3>
                  <p className="text-sm text-gray-600">Toggle features dynamically</p>
                </div>
                <div>
                  <h3 className="font-medium text-green-600">✓ Permission-Based Filtering</h3>
                  <p className="text-sm text-gray-600">Role-based menu visibility</p>
                </div>
                <div>
                  <h3 className="font-medium text-green-600">✓ Loading States</h3>
                  <p className="text-sm text-gray-600">Skeleton loaders and fallbacks</p>
                </div>
                <div>
                  <h3 className="font-medium text-green-600">✓ SEO Optimized</h3>
                  <p className="text-sm text-gray-600">Semantic HTML structure</p>
                </div>
              </div>
            </section>

            <section className="bg-blue-50 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Configuration Options</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Dynamic Menu:</span>
                  <span className="text-green-600">✓ Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Max Columns:</span>
                  <span>4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Grouping Strategy:</span>
                  <span>By Category</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Social Links:</span>
                  <span className="text-green-600">✓ Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Newsletter Signup:</span>
                  <span className="text-blue-600">Feature Flag Dependent</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Dynamic Footer with Menu Provider */}
      <FooterMenuProvider userRoles={['user']}>
        <Footer
          enableDynamicMenu={true}
          fallbackColumns={fallbackColumns}
          socialLinks={customSocialLinks}
          maxColumns={4}
          showSocialLinks={true}
          showCopyright={true}
          copyrightText="© 2024 Kootenay Tech Community. Empowering innovation in the Kootenays."
        />
      </FooterMenuProvider>
    </div>
  );
};

export default FooterExample;