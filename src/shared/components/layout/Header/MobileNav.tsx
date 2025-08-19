import React from 'react';
import { NavLinkItem } from './types';
import Dropdown from './Dropdown';
import UserMenu from './UserMenu';

interface MobileNavProps {
  isOpen: boolean;
  navLinks: NavLinkItem[];
  onLinkClick: () => void;
  showLoadingSkeleton?: boolean;
  className?: string;
}

const MobileNav: React.FC<MobileNavProps> = ({ 
  isOpen, 
  navLinks, 
  onLinkClick,
  showLoadingSkeleton = false,
  className = "md:hidden bg-gradient-to-r from-orange-600 to-red-600"
}) => {
  if (!isOpen) return null;
  
  if (showLoadingSkeleton) {
    return (
      <div className={className}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-4 w-24 bg-white/20 rounded animate-pulse mb-2" />
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="px-2 pt-2 pb-3 space-y-1">
        {navLinks.map((link, index) => (
          <Dropdown
            key={link.href || index}
            item={link}
            isDesktop={false}
            onLinkClick={onLinkClick}
          />
        ))}
        {/* User Menu for Mobile */}
        <div className="pt-2 border-t border-orange-500/30">
          <UserMenu />
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
