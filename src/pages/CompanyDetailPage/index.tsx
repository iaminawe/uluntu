import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCompany, useCompanyEmployees } from '../../hooks/useSupabaseQueries';
import { ContentContainer } from '../../components/ui/PageLayout';
import { Card } from '../../components/ui/Card';
import PageHeader from './PageHeader';
import CompanyInfoSection from './CompanyInfoSection';
import SocialLinksSidebar from './SocialLinksSidebar';
import EmployeesSection from './EmployeesSection';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

export default function CompanyDetailPage() {
  const { id } = useParams();
  const companyId = id ? parseInt(id) : 0;
  
  const { data: company, isLoading: companyLoading, error: companyError } = useCompany(companyId);
  const { data: employees = [], isLoading: employeesLoading } = useCompanyEmployees(companyId);
  
  if (companyLoading) {
    return <LoadingState />;
  }

  if (companyError || !company) {
    return <ErrorState />;
  }

  return (
    <>
      <Helmet>
        <title>{company.name} - Kootenay Tech Community</title>
        <meta name="description" content={company.description} />
      </Helmet>
      
      <ContentContainer>
          <PageHeader id={id as string} />
          
          <Card className="overflow-hidden">
            {/* Header Section with Cover Image */}
            <div className="h-64 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
              {company.coverImage && (
                <img 
                  src={company.coverImage} 
                  alt={company.name} 
                  className="w-full h-full object-cover opacity-50"
                />
              )}
              <div className="absolute left-8 bottom-0 transform translate-y-1/2 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-md">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-24 h-24 object-contain"
                />
              </div>
            </div>
            
            {/* Company Information */}
            <div className="mt-16 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <CompanyInfoSection company={company} />
                <SocialLinksSidebar company={company} />
              </div>
            </div>
          </Card>
          
          <Card className="mt-8">
            <EmployeesSection employees={employees} isLoading={employeesLoading} />
          </Card>
      </ContentContainer>
    </>
  );
}
