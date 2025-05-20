import { Metadata } from 'next';
import OpportunitiesList from '../../components/OpportunitiesList';

export const metadata: Metadata = {
  title: 'Opportunities | Kootenay Tech Community',
  description: 'Jobs, volunteer positions, funding, and community projects in the Kootenay tech community',
};

export default function OpportunitiesPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Opportunities</h1>
      <OpportunitiesList />
    </div>
  );
}