import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ContentContainer from '@/shared/components/ui/PageLayout/ContentContainer';
import { QueryError } from '@/shared/components/ui/ErrorDisplay';
import { useCompanyByIdOrSlugHybrid } from '@/features/companies/hooks/useCompaniesHybrid';
import { CompanyAssociations } from '@/features/companies/components/CompanyAssociations';
import { 
  ArrowLeft, 
  Globe, 
  MapPin, 
  Calendar, 
  Building2, 
  Users, 
  Briefcase,
  BookOpen,
  Image,
  Star,
  ExternalLink,
  Mail,
  Phone,
  Linkedin,
  Github,
  Twitter,
  TrendingUp,
  Activity,
  Award
} from 'lucide-react';

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  // Use hybrid approach for data fetching with slug support
  const {
    company,
    isLoading,
    isError,
    error,
    refetch
  } = useCompanyByIdOrSlugHybrid(id);

  const defaultCoverImage = 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&dpr=2';

  return (
    <>
      <Helmet>
        <title>{company?.name || 'Company Details'} - Kootenay Tech Community</title>
        <meta name="description" content={company?.description || 'Company details page'} />
      </Helmet>
      
      <ContentContainer className="px-0">
        {/* Back Navigation */}
        <div className="px-4 sm:px-6 lg:px-8 mb-6">
          <Link 
            to="/companies" 
            className="inline-flex items-center text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Link>
        </div>
        
        {isLoading ? (
          <CompanyDetailSkeleton />
        ) : isError ? (
          <div className="px-4 sm:px-6 lg:px-8">
            <QueryError 
              error={error || new Error('Failed to load company details')} 
              retry={refetch} 
              message="We couldn't load the company details. Please try again."
            />
          </div>
        ) : !company ? (
          <div className="text-center py-12 px-4">
            <Building2 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Company Not Found</h2>
            <p className="text-slate-600 dark:text-slate-400">The company you're looking for doesn't exist or has been removed.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Hero Section with Cover */}
            <div className="relative">
              <div className="h-64 sm:h-80 lg:h-96 w-full overflow-hidden">
                <img 
                  src={(company as any).cover_image || defaultCoverImage} 
                  alt={`${company.name} cover`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              </div>
              
              {/* Company Header Info */}
              <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-6">
                <div className="max-w-6xl mx-auto">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                    <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 p-2 shadow-2xl border-4 border-white dark:border-slate-800">
                      {company.logo ? (
                        <img 
                          src={company.logo} 
                          alt={`${company.name} logo`} 
                          className="w-full h-full object-contain rounded-xl" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                          <Building2 className="h-12 w-12 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 text-white">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                          <h1 className="text-3xl sm:text-4xl font-bold mb-2">{company.name}</h1>
                          <div className="flex flex-wrap items-center gap-4 text-white/90">
                            <span className="flex items-center gap-1.5">
                              <TrendingUp className="h-4 w-4" />
                              {company.size}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              Founded {company.founded}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              {company.location}
                            </span>
                          </div>
                        </div>
                        
                        {company.featured && (
                          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                            <Star className="h-4 w-4" fill="currentColor" />
                            Featured Company
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-8">
                  {/* About Section */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Building2 className="h-6 w-6 text-orange-500" />
                      About {company.name}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {company.description}
                    </p>
                  </div>

                  {/* Company Associations */}
                  {company && <CompanyAssociations companyId={company.id} />}
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5 text-orange-500" />
                      Quick Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Team Size</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{company.size || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Founded</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{company.founded}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Location</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{company.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Industries</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{company.industry?.length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Industries */}
                  {company.industry && company.industry.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Award className="h-5 w-5 text-orange-500" />
                        Industries
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {company.industry.map((ind, index) => (
                          <span 
                            key={`${ind}-${index}`}
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-medium border border-orange-200 dark:border-orange-800"
                          >
                            {ind}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact & Links */}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-orange-500" />
                      Contact & Links
                    </h3>
                    <div className="space-y-3">
                      {company.website && (
                        <a 
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        >
                          <Globe className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{company.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                          <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 ml-auto" />
                        </a>
                      )}
                      
                      {/* Social Media Links */}
                      {company.social && Object.keys(company.social).length > 0 && (
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Social Media</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {company.social.linkedin && (
                              <a 
                                href={company.social.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                title="LinkedIn"
                              >
                                <Linkedin className="h-4 w-4" />
                              </a>
                            )}
                            {company.social.github && (
                              <a 
                                href={company.social.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                title="GitHub"
                              >
                                <Github className="h-4 w-4" />
                              </a>
                            )}
                            {company.social.twitter && (
                              <a 
                                href={company.social.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                title="Twitter"
                              >
                                <Twitter className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}
      </ContentContainer>
    </>
  );
}

// Loading skeleton component
function CompanyDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="h-64 sm:h-80 lg:h-96 bg-slate-200 dark:bg-slate-700"></div>
      
      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto -mt-20">
        <div className="flex items-end gap-4 mb-8">
          <div className="w-32 h-32 bg-slate-300 dark:bg-slate-600 rounded-2xl"></div>
          <div className="flex-1">
            <div className="h-8 w-64 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-6">
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}