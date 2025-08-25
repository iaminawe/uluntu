import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  MapPin, 
  Calendar,
  ExternalLink,
  Eye,
  Plus
} from 'lucide-react';
import { useUserCompanies } from '@/hooks/useCompanyQueries';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/shared/components/ui/ErrorDisplay';

interface CompaniesTabProps {
  contentType: 'company';
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onCreateCompany?: () => void;
  className?: string;
}

export const CompaniesTab: React.FC<CompaniesTabProps> = ({
  loading: propLoading = false,
  error: propError,
  onRefresh,
  onCreateCompany,
  className = ''
}) => {
  const navigate = useNavigate();
  const { user } = useSession();
  
  // Use a custom hook to fetch only user-associated companies
  const { data: userCompanies = [], isLoading, error, refetch } = useUserCompanies();

  const isLoadingState = propLoading || isLoading;
  const errorState = propError || error;

  if (isLoadingState) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (errorState) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <ErrorDisplay 
          error={errorState} 
          retry={onRefresh || (() => refetch())} 
        />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCompanySize = (size?: string) => {
    if (!size) return 'Unknown size';
    return size.replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleViewProfile = (company: any) => {
    // Navigate to company detail page using slug or id
    const identifier = company.slug || company.id;
    navigate(`/companies/${identifier}`);
  };

  const handleManageCompany = (company: any) => {
    // Navigate to company edit page
    const identifier = company.slug || company.id;
    navigate(`/companies/${identifier}/edit`);
  };

  const handleCreateCompany = () => {
    if (onCreateCompany) {
      onCreateCompany();
    } else {
      navigate('/companies/create');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Companies
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Companies you've created or are associated with
          </p>
        </div>
        <button
          onClick={handleCreateCompany}
          className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Company
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Companies
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {userCompanies.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Team Members
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {userCompanies.reduce((total, company) => total + (company.employees?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Profile Views
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                0
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Companies List */}
      {userCompanies.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No companies yet
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Get started by creating your first company profile.
          </p>
          <button
            onClick={handleCreateCompany}
            className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Company
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {userCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
            >
              {/* Company Header */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="flex-shrink-0">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={`${company.name} logo`}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                    {company.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                    {company.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {company.location}
                      </div>
                    )}
                    {company.founded && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Founded {company.founded}
                      </div>
                    )}
                  </div>
                </div>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Company Details */}
              <div className="space-y-3">
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {company.description || 'No description available.'}
                </p>

                {/* Company Metrics */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Size: {getCompanySize(company.size)}
                    </span>
                    {company.industry && company.industry.length > 0 && (
                      <span className="text-slate-600 dark:text-slate-400">
                        Industry: {company.industry.slice(0, 2).join(', ')}
                        {company.industry.length > 2 && ' +more'}
                      </span>
                    )}
                  </div>
                  {company.featured && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                      Featured
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-2">
                  <button 
                    onClick={() => handleViewProfile(company)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    View Profile
                  </button>
                  <button 
                    onClick={() => handleManageCompany(company)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompaniesTab;