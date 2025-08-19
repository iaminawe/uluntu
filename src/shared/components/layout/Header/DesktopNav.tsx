import React from 'react';
import { NavLinkItem } from './types';
import ThemeToggle from './ThemeToggle';
import Dropdown from './Dropdown';

interface DesktopNavProps {
  navLinks: NavLinkItem[];
  isDark: boolean;
  toggleDarkMode: () => void;
  className?: string;
  showLoadingSkeleton?: boolean;
}

const DesktopNav: React.FC<DesktopNavProps> = ({ 
  navLinks, 
  isDark, 
  toggleDarkMode,
  className = "hidden md:flex items-center space-x-6",
  showLoadingSkeleton = false 
}) => {
  if (showLoadingSkeleton) {
    return (
      <nav className={className}>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-4 w-16 bg-white/20 rounded animate-pulse" />
        ))}
        <ThemeToggle isDark={isDark} toggleDarkMode={toggleDarkMode} />
      </nav>
    );
  }

  return (
    <nav className={className}>
      {navLinks.map((link, index) => (
        <Dropdown
          key={link.href || index}
          item={link}
          isDesktop={true}
        />
      ))}
      <ThemeToggle isDark={isDark} toggleDarkMode={toggleDarkMode} />
    </nav>
  );
};

export default DesktopNav;
