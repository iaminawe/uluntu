import React from 'react';
import { TypingIndicator as TypingIndicatorType } from '../../types';

interface TypingIndicatorProps {
  typingUsers: TypingIndicatorType[];
  className?: string;
}

/**
 * Basic typing indicator component - placeholder implementation
 */
export default function TypingIndicator({ 
  typingUsers = [], 
  className = '' 
}: TypingIndicatorProps) {
  if (typingUsers.length === 0) {
    return null;
  }

  const getUserNames = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].user.name} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].user.name} and ${typingUsers[1].user.name} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };

  return (
    <div className={`typing-indicator ${className}`}>
      <div className="typing-text">{getUserNames()}</div>
      <div className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}