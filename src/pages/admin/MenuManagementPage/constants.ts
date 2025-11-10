/**
 * Menu Management Constants
 * Icon mappings and configuration options
 */

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
  ExternalLink,
  Menu,
  Eye,
  EyeOff
} from 'lucide-react';

/**
 * Icon components mapped to their string identifiers
 */
export const ICON_COMPONENTS = {
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
  ExternalLink,
  Menu,
  Eye,
  EyeOff
} as const;

/**
 * Icon options for dropdowns and selectors
 */
export const ICON_OPTIONS = [
  { value: 'Home', label: 'Home' },
  { value: 'Users', label: 'Users' },
  { value: 'Building2', label: 'Building' },
  { value: 'Calendar', label: 'Calendar' },
  { value: 'Newspaper', label: 'News' },
  { value: 'BookOpen', label: 'Resources' },
  { value: 'ShoppingBag', label: 'Shopping' },
  { value: 'Briefcase', label: 'Briefcase' },
  { value: 'Tag', label: 'Tag' },
  { value: 'Mail', label: 'Mail' },
  { value: 'Phone', label: 'Phone' },
  { value: 'MapPin', label: 'Location' },
  { value: 'Globe', label: 'Globe' },
  { value: 'Info', label: 'Info' },
  { value: 'Settings', label: 'Settings' },
  { value: 'HelpCircle', label: 'Help' },
  { value: 'FileText', label: 'Document' },
  { value: 'Link', label: 'Link' },
  { value: 'ExternalLink', label: 'External Link' },
  { value: 'Menu', label: 'Menu' }
] as const;

export type IconType = typeof ICON_OPTIONS[number]['value'];
