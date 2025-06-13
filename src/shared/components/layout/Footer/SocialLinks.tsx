import React from 'react';
import { SocialLink } from './types';

interface SocialLinksProps {
  socialLinks: SocialLink[];
}

const SocialLinks: React.FC<SocialLinksProps> = ({ socialLinks }) => {
  return (
    <div className="flex justify-center space-x-4">
      {socialLinks.map((link, index) => (
        <a
          key={index}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          aria-label={`Follow us on ${link.platform}`}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
