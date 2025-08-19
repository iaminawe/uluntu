import { AuthorData } from '../../../../hooks/useAuthor';

export type { AuthorData };

export interface BaseAuthorProps {
  /** Author/Member ID to display */
  authorId?: string;
  /** Content object with author information */
  content?: Record<string, any>;
  /** Size variant for the component */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
  /** Disable link behavior (render as span) */
  noLink?: boolean;
  /** Custom click handler */
  onClick?: (author: AuthorData) => void;
  /** Loading fallback component */
  loadingFallback?: React.ReactNode;
  /** Error fallback component */
  errorFallback?: React.ReactNode;
  /** Unknown author fallback text */
  unknownAuthorText?: string;
}

export interface AuthorDisplayOptions {
  /** Show author avatar */
  showAvatar?: boolean;
  /** Show author title/role */
  showTitle?: boolean;
  /** Custom avatar size */
  avatarSize?: number;
}

export interface AuthorLinkProps extends BaseAuthorProps, AuthorDisplayOptions {}

export interface SizeConfig {
  avatar: number;
  textSize: string;
  titleSize: string;
  gap: string;
}

export type AuthorSizes = 'sm' | 'md' | 'lg';

/**
 * Configuration for different size variants
 */
export const AUTHOR_SIZE_CONFIG: Record<AuthorSizes, SizeConfig> = {
  sm: {
    avatar: 24,
    textSize: 'text-sm',
    titleSize: 'text-xs',
    gap: 'gap-2'
  },
  md: {
    avatar: 32,
    textSize: 'text-base',
    titleSize: 'text-sm',
    gap: 'gap-3'
  },
  lg: {
    avatar: 40,
    textSize: 'text-lg',
    titleSize: 'text-base',
    gap: 'gap-4'
  }
};

/**
 * Default configuration values
 */
export const AUTHOR_DEFAULTS = {
  size: 'md' as AuthorSizes,
  showAvatar: false,
  showTitle: false,
  noLink: false,
  unknownAuthorText: 'Unknown Author',
  placeholderImage: '/placeholder-avatar.png'
} as const;