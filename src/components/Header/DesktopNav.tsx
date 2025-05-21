import React from 'react';
import { Link } from 'react-router-dom';
import { NavLinkItem } from './types';
import ThemeToggle from './ThemeToggle';

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
    <nav className="hidden md:flex items-center space-x-8">
      {navLinks.map((link, index) => (
        <Link
          key={index}
          to={link.href}
          className="text-white hover:text-orange-100 transition-colors"
        >
          {link.text}
        </Link>
      ))}
      <ThemeToggle isDark={isDark} toggleDarkMode={toggleDarkMode} />
    </nav>
  );
};

export default DesktopNav;
