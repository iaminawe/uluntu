import React from 'react';
import { Link } from 'react-router-dom';
import type { FooterColumn as FooterColumnType } from './types';

interface FooterColumnProps {
  column: FooterColumnType;
  showIcons?: boolean;
  className?: string;
}

const FooterColumn: React.FC<FooterColumnProps> = ({ 
  column, 
  showIcons = false, 
  className = '' 
}) => {
  const { title, links, cssClasses } = column;
  
  return (
    <div className={`flex flex-col ${cssClasses || ''} ${className}`}>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link, index) => {
          // Determine if it's an external link or internal route
          const isExternal = link.isExternal || link.href.startsWith('http');
          const target = link.target || (isExternal ? '_blank' : '_self');
          const linkClasses = `text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2 ${link.cssClasses || ''}`;
          
          return (
            <li key={link.href || index}>
              {isExternal ? (
                <a 
                  href={link.href}
                  className={linkClasses}
                  target={target}
                  rel={target === '_blank' ? 'noopener noreferrer' : undefined}
                  aria-label={`${link.text} (opens in new tab)`}
                >
                  {showIcons && link.icon && (
                    <span className="w-4 h-4 flex-shrink-0">
                      {/* Icon would be rendered here based on icon string */}
                      <span className="text-xs">{link.icon}</span>
                    </span>
                  )}
                  <span>{link.text}</span>
                </a>
              ) : (
                <Link
                  to={link.href}
                  className={linkClasses}
                  target={target}
                  aria-label={link.text}
                >
                  {showIcons && link.icon && (
                    <span className="w-4 h-4 flex-shrink-0">
                      {/* Icon would be rendered here based on icon string */}
                      <span className="text-xs">{link.icon}</span>
                    </span>
                  )}
                  <span>{link.text}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FooterColumn;
