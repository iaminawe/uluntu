import { Metadata } from 'next';
import ResourcesList from '../../components/ResourcesList';

export const metadata: Metadata = {
  title: 'Resources | Kootenay Tech Community',
  description: 'Tech and knowledge resources in the Kootenay region',
};

export default function ResourcesPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Resources</h1>
      <ResourcesList />
    </div>
  );
}