import { Link } from 'react-router-dom';
import { MapPin, Clock, Building, ExternalLink } from 'lucide-react';
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

const OpportunityCard = ({ opportunity, featured = false }: OpportunityCardProps) => {
  const daysLeft = opportunity.deadline ? calculateDaysLeft(opportunity.deadline) : null;
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const postedDate = formatDate(opportunity.postedDate);
  const deadlineDate = opportunity.deadline ? formatDate(opportunity.deadline) : null;
  
  return (
    <div 
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden 
                 ${featured ? 'border-2 border-orange-400 dark:border-orange-500' : ''}`}
    >
      {featured && (
        <div className="bg-orange-500 text-white px-4 py-1 text-sm font-medium">
          Featured Opportunity
        </div>
      )}
      
      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between mb-3">
          <div className="flex items-center mb-3 sm:mb-0">
            <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden mr-3">
              <img 
                src={opportunity.company.logo} 
                alt={opportunity.company.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <Link 
                to={`/companies/${opportunity.company.id}`}
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
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 
                           dark:bg-slate-700 dark:text-slate-300">
              {getExperienceLevelLabel(opportunity.experienceLevel)}
            </span>
            {opportunity.remote && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 
                             dark:bg-emerald-900 dark:text-emerald-300">
                Remote
              </span>
            )}
          </div>
        </div>
        
        <Link to={`/opportunities/${opportunity.id}`}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white hover:text-orange-500 
                        dark:hover:text-orange-400 mb-2">
            {opportunity.title}
          </h3>
        </Link>
        
        <div className="flex flex-wrap mb-3 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center mr-4 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {opportunity.location}
          </div>
          {opportunity.salary && (
            <div className="flex items-center mb-2 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {opportunity.salary}
            </div>
          )}
          <div className="flex items-center mb-2">
            <Clock className="h-4 w-4 mr-1" />
            Posted: {postedDate}
          </div>
        </div>
        
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3">
          {opportunity.description}
        </p>
        
        <div className="flex flex-wrap items-center justify-between">
          {deadlineDate && (
            <div className={`text-xs ${isExpired ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
              {isExpired ? (
                <span>Expired on {deadlineDate}</span>
              ) : (
                <span>
                  Deadline: {deadlineDate} ({daysLeft} days left)
                </span>
              )}
            </div>
          )}
          
          <div className="mt-2 sm:mt-0">
            {opportunity.applyUrl ? (
              <a
                href={opportunity.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 
                         text-white rounded-md transition-colors text-sm"
              >
                Apply Now <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </a>
            ) : (
              <Link
                to={`/opportunities/${opportunity.id}`}
                className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 
                         dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 
                         rounded-md transition-colors text-sm"
              >
                View Details
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityCard;
