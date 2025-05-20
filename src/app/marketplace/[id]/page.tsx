import { Metadata } from 'next';
import MarketplaceItemDetail from '../../../components/MarketplaceItemDetail';

export const metadata: Metadata = {
  title: 'Marketplace Item | Nelson Tech Community',
  description: 'View marketplace item details',
};

export default function MarketplaceItemPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <MarketplaceItemDetail itemId={params.id} />
    </div>
  );
}