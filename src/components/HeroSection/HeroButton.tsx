import React from 'react';
import { Link } from 'react-router-dom';
import { ButtonLink } from '@/shared/components/layout/HeroSection/types';

interface HeroButtonProps {
  button: ButtonLink;
}

const HeroButton: React.FC<HeroButtonProps> = ({ button }) => {
  const { text, href, isPrimary = false } = button;
  
  // Determine if it's an external link
  const isExternal = href.startsWith('http');
  
  const buttonClasses = isPrimary
    ? "px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
    : "px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors";
  
  if (isExternal) {
    return (
      <a
        href={href}
        className={buttonClasses}
        target="_blank"
        rel="noopener noreferrer"
      >
        {text}
      </a>
    );
  }
  
  return (
    <Link to={href} className={buttonClasses}>
      {text}
    </Link>
  );
};

export default HeroButton;
