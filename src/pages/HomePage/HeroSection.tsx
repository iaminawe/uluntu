import React from 'react';
import { Link } from 'react-router-dom';
import { EditableText } from '../../components/ContentEditor';
import { useContent } from '../../contexts/ContentContext';
import { MOUNTAIN_BACKGROUNDS } from '../../constants/backgroundImages';

const HeroSection: React.FC = () => {
  const { getPageContent } = useContent();
  const homeContent = getPageContent('home');

  const actionButtons = (
    <div className="flex flex-wrap gap-4 mt-8">
      <Link
        to="/directory"
        className="px-6 py-3 bg-white text-orange-500 hover:bg-white/90 transition-colors rounded-lg font-medium"
      >
        View Directory
      </Link>
      <Link
        to="/events"
        className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors rounded-lg font-medium"
      >
        Upcoming Events
      </Link>
    </div>
  );

  return (
    <div 
      className="py-24"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${MOUNTAIN_BACKGROUNDS.home})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <EditableText
            pageId="home"
            field="title"
            content={homeContent?.title || { en: "Connecting Kootenay Tech Professionals" }}
            as="h1"
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          />
          <EditableText
            pageId="home"
            field="description"
            content={homeContent?.description || { en: "Join our growing tech community to connect, collaborate, and grow together." }}
            as="p"
            className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto"
            multiline
          />
          {actionButtons}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
