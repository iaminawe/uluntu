import { Metadata } from 'next';
import MemberProfile from '../../../components/MemberProfile';

export const metadata: Metadata = {
  title: 'Member Profile | Kootenay Tech Community',
  description: 'View member profile and contributions',
};

export default function MemberProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <MemberProfile memberId={params.id} />
    </div>
  );
}