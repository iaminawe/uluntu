import { Metadata } from 'next';
import CompanyProfile from '../../../components/CompanyProfile';

export const metadata: Metadata = {
  title: 'Company Profile | Kootenay Tech Community',
  description: 'View company details, team members, and related content',
};

export default function CompanyProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <CompanyProfile companyId={params.id} />
    </div>
  );
}