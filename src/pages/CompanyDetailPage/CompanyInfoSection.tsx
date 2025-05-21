import { MapPin, Building, Calendar } from 'lucide-react';
import { CompanyInfoSectionProps } from './types';

const CompanyInfoSection: React.FC<CompanyInfoSectionProps> = ({ company }) => {
  return (
    <div className="lg:col-span-2">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
        {company.name}
      </h1>
      
      {/* Company Stats */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center text-slate-600 dark:text-slate-300">
          <Building className="h-5 w-5 mr-2" />
          <span>{company.size}</span>
        </div>
        
        <div className="flex items-center text-slate-600 dark:text-slate-300">
          <MapPin className="h-5 w-5 mr-2" />
          <span>{company.location}</span>
        </div>
        
        <div className="flex items-center text-slate-600 dark:text-slate-300">
          <Calendar className="h-5 w-5 mr-2" />
          <span>Founded {company.founded}</span>
        </div>
      </div>
      
      {/* Industry Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {company.industry.map(industry => (
          <span
            key={industry}
            className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
          >
            {industry}
          </span>
        ))}
      </div>
      
      {/* Company Description */}
      <div className="prose dark:prose-invert max-w-none mb-8">
        <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{company.description}</p>
      </div>
    </div>
  );
};

export default CompanyInfoSection;
