import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ContentContainer } from '../../components/ui/PageLayout';
import { QueryError } from '../../components/ui/ErrorDisplay';
import { Company } from '../../types';
import { companiesApi } from '../../api/companiesApi';

// Check if we should use Supabase or mock data
const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';



export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  
  console.log('CompanyDetailPage: Rendering with company ID:', id);
  
  useEffect(() => {
    console.log('CompanyDetailPage: Loading company with ID:', id);
    console.log('Using Supabase:', useSupabase);
    
    let isMounted = true;
    
    const loadCompany = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      
      try {
        if (useSupabase) {
          // Fetch from Supabase
          const companyData = await companiesApi.getById(id);
          
          if (isMounted) {
            setCompany(companyData);
            setIsLoading(false);
            console.log('CompanyDetailPage: Company loaded from Supabase:', companyData);
          }
        } else {
          // Use mock data with a small delay
          setTimeout(() => {
            if (isMounted) {
              // Find company in mock data
              const mockCompanies = companiesApi.getMockCompanies();
              const foundCompany = mockCompanies.find(c => c.id === id);
              
              setCompany(foundCompany || null);
              setIsLoading(false);
              console.log('CompanyDetailPage: Mock company loaded:', foundCompany);
            }
          }, 800);
        }
      } catch (err) {
        console.error('Error loading company:', err);
        if (isMounted) {
          setIsError(true);
          setError(err instanceof Error ? err : new Error('Failed to load company details'));
          setIsLoading(false);
        }
      }
    };
    
    loadCompany();
    
    return () => {
      isMounted = false;
    };
  }, [id]);
  
  console.log('CompanyDetailPage: Company data:', company);
  console.log('CompanyDetailPage: Loading state:', isLoading);

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
            retry={() => window.location.reload()} 
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
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{company.name}</h1>
                {company.location && (
                  <p className="text-slate-600 dark:text-slate-400">
                    {company.location}
                  </p>
                )}
              </div>
            </div>
            
            {company.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">About</h2>
                <p className="text-slate-600 dark:text-slate-400">{company.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {company.industry && company.industry.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Industry</h2>
                  <div className="flex flex-wrap gap-2">
                    {company.industry.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Details</h2>
                <ul className="space-y-2">
                  {company.founded && (
                    <li className="text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Founded:</span> {company.founded}
                    </li>
                  )}
                  {company.size && (
                    <li className="text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Size:</span> {company.size}
                    </li>
                  )}
                  {company.website && (
                    <li>
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Visit Website
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </ContentContainer>
    </>
  );
}
