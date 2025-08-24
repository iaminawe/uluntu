import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthorByMemberId as useAuthorById, useAuthorFromContent, AuthorData } from '../../../../hooks/useAuthor';
import Skeleton from '../Skeleton/Skeleton';
import { AuthorInitialsAvatar } from './AuthorInitialsAvatar';

interface AuthorLinkProps {
  /** Author/Member ID to display */
  authorId?: string;
  /** Content object with author information */
  content?: Record<string, any>;
  /** Show author avatar */
  showAvatar?: boolean;
  /** Show author title/role */
  showTitle?: boolean;
  /** Size variant for the component */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
  /** Custom avatar size */
  avatarSize?: number;
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

const sizeConfig = {
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
 * AuthorLink Component
 * 
 * A reusable component for displaying author information with optional linking to their profile.
 * Handles loading states, error states, and provides flexible display options.
 * 
 * @example
 * // Basic usage with author ID
 * <AuthorLink authorId="123" showAvatar showTitle />
 * 
 * @example
 * // Usage with content object
 * <AuthorLink content={post} showAvatar />
 * 
 * @example
 * // Custom styling and behavior
 * <AuthorLink 
 *   authorId="123" 
 *   size="lg" 
 *   noLink 
 *   onClick={(author) => console.log(author)}
 *   className="custom-author-style"
 * />
 */
export function AuthorLink({
  authorId,
  content,
  showAvatar = false,
  showTitle = false,
  size = 'md',
  className = '',
  avatarSize,
  noLink = false,
  onClick,
  loadingFallback,
  errorFallback,
  unknownAuthorText = 'Unknown Author'
}: AuthorLinkProps) {
  // Use appropriate hook based on provided props
  const authorQuery = authorId 
    ? useAuthorById(authorId)
    : useAuthorFromContent(content);

  const { data: author, isLoading, error } = authorQuery;
  const config = sizeConfig[size];
  const finalAvatarSize = avatarSize || config.avatar;

  // Handle loading state
  if (isLoading) {
    if (loadingFallback) {
      return <>{loadingFallback}</>;
    }
    
    return (
      <div className={`flex items-center ${config.gap} ${className}`}>
        {showAvatar && (
          <Skeleton 
            className="rounded-full" 
            width={`${finalAvatarSize}px`}
            height={`${finalAvatarSize}px`}
          />
        )}
        <div className="flex flex-col">
          <Skeleton className={`h-4 w-24 ${config.textSize}`} />
          {showTitle && <Skeleton className={`h-3 w-16 ${config.titleSize} mt-1`} />}
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }
    
    return (
      <span className={`text-gray-500 ${config.textSize} ${className}`}>
        {unknownAuthorText}
      </span>
    );
  }

  // Handle no author found or invalid author data
  if (!author || !author.id || !author.name) {
    return (
      <span className={`text-gray-500 ${config.textSize} ${className}`}>
        {unknownAuthorText}
      </span>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick && author && author.id && author.name) {
      e.preventDefault();
      onClick(author);
    }
  };

  const authorContent = (
    <div className={`flex items-center ${config.gap} ${className}`}>
      {showAvatar && (
        <AuthorAvatarImage
          src={author.image || ''}
          alt={`${author.name || 'Unknown'} avatar`}
          name={author.name || 'Unknown'}
          size={finalAvatarSize}
        />
      )}
      <div className="flex flex-col min-w-0">
        <span className={`font-medium text-gray-900 dark:text-gray-100 truncate ${config.textSize}`}>
          {author.name || unknownAuthorText}
        </span>
        {showTitle && author.title && (
          <span className={`text-gray-600 dark:text-gray-400 truncate ${config.titleSize}`}>
            {author.title}
          </span>
        )}
      </div>
    </div>
  );

  if (noLink) {
    return onClick ? (
      <button 
        onClick={handleClick}
        className="text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      >
        {authorContent}
      </button>
    ) : (
      <div>{authorContent}</div>
    );
  }

  const profileUrl = author.profileUrl || `/directory/${author.slug || author.id}`;
  
  return (
    <Link
      to={profileUrl}
      className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
      onClick={handleClick}
    >
      {authorContent}
    </Link>
  );
}

// Export additional components for specific use cases

/**
 * AuthorAvatar - Just the avatar with optional link
 */
export function AuthorAvatar({
  authorId,
  content,
  size = 'md',
  noLink = false,
  className = '',
  ...props
}: Omit<AuthorLinkProps, 'showAvatar' | 'showTitle'>) {
  return (
    <AuthorLink
      authorId={authorId}
      content={content}
      showAvatar
      showTitle={false}
      size={size}
      noLink={noLink}
      className={className}
      {...props}
    />
  );
}

/**
 * AuthorName - Just the name with optional link
 */
export function AuthorName({
  authorId,
  content,
  size = 'md',
  noLink = false,
  className = '',
  ...props
}: Omit<AuthorLinkProps, 'showAvatar' | 'showTitle'>) {
  return (
    <AuthorLink
      authorId={authorId}
      content={content}
      showAvatar={false}
      showTitle={false}
      size={size}
      noLink={noLink}
      className={className}
      {...props}
    />
  );
}

/**
 * AuthorCard - Full author information display
 */
export function AuthorCard({
  authorId,
  content,
  size = 'lg',
  className = '',
  ...props
}: Omit<AuthorLinkProps, 'showAvatar' | 'showTitle'>) {
  return (
    <AuthorLink
      authorId={authorId}
      content={content}
      showAvatar
      showTitle
      size={size}
      className={`p-3 border rounded-lg hover:shadow-md transition-shadow ${className}`}
      {...props}
    />
  );
}

/**
 * AuthorAvatarImage - Internal component with fallback to initials
 */
function AuthorAvatarImage({
  src,
  alt,
  name,
  size
}: {
  src: string;
  alt: string;
  name: string;
  size: number;
}) {
  const [imageError, setImageError] = React.useState(false);

  if (imageError || !src || src === '/placeholder-avatar.png') {
    return <AuthorInitialsAvatar name={name} size={size} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
      onError={() => setImageError(true)}
    />
  );
}

export default AuthorLink;