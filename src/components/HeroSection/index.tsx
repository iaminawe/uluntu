import React from 'react';
import { HeroSectionProps } from '@/shared/components/layout/HeroSection/types';
import HeroButton from '@/shared/components/layout/HeroSection/HeroButton';
import { useSettings } from '@/hooks/useSettings';

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  description,
  backgroundImage = "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
  buttons = [
    {
      text: "Join the Community",
      href: "/directory",
      isPrimary: true
    },
    {
      text: "Upcoming Events",
      href: "/events",
      isPrimary: false
    }
  ]
}) => {
  const { settings } = useSettings();
  
  // Get settings with fallbacks
  const siteName = settings?.site?.site_name?.value || "Uluntu";
  const siteDescription = settings?.site?.site_description?.value || "Connecting and empowering the Uluntu community through collaboration and knowledge sharing.";
  
  const displayTitle = title || siteName;
  const displayDescription = description || siteDescription;
  
  return (
    <section className="relative bg-gradient-to-r from-slate-900 to-slate-800 text-white py-24">
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src={backgroundImage}
          alt={`${siteName} Community`}
          className="w-full h-full object-cover opacity-20"
        />
      </div>
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-6">{displayTitle}</h1>
          <p className="text-xl text-slate-300 mb-8">
            {displayDescription}
          </p>
          <div className="flex flex-wrap gap-4">
            {buttons.map((button, index) => (
              <HeroButton key={index} button={button} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
