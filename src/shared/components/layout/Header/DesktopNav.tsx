import React from 'react';
import { NavLinkItem } from './types';
import ThemeToggle from './ThemeToggle';
import Dropdown from './Dropdown';

interface DesktopNavProps {
  navLinks: NavLinkItem[];
  isDark: boolean;
  toggleDarkMode: () => void;
}

const DesktopNav: React.FC<DesktopNavProps> = ({ 
  navLinks, 
  isDark, 
  toggleDarkMode 
}) => {
  return (
    <nav className="hidden md:flex items-center space-x-6">
      {navLinks.map((link, index) => (
        <Dropdown
          key={index}
          item={link}
          isDesktop={true}
        />
      ))}
      <ThemeToggle isDark={isDark} toggleDarkMode={toggleDarkMode} />
    </nav>
  );
};

export default DesktopNav;
