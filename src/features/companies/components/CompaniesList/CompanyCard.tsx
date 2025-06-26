import { Link } from 'react-router-dom';
import { MapPin, Users, Calendar, Globe, Building2, Star, TrendingUp } from 'lucide-react';
import { Company } from './types';
import { truncateDescription, formatEmployeeCount } from './utils';

interface CompanyCardProps {
  company: Company;
}

const CompanyCard = ({ company }: CompanyCardProps) => {
  const defaultCoverImage = 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
  const defaultLogo = 'https://images.unsplash.com/photo-1568952433726-3896e3881c65?w=100&h=100&fit=crop';

  // Calculate member count (mock data for now)
  const memberCount = Math.floor(Math.random() * 50) + 5;
  
  return (
    <Link
      to={`/companies/${company.slug || company.id}`}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative group overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600"
    >
      {/* Featured Badge */}
      {company.featured && (
        <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
          <Star className="h-3 w-3" fill="currentColor" />
          Featured
        </div>
      )}

      {/* Cover Image Section with Overlay */}
      <div className="h-48 w-full relative overflow-hidden">
        <img
          src={company.cover_image || (company as any).coverImage || defaultCoverImage}
          alt={`${company.name} cover`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        
        {/* Stats Overlay */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white/90">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{memberCount} members</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Since {company.founded}</span>
          </div>
        </div>
      </div>

      {/* Logo Section - Floating */}
      <div className="flex justify-center -mt-12 relative z-10 px-6">
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 p-2 shadow-xl border-4 border-white dark:border-slate-800 group-hover:shadow-2xl transition-all duration-300">
          {company.logo ? (
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="w-full h-full object-contain rounded-xl"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Content Section - Enhanced */}
      <div className="p-6 flex flex-col flex-grow pt-4">
        {/* Company Name & Size */}
        <div className="text-center mb-4">
          <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors line-clamp-1 mb-1">
            {company.name}
          </h3>
          <div className="flex items-center justify-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              {company.size}
            </span>
            {company.status === 'active' && (
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-green-600 dark:text-green-400 font-medium">Active</span>
              </span>
            )}
          </div>
        </div>
        
        {/* Description */}
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 mb-4 text-center leading-relaxed">
          {truncateDescription(company.description, 120)}
        </p>
        
        {/* Location & Website */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-center text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="h-4 w-4 mr-2 text-orange-500" />
            <span className="font-medium">{company.location}</span>
          </div>
          {company.website && (
            <div className="flex items-center justify-center text-sm text-slate-600 dark:text-slate-400">
              <Globe className="h-4 w-4 mr-2 text-orange-500" />
              <span className="truncate max-w-[200px]">
                {company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </span>
            </div>
          )}
        </div>
        
        {/* Industries - Enhanced */}
        {company.industry && company.industry.length > 0 && (
          <div className="mt-auto">
            <div className="flex flex-wrap gap-1.5 justify-center">
              {company.industry.slice(0, 3).map((ind, index) => (
                <span
                  key={`${ind}-${index}`}
                  className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 text-orange-700 dark:text-orange-300 rounded-lg text-xs font-medium border border-orange-200 dark:border-orange-800 group-hover:border-orange-300 dark:group-hover:border-orange-700 transition-colors"
                >
                  {ind}
                </span>
              ))}
              {company.industry.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-600">
                  +{company.industry.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hover Effect - Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </Link>
  );
};

export default CompanyCard;
