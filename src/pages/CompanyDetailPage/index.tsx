import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import { SkeletonCard } from '@/shared/components/ui/Skeleton';
import { useCompanyHybrid } from '@/features/companies/hooks/useCompaniesHybrid';

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  // Use hybrid approach for data fetching
  const {
    company,
    isLoading,
    isError,
    error,
    refetch
  } = useCompanyHybrid(id);

  return (
    <>
      <Helmet>
        <title>{company?.name || 'Company Details'} - Kootenay Tech Community</title>
        <meta name="description" content={company?.description || 'Company details page'} />
      </Helmet>
      
      <ContentContainer>
        <div className="mb-6">
          <Link to="/companies" className="text-blue-600 dark:text-blue-400 hover:underline">
            &larr; Back to Companies
          </Link>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center mb-6">
              <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-md mr-6 mb-4 md:mb-0"></div>
              <div>
                <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
            <div className="mb-6">
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
              <div>
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                <div className="space-y-2">
                  <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : isError ? (
          <QueryError 
            error={error || new Error('Failed to load company details')} 
            retry={refetch} 
            message="We couldn't load the company details. Please try again."
          />
        ) : !company ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Company Not Found</h2>
            <p className="text-slate-600 dark:text-slate-400">The company you're looking for doesn't exist or has been removed.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center mb-6">
              {company.logo ? (
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`} 
                  className="w-24 h-24 object-contain rounded-md mr-6 mb-4 md:mb-0" 
                />
              ) : (
                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-md mr-6 mb-4 md:mb-0 flex items-center justify-center">
                  <span className="text-slate-500 dark:text-slate-400 text-3xl font-bold">
                    {company.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {company.name}
                </h1>
                {company.industry && company.industry.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {company.industry.map((ind: string, index: number) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                      >
                        {ind}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {company.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">About</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {company.description}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Company Details</h3>
                <dl className="space-y-2">
                  {company.size && (
                    <div className="flex">
                      <dt className="text-slate-600 dark:text-slate-400 w-20">Size:</dt>
                      <dd className="text-slate-900 dark:text-white">{company.size}</dd>
                    </div>
                  )}
                  {company.founded && (
                    <div className="flex">
                      <dt className="text-slate-600 dark:text-slate-400 w-20">Founded:</dt>
                      <dd className="text-slate-900 dark:text-white">{company.founded}</dd>
                    </div>
                  )}
                  {company.location && (
                    <div className="flex">
                      <dt className="text-slate-600 dark:text-slate-400 w-20">Location:</dt>
                      <dd className="text-slate-900 dark:text-white">{company.location}</dd>
                    </div>
                  )}
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Links</h3>
                <div className="space-y-2">
                  {company.website && (
                    <a 
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline block"
                    >
                      Visit Website →
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {company.featured && (
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center">
                  <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                    ⭐ Featured Company
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </ContentContainer>
    </>
  );
}