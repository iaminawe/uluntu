// Types for Footer component

export interface FooterLink {
  text: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  platform: string;
  href: string;
  icon: React.ReactNode;
}

export interface FooterProps {
  columns?: FooterColumn[];
  socialLinks?: SocialLink[];
  copyrightText?: string;
}
