import React from 'react';
import { FooterProps } from '@/shared/components/layout/Footer/types';
import FooterColumn from '@/shared/components/layout/Footer/FooterColumn';
import SocialLinks from '@/shared/components/layout/Footer/SocialLinks';
import { Github, Linkedin, Twitter } from 'lucide-react';

const Footer: React.FC<FooterProps> = ({
  columns,
  socialLinks,
  copyrightText
}) => {
  // Default footer columns if none provided
  const defaultColumns = columns || [
    {
      title: 'Community',
      links: [
        { text: 'Directory', href: '/directory' },
        { text: 'Companies', href: '/companies' },
        { text: 'Groups', href: '/groups' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { text: 'Events', href: '/events' },
        { text: 'News', href: '/news' },
        { text: 'Resources', href: '/resources' }
      ]
    },
    {
      title: 'Marketplace',
      links: [
        { text: 'Marketplace', href: '/marketplace' },
        { text: 'Opportunities', href: '/opportunities' }
      ]
    }
  ];

  // Default social links if none provided
  const defaultSocialLinks = socialLinks || [
    {
      platform: 'GitHub',
      href: 'https://github.com',
      icon: <Github className="h-5 w-5" />
    },
    {
      platform: 'LinkedIn',
      href: 'https://linkedin.com',
      icon: <Linkedin className="h-5 w-5" />
    },
    {
      platform: 'Twitter',
      href: 'https://twitter.com',
      icon: <Twitter className="h-5 w-5" />
    }
  ];

  // Default copyright text if none provided
  const defaultCopyrightText = copyrightText || 
    `© ${new Date().getFullYear()} Kootenay Tech Community. All rights reserved.`;

  return (
    <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {defaultColumns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {defaultColumns.map((column, index) => (
              <FooterColumn key={index} column={column} />
            ))}
            
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Follow Us
              </h3>
              <SocialLinks socialLinks={defaultSocialLinks} />
            </div>
          </div>
        )}
        
        <div className="border-t border-slate-200 dark:border-slate-700 pt-8">
          <div className="text-center text-slate-600 dark:text-slate-400">
            <p>{defaultCopyrightText}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
