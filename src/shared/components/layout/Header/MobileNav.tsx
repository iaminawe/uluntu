import React from 'react';
import { NavLinkItem } from './types';
import Dropdown from './Dropdown';

interface MobileNavProps {
  isOpen: boolean;
  navLinks: NavLinkItem[];
  onLinkClick: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ 
  isOpen, 
  navLinks, 
  onLinkClick 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="md:hidden bg-gradient-to-r from-orange-600 to-red-600">
      <div className="px-2 pt-2 pb-3 space-y-1">
        {navLinks.map((link, index) => (
          <Dropdown
            key={index}
            item={link}
            isDesktop={false}
            onLinkClick={onLinkClick}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileNav;
