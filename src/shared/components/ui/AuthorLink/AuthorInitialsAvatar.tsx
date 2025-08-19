import React from 'react';
import { generateInitials, generateAvatarColor } from '../../../../utils/authorUtils';

interface AuthorInitialsAvatarProps {
  name: string;
  size: number;
  className?: string;
}

/**
 * Fallback avatar component that displays initials with a colored background
 * Used when author image fails to load or is not available
 */
export function AuthorInitialsAvatar({ 
  name, 
  size, 
  className = '' 
}: AuthorInitialsAvatarProps) {
  const initials = generateInitials(name);
  const colorClass = generateAvatarColor(name);
  const fontSize = Math.max(size * 0.4, 10); // Responsive font size
  
  return (
    <div
      className={`
        ${colorClass}
        rounded-full 
        flex 
        items-center 
        justify-center 
        text-white 
        font-medium 
        ${className}
      `}
      style={{ 
        width: size, 
        height: size,
        fontSize: `${fontSize}px`,
        minWidth: size,
        minHeight: size
      }}
      role="img"
      aria-label={`${name} avatar`}
    >
      {initials}
    </div>
  );
}

export default AuthorInitialsAvatar;