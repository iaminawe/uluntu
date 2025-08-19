import React from 'react';
import {
  Home,
  Users,
  Building2,
  Calendar,
  Newspaper,
  BookOpen,
  ShoppingBag,
  Briefcase,
  Tag,
  Mail,
  Phone,
  MapPin,
  Globe,
  Info,
  Settings,
  HelpCircle,
  FileText,
  Link,
  ExternalLink
} from 'lucide-react';

// Icon mapping for consistent icon rendering
const ICON_COMPONENTS = {
  Home,
  Users,
  Building2,
  Calendar,
  Newspaper,
  BookOpen,
  ShoppingBag,
  Briefcase,
  Tag,
  Mail,
  Phone,
  MapPin,
  Globe,
  Info,
  Settings,
  HelpCircle,
  FileText,
  Link,
  ExternalLink
} as const;

export type IconName = keyof typeof ICON_COMPONENTS;

interface MenuItemIconProps {
  icon?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MenuItemIcon: React.FC<MenuItemIconProps> = ({
  icon,
  className = '',
  size = 'md'
}) => {
  // Default to Link icon if no icon provided or icon not found
  const IconComponent = (icon && ICON_COMPONENTS[icon as IconName]) || Link;
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <IconComponent 
      className={`${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    />
  );
};

export { ICON_COMPONENTS };
export default MenuItemIcon;