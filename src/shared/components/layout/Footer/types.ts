// Types for Footer component with dynamic menu support
import React from 'react';
import type { MenuItem } from '@/types/menu';
import type { FeatureKey as SettingsFeatureKey } from '@/types/settings';

// Footer feature type - more permissive than settings FeatureKey
export type FeatureKey = string;

export interface FooterLink {
  text: string;
  href: string;
  isExternal?: boolean;
  target?: '_self' | '_blank' | '_parent' | '_top';
  icon?: string | null;
  cssClasses?: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
  id?: string;
  cssClasses?: string;
}

export interface SocialLink {
  platform: string;
  href: string;
  icon: React.ReactNode;
  ariaLabel?: string;
}

export interface FooterProps {
  columns?: FooterColumn[];
  socialLinks?: SocialLink[];
  copyrightText?: string;
  enableDynamicMenu?: boolean;
  fallbackColumns?: FooterColumn[];
  maxColumns?: number;
  showSocialLinks?: boolean;
  showCopyright?: boolean;
}

// Dynamic footer menu types
export interface DynamicFooterProps {
  enableDynamicMenu?: boolean;
  fallbackColumns?: FooterColumn[];
  featureFlagKey?: string;
  permissionRoles?: string[];
  maxColumns?: number;
  columnLayout?: 'auto' | 'equal' | 'custom';
}

// Footer layout options
export interface FooterLayoutConfig {
  showBranding: boolean;
  showSocialLinks: boolean;
  showNewsletter: boolean;
  showLegalLinks: boolean;
  columnBreakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

// Footer menu grouping strategies
export type FooterGroupingStrategy = 
  | 'by-category'
  | 'by-section' 
  | 'flat'
  | 'hierarchical';

// Footer menu configuration
export interface FooterMenuConfig {
  groupingStrategy: FooterGroupingStrategy;
  maxItemsPerColumn: number;
  showIcons: boolean;
  showDescriptions: boolean;
  preserveHierarchy: boolean;
}

// Enhanced footer link with menu item data
export interface EnhancedFooterLink extends FooterLink {
  id?: string;
  description?: string;
  featureFlag?: string;
  requiredRoles?: string[];
  sortOrder: number;
  children?: EnhancedFooterLink[];
}

// Enhanced footer column with dynamic capabilities
export interface EnhancedFooterColumn extends FooterColumn {
  menuItems?: MenuItem[];
  isGenerated?: boolean;
  priority?: number;
  responsive?: {
    hidden?: string[];
    orderMobile?: number;
    orderTablet?: number;
  };
}
