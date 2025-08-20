import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthorByUserId, useAuthorByMemberId, formatAuthorName, getAuthorProfileUrl } from '@/hooks/useAuthor';

interface AuthorLinkProps {
  userId?: string | null;
  memberId?: string | null;
  fallback?: string;
  className?: string;
  showImage?: boolean;
  linkToProfile?: boolean;
}

export function AuthorLink({
  userId,
  memberId,
  fallback = 'Unknown Author',
  className = '',
  showImage = false,
  linkToProfile = true,
}: AuthorLinkProps) {
  const { data: authorByUser, isLoading: loadingUser } = useAuthorByUserId(userId);
  const { data: authorByMember, isLoading: loadingMember } = useAuthorByMemberId(memberId);
  
  const author = authorByUser || authorByMember;
  const isLoading = userId ? loadingUser : loadingMember;
  const profileUrl = getAuthorProfileUrl(author);
  
  if (isLoading) {
    return <span className={`text-gray-400 ${className}`}>Loading...</span>;
  }
  
  const authorDisplay = (
    <span className={`author-info ${className}`}>
      {showImage && author && author.image && (
        <img 
          src={author.image} 
          alt={author.name || fallback}
          className="inline-block w-6 h-6 rounded-full mr-2"
        />
      )}
      {formatAuthorName(author, fallback)}
    </span>
  );
  
  if (linkToProfile && profileUrl) {
    return (
      <Link to={profileUrl} className="hover:underline">
        {authorDisplay}
      </Link>
    );
  }
  
  return authorDisplay;
}