// Types for HeroSection component

export interface ButtonLink {
  text: string;
  href: string;
  isPrimary?: boolean;
}

export interface HeroSectionProps {
  title?: string;
  description?: string;
  backgroundImage?: string;
  buttons?: ButtonLink[];
}
