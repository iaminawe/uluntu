import { Calendar, MapPin, Building, Briefcase, Heart, Coins, Users, Clock, Home, Globe, DollarSign, Star } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { OpportunityHeroProps } from './types';

// Helper function for getting the icon based on opportunity type
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'job':
      return <Briefcase className="h-5 w-5" />;
    case 'volunteer':
      return <Heart className="h-5 w-5" />;
    case 'funding':
      return <Coins className="h-5 w-5" />;
    case 'community':
      return <Users className="h-5 w-5" />;
    default:
      return <Briefcase className="h-5 w-5" />;
  }
};

const OpportunityHero: React.FC<OpportunityHeroProps> = ({ opportunity }) => {
  const daysUntilDeadline = opportunity.deadline 
    ? differenceInDays(new Date(opportunity.deadline), new Date())
    : null;
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 7 && daysUntilDeadline > 0;
  const isExpired = daysUntilDeadline !== null && daysUntilDeadline < 0;

  // Default hero images based on opportunity type
  const defaultHeroImages = {
    'job': 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&h=800&fit=crop&q=80',
    'volunteer': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600&h=800&fit=crop&q=80',
    'funding': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1600&h=800&fit=crop&q=80',
    'community': 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1600&h=800&fit=crop&q=80'
  };
  
  const heroImage = opportunity.image || defaultHeroImages[opportunity.type] || defaultHeroImages['job'];

  return (
    <>
      {/* Hero Image with Overlay */}
      <div className="relative h-96 w-full overflow-hidden">
        <img 
          src={heroImage} 
          alt={opportunity.title}
          className="w-full h-full object-cover object-center" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        
        {/* Floating Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <div className="flex gap-2">
            {opportunity.type && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full text-sm font-medium text-slate-900 dark:text-white shadow-lg">
                {getTypeIcon(opportunity.type)}
                <span className="capitalize">{opportunity.type}</span>
              </span>
            )}
            {isUrgent && !isExpired && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-full text-sm font-medium shadow-lg animate-pulse">
                <Clock className="h-4 w-4" />
                Closing Soon
              </span>
            )}
          </div>
          {opportunity.compensation && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-full text-sm font-medium shadow-lg">
              <DollarSign className="h-4 w-4" />
              {opportunity.compensation}
            </span>
          )}
        </div>
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
            {opportunity.title}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-white/90">
            <div className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              <span className="font-medium">{opportunity.organization}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{opportunity.location}</span>
            </div>
            
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>Posted {format(new Date(opportunity.postedAt), 'MMM d, yyyy')}</span>
            </div>
            
            {opportunity.deadline && (
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span className={isExpired ? 'text-red-300' : isUrgent ? 'text-yellow-300' : ''}>
                  {isExpired 
                    ? 'Deadline passed' 
                    : `Closes ${format(new Date(opportunity.deadline), 'MMM d, yyyy')}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Description Section */}
      <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">About this Opportunity</h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {opportunity.description}
        </p>
      </div>
    </>
  );
};

export default OpportunityHero;
