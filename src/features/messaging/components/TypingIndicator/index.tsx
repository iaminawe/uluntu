import React from 'react';
import AnimatedDots from './AnimatedDots';

interface TypingIndicatorProps {
  className?: string;
}

/**
 * Simple typing indicator with animated dots
 * Used in RealtimeMessageThread when users are typing
 */
export default function TypingIndicator({ 
  className = '' 
}: TypingIndicatorProps) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <AnimatedDots />
    </div>
  );
}