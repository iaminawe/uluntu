import { Calendar, MapPin, Building, Briefcase, Heart, Coins, Users } from 'lucide-react';
import { format } from 'date-fns';
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
  return (
    <>
      {/* Hero Image */}
      {opportunity.image && (
        <div className="h-80 w-full relative">
          <img 
            src={opportunity.image} 
            alt={opportunity.title}
            className="w-full h-full object-cover object-center" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      )}
      
      <div className="p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
          {opportunity.title}
        </h1>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <Building className="h-5 w-5 mr-2 text-slate-500 dark:text-slate-500" />
            {opportunity.organization}
          </div>
          
          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <MapPin className="h-5 w-5 mr-2 text-slate-500 dark:text-slate-500" />
            {opportunity.location}
          </div>
          
          <div className="flex items-center text-slate-600 dark:text-slate-400">
            <Calendar className="h-5 w-5 mr-2 text-slate-500 dark:text-slate-500" />
            Posted {format(new Date(opportunity.postedAt), 'MMM d, yyyy')}
          </div>
          
          <div className="flex items-center text-slate-600 dark:text-slate-400">
            {getTypeIcon(opportunity.type)}
            <span className="ml-2 capitalize">{opportunity.type}</span>
          </div>
        </div>
        
        <p className="text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">
          {opportunity.description}
        </p>
      </div>
    </>
  );
};

export default OpportunityHero;
