import { Metadata } from 'next';
import CompanyList from '../../components/CompanyList';

export const metadata: Metadata = {
  title: 'Tech Companies | Kootenay Tech Community',
  description: 'Discover tech companies and startups in the Kootenay region',
};

export default function CompaniesPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Tech Companies</h1>
      <CompanyList />
    </div>
  );
}