import { useState } from 'react';
import { Company, SAMPLE_COMPANY } from '@/features/companies/components/CompanyProfile/types';
import CompanyHeader from '@/features/companies/components/CompanyProfile/CompanyHeader';
import CompanyContent from '@/features/companies/components/CompanyProfile/CompanyContent';
import ContactModal from '@/features/companies/components/CompanyProfile/ContactModal';
import { LikeButton, CommentsList } from '@/components/interactions';

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
      
      {/* Like and Comment Section */}
      <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-4 mb-6">
          <LikeButton
            entityType="company"
            entityId={company.id.toString()}
            initialLikeCount={company.like_count || 0}
          />
        </div>
        
        <CommentsList
          entityType="company"
          entityId={company.id.toString()}
          showToggle
          defaultExpanded={false}
        />
      </div>
      
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
