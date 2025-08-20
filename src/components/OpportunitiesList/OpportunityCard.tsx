import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Building,
  MessageCircle
} from 'lucide-react';
import { Opportunity } from '@/features/opportunities/components/OpportunitiesList/types';
import { getOpportunityUrl, getCompanyUrl } from '@/utils/contentUrlUtils';
import { 
  formatDate, 
  calculateDaysLeft, 
  getTypeColor, 
  getOpportunityTypeLabel,
  getExperienceLevelLabel
} from '@/features/opportunities/components/OpportunitiesList/utils';
import { LikeButton } from '@/components/interactions';

interface OpportunityCardProps {
  opportunity: Opportunity;
  featured?: boolean;
}

const OpportunityCard = ({ opportunity, featured = false }: OpportunityCardProps) => {
  const daysLeft = opportunity.deadline ? calculateDaysLeft(opportunity.deadline) : null;
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const postedDate = formatDate(opportunity.postedDate);
  const deadlineDate = opportunity.deadline ? formatDate(opportunity.deadline) : null;
  
  if (featured) {
    // Featured card with full-width image at the top
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden border-2 border-orange-400 dark:border-orange-500">
        <div className="bg-orange-500 text-white px-4 py-1 text-sm font-medium">
          Featured Opportunity
        </div>
        
        {/* Full-width image at top */}
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={opportunity.company.logo} 
            alt={opportunity.company.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-5">
          {/* Company info */}
          <div className="flex flex-wrap items-start justify-between mb-3">
            <div className="mb-3 sm:mb-0">
              <Link 
                to={getCompanyUrl(opportunity.company)}
                className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-orange-500 
                         dark:hover:text-orange-400 flex items-center"
              >
                <Building className="h-3.5 w-3.5 mr-1" />
                {opportunity.company.name}
              </Link>
              {opportunity.company.location && (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {opportunity.company.location}
                </span>
              )}
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(opportunity.type)}`}>
                {getOpportunityTypeLabel(opportunity.type)}
              </span>
              {opportunity.experienceLevel && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 
                             dark:bg-slate-700 dark:text-slate-300">
                  {getExperienceLevelLabel(opportunity.experienceLevel)}
                </span>
              )}
              {opportunity.remote && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 
                              dark:bg-emerald-900 dark:text-emerald-300">
                  Remote
                </span>
              )}
            </div>
          </div>
          
          {/* Title */}
          <Link to={getOpportunityUrl(opportunity)}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white hover:text-orange-500 
                          dark:hover:text-orange-400 mb-2">
              {opportunity.title}
            </h3>
          </Link>
          
          {/* Location and details */}
          <div className="flex flex-wrap mb-3 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center mr-4 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {opportunity.location}
            </div>
            {opportunity.salary && (
              <div className="flex items-center mb-2 mr-4">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {opportunity.salary}
                </span>
              </div>
            )}
          </div>
          
          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
            {opportunity.description}
          </p>
          
          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  Posted {postedDate}
                </span>
              </div>
              
              {deadlineDate && (
                <div className={`text-xs ${isExpired ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {isExpired ? 'Deadline passed' : `${daysLeft} days left`}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4" onClick={(e) => e.preventDefault()}>
              <LikeButton
                entityType="opportunity"
                entityId={opportunity.id.toString()}
                initialLikeCount={opportunity.like_count || 0}
                size="sm"
              />
              <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                <MessageCircle className="h-4 w-4" />
                <span>{opportunity.comment_count || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    // Non-featured card with image on the left side
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden flex h-full">
        {/* Left side image (20% width) */}
        <div className="w-1/5 overflow-hidden">
          <img 
            src={opportunity.company.logo} 
            alt={opportunity.company.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content (80% width) */}
        <div className="p-5 w-4/5">
          {/* Company and tags */}
          <div className="flex flex-wrap items-start justify-between mb-3">
            <div className="flex items-center mb-3 sm:mb-0">
              <div>
                <Link 
                  to={getCompanyUrl(opportunity.company)}
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-orange-500 
                           dark:hover:text-orange-400 flex items-center"
                >
                  <Building className="h-3.5 w-3.5 mr-1" />
                  {opportunity.company.name}
                </Link>
                {opportunity.company.location && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {opportunity.company.location}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(opportunity.type)}`}>
                {getOpportunityTypeLabel(opportunity.type)}
              </span>
              {opportunity.experienceLevel && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 
                             dark:bg-slate-700 dark:text-slate-300">
                  {getExperienceLevelLabel(opportunity.experienceLevel)}
                </span>
              )}
              {opportunity.remote && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 
                              dark:bg-emerald-900 dark:text-emerald-300">
                  Remote
                </span>
              )}
            </div>
          </div>
          
          {/* Title */}
          <Link to={getOpportunityUrl(opportunity)}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white hover:text-orange-500 
                          dark:hover:text-orange-400 mb-2">
              {opportunity.title}
            </h3>
          </Link>
          
          {/* Location and details */}
          <div className="flex flex-wrap mb-3 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center mr-4 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {opportunity.location}
            </div>
            {opportunity.salary && (
              <div className="flex items-center mb-2 mr-4">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {opportunity.salary}
                </span>
              </div>
            )}
          </div>
          
          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
            {opportunity.description}
          </p>
          
          {/* Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  Posted {postedDate}
                </span>
              </div>
              
              {deadlineDate && (
                <div className={`text-xs ${isExpired ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {isExpired ? 'Deadline passed' : `${daysLeft} days left`}
                </div>
              )}
            </div>
            <div className="flex items-center gap-4" onClick={(e) => e.preventDefault()}>
              <LikeButton
                entityType="opportunity"
                entityId={opportunity.id.toString()}
                initialLikeCount={opportunity.like_count || 0}
                size="sm"
              />
              <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                <MessageCircle className="h-4 w-4" />
                <span>{opportunity.comment_count || 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default OpportunityCard;
