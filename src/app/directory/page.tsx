import { Metadata } from 'next';
import DirectoryList from '../../components/DirectoryList';

export const metadata: Metadata = {
  title: 'Member Directory | Kootenay Tech Community',
  description: 'Browse and connect with tech professionals in the Kootenay region',
};

export default function DirectoryPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Member Directory</h1>
      <DirectoryList />
    </div>
  );
}