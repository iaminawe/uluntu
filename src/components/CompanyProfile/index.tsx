import { useState } from 'react';
import { Company, SAMPLE_COMPANY } from '@/features/companies/components/CompanyProfile/types';
import CompanyHeader from '@/features/companies/components/CompanyProfile/CompanyHeader';
import CompanyContent from '@/features/companies/components/CompanyProfile/CompanyContent';
import ContactModal from '@/features/companies/components/CompanyProfile/ContactModal';

interface CompanyProfileProps {
  companyId: string;
}

const CompanyProfile = ({ companyId: _companyId }: CompanyProfileProps) => {
  const [company, _setCompany] = useState<Company | null>(SAMPLE_COMPANY); // In a real app, fetch by ID
  const [showContactModal, setShowContactModal] = useState(false);

  if (!company) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <CompanyHeader 
        company={company}
        onContactClick={() => setShowContactModal(true)}
      />
      
      <CompanyContent company={company} />
      
      {showContactModal && (
        <ContactModal
          company={company}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
};

export default CompanyProfile;
