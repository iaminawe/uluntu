// Export all footer components for easy importing
export { default as Footer } from './index';
export { default as FooterColumnComponent } from './FooterColumn';
export { default as SocialLinks } from './SocialLinks';
export { default as DynamicFooterMenu } from './DynamicFooterMenu';
export { default as FooterMenuProvider, useFooterMenu } from './FooterMenuProvider';
export { default as FooterPermissionGate, withFooterPermissions, useFooterPermissions } from './FooterPermissionGate';
export { default as FooterFeatureGate, withFooterFeatureGate, useFooterFeatures, FooterFeatureDebug } from './FooterFeatureGate';

// Export types
export type {
  FooterProps,
  FooterColumn,
  FooterLink,
  SocialLink,
  DynamicFooterProps,
  FooterLayoutConfig,
  FooterGroupingStrategy,
  FooterMenuConfig,
  EnhancedFooterLink,
  EnhancedFooterColumn,
  FeatureKey
} from './types';