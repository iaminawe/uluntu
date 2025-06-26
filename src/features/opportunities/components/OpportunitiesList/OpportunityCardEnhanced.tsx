import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Building2,
  DollarSign,
  Calendar,
  Users,
  Briefcase,
  Star,
  Home,
  Globe,
  TrendingUp,
  Award
} from 'lucide-react';
import { Opportunity } from './types';
import { 
  formatDate, 
  calculateDaysLeft, 
  getTypeColor, 
  getOpportunityTypeLabel,
  getExperienceLevelLabel
} from './utils';

interface OpportunityCardProps {
  opportunity: Opportunity;
  featured?: boolean;
}

const OpportunityCardEnhanced = ({ opportunity, featured = false }: OpportunityCardProps) => {
  const daysLeft = opportunity.deadline ? calculateDaysLeft(opportunity.deadline) : null;
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
  const postedDate = formatDate(opportunity.postedDate);
  
  // Default cover images based on opportunity type
  const defaultCovers = {
    'full-time': 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'part-time': 'https://images.pexels.com/photos/5439381/pexels-photo-5439381.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'contract': 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'volunteer': 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'internship': 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
  };
  
  const coverImage = opportunity.coverImage || defaultCovers[opportunity.type] || defaultCovers['full-time'];
  
  return (
    <Link
      to={`/opportunities/${opportunity.originalId || String(opportunity.id)}`}
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative group overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 ${
        featured ? 'md:col-span-2 lg:col-span-2' : ''
      }`}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
          <Star className="h-3 w-3" fill="currentColor" />
          Featured
        </div>
      )}
      
      {/* Urgent Badge */}
      {isUrgent && !isExpired && (
        <div className="absolute top-4 left-4 z-20 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg animate-pulse">
          <Clock className="h-3 w-3" />
          Closing Soon
        </div>
      )}
      
      {/* Cover Image Section */}
      <div className={`${featured ? 'h-64' : 'h-48'} w-full relative overflow-hidden`}>
        <img
          src={coverImage}
          alt={`${opportunity.title} cover`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Stats Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/90">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm font-medium">{getOpportunityTypeLabel(opportunity.type)}</span>
            </div>
            {opportunity.remote && (
              <div className="flex items-center gap-1.5">
                <Home className="h-4 w-4" />
                <span className="text-sm font-medium">Remote</span>
              </div>
            )}
          </div>
          {!isExpired && daysLeft !== null && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">{daysLeft} days left</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Logo Section - Floating */}
      <div className="flex justify-center -mt-12 relative z-10 px-6">
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 p-2 shadow-xl border-4 border-white dark:border-slate-800 group-hover:shadow-2xl transition-all duration-300">
          {opportunity.company.logo ? (
            <img
              src={opportunity.company.logo}
              alt={`${opportunity.company.name} logo`}
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          )}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow pt-4">
        {/* Title & Company */}
        <div className="text-center mb-4">
          <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors line-clamp-2 mb-1">
            {opportunity.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
            {opportunity.company.name}
          </p>
        </div>
        
        {/* Key Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center justify-center text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="h-4 w-4 mr-1.5 text-orange-500" />
            <span className="truncate">{opportunity.location}</span>
          </div>
          {opportunity.salary && (
            <div className="flex items-center justify-center text-sm text-slate-600 dark:text-slate-400">
              <DollarSign className="h-4 w-4 mr-1.5 text-green-500" />
              <span className="truncate font-medium">{opportunity.salary}</span>
            </div>
          )}
        </div>
        
        {/* Description */}
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-4 text-center leading-relaxed">
          {opportunity.description}
        </p>
        
        {/* Tags */}
        <div className="mt-auto">
          <div className="flex flex-wrap gap-1.5 justify-center">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${getTypeColor(opportunity.type)}`}>
              {getOpportunityTypeLabel(opportunity.type)}
            </span>
            {opportunity.experienceLevel && (
              <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium border border-purple-200 dark:border-purple-800">
                <Award className="h-3 w-3 mr-1" />
                {getExperienceLevelLabel(opportunity.experienceLevel)}
              </span>
            )}
            {opportunity.remote && (
              <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-medium border border-emerald-200 dark:border-emerald-800">
                <Globe className="h-3 w-3 mr-1" />
                Remote OK
              </span>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Posted {postedDate}
          </span>
          {isExpired ? (
            <span className="text-red-500 dark:text-red-400 font-medium">Expired</span>
          ) : isUrgent ? (
            <span className="text-orange-500 dark:text-orange-400 font-medium flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Apply Soon
            </span>
          ) : (
            <span className="text-green-500 dark:text-green-400 font-medium flex items-center">
              <Users className="h-3 w-3 mr-1" />
              Open
            </span>
          )}
        </div>
      </div>
      
      {/* Hover Effect - Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </Link>
  );
};

export default OpportunityCardEnhanced;