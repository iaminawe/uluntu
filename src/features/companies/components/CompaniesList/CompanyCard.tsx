import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import { Company } from './types';
import { truncateDescription, formatEmployeeCount } from './utils';

interface CompanyCardProps {
  company: Company;
}

const CompanyCard = ({ company }: CompanyCardProps) => {
  const defaultCoverImage = 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'; // A generic tech background

  return (
    <Link
      to={`/companies/${company.id}`}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full relative group"
    >
      {/* Cover Image Section */}
      <div className="h-40 w-full relative">
        <img
          src={company.cover_image || defaultCoverImage}
          alt={`${company.name} cover`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div> {/* Overlay */}
        
        {/* Logo - Inset and Circular */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/4 z-10">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white p-1 border-2 border-white dark:border-slate-700 shadow-lg flex items-center justify-center">
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Content Section - Adjusted for inset logo */}
      <div className="p-6 flex flex-col h-full pt-12"> {/* Increased top padding */}
        <div className="text-center mb-4">
          <h3 className="font-semibold text-xl text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
            {company.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{company.size}</p>
        </div>
        
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-4 flex-grow text-center">
          {truncateDescription(company.description, 100)} {/* Allow slightly longer description */}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-center text-sm text-slate-500 dark:text-slate-400">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{company.location}</span>
          </div>
          
          {/* Employee count removed - would need separate API call */}
        </div>
        
        {company.industry && company.industry.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto justify-center">
            {company.industry.slice(0, 3).map(ind => (
              <span
                key={ind}
                className="inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs"
              >
                {ind}
              </span>
            ))}
            {company.industry.length > 3 && (
              <span className="inline-block px-2.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-xs">
                +{company.industry.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default CompanyCard;
