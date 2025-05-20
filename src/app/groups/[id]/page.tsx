import { Metadata } from 'next';
import GroupDetails from '../../../components/GroupDetails';

export const metadata: Metadata = {
  title: 'Group Details | Kootenay Tech Community',
  description: 'View group details and activities',
};

export default function GroupPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <GroupDetails groupId={params.id} />
    </div>
  );
}