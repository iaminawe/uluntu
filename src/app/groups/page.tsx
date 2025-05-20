import { Metadata } from 'next';
import GroupsList from '../../components/GroupsList';

export const metadata: Metadata = {
  title: 'Tech Groups | Kootenay Tech Community',
  description: 'Tech and knowledge worker groups in the Kootenay region',
};

export default function GroupsPage() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Tech Groups</h1>
      <GroupsList />
    </div>
  );
}