import React from 'react';
import { Link } from 'react-router-dom';
import { NavLinkItem } from '@/shared/components/layout/Header/types';

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
          <Link
            key={index}
            to={link.href}
            className="block px-3 py-2 text-white hover:bg-orange-700 rounded-md"
            onClick={onLinkClick}
          >
            {link.text}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;
