import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import { Company } from './types';
import { truncateDescription, formatEmployeeCount } from './utils';

interface CompanyCardProps {
  company: Company;
}

const CompanyCard = ({ company }: CompanyCardProps) => {
  return (
    <Link
      to={`/companies/${company.id}`}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full"
    >
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 rounded-md overflow-hidden mr-4 bg-white p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            <img
              src={company.logo}
              alt={company.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
              {company.name}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{company.size}</p>
          </div>
        </div>
        
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2 mb-4 flex-grow">
          {truncateDescription(company.description)}
        </p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{company.location}</span>
          </div>
          
          {company.employees && (
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
              <Users className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{formatEmployeeCount(company.employees)}</span>
            </div>
          )}
        </div>
        
        {company.industry && company.industry.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
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
