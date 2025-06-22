import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { NavLinkItem } from './types';

interface DropdownProps {
  item: NavLinkItem;
  isDesktop?: boolean;
  onLinkClick?: () => void;
}

const Dropdown: React.FC<DropdownProps> = ({ item, isDesktop = true, onLinkClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Clear hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const handleMouseEnter = () => {
    if (isDesktop && item.children && item.children.length > 0) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (isDesktop && item.children && item.children.length > 0) {
      const timeout = setTimeout(() => {
        setIsOpen(false);
      }, 200); // Small delay to allow mouse movement between trigger and dropdown
      setHoverTimeout(timeout);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (item.children && item.children.length > 0) {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (onLinkClick) {
      onLinkClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (item.children && item.children.length > 0) {
        setIsOpen(!isOpen);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleChildClick = () => {
    setIsOpen(false);
    if (onLinkClick) {
      onLinkClick();
    }
  };

  // If it's a simple link without children
  if (!item.children || item.children.length === 0) {
    return (
      <Link
        to={item.href}
        className={
          isDesktop
            ? "text-white hover:text-orange-100 transition-colors"
            : "block px-3 py-2 text-white hover:bg-orange-700 rounded-md"
        }
        onClick={onLinkClick}
      >
        {item.text}
      </Link>
    );
  }

  // Dropdown with children
  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={
          isDesktop
            ? "flex items-center text-white hover:text-orange-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-opacity-50 rounded px-2 py-1"
            : "flex items-center justify-between w-full px-3 py-2 text-white hover:bg-orange-700 rounded-md focus:outline-none focus:bg-orange-700"
        }
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`${item.text} menu`}
      >
        <span>{item.text}</span>
        <ChevronDown 
          className={`ml-1 h-4 w-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div
          className={
            isDesktop
              ? "absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-md shadow-lg py-2 z-50 border border-slate-200 dark:border-slate-700"
              : "mt-2 w-full bg-orange-700/50 backdrop-blur-sm rounded-md py-2 pl-4"
          }
          role="menu"
          aria-orientation="vertical"
        >
          {item.children.map((child, index) => (
            <Link
              key={index}
              to={child.href}
              className={
                isDesktop
                  ? "block px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-600 last:border-b-0"
                  : "block px-3 py-2 text-sm text-white hover:bg-orange-600 rounded-md transition-colors"
              }
              onClick={handleChildClick}
              role="menuitem"
            >
              <div>
                <div className="font-medium">{child.text}</div>
                {child.description && (
                  <div className={
                    isDesktop
                      ? "text-xs text-slate-500 dark:text-slate-400 mt-1"
                      : "text-xs text-orange-100 mt-1"
                  }>
                    {child.description}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;