import React from 'react';
import { Link } from 'react-router-dom';
import { FooterColumn as FooterColumnType } from '@/shared/components/layout/Footer/types';

interface FooterColumnProps {
  column: FooterColumnType;
}

const FooterColumn: React.FC<FooterColumnProps> = ({ column }) => {
  const { title, links } = column;
  
  return (
    <div className="flex flex-col">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link, index) => {
          // Determine if it's an external link or internal route
          const isExternal = link.href.startsWith('http');
          
          return (
            <li key={index}>
              {isExternal ? (
                <a 
                  href={link.href}
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.text}
                </a>
              ) : (
                <Link
                  to={link.href}
                  className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {link.text}
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
