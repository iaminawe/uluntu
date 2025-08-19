import React from 'react';
import { SocialLink } from './types';
import FooterFeatureGate from './FooterFeatureGate';

interface SocialLinksProps {
  socialLinks: SocialLink[];
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical' | 'grid';
  showLabels?: boolean;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ 
  socialLinks, 
  className = '',
  iconSize = 'md',
  layout = 'horizontal',
  showLabels = false
}) => {
  const getIconSizeClass = () => {
    switch (iconSize) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-6 h-6';
      case 'md':
      default: return 'w-5 h-5';
    }
  };

  const getLayoutClass = () => {
    switch (layout) {
      case 'vertical': return 'flex flex-col space-y-2';
      case 'grid': return 'grid grid-cols-2 gap-2';
      case 'horizontal':
      default: return 'flex justify-center space-x-4';
    }
  };

  const getLinkClass = () => {
    const baseClass = 'text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors';
    const layoutSpecific = showLabels ? 'flex items-center gap-2' : '';
    return `${baseClass} ${layoutSpecific}`;
  };

  return (
    <FooterFeatureGate featureKey="footer_social_links">
      <div className={`${getLayoutClass()} ${className}`}>
        {socialLinks.map((link, index) => (
          <a
            key={link.platform || index}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={getLinkClass()}
            aria-label={link.ariaLabel || `Follow us on ${link.platform}`}
            title={`Follow us on ${link.platform}`}
          >
            <span className={getIconSizeClass()}>
              {link.icon}
            </span>
            {showLabels && (
              <span className="text-sm">{link.platform}</span>
            )}
          </a>
        ))}
      </div>
    </FooterFeatureGate>
  );
};

export default SocialLinks;
